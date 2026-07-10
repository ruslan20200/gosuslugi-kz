import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerHref from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useState } from "react";

/* Срезаем query (?url и т.п.) — воркер должен грузить сам файл, а не vite-обёртку */
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerHref.split("?")[0];

const RENDER_SCALE = 2;

export type OverlayField = {
  /* строка или несколько строк */
  text: string | string[];
  /* координаты PDF (масштаб 1, y — базовая линия снизу) */
  x: number;
  y: number;
  /* закрасить область фоном перед записью (для замены впечатанных данных) */
  clearWidth?: number;
  clearHeight?: number;
  bold?: boolean;
  fontSize?: number;
  lineGap?: number;
  /* брать цвет фона слева-ниже поля, а не справа (для документов с цветным фоном
     и узкими белыми полями A4 по краям — иначе плашка красится белым) */
  sampleLeft?: boolean;
  /* моноширинный вывод с фиксированным шагом между символами (для MRZ) */
  pitch?: number;
  mono?: boolean;
};

export type PageOverlay = OverlayField[];

/* Картинка, вклеиваемая в PDF (фото). Координаты — нижний-левый угол, PDF-система */
export type OverlayImage = {
  src?: string; // dataURL; если нет — серый прямоугольник-заглушка
  x: number;
  y: number;
  w: number;
  h: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* Рисуем картинку «cover» — заполняем бокс с обрезкой краёв */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const scale = Math.max(dw / img.width, dh / img.height);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

export type OverlayStyle = {
  font: string;
  color: string;
  fontSize: number;
  lineGap: number;
};

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function drawOverlays(
  context: CanvasRenderingContext2D,
  fields: PageOverlay,
  pageHeight: number,
  scale: number,
  style: OverlayStyle
) {
  context.textBaseline = "alphabetic";

  for (const field of fields) {
    const size = field.fontSize ?? style.fontSize;
    const gap = field.lineGap ?? style.lineGap;

    if (field.clearWidth) {
      /* Берём цвет фона рядом с полем — впечатанные данные закрасятся ровно */
      const clearHeight = field.clearHeight ?? size + 6;
      const maxX = context.canvas.width - 1;
      const rawX = field.sampleLeft
        ? (field.x - 8) * scale
        : (field.x + field.clearWidth + 24) * scale;
      const rawY = field.sampleLeft
        ? (pageHeight - field.y + 5) * scale
        : (pageHeight - field.y - 4) * scale;
      const sampleX = Math.min(Math.max(0, Math.round(rawX)), maxX);
      const sampleY = Math.min(Math.max(0, Math.round(rawY)), context.canvas.height - 1);
      const pixel = context.getImageData(sampleX, sampleY, 1, 1).data;
      context.fillStyle = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      context.fillRect(
        (field.x - 3) * scale,
        (pageHeight - field.y - size - 1) * scale,
        (field.clearWidth + 10) * scale,
        clearHeight * scale
      );
    }

    const fontName = field.mono ? "'Courier New', monospace" : style.font;
    context.font = `${size * scale}px ${fontName}`;
    context.fillStyle = style.color;
    context.strokeStyle = style.color;
    context.lineJoin = "round";
    /* «Жирные» поля рисуем как в самом бланке — заливка + тонкая обводка (Tr 2, ~0.5),
       а не синтетическим bold: так вес глифов совпадает с впечатанным текстом */
    const strokeW = field.bold ? 0.5 * scale : 0;
    const baseline = (pageHeight - field.y) * scale;

    const paint = (line: string, x: number, y: number) => {
      if (strokeW) {
        context.lineWidth = strokeW;
        context.strokeText(line, x, y);
      }
      context.fillText(line, x, y);
    };

    if (field.pitch) {
      /* Моноширинный вывод — каждый символ на фиксированном шаге (MRZ) */
      const text = Array.isArray(field.text) ? field.text.join("") : field.text;
      for (let i = 0; i < text.length; i++) {
        paint(text[i], (field.x + i * field.pitch) * scale, baseline);
      }
      continue;
    }

    const lines = Array.isArray(field.text) ? field.text : [field.text];
    lines.forEach((line, index) => {
      paint(line, field.x * scale, baseline + index * gap * scale);
    });
  }
}

/* Обрезаем белые поля PDF — остаётся только сам документ */
function cropCanvasToContent(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const { width, height } = canvas;
  const data = context.getImageData(0, 0, width, height).data;
  const threshold = 246;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const i = (y * width + x) * 4;
      if (data[i] < threshold || data[i + 1] < threshold || data[i + 2] < threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX <= minX || maxY <= minY) return canvas;

  const cropWidth = maxX - minX + 2;
  const cropHeight = maxY - minY + 2;
  const cropped = document.createElement("canvas");
  cropped.width = cropWidth;
  cropped.height = cropHeight;
  cropped
    .getContext("2d")
    ?.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return cropped;
}

export type UsePdfDocumentOptions = {
  /* Встроенный шаблон по URL или загруженный dataURL */
  url?: string;
  dataUrl?: string | null;
  overlays?: PageOverlay[] | null;
  overlayStyle?: OverlayStyle;
  /* вклеиваемые картинки (фото) по страницам */
  images?: OverlayImage[][] | null;
  /* строка-ключ: перерисовать при изменении данных оверлея */
  renderKey?: string;
  crop?: boolean;
  enabled?: boolean;
};

/** Рендерит PDF в массив картинок-страниц (с дорисованными данными) */
export function usePdfDocument({
  url,
  dataUrl,
  overlays,
  overlayStyle,
  images,
  renderKey = "",
  crop = false,
  enabled = true,
}: UsePdfDocumentOptions) {
  const [pages, setPages] = useState<string[]>([]);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    if (!enabled || (!url && !dataUrl)) {
      setPages([]);
      setIsRendering(false);
      return;
    }

    let cancelled = false;
    setIsRendering(true);

    const loadingTask = pdfjsLib.getDocument({
      ...(url ? { url } : { data: dataUrlToBytes(dataUrl as string) }),
      /* Без этого рендер зависает на PDF со стандартными (невстроенными) шрифтами */
      standardFontDataUrl: "/pdfjs-fonts/",
    });

    (async () => {
      try {
        /* Ждём встроенную Tahoma — иначе canvas нарисует данные фолбэком */
        await Promise.all([
          document.fonts.load("15px UdoDoc"),
          document.fonts.load("bold 15px UdoDoc"),
        ]).catch(() => undefined);
        const doc = await loadingTask.promise;
        const rendered: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: RENDER_SCALE });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext("2d");
          if (!context) continue;
          await page.render({ canvasContext: context, viewport, canvas }).promise;
          const pageHeightPt = viewport.height / RENDER_SCALE;

          /* Фото — поверх старого, до текстовых оверлеев */
          const pageImages = images?.[i - 1];
          if (pageImages) {
            for (const im of pageImages) {
              const dx = im.x * RENDER_SCALE;
              const dy = (pageHeightPt - im.y - im.h) * RENDER_SCALE;
              const dw = im.w * RENDER_SCALE;
              const dh = im.h * RENDER_SCALE;
              context.fillStyle = "#E5E5EA";
              context.fillRect(dx, dy, dw, dh);
              if (im.src) {
                try {
                  const img = await loadImage(im.src);
                  if (cancelled) return;
                  drawImageCover(context, img, dx, dy, dw, dh);
                } catch {
                  /* битое фото — оставляем серый прямоугольник */
                }
              }
            }
          }

          if (overlays && overlays[i - 1] && overlayStyle) {
            drawOverlays(context, overlays[i - 1], pageHeightPt, RENDER_SCALE, overlayStyle);
          }
          const finalCanvas = crop ? cropCanvasToContent(canvas) : canvas;
          rendered.push(finalCanvas.toDataURL("image/jpeg", 0.92));
        }
        if (!cancelled) setPages(rendered);
      } catch (err) {
        console.warn("Failed to render PDF", err);
        if (!cancelled) setPages([]);
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    })();

    return () => {
      cancelled = true;
      void loadingTask.destroy().catch(() => undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, url, dataUrl, renderKey, crop]);

  return { pages, isRendering };
}
