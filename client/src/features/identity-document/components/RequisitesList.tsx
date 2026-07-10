import { Check, Copy } from "lucide-react";
import type { Requisite } from "../lib/documentData";

export function RequisitesList({
  requisites,
  copiedField,
  onCopyField,
}: {
  requisites: Requisite[];
  copiedField: string | null;
  onCopyField: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-0">
      {requisites.map((item) => (
        <RequisiteRow
          key={item.key}
          label={item.label}
          value={item.value}
          isCopied={copiedField === item.key}
          onCopy={() => onCopyField(item.key, item.value)}
        />
      ))}
    </div>
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
    <div className="w-full py-[13px] flex items-start justify-between gap-3">
      <div className="flex-1">
        <p className="text-[13px] font-normal text-[#8E8E93] leading-snug mb-1">
          {label}
        </p>
        <p className="text-[17px] font-normal text-[#1F1F24] leading-tight">
          {value}
        </p>
      </div>
      <button
        onClick={onCopy}
        className="p-1.5 mt-1 text-[#A8AEB8] active:text-blue-600"
        aria-label={`Копировать поле ${label}`}
      >
        {isCopied ? (
          <Check size={21} strokeWidth={1.7} className="text-green-600" />
        ) : (
          <Copy size={21} strokeWidth={1.7} />
        )}
      </button>
    </div>
  );
}
