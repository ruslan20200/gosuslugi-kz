import type { ReactNode } from "react";

export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h3 className="text-[15px] font-semibold text-kaspi-text">{title}</h3>
      {children}
    </div>
  );
}
