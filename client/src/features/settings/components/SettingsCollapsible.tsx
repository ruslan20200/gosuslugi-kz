import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/* Раскрываемый блок настроек: заголовок с подписью и стрелкой,
   контент скрыт по умолчанию — чтобы редкие поля не мешали. */
export function SettingsCollapsible({
  title,
  hint,
  defaultOpen = false,
  children,
}: {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-[#F7F7F8]"
        aria-expanded={open}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-kaspi-text">{title}</span>
          {hint && (
            <span className="mt-0.5 block text-[12px] leading-snug text-kaspi-text-muted">
              {hint}
            </span>
          )}
        </span>
        <ChevronDown
          size={20}
          strokeWidth={2}
          className={`shrink-0 text-[#9A9AA2] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="space-y-3 px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}
