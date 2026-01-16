import React from "react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function MobileLayout({ children, className }: MobileLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-white flex justify-center">
      <div 
        className={cn(
          "w-full max-w-[430px] min-h-screen bg-white relative shadow-2xl overflow-hidden flex flex-col",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
