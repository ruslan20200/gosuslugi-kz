import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const STEPS: { title: string; text: string }[] = [
  {
    title: "Заполните свои данные",
    text: "Ниже впишите ФИО, ИИН, дату рождения и фото — они сразу появятся в документах.",
  },
  {
    title: "Установите код доступа",
    text: "Кнопка «Установить код доступа» выше. Его спросят при входе в Госуслуги.",
  },
  {
    title: "Откройте документ",
    text: "Госуслуги → «Цифровые документы» → удостоверение, паспорт, права или образование.",
  },
  {
    title: "Покажите или отправьте",
    text: "Внизу документа: «Предъявить» — показать QR, «Отправить» — переслать PDF.",
  },
];

export function HowToUseCard() {
  const [open, setOpen] = useState(true);

  return (
    <div className="mt-3 overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-[#F7F7F8]"
        aria-expanded={open}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FEECEA] text-kaspi-red">
          <HelpCircle size={20} strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-kaspi-text">
            Как пользоваться
          </span>
          <span className="block text-[12px] text-kaspi-text-muted">
            Короткая инструкция в 4 шага
          </span>
        </span>
        <ChevronDown
          size={20}
          strokeWidth={2}
          className={`shrink-0 text-[#9A9AA2] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ol className="space-y-3.5 px-4 pb-4 pt-1">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-kaspi-red text-[13px] font-bold text-white">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-kaspi-text">
                  {step.title}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-kaspi-text-secondary">
                  {step.text}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
