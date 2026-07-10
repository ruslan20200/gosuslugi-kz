interface SettingsSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[] | readonly string[];
}

export function SettingsSelect({ label, value, onChange, options }: SettingsSelectProps) {
  return (
    <label className="block space-y-1">
      <span className="text-[13px] text-kaspi-text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-transparent bg-kaspi-surface px-3 py-2.5 text-[15px] font-medium text-kaspi-text outline-none transition-colors focus:border-kaspi-red focus:bg-white"
      >
        {options.map((option) => {
          const item = typeof option === "string" ? { value: option, label: option } : option;
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}
