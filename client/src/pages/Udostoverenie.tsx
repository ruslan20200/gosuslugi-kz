import React, { useState, useEffect, useRef } from "react";
import MobileLayout from "@/components/MobileLayout";
import { ChevronRight, Copy, Check, X } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import JsBarcode from "jsbarcode";
import { useUserData } from "@/hooks/useUserData";

function PresentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <g transform="translate(3.5 3.5) scale(0.7)">
        <path
          strokeWidth="2"
          d="M4 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"
        />
        <path strokeWidth="2" d="M7 17l0 .01" />
        <path
          strokeWidth="2"
          d="M14 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"
        />
        <path strokeWidth="2" d="M7 7l0 .01" />
        <path
          strokeWidth="2"
          d="M4 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"
        />
        <path strokeWidth="2" d="M17 7l0 .01" />
        <path strokeWidth="2" d="M14 14l3 0" />
        <path strokeWidth="2" d="M20 14l0 .01" />
        <path strokeWidth="2" d="M14 14l0 3" />
        <path strokeWidth="2" d="M14 20l3 0" />
        <path strokeWidth="2" d="M17 17l3 0" />
        <path strokeWidth="2" d="M20 17l0 3" />
      </g>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 10h10a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3z" />
      <path d="M12 3v13" />
      <path d="M9.5 5.5L12 3l2.5 2.5" />
    </svg>
  );
}

export default function Udostoverenie() {
  const [activeTab, setActiveTab] = useState<"document" | "details">(
    "document"
  );
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState("851055");
  const { data: userData } = useUserData();
  // Tahoma is not available on many phones (especially iOS). Use a mobile-safe system font stack.
  const fontFamily =
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, "Noto Sans", sans-serif';
  const [zoom, setZoom] = useState(1);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1);

  // Position controls in pixels
  const [positions, setPositions] = useState({
    photo: { left: 17, top: "58%", translateY: "-50%", width: 29 },
    lastName: {
      left: 37,
      top: 38,
      translateY: "-50%",
      fontSize: 12,
      fontWeight: 460,
    },
    firstName: {
      left: 37,
      top: 52,
      translateY: "-50%",
      fontSize: 12,
      fontWeight: 460,
    },
    middleName: {
      left: 37,
      top: 66,
      translateY: "-50%",
      fontSize: 12,
      fontWeight: 460,
    },
    birthDate: {
      left: 37,
      top: 80,
      translateY: "-50%",
      fontSize: 12,
      fontWeight: 460,
    },
    iin: {
      bottom: 3,
      left: 57,
      fontSize: 14,
      fontWeight: 480,
      letterSpacing: 0.02,
    },
    emblem: { top: 8, left: "50%", translateX: "-50%", size: 40 },
    barcode: { top: -18, left: 10, width: 130, height: 50 },
    docNumber: { top: 15, right: 15, fontSize: 14, fontWeight: 460 },
    mrz: { bottom: 26, left: 30, fontSize: 14 },
    birthPlace: { top: 50, left: 110, fontSize: 12, fontWeight: 460 },
    nationality: { top: 75, left: 110, fontSize: 12, fontWeight: 460 },
    ministry: { top: 98, left: 110, fontSize: 12, fontWeight: 460 },
    dates: { top: 122, left: 110, fontSize: 12, fontWeight: 460 },
    buttons: { paddingBottom: 30 },
  });

  // Handle pinch zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prev => Math.max(1, Math.min(3, prev * delta)));
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Prevent browser pinch-zoom; we'll handle it ourselves
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        pinchStartDistanceRef.current = distance;
        pinchStartZoomRef.current = zoom;
      } else if (e.touches.length === 1) {
        const now = Date.now();
        if (now - lastTapTime < 300) {
          // Double tap
          setZoom(prev => (prev === 1 ? 1.5 : 1));
        }
        setLastTapTime(now);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Prevent page scroll/zoom while pinching
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        const startDistance = pinchStartDistanceRef.current;
        const startZoom = pinchStartZoomRef.current;
        if (startDistance && startDistance > 0) {
          const next = startZoom * (distance / startDistance);
          setZoom(Math.max(1, Math.min(3, next)));
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchStartDistanceRef.current = null;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel as EventListener, {
        passive: false,
      });
      container.addEventListener("touchstart", handleTouchStart as EventListener, {
        passive: false,
      });
      container.addEventListener("touchmove", handleTouchMove as EventListener, {
        passive: false,
      });
      container.addEventListener("touchend", handleTouchEnd as EventListener);
      container.addEventListener("touchcancel", handleTouchEnd as EventListener);
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel as EventListener);
        container.removeEventListener("touchstart", handleTouchStart as EventListener);
        container.removeEventListener("touchmove", handleTouchMove as EventListener);
        container.removeEventListener("touchend", handleTouchEnd as EventListener);
        container.removeEventListener("touchcancel", handleTouchEnd as EventListener);
      }
    };
  }, [lastTapTime, zoom]);

  const generateNewCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setQrCode(code);
  };

  const handleShare = async () => {
    const sharePayload = {
      title: "Удостоверение личности",
      text: "Смотрите этот PDF-файл!",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(sharePayload);
        return;
      } catch (err) {
        // user cancelled or not supported, fallback to sheet
      }
    }
    setShowShare(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const markCopied = (key: string) => {
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    setCopiedField(key);
    copyTimeoutRef.current = window.setTimeout(() => setCopiedField(null), 1200);
  };

  const handleCopyField = (key: string, value: string) => {
    copyToClipboard(value);
    markCopied(key);
  };

  const requisites = [
    {
      key: "fio",
      label: "ФИО",
      value: `${userData.lastName} ${userData.firstName} ${userData.middleName}`.trim(),
    },
    { key: "iin", label: "ИИН", value: userData.iin },
    { key: "birthDate", label: "Дата рождения", value: userData.birthDate },
    { key: "docNumber", label: "Номер документа", value: userData.docNumber },
    { key: "issueDate", label: "Дата выдачи", value: userData.issueDate },
    { key: "expiryDate", label: "Срок действия", value: userData.expiryDate },
  ];

  const formatRequisites = () => {
    const lines = requisites.map(item => `${item.label}: ${item.value}`);
    return ["Удостоверение личности", ...lines].join("\n");
  };

  const handleSendRequisites = async () => {
    const text = formatRequisites();
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

  // Generate MRZ string
  const generateMRZ = () => {
    // Simple transliteration map (incomplete, but sufficient for demo)
    const translit = (str: string) => {
      const ru: Record<string, string> = {
        А: "A",
        Б: "B",
        В: "V",
        Г: "G",
        Д: "D",
        Е: "E",
        Ё: "E",
        Ж: "ZH",
        З: "Z",
        И: "I",
        Й: "Y",
        К: "K",
        Л: "L",
        М: "M",
        Н: "N",
        О: "O",
        П: "P",
        Р: "R",
        С: "S",
        Т: "T",
        У: "U",
        Ф: "F",
        Х: "KH",
        Ц: "TS",
        Ч: "CH",
        Ш: "SH",
        Щ: "SHCH",
        Ъ: "",
        Ы: "Y",
        Ь: "",
        Э: "E",
        Ю: "YU",
        Я: "YA",
      };
      return str
        .toUpperCase()
        .split("")
        .map(char => ru[char] || char)
        .join("");
    };

    const surname = translit(userData.lastName);
    const name = translit(userData.firstName);

    // Format: SURNAME<<NAME<<<<<<<<<<<<
    // Max length for line is usually 30 chars for ID cards
    let line = `${surname}<<${name}`;
    while (line.length < 33) {
      line += "<";
    }
    return line;
  };

  return (
    <MobileLayout className="h-screen flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-[56px] bg-white z-50 flex items-center px-2">
        <Link href="/">
          <button className="p-2 -ml-1 flex items-center text-[#000000]">
            <ChevronRight className="rotate-180 w-6 h-6" />
          </button>
        </Link>
        <h1 className="flex-1 text-center font-semibold text-[17px] pr-8">
          Удостоверение личности
        </h1>
      </header>

      {/* Scrollable Area - Tabs + Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-white"
        style={{ paddingTop: "56px", touchAction: "pan-y" }}
      >
        {/* Tabs */}
        <div
          className="px-4 pb-4 bg-white sticky top-0 z-20"
          style={{ paddingTop: "8px" }}
        >
          <div className="bg-[#E3E3E8] p-0.5 rounded-[9px] flex">
            <button
              onClick={() => setActiveTab("document")}
              className={`flex-1 py-[6px] text-[13px] font-medium rounded-[7px] transition-all ${activeTab === "document" ? "bg-white shadow-sm text-black" : "text-black"}`}
            >
              Документ
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`flex-1 py-[6px] text-[13px] font-medium rounded-[7px] transition-all ${activeTab === "details" ? "bg-white shadow-sm text-black" : "text-black"}`}
            >
              Реквизиты
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className={cn(
            "bg-white pb-[140px]",
            activeTab === "document" ? "p-4" : "px-4 pt-1"
          )}
        >
          {activeTab === "document" ? (
            <div
              className="space-y-4"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
                transition: "transform 0.1s ease-out",
              }}
            >
              {/* ID Card Front */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm relative aspect-[1.58/1]">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('/udostoverenie-bg.png')" }}
                ></div>

                <div className="absolute inset-0 p-4 flex flex-col">
                  {/* Photo - positioned absolutely */}
                  <div
                    className="absolute aspect-[3/4] bg-gray-200 overflow-hidden shadow-sm"
                    style={{
                      left: `${positions.photo.left}px`,
                      top: positions.photo.top,
                      width: `${positions.photo.width}%`,
                      transform: `translateY(${positions.photo.translateY})`,
                    }}
                  >
                    {userData.photo ? (
                      <img
                        src={userData.photo}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-xs text-gray-500">ФОТО</span>
                      </div>
                    )}
                  </div>

                  {/* Last Name - positioned absolutely */}
                  <div
                    className="absolute"
                    style={{
                      left: `${positions.lastName.left}%`,
                      top: `${positions.lastName.top}%`,
                      transform: `translateY(${positions.lastName.translateY})`,
                    }}
                  >
                    <div
                      className="font-medium text-gray-900 leading-none"
                      style={{
                        fontSize: `${positions.lastName.fontSize}px`,
                        fontWeight: positions.lastName.fontWeight,
                        fontFamily,
                      }}
                    >
                      {userData.lastName}
                    </div>
                  </div>

                  {/* First Name - positioned absolutely */}
                  <div
                    className="absolute"
                    style={{
                      left: `${positions.firstName.left}%`,
                      top: `${positions.firstName.top}%`,
                      transform: `translateY(${positions.firstName.translateY})`,
                    }}
                  >
                    <div
                      className="font-medium text-gray-900 leading-none"
                      style={{
                        fontSize: `${positions.firstName.fontSize}px`,
                        fontWeight: positions.firstName.fontWeight,
                        fontFamily,
                      }}
                    >
                      {userData.firstName}
                    </div>
                  </div>

                  {/* Middle Name - positioned absolutely */}
                  <div
                    className="absolute"
                    style={{
                      left: `${positions.middleName.left}%`,
                      top: `${positions.middleName.top}%`,
                      transform: `translateY(${positions.middleName.translateY})`,
                    }}
                  >
                    <div
                      className="font-medium text-gray-900 leading-none"
                      style={{
                        fontSize: `${positions.middleName.fontSize}px`,
                        fontWeight: positions.middleName.fontWeight,
                        fontFamily,
                      }}
                    >
                      {userData.middleName}
                    </div>
                  </div>

                  {/* Birth Date - positioned absolutely */}
                  <div
                    className="absolute"
                    style={{
                      left: `${positions.birthDate.left}%`,
                      top: `${positions.birthDate.top}%`,
                      transform: `translateY(${positions.birthDate.translateY})`,
                    }}
                  >
                    <div
                      className="font-medium text-gray-900 leading-none"
                      style={{
                        fontSize: `${positions.birthDate.fontSize}px`,
                        fontWeight: positions.birthDate.fontWeight,
                        fontFamily,
                      }}
                    >
                      {userData.birthDate}
                    </div>
                  </div>

                  {/* IIN - positioned absolutely at bottom */}
                  <div
                    className="absolute"
                    style={{
                      bottom: `${positions.iin.bottom}px`,
                      left: `${positions.iin.left}px`,
                    }}
                  >
                    <span
                      className="text-gray-900"
                      style={{
                        fontSize: `${positions.iin.fontSize}px`,
                        letterSpacing: `${positions.iin.letterSpacing}em`,
                        fontWeight: positions.iin.fontWeight,
                        fontFamily,
                      }}
                    >
                      {userData.iin}
                    </span>
                  </div>
                </div>
              </div>

              {/* ID Card Back */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm relative aspect-[1.58/1]">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/udostoverenie-back-bg.png')",
                  }}
                ></div>

                <div className="relative p-4 h-full flex flex-col">
                  <div
                    className="flex justify-between items-start"
                    style={{
                      position: "relative",
                      top: `${positions.barcode.top}px`,
                    }}
                  >
                    {/* Barcode SVG */}
                    <svg
                      ref={el => {
                        if (el) {
                          try {
                            JsBarcode(el, userData.docNumber, {
                              format: "CODE128",
                              width: 2,
                              height: 30,
                              margin: 5,
                              displayValue: false,
                              background: "transparent",
                              lineColor: "#000000",
                            });
                          } catch (e) {
                            console.error("Barcode error:", e);
                          }
                        }
                      }}
                      style={{
                        width: `${positions.barcode.width}px`,
                        height: `${positions.barcode.height}px`,
                        marginLeft: `${positions.barcode.left}px`,
                      }}
                    ></svg>

                    <div
                      style={{
                        fontSize: `${positions.docNumber.fontSize}px`,
                        fontWeight: positions.docNumber.fontWeight,
                        marginRight: `${positions.docNumber.right}px`,
                        marginTop: `${positions.docNumber.top}px`,
                        fontFamily: '"Times New Roman", Times, serif',
                      }}
                      className="text-gray-900"
                    >
                      {userData.docNumber}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <div
                        className="absolute"
                        style={{
                          top: `${positions.birthPlace.top}px`,
                          left: `${positions.birthPlace.left}px`,
                        }}
                      >
                        <div
                          className="text-black leading-tight"
                          style={{
                            fontSize: `${positions.birthPlace.fontSize}px`,
                            fontWeight: positions.birthPlace.fontWeight,
                            fontFamily,
                          }}
                        >
                          {userData.birthPlace}
                        </div>
                      </div>
                      <div
                        className="absolute"
                        style={{
                          top: `${positions.nationality.top}px`,
                          left: `${positions.nationality.left}px`,
                        }}
                      >
                        <div
                          className="text-black leading-tight"
                          style={{
                            fontSize: `${positions.nationality.fontSize}px`,
                            fontWeight: positions.nationality.fontWeight,
                            fontFamily,
                          }}
                        >
                          {userData.nationality}
                        </div>
                      </div>
                      <div
                        className="absolute"
                        style={{
                          top: `${positions.ministry.top}px`,
                          left: `${positions.ministry.left}px`,
                        }}
                      >
                        <div
                          className="text-black leading-tight"
                          style={{
                            fontSize: `${positions.ministry.fontSize}px`,
                            fontWeight: positions.ministry.fontWeight,
                            fontFamily,
                          }}
                        >
                          МИНИСТЕРСТВО ВНУТРЕННИХ ДЕЛ РК
                        </div>
                      </div>
                      <div
                        className="absolute"
                        style={{
                          top: `${positions.dates.top}px`,
                          left: `${positions.dates.left}px`,
                        }}
                      >
                        <div
                          className="text-black leading-tight"
                          style={{
                            fontSize: `${positions.dates.fontSize}px`,
                            fontWeight: positions.dates.fontWeight,
                            fontFamily,
                          }}
                        >
                          {userData.issueDate} - {userData.expiryDate}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="text-gray-900 break-all"
                    style={{
                      fontSize: `${positions.mrz.fontSize}px`,
                      position: "absolute",
                      bottom: `${positions.mrz.bottom}px`,
                      left: `${positions.mrz.left}px`,
                      whiteSpace: "pre",
                      lineHeight: "1.6",
                      fontFamily,
                      letterSpacing: "0.02em",
                      fontWeight: 490,
                    }}
                  >
                    {"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n"}
                    {generateMRZ()}
                    {"\n<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {requisites.map(item => (
                <RequisiteRow
                  key={item.key}
                  label={item.label}
                  value={item.value}
                  isCopied={copiedField === item.key}
                  onCopy={() => handleCopyField(item.key, item.value)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none bg-white border-t border-gray-200 overflow-x-hidden">
        <div
          className="w-full max-w-[430px] px-4 py-3 pointer-events-auto space-y-3"
          style={{
            paddingBottom: `max(${positions.buttons.paddingBottom}px, env(safe-area-inset-bottom))`,
          }}
        >
          {activeTab === "document" ? (
            <>
              <button
                onClick={() => {
                  generateNewCode();
                  setShowQR(true);
                }}
                className="w-full bg-[#2E7DE1] text-white font-semibold py-3.5 rounded-[12px] flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
              >
                <PresentIcon />
                Предъявить документ
              </button>
              <button
                onClick={handleShare}
                className="w-full border border-[#2E7DE1] bg-white text-[#2E7DE1] font-semibold py-3.5 rounded-[12px] flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
              >
                <SendIcon />
                Отправить документ
              </button>
            </>
          ) : (
            <button
              onClick={handleSendRequisites}
              className="w-full border border-[#2E7DE1] text-[#2E7DE1] font-semibold py-3.5 rounded-[12px] flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
            >
              <SendIcon />
              Отправить реквизиты
            </button>
          )}
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQR(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
            >
              <div className="w-full max-w-[430px] bg-white rounded-t-[24px] p-3 pb-20 pointer-events-auto relative">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3" />

                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-[20px] font-bold text-black">
                    Удостоверение личности
                  </h2>
                  <button
                    onClick={() => setShowQR(false)}
                    className="p-2 bg-gray-100 rounded-full"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="text-center space-y-4 ">
                  <p className="text-[15px] text-gray-500">
                    Покажите QR-код сотруднику
                  </p>

                  <div className="flex justify-center">
                    <div className="p-1.5 bg-white rounded-2xl">
                      <QRCode
                        value={JSON.stringify({
                          iin: userData.iin,
                          docNumber: userData.docNumber,
                          fullName: `${userData.lastName} ${userData.firstName}`,
                          timestamp: Date.now(),
                          code: qrCode,
                        })}
                        size={110}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 mb-5">
                    <p className="text-[15px] text-gray-500">или скажите код</p>
                    <p className="text-[25px] font-bold text-black tracking-[0.05em]">
                      {qrCode}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShare && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShare(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
            >
              <div className="w-full max-w-[430px] bg-white rounded-t-[24px] p-5 pb-10 pointer-events-auto relative">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-5" />

                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-[20px] font-bold text-black">Поделиться</h2>
                  <button
                    onClick={() => setShowShare(false)}
                    className="p-2 bg-gray-100 rounded-full"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-[15px] text-gray-600">Смотрите этот PDF-файл!</p>

                  <div className="grid grid-cols-4 gap-3 text-center text-[13px] text-gray-700">
                    <button className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500">⇪</div>
                      AirDrop
                    </button>
                    <button className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-[#0A84FF] text-white flex items-center justify-center text-sm font-semibold">@</div>
                      Почта
                    </button>
                    <button className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-[#FF9500] text-white flex items-center justify-center text-lg font-semibold">⚡</div>
                      Swiftgram
                    </button>
                    <button className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center text-lg font-semibold">☎</div>
                      WhatsApp
                    </button>
                  </div>

                  <div className="rounded-2xl border border-gray-200 divide-y divide-gray-200 overflow-hidden text-left text-[15px] text-black">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setShowShare(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 active:bg-gray-50"
                    >
                      <span>Скопировать ссылку</span>
                      <span className="text-gray-400">⧉</span>
                    </button>
                    <button
                      onClick={() => setShowShare(false)}
                      className="w-full flex items-center justify-between px-4 py-3 active:bg-gray-50"
                    >
                      <span>Отменить</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
}

function RequisiteRow({
  label,
  value,
  onCopy,
  isCopied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  isCopied: boolean;
}) {
  return (
    <div className="w-full py-2.5 flex items-center justify-between gap-3">
      <div className="flex-1">
        <p className="text-[13px] text-gray-500 mb-0.5">{label}</p>
        <p className="text-[16px] font-medium text-black leading-snug">
          {value}
        </p>
      </div>
      <button
        onClick={onCopy}
        className="p-1.5 text-gray-400 active:text-blue-600"
        aria-label={`Копировать поле ${label}`}
      >
        {isCopied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
      </button>
    </div>
  );
}
