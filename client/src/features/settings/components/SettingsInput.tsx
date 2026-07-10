import type { HTMLAttributes } from "react";

interface SettingsInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
}

export function SettingsInput({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: SettingsInputProps) {
  return (
    <label className="block space-y-1">
      <span className="text-[13px] text-kaspi-text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-xl border border-transparent bg-kaspi-surface px-3 py-2.5 text-[15px] font-medium text-kaspi-text outline-none transition-colors placeholder:text-kaspi-text-muted focus:border-kaspi-red focus:bg-white"
      />
    </label>
  );
}
