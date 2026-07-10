import MobileLayout from "@/components/MobileLayout";
import { DocumentActionBar } from "@/features/identity-document/components/DocumentActionBar";
import {
  DocumentTabs,
  type IdentityDocumentTab,
} from "@/features/identity-document/components/DocumentTabs";
import { QrCodeSheet } from "@/features/identity-document/components/QrCodeSheet";
import { RequisitesList } from "@/features/identity-document/components/RequisitesList";
import { useDocumentZoom } from "@/features/identity-document/hooks/useDocumentZoom";
import {
  buildQrPayload,
  type Requisite,
} from "@/features/identity-document/lib/documentData";
import { useUserData } from "@/hooks/useUserData";
import { APP_ROUTES } from "@/shared/config/routes";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { sharePdfFromImages } from "./sharePdf";
import {
  usePdfDocument,
  type OverlayImage,
  type OverlayStyle,
  type PageOverlay,
} from "./pdfRender";

/* Общий стиль дорисованных данных: настоящая Tahoma (встроена как 'UdoDoc'),
   тот же шрифт, что и впечатанные значения в шаблонах госдокументов */
export const DOC_OVERLAY_STYLE: OverlayStyle = {
  font: "'UdoDoc', Tahoma, Arial, sans-serif",
  color: "#1B1B1F",
  fontSize: 15,
  lineGap: 21,
};

interface PdfDocumentPageProps {
  title: string;
  templateUrl: string;
  overlays: PageOverlay[];
  overlayStyle?: OverlayStyle;
  images?: OverlayImage[][];
  requisites: Requisite[];
  renderKey: string;
}

/** Универсальная страница госдокумента: вшитый PDF + Документ/Реквизиты + QR + share */
export function PdfDocumentPage({
  title,
  templateUrl,
  overlays,
  overlayStyle = DOC_OVERLAY_STYLE,
  images,
  requisites,
  renderKey,
}: PdfDocumentPageProps) {
  const { data: userData } = useUserData();
  const [activeTab, setActiveTab] = useState<IdentityDocumentTab>("document");
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState("851055");
  const [qrIssuedAt, setQrIssuedAt] = useState(() => Date.now());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  /* 66px — высота переключателя: он «сворачивается» при прокрутке документа */
  const { containerRef, sizerRef, contentRef, collapseRef, resetView, zoom } =
    useDocumentZoom(66);

  useEffect(() => {
    resetView();
  }, [activeTab, resetView]);

  const { pages, isRendering } = usePdfDocument({
    url: templateUrl,
    overlays,
    overlayStyle,
    images,
    renderKey,
    crop: true,
  });

  const qrPayload = useMemo(
    () => buildQrPayload({ userData, issuedAt: qrIssuedAt, code: qrCode }),
    [qrCode, qrIssuedAt, userData]
  );

  const handleSwipeStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) {
      swipeStartRef.current = null;
      return;
    }
    swipeStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleSwipeEnd = (e: React.TouchEvent) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || zoom > 1.05) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    if (dx < 0 && activeTab === "document") setActiveTab("details");
    if (dx > 0 && activeTab === "details") setActiveTab("document");
  };

  const handleCopyField = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
    setCopiedField(key);
    copyTimeoutRef.current = window.setTimeout(() => setCopiedField(null), 1200);
  };

  const handlePresentDocument = () => {
    setQrCode(Math.floor(100000 + Math.random() * 900000).toString());
    setQrIssuedAt(Date.now());
    setShowQR(true);
  };

  /* Собираем PDF из отрисованных страниц (с данными/фото из настроек) и шарим его */
  const handleShare = () => {
    const fileName = `${userData.iin || "document"}-${Date.now()}.pdf`;
    void sharePdfFromImages(pages, fileName, title);
  };

  const handleSendRequisites = async () => {
    const text = requisites.map((r) => `${r.label}: ${r.value}`).join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast("Реквизиты скопированы");
    } catch {
      /* пользователь закрыл окно */
    }
  };

  return (
    <MobileLayout className="bg-white">
      <header className="relative z-30 flex h-[52px] shrink-0 items-center bg-white px-2">
        <Link href={APP_ROUTES.digitalDocuments}>
          <button
            className="grid h-11 w-11 place-items-center rounded-xl text-black active:bg-gray-100"
            aria-label="Назад"
          >
            <ChevronLeft size={26} strokeWidth={1.8} />
          </button>
        </Link>
        <h1 className="flex-1 pr-11 text-center font-semibold text-[17px]">{title}</h1>
      </header>

      <div
        className="relative flex-1 overflow-hidden bg-white"
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
      >
        {/* Переключатель — оверлеем поверх верха документа, сворачивается при прокрутке */}
        <div
          ref={collapseRef}
          className="absolute inset-x-0 top-0 z-20 will-change-transform"
        >
          <DocumentTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div
          className="flex h-full w-[200%] transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${activeTab === "document" ? "0" : "-50%"})` }}
        >
          {/* Документ */}
          <div
            ref={containerRef}
            className="kaspi-scrollbar-none h-full w-1/2 overflow-auto overscroll-contain"
            style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}
          >
            {isRendering ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 pb-24 text-kaspi-text-muted">
                <Loader2 size={34} strokeWidth={1.6} className="animate-spin" />
                <span className="text-[15px]">Открываем документ…</span>
              </div>
            ) : (
              <div ref={sizerRef} className="relative">
                <div
                  ref={contentRef}
                  className="absolute left-0 top-0 origin-top-left space-y-6 px-7 pb-[170px] pt-[82px] will-change-transform"
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
          </div>

          {/* Реквизиты */}
          <div
            className="h-full w-1/2 overflow-y-auto overscroll-contain"
            style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}
          >
            <div className="bg-white px-7 pb-[150px] pt-[74px]">
              <RequisitesList
                requisites={requisites}
                copiedField={copiedField}
                onCopyField={handleCopyField}
              />
            </div>
          </div>
        </div>
      </div>

      <DocumentActionBar
        activeTab={activeTab}
        onPresentDocument={handlePresentDocument}
        onShareDocument={handleShare}
        onSendRequisites={handleSendRequisites}
      />

      <QrCodeSheet
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        qrPayload={qrPayload}
        qrCode={qrCode}
        title={title}
      />
    </MobileLayout>
  );
}
