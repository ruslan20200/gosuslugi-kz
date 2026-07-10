import { useEffect, useRef, useState, type ReactNode } from "react";
import JsBarcode from "jsbarcode";
import type { UserData } from "@/hooks/useUserData";
import { CARD_ASPECT, CARD_BASE_WIDTH, POSITIONS } from "../constants/documentLayout";

/* Карточка рендерится в базовой системе координат (398px) и масштабируется
   целиком под ширину экрана — тексты никогда не съезжают от фона */
function ScaledCard({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / CARD_BASE_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
      style={{ aspectRatio: `${CARD_ASPECT} / 1` }}
    >
      <div
        className="absolute left-0 top-0"
        style={{
          width: CARD_BASE_WIDTH,
          height: CARD_BASE_WIDTH / CARD_ASPECT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface IdentityDocumentCardsProps {
  userData: UserData;
  fontFamily: string;
  mrzLine: string;
}

export function IdentityDocumentCards({
  userData,
  fontFamily,
  mrzLine,
}: IdentityDocumentCardsProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = barcodeRef.current;
    if (!el) return;

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
    } catch (error) {
      console.error("Barcode error:", error);
    }
  }, [userData.docNumber]);

  return (
    <div className="space-y-4">
      <IdentityDocumentFront userData={userData} fontFamily={fontFamily} />
      <IdentityDocumentBack
        userData={userData}
        fontFamily={fontFamily}
        mrzLine={mrzLine}
        barcodeRef={barcodeRef}
      />
    </div>
  );
}

function IdentityDocumentFront({
  userData,
  fontFamily,
}: {
  userData: UserData;
  fontFamily: string;
}) {
  return (
    <ScaledCard>
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm relative h-full w-full">
      <picture className="absolute inset-0">
        <source srcSet="/udostoverenie-bg.webp" type="image/webp" />
        <img
          src="/udostoverenie-bg.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          decoding="async"
          fetchPriority="high"
        />
      </picture>

      <div className="absolute inset-0 p-4 flex flex-col">
        <div
          className="absolute aspect-[3/4] bg-gray-200 overflow-hidden shadow-sm"
          style={{
            left: `${POSITIONS.photo.left}px`,
            top: POSITIONS.photo.top,
            width: `${POSITIONS.photo.width}%`,
            transform: `translateY(${POSITIONS.photo.translateY})`,
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

        <FrontTextField
          position={POSITIONS.lastName}
          value={userData.lastName}
          fontFamily={fontFamily}
        />
        <FrontTextField
          position={POSITIONS.firstName}
          value={userData.firstName}
          fontFamily={fontFamily}
        />
        <FrontTextField
          position={POSITIONS.middleName}
          value={userData.middleName}
          fontFamily={fontFamily}
        />
        <FrontTextField
          position={POSITIONS.birthDate}
          value={userData.birthDate}
          fontFamily={fontFamily}
        />
        <FrontTextField
          position={POSITIONS.gender}
          value={userData.gender}
          fontFamily={fontFamily}
        />

        <div
          className="absolute"
          style={{
            bottom: `${POSITIONS.iin.bottom}px`,
            left: `${POSITIONS.iin.left}px`,
          }}
        >
          <span
            className="text-gray-900"
            style={{
              fontSize: `${POSITIONS.iin.fontSize}px`,
              letterSpacing: `${POSITIONS.iin.letterSpacing}em`,
              fontWeight: POSITIONS.iin.fontWeight,
              fontFamily,
            }}
          >
            {userData.iin}
          </span>
        </div>
      </div>
    </div>
    </ScaledCard>
  );
}

function FrontTextField({
  position,
  value,
  fontFamily,
}: {
  position: {
    left: number;
    top: number;
    translateY: string;
    fontSize: number;
    fontWeight: number;
  };
  value: string;
  fontFamily: string;
}) {
  return (
    <div
      className="absolute"
      style={{
        left: `${position.left}%`,
        top: `${position.top}%`,
        transform: `translateY(${position.translateY})`,
      }}
    >
      <div
        className="font-medium text-gray-900 leading-none"
        style={{
          fontSize: `${position.fontSize}px`,
          fontWeight: position.fontWeight,
          fontFamily,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function IdentityDocumentBack({
  userData,
  fontFamily,
  mrzLine,
  barcodeRef,
}: {
  userData: UserData;
  fontFamily: string;
  mrzLine: string;
  barcodeRef: React.RefObject<SVGSVGElement | null>;
}) {
  return (
    <ScaledCard>
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm relative h-full w-full">
      <picture className="absolute inset-0">
        <source srcSet="/udostoverenie-back-bg.webp" type="image/webp" />
        <img
          src="/udostoverenie-back-bg.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </picture>

      <div className="relative p-4 h-full flex flex-col">
        <div
          className="flex justify-between items-start"
          style={{
            position: "relative",
            top: `${POSITIONS.barcode.top}px`,
          }}
        >
          <svg
            ref={barcodeRef}
            style={{
              width: `${POSITIONS.barcode.width}px`,
              height: `${POSITIONS.barcode.height}px`,
              marginLeft: `${POSITIONS.barcode.left}px`,
            }}
          />

          <div
            style={{
              fontSize: `${POSITIONS.docNumber.fontSize}px`,
              fontWeight: POSITIONS.docNumber.fontWeight,
              marginRight: `${POSITIONS.docNumber.right}px`,
              marginTop: `${POSITIONS.docNumber.top}px`,
              fontFamily: '"Times New Roman", Times, serif',
            }}
            className="text-gray-900"
          >
            {userData.docNumber}
          </div>
        </div>

        <BackTextField
          position={POSITIONS.birthPlace}
          value={userData.birthPlace}
          fontFamily={fontFamily}
        />
        <BackTextField
          position={POSITIONS.nationality}
          value={userData.nationality}
          fontFamily={fontFamily}
        />
        <BackTextField
          position={POSITIONS.citizenship}
          value={userData.citizenship}
          fontFamily={fontFamily}
        />
        <BackTextField
          position={POSITIONS.dates}
          value={`${userData.issueDate} - ${userData.expiryDate}`}
          fontFamily={fontFamily}
        />
        <BackTextField
          position={POSITIONS.issuingAuthority}
          value={userData.issuingAuthority}
          fontFamily={fontFamily}
        />

        <div
          className="text-gray-900 break-all"
          style={{
            fontSize: `${POSITIONS.mrz.fontSize}px`,
            position: "absolute",
            bottom: `${POSITIONS.mrz.bottom}px`,
            left: `${POSITIONS.mrz.left}px`,
            whiteSpace: "pre",
            lineHeight: "1.6",
            fontFamily,
            letterSpacing: "0.02em",
            fontWeight: 490,
          }}
        >
          {"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n"}
          {mrzLine}
          {"\n<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"}
        </div>
      </div>
    </div>
    </ScaledCard>
  );
}

function BackTextField({
  position,
  value,
  fontFamily,
}: {
  position: { top: number; left: number; fontSize: number; fontWeight: number };
  value: string;
  fontFamily: string;
}) {
  return (
    <div
      className="absolute"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div
        className="text-black leading-tight"
        style={{
          fontSize: `${position.fontSize}px`,
          fontWeight: position.fontWeight,
          fontFamily,
        }}
      >
        {value}
      </div>
    </div>
  );
}
