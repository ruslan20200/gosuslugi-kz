/* Сборка PDF из JPEG-страниц без внешних зависимостей.
   JPEG вставляется как есть (Filter /DCTDecode) — без перекодирования. */

export function dataUrlToUint8(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/* Размер JPEG из маркера SOF */
function jpegSize(bytes: Uint8Array): { width: number; height: number } {
  let i = 2;
  while (i < bytes.length - 8) {
    if (bytes[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = bytes[i + 1];
    const isSOF =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;
    if (isSOF) {
      const height = (bytes[i + 5] << 8) | bytes[i + 6];
      const width = (bytes[i + 7] << 8) | bytes[i + 8];
      return { width, height };
    }
    const len = (bytes[i + 2] << 8) | bytes[i + 3];
    i += 2 + len;
  }
  return { width: 1, height: 1 };
}

/** Собирает многостраничный PDF из массива JPEG-страниц (dataURL) */
export function imagesToPdfBlob(jpegDataUrls: string[]): Blob {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  let offset = 0;
  const offsets: number[] = [];

  const push = (c: Uint8Array | string) => {
    const bytes = typeof c === "string" ? enc.encode(c) : c;
    chunks.push(bytes);
    offset += bytes.length;
  };

  const jpegs = jpegDataUrls.map(dataUrlToUint8);
  const n = jpegs.length;
  const imgObj = (i: number) => 3 + i * 3;
  const contentObj = (i: number) => 4 + i * 3;
  const pageObj = (i: number) => 5 + i * 3;
  const totalObjs = 2 + n * 3;

  const startObj = (num: number) => {
    offsets[num] = offset;
    push(`${num} 0 obj\n`);
  };

  push("%PDF-1.3\n");
  push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a])); // бинарный маркер

  startObj(1);
  push("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  const kids = jpegs.map((_, i) => `${pageObj(i)} 0 R`).join(" ");
  startObj(2);
  push(`<< /Type /Pages /Kids [${kids}] /Count ${n} >>\nendobj\n`);

  jpegs.forEach((jpeg, i) => {
    const { width, height } = jpegSize(jpeg);

    startObj(imgObj(i));
    push(
      `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`
    );
    push(jpeg);
    push("\nendstream\nendobj\n");

    const content = `q ${width} 0 0 ${height} 0 0 cm /Im Do Q`;
    startObj(contentObj(i));
    push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`);

    startObj(pageObj(i));
    push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] ` +
        `/Resources << /XObject << /Im ${imgObj(i)} 0 R >> >> /Contents ${contentObj(i)} 0 R >>\nendobj\n`
    );
  });

  const xrefStart = offset;
  push(`xref\n0 ${totalObjs + 1}\n`);
  push("0000000000 65535 f \n");
  for (let num = 1; num <= totalObjs; num++) {
    push(`${String(offsets[num] ?? 0).padStart(10, "0")} 00000 n \n`);
  }
  push(`trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);

  return new Blob(chunks as BlobPart[], { type: "application/pdf" });
}
