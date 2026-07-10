import JsBarcode from "jsbarcode";
import type { UserData } from "@/hooks/useUserData";
import { CARD_ASPECT, CARD_BASE_WIDTH, POSITIONS } from "../constants/documentLayout";

/*
 * Рендер удостоверения (лицо + оборот) в JPEG-картинки для сборки PDF при «Отправить».
 * Координаты — те же, что и у HTML-карточки (базовая система 398px), проверены мокапом.
 */

const SCALE = 3;
const W = CARD_BASE_WIDTH; // 398
const H = CARD_BASE_WIDTH / CARD_ASPECT; // ≈ 251.9
const FONT = '"UdoDoc", Tahoma, Arial, sans-serif';
const DARK = "#111827";
const PHOTO_TOP_RATIO = 0.58; // POSITIONS.photo.top = "58%"
const PADDING = 16; // p-4 контейнера оборота

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadBg(webp: string, png: string): Promise<HTMLImageElement | null> {
  try {
    return await loadImage(webp);
  } catch {
    try {
      return await loadImage(png);
    } catch {
      return null;
    }
  }
}

/* «cover»: заполнить бокс с обрезкой краёв (как object-fit: cover) */
function drawCover(
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

function newCardCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(W * SCALE);
  canvas.height = Math.round(H * SCALE);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  ctx.textAlign = "left";
  return [canvas, ctx];
}

async function renderFront(userData: UserData): Promise<string> {
  const [canvas, ctx] = newCardCanvas();
  const bg = await loadBg("/udostoverenie-bg.webp", "/udostoverenie-bg.png");
  if (bg) drawCover(ctx, bg, 0, 0, W, H);

  /* Фото */
  const pw = (POSITIONS.photo.width / 100) * W;
  const ph = (pw * 4) / 3;
  const px = POSITIONS.photo.left;
  const py = PHOTO_TOP_RATIO * H - ph / 2;
  ctx.fillStyle = "#d2d5db";
  ctx.fillRect(px, py, pw, ph);
  if (userData.photo) {
    try {
      const photo = await loadImage(userData.photo);
      drawCover(ctx, photo, px, py, pw, ph);
    } catch {
      /* битое фото — оставляем серый прямоугольник */
    }
  }

  /* Текстовые поля (left/top в %, вертикальный центр) */
  ctx.fillStyle = DARK;
  ctx.textBaseline = "middle";
  const field = (pos: { left: number; top: number; fontSize: number; fontWeight: number }, text: string) => {
    ctx.font = `${pos.fontWeight} ${pos.fontSize}px ${FONT}`;
    ctx.fillText(text, (pos.left / 100) * W, (pos.top / 100) * H);
  };
  field(POSITIONS.lastName, userData.lastName);
  field(POSITIONS.firstName, userData.firstName);
  field(POSITIONS.middleName, userData.middleName);
  field(POSITIONS.birthDate, userData.birthDate);
  field(POSITIONS.gender, userData.gender);

  /* ИИН — у нижнего края */
  ctx.font = `${POSITIONS.iin.fontWeight} ${POSITIONS.iin.fontSize}px ${FONT}`;
  ctx.textBaseline = "bottom";
  ctx.letterSpacing = `${POSITIONS.iin.letterSpacing}em`;
  ctx.fillText(userData.iin, POSITIONS.iin.left, H - POSITIONS.iin.bottom);
  ctx.letterSpacing = "0px";

  return canvas.toDataURL("image/jpeg", 0.92);
}

async function renderBack(userData: UserData, mrzLine: string): Promise<string> {
  const [canvas, ctx] = newCardCanvas();
  const bg = await loadBg("/udostoverenie-back-bg.webp", "/udostoverenie-back-bg.png");
  if (bg) drawCover(ctx, bg, 0, 0, W, H);

  /* Штрихкод (CODE128 по номеру документа) */
  try {
    const bc = document.createElement("canvas");
    JsBarcode(bc, userData.docNumber || "0", {
      format: "CODE128",
      width: 2,
      height: 30,
      margin: 5,
      displayValue: false,
      background: "transparent",
      lineColor: "#000000",
    });
    ctx.drawImage(
      bc,
      PADDING + POSITIONS.barcode.left,
      PADDING + POSITIONS.barcode.top,
      POSITIONS.barcode.width,
      POSITIONS.barcode.height
    );
  } catch {
    /* штрихкод не критичен */
  }

  /* Номер документа справа сверху (Times, как в HTML) */
  ctx.fillStyle = DARK;
  ctx.font = `${POSITIONS.docNumber.fontWeight} ${POSITIONS.docNumber.fontSize}px "Times New Roman", Times, serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(
    userData.docNumber,
    W - PADDING - POSITIONS.docNumber.right,
    PADDING + POSITIONS.barcode.top + POSITIONS.docNumber.top
  );
  ctx.textAlign = "left";

  /* Поля оборота (координаты в px, привязка к верху) */
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "top";
  const back = (
    pos: { top: number; left: number; fontSize: number; fontWeight: number },
    text: string
  ) => {
    ctx.font = `${pos.fontWeight} ${pos.fontSize}px ${FONT}`;
    ctx.fillText(text, pos.left, pos.top);
  };
  back(POSITIONS.birthPlace, userData.birthPlace);
  back(POSITIONS.nationality, userData.nationality);
  back(POSITIONS.citizenship, userData.citizenship);
  back(POSITIONS.dates, `${userData.issueDate} - ${userData.expiryDate}`);
  back(POSITIONS.issuingAuthority, userData.issuingAuthority);

  /* MRZ — три строки у нижнего края */
  ctx.font = `490 ${POSITIONS.mrz.fontSize}px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "0.02em";
  const filler = "<".repeat(33);
  const lines = [filler, mrzLine, filler];
  const lineHeight = POSITIONS.mrz.fontSize * 1.6;
  const blockTop = H - POSITIONS.mrz.bottom - lineHeight * lines.length;
  lines.forEach((line, i) => {
    ctx.fillText(line, POSITIONS.mrz.left, blockTop + i * lineHeight + lineHeight / 2);
  });
  ctx.letterSpacing = "0px";

  return canvas.toDataURL("image/jpeg", 0.92);
}

/** Рендерит лицо и оборот удостоверения в JPEG-картинки (для сборки PDF) */
export async function renderIdentityCardImages(
  userData: UserData,
  mrzLine: string
): Promise<string[]> {
  await Promise.all([
    document.fonts.load(`480 15px UdoDoc`),
    document.fonts.load(`490 15px UdoDoc`),
  ]).catch(() => undefined);
  const front = await renderFront(userData);
  const back = await renderBack(userData, mrzLine);
  return [front, back];
}
