import MobileLayout from "@/components/MobileLayout";
import { DocumentActionBar } from "@/features/identity-document/components/DocumentActionBar";
import { QrCodeSheet } from "@/features/identity-document/components/QrCodeSheet";
import { buildQrPayload } from "@/features/identity-document/lib/documentData";
import { useDocumentZoom } from "@/features/identity-document/hooks/useDocumentZoom";
import {
  formatEducationGroup,
  useUserData,
  type UserData,
} from "@/hooks/useUserData";
import { APP_ROUTES } from "@/shared/config/routes";
import { ChevronLeft, FileUp, Loader2, RefreshCw } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerHref from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { sharePdfFromImages } from "@/features/documents/sharePdf";
import {
  getStoredEducationPdf,
  setStoredEducationPdf,
} from "./educationPdfStorage";

/* Срезаем query (?url и т.п.) — воркер должен грузить сам файл, а не vite-обёртку */
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerHref.split("?")[0];

const MAX_PDF_BYTES = 4 * 1024 * 1024; // ~4 МБ — иначе не влезет в localStorage
const RENDER_SCALE = 2;
const TEMPLATE_URL = "/education-template.pdf";
/* Настоящий шрифт документа — встроенная Tahoma ('UdoDoc'), тот же, что и
   впечатанные значения в шаблоне. Никаких subset'ов и fake-bold. */
const TEMPLATE_FONT = "'UdoDoc', Tahoma, Arial, sans-serif";
/* В самом шаблоне все значения — Tahoma 15px, обычный вес, чистый чёрный (#000000).
   Рисуем ровно тем же цветом и весом, чтобы наши данные не отличались от впечатанных. */
const TEMPLATE_TEXT_COLOR = "#000000";
const TEMPLATE_FONT_SIZE = 15; // как в текстовом слое шаблона
const TEMPLATE_LINE_GAP = 21;
/* В самом шаблоне текст рисуется в режиме «заливка + обводка» (Tr 2) с толщиной
   обводки 0.6 — из-за этого он чуть жирнее обычного. Повторяем ровно то же,
   иначе наши значения выглядят тоньше впечатанных. */
const TEMPLATE_STROKE_WIDTH = 0.6;

function loadDocFonts(): Promise<void> {
  return Promise.all([
    document.fonts.load("15px UdoDoc"),
    document.fonts.load("bold 15px UdoDoc"),
  ])
    .then(() => undefined)
    .catch(() => undefined);
}

type OverlayField = {
  /* строка или несколько строк (ФИО) */
  text: string | string[];
  /* координаты PDF (масштаб 1, y — базовая линия снизу) */
  x: number;
  y: number;
  /* закрасить область фоном перед записью (для впечатанного «3 курс») */
  clearWidth?: number;
};

/* Координаты пустых полей шаблона — вычислены из текстового слоя PDF */
function buildOverlays(data: UserData): OverlayField[][] {
  const fioFull = `${data.lastName} ${data.firstName} ${data.middleName}`
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
  /* Как в оригинале: «ФАМИЛИЯ ИМЯ» / «ОТЧЕСТВО» на двух строках */
  const fio =
    fioFull.length > 26 && data.middleName
      ? [`${data.lastName} ${data.firstName}`.toUpperCase(), data.middleName.toUpperCase()]
      : fioFull;
  const group = formatEducationGroup(data.educationGroup, data.educationCourse);
  const course = `${data.educationCourse} курс`;

  return [
    /* Страница 1 — казахская */
    [
      { text: fio, x: 398, y: 737 },
      { text: data.iin, x: 398, y: 683 },
      { text: data.birthDate, x: 398, y: 649 },
      { text: course, x: 398, y: 528, clearWidth: 60 },
      { text: group, x: 398, y: 473 },
    ],
    /* Страница 2 — русская */
    [
      { text: fio, x: 407, y: 744 },
      { text: data.iin, x: 407, y: 689 },
      { text: data.birthDate, x: 407, y: 656 },
      { text: course, x: 407, y: 513, clearWidth: 60 },
      { text: group, x: 407, y: 458 },
    ],
  ];
}

function drawOverlays(
  context: CanvasRenderingContext2D,
  fields: OverlayField[],
  pageHeight: number,
  scale: number
) {
  /* Настоящая Tahoma, тот же вес что и впечатанные значения — без костылей */
  const fontPx = TEMPLATE_FONT_SIZE * scale;
  context.font = `${fontPx}px ${TEMPLATE_FONT}`;
  context.textBaseline = "alphabetic";
  context.lineJoin = "round";

  /* Заливка + обводка ровно как в шаблоне (Tr 2, w 0.6) — тот же вес глифов */
  const paint = (line: string, x: number, y: number) => {
    context.lineWidth = TEMPLATE_STROKE_WIDTH * scale;
    context.strokeText(line, x, y);
    context.fillText(line, x, y);
  };

  for (const field of fields) {
    if (field.clearWidth) {
      /* Берём цвет фона рядом с полем — водяной знак закрасится ровно */
      const sampleX = Math.round((field.x + field.clearWidth + 24) * scale);
      const sampleY = Math.round((pageHeight - field.y - 4) * scale);
      const pixel = context.getImageData(sampleX, sampleY, 1, 1).data;
      context.fillStyle = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      context.fillRect(
        (field.x - 3) * scale,
        (pageHeight - field.y - TEMPLATE_FONT_SIZE - 1) * scale,
        (field.clearWidth + 10) * scale,
        (TEMPLATE_FONT_SIZE + 6) * scale
      );
    }

    context.fillStyle = TEMPLATE_TEXT_COLOR;
    context.strokeStyle = TEMPLATE_TEXT_COLOR;
    const lines = Array.isArray(field.text) ? field.text : [field.text];
    lines.forEach((line, index) => {
      paint(
        line,
        field.x * scale,
        (pageHeight - field.y + index * TEMPLATE_LINE_GAP) * scale
      );
    });
  }
}

/* Обрезаем белые поля PDF — остаётся только сам документ */
function cropCanvasToContent(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const { width, height } = canvas;
  const data = context.getImageData(0, 0, width, height).data;
  const threshold = 246; // всё светлее — считаем белым полем
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
  cropped.getContext("2d")?.drawImage(
    canvas,
    minX,
    minY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );
  return cropped;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function EducationPage() {
  const { data: userData } = useUserData();
  const isBuiltin = userData.educationDocSource !== "upload";

  const [uploadedPdf, setUploadedPdf] = useState<string | null>(() => getStoredEducationPdf());
  const [pages, setPages] = useState<string[]>([]);
  const [isRendering, setIsRendering] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState("851055");
  const [qrIssuedAt, setQrIssuedAt] = useState(() => Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);
  /* Пинч-зум и двойной тап — как в разделе удостоверения */
  const { containerRef, sizerRef, contentRef } = useDocumentZoom();

  const qrPayload = useMemo(
    () => buildQrPayload({ userData, issuedAt: qrIssuedAt, code: qrCode }),
    [qrCode, qrIssuedAt, userData]
  );

  /* Ключевые данные оверлея — чтобы не перерисовывать без надобности */
  const overlayKey = [
    userData.lastName,
    userData.firstName,
    userData.middleName,
    userData.iin,
    userData.birthDate,
    userData.educationGroup,
    userData.educationCourse,
  ].join("|");

  useEffect(() => {
    if (!isBuiltin && !uploadedPdf) {
      setPages([]);
      setIsRendering(false);
      return;
    }

    let cancelled = false;
    setIsRendering(true);

    const loadingTask = pdfjsLib.getDocument({
      ...(isBuiltin ? { url: TEMPLATE_URL } : { data: dataUrlToBytes(uploadedPdf as string) }),
      /* Без этого рендер зависает на PDF со стандартными (невстроенными) шрифтами */
      standardFontDataUrl: "/pdfjs-fonts/",
    });

    (async () => {
      try {
        /* Ждём шрифты из PDF — иначе canvas нарисует фолбэком */
        await loadDocFonts();
        const doc = await loadingTask.promise;
        const overlays = isBuiltin ? buildOverlays(userData) : null;
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
          if (overlays && overlays[i - 1]) {
            drawOverlays(context, overlays[i - 1], viewport.height / RENDER_SCALE, RENDER_SCALE);
          }
          /* У встроенного шаблона убираем белые поля — виден только документ */
          const finalCanvas = isBuiltin ? cropCanvasToContent(canvas) : canvas;
          rendered.push(finalCanvas.toDataURL("image/jpeg", 0.92));
        }
        if (!cancelled) setPages(rendered);
      } catch (err) {
        console.warn("Failed to render PDF", err);
        if (!cancelled) {
          toast.error("Не удалось открыть PDF");
          setPages([]);
        }
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    })();

    return () => {
      cancelled = true;
      void loadingTask.destroy().catch(() => undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBuiltin, uploadedPdf, overlayKey]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Выберите файл PDF");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      toast.error("Файл слишком большой — до 4 МБ");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      if (!setStoredEducationPdf(dataUrl)) {
        toast.error("Не хватило места для сохранения файла");
      }
      setUploadedPdf(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handlePresentDocument = () => {
    setQrCode(Math.floor(100000 + Math.random() * 900000).toString());
    setQrIssuedAt(Date.now());
    setShowQR(true);
  };

  /* Собираем PDF из отрисованных страниц (с данными из настроек) и шарим его */
  const handleShare = () => {
    const fileName = `${userData.iin || "document"}-${Date.now()}.pdf`;
    void sharePdfFromImages(pages, fileName, "Сведения об образовании");
  };

  const showDocument = pages.length > 0 && !isRendering;
  const showUploadPlaceholder = !isBuiltin && !uploadedPdf;

  return (
    <MobileLayout className="bg-white">
      {/* Шапка зафиксирована — страницы PDF скроллятся под ней */}
      <header className="relative z-30 flex h-[52px] shrink-0 items-center bg-white px-2">
        <Link href={APP_ROUTES.digitalDocuments}>
          <button
            className="grid h-11 w-11 place-items-center rounded-xl text-black active:bg-gray-100"
            aria-label="Назад"
          >
            <ChevronLeft size={26} strokeWidth={1.8} />
          </button>
        </Link>
        <h1 className="flex-1 text-center font-semibold text-[17px]">
          Сведения об образовании
        </h1>
        <div className="grid h-11 w-11 place-items-center">
          {!isBuiltin && uploadedPdf && (
            <button
              className="grid h-11 w-11 place-items-center rounded-xl text-[#6E6E78] active:bg-gray-100"
              aria-label="Заменить документ"
              onClick={() => fileInputRef.current?.click()}
            >
              <RefreshCw size={21} strokeWidth={1.7} />
            </button>
          )}
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleUpload}
      />

      <main
        ref={containerRef}
        className="kaspi-scrollbar-none flex-1 overflow-auto overscroll-contain"
        style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}
      >
        {showUploadPlaceholder ? (
          /* Свой PDF (режим включается в Настройках) */
          <div className="flex h-full flex-col items-center justify-center px-8 pb-24">
            <div className="w-full rounded-2xl border-2 border-dashed border-[#C9CFE3] bg-white px-6 py-12 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#EEF3FE] text-[#2E7DE1]">
                <FileUp size={30} strokeWidth={1.6} />
              </div>
              <div className="mt-5 text-[17px] font-semibold text-kaspi-text">
                Загрузите документ
              </div>
              <div className="mt-1.5 text-[14px] leading-snug text-kaspi-text-muted">
                PDF со сведениями об образовании —
                он будет показан как в просмотрщике
              </div>
              <button
                className="mt-6 h-12 w-full rounded-xl bg-[#2E7DE1] text-[16px] font-semibold text-white active:scale-[0.98]"
                onClick={() => fileInputRef.current?.click()}
              >
                Выбрать файл PDF
              </button>
            </div>
          </div>
        ) : isRendering ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 pb-24 text-kaspi-text-muted">
            <Loader2 size={34} strokeWidth={1.6} className="animate-spin" />
            <span className="text-[15px]">Открываем документ…</span>
          </div>
        ) : (
          /* Страницы PDF — листы точно по размеру документа */
          <div ref={sizerRef} className="relative">
            <div
              ref={contentRef}
              className="absolute left-0 top-0 origin-top-left space-y-6 px-7 pb-[170px] pt-6 will-change-transform"
            >
              {pages.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Страница ${index + 1}`}
                  className="block w-full rounded-[4px] shadow-[0_3px_14px_rgba(0,0,0,0.13)]"
                  draggable={false}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {showDocument && (
        <DocumentActionBar
          activeTab="document"
          onPresentDocument={handlePresentDocument}
          onShareDocument={handleShare}
          onSendRequisites={handleShare}
        />
      )}

      <QrCodeSheet
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        qrPayload={qrPayload}
        qrCode={qrCode}
        title="Сведения об образовании"
      />
    </MobileLayout>
  );
}
