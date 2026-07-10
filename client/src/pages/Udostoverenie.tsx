import { useEffect, useMemo, useRef, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { DocumentActionBar } from "@/features/identity-document/components/DocumentActionBar";
import {
  DocumentTabs,
  type IdentityDocumentTab,
} from "@/features/identity-document/components/DocumentTabs";
import { IdentityDocumentCards } from "@/features/identity-document/components/IdentityDocumentCards";
import { QrCodeSheet } from "@/features/identity-document/components/QrCodeSheet";
import { RequisitesList } from "@/features/identity-document/components/RequisitesList";
import { useDocumentZoom } from "@/features/identity-document/hooks/useDocumentZoom";
import { APP_ROUTES } from "@/shared/config/routes";
import {
  buildMrzLine,
  buildQrPayload,
  buildRequisites,
  formatRequisites,
} from "@/features/identity-document/lib/documentData";
import { useUserData } from "@/hooks/useUserData";
import { renderIdentityCardImages } from "@/features/identity-document/lib/renderIdentityCards";
import { sharePdfFromImages } from "@/features/documents/sharePdf";

/* Настоящий шрифт удостоверения — Tahoma (встроена), фолбэк на системную */
const DOCUMENT_FONT_FAMILY = '"UdoDoc", Tahoma, Arial, "Segoe UI", sans-serif';

export default function Udostoverenie() {
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
  const { data: userData } = useUserData();
  /* Заранее рендерим карточки в картинки — чтобы «Отправить» собрал PDF
     синхронно в жесте нажатия (иначе iOS не откроет окно «Поделиться») */
  const [cardImages, setCardImages] = useState<string[]>([]);

  /* При смене вкладки возвращаем документ в исходный вид и показываем переключатель */
  useEffect(() => {
    resetView();
  }, [activeTab, resetView]);

  /* Свайп влево/вправо с любого места — переключение Документ <-> Реквизиты */
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
    if (!start || zoom > 1.05) return; // при увеличенном документе жест не мешает панораме

    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.4) return;

    if (dx < 0 && activeTab === "document") setActiveTab("details");
    if (dx > 0 && activeTab === "details") setActiveTab("document");
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const requisites = useMemo(() => buildRequisites(userData), [userData]);
  const mrzLine = useMemo(() => buildMrzLine(userData), [userData]);

  /* Готовим картинки карточек заранее (обновляются при смене данных) */
  useEffect(() => {
    let cancelled = false;
    renderIdentityCardImages(userData, mrzLine)
      .then((images) => {
        if (!cancelled) setCardImages(images);
      })
      .catch(() => {
        if (!cancelled) setCardImages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [userData, mrzLine]);
  const qrPayload = useMemo(
    () => buildQrPayload({ userData, issuedAt: qrIssuedAt, code: qrCode }),
    [qrCode, qrIssuedAt, userData]
  );

  const generateNewCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setQrCode(code);
    setQrIssuedAt(Date.now());
  };

  const markCopied = (key: string) => {
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    setCopiedField(key);
    copyTimeoutRef.current = window.setTimeout(() => setCopiedField(null), 1200);
  };

  const handleCopyField = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    markCopied(key);
  };

  const handlePresentDocument = () => {
    generateNewCode();
    setShowQR(true);
  };

  /* Собираем PDF из заранее отрисованных карточек и открываем окно «Поделиться» */
  const handleShare = () => {
    const fileName = `${userData.iin || "document"}-${Date.now()}.pdf`;
    void sharePdfFromImages(cardImages, fileName, "Удостоверение личности");
  };

  const handleSendRequisites = async () => {
    const text = formatRequisites(requisites);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Реквизиты удостоверения",
          text,
        });
        return;
      }
    } catch (err) {
      console.warn("Share failed, copying instead", err);
    }

    try {
      await navigator.clipboard.writeText(text);
      markCopied("all");
    } catch (err) {
      console.warn("Clipboard unavailable", err);
    }
  };

  return (
    <MobileLayout className="min-h-[100dvh] flex flex-col">
      {/* Шапка зафиксирована — не двигается при скролле */}
      <header className="relative z-30 flex h-[52px] shrink-0 items-center bg-white px-2">
        <Link href={APP_ROUTES.digitalDocuments}>
          <button
            className="grid h-11 w-11 place-items-center rounded-xl text-black active:bg-gray-100"
            aria-label="Назад"
          >
            <ChevronLeft size={26} strokeWidth={1.8} />
          </button>
        </Link>
        <h1 className="flex-1 pr-11 text-center font-semibold text-[17px]">
          Удостоверение личности
        </h1>
      </header>

      {/* Область документа. Переключатель — оверлеем поверх верха, он уезжает
          под шапку при прокрутке документа вниз и возвращается наверху */}
      <div
        className="relative flex-1 overflow-hidden bg-white"
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
      >
        <div
          ref={collapseRef}
          className="absolute inset-x-0 top-0 z-20 will-change-transform"
        >
          <DocumentTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div
          className="flex h-full w-[200%] transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${activeTab === "document" ? "0" : "-50%"})`,
          }}
        >
          <div
            ref={containerRef}
            className="kaspi-scrollbar-none h-full w-1/2 overflow-auto overscroll-contain"
            style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}
          >
            <div ref={sizerRef} className="relative">
              <div
                ref={contentRef}
                className="absolute left-0 top-0 origin-top-left bg-white px-4 pb-[150px] pt-[82px] will-change-transform"
              >
                <IdentityDocumentCards
                  userData={userData}
                  fontFamily={DOCUMENT_FONT_FAMILY}
                  mrzLine={mrzLine}
                />
              </div>
            </div>
          </div>
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
      />
    </MobileLayout>
  );
}
