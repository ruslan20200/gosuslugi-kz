/* Цветные иконки категорий Госуслуг — под референс реального приложения */

type IconProps = { className?: string };

const box = "0 0 40 40";

export function MegaphoneIcon({ className }: IconProps) {
  return (
    <svg viewBox={box} className={className} fill="none" aria-hidden="true">
      <path
        d="M8 17.5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h3l11 5.5V12L11 17.5H8Z"
        fill="#FF7A45"
      />
      <path d="M11 23.5h4v4.4a2 2 0 1 1-4 0v-4.4Z" fill="#F2632C" />
      <path
        d="M25.5 16c2.2 1.3 3.5 3 3.5 4.5s-1.3 3.2-3.5 4.5"
        stroke="#FFB48C"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DocCheckIcon({ className }: IconProps) {
  return (
    <svg viewBox={box} className={className} fill="none" aria-hidden="true">
      <path
        d="M11 6.5h10.5L29 14v16a2.5 2.5 0 0 1-2.5 2.5H11A2.5 2.5 0 0 1 8.5 30V9A2.5 2.5 0 0 1 11 6.5Z"
        fill="#EEF2F8"
      />
      <path d="M21.5 6.5 29 14h-5.5a2 2 0 0 1-2-2V6.5Z" fill="#CDD8E8" />
      <rect x="12.5" y="17" width="11" height="2" rx="1" fill="#A4B0C4" />
      <rect x="12.5" y="21" width="8.5" height="2" rx="1" fill="#A4B0C4" />
      <circle cx="27" cy="28.5" r="6.5" fill="#35B36A" />
      <path
        d="m24 28.6 2 2 4-4.2"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CarIcon({ className }: IconProps) {
  return (
    <svg viewBox={box} className={className} fill="none" aria-hidden="true">
      <path
        d="M5 25.2c0-.8.5-1.5 1.2-1.8l1.7-.7 2-4.3A4.2 4.2 0 0 1 13.7 16h9.1a4.2 4.2 0 0 1 3.3 1.6l2.7 3.6 3.1.9A2.1 2.1 0 0 1 35 24.1V26a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 26v-.8Z"
        fill="#E8402F"
      />
      <path d="M13.6 17.6 11.8 21.5H18v-3.9h-4.4Z" fill="#CBE6F7" />
      <path d="M20 17.6v3.9h6.6l-2.7-3.4a1.8 1.8 0 0 0-1.4-.5H20Z" fill="#CBE6F7" />
      <circle cx="13" cy="27.4" r="3.4" fill="#2B2B30" />
      <circle cx="13" cy="27.4" r="1.4" fill="#C2C6CE" />
      <circle cx="27" cy="27.4" r="3.4" fill="#2B2B30" />
      <circle cx="27" cy="27.4" r="1.4" fill="#C2C6CE" />
    </svg>
  );
}

export function HouseIcon({ className }: IconProps) {
  return (
    <svg viewBox={box} className={className} fill="none" aria-hidden="true">
      <path d="M12 18.5h16v11a1.8 1.8 0 0 1-1.8 1.8H13.8A1.8 1.8 0 0 1 12 29.5V18.5Z" fill="#D7E3F4" />
      <path
        d="M20 7 5.5 18.4a1.4 1.4 0 0 0 .9 2.5h27.2a1.4 1.4 0 0 0 .9-2.5L20 7Z"
        fill="#4A90D9"
      />
      <rect x="17.5" y="24" width="5" height="7.3" rx="0.8" fill="#4A90D9" />
    </svg>
  );
}

export function StrollerIcon({ className }: IconProps) {
  return (
    <svg viewBox={box} className={className} fill="none" aria-hidden="true">
      <path d="M8 21a11 11 0 0 1 11-11h.5v11H8Z" fill="#4A90D9" />
      <path
        d="M6.5 21h16.8l-2.4 4.8A3.5 3.5 0 0 1 17.8 28h-5A6.3 6.3 0 0 1 6.5 21Z"
        fill="#5B9BD5"
      />
      <path d="M19.5 10.5 29 6" stroke="#3C7BC4" strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="12" cy="30.5" r="2.7" fill="#2B2B30" />
      <circle cx="21" cy="30.5" r="2.7" fill="#2B2B30" />
    </svg>
  );
}
