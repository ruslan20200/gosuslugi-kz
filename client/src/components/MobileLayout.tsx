import React from "react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function MobileLayout({ children, className }: MobileLayoutProps) {
  return (
    <div className="h-screen w-full bg-white flex justify-center" style={{ height: "100dvh" }}>
      {/* Фиксированная высота: шапка и низ никогда не двигаются, скроллится только контент внутри */}
      <div
        className={cn(
          "w-full max-w-[430px] h-full bg-white relative shadow-none md:shadow-2xl overflow-hidden flex flex-col",
          className
        )}
        style={{
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
