import { Home, MessageSquare, Settings, QrCode } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Главная", path: "/" },
    { icon: QrCode, label: "Kaspi QR", path: "/qr" },
    { icon: MessageSquare, label: "Сообщения", path: "/messages" },
    { icon: Settings, label: "Настройки", path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-[430px] bg-white border-t border-gray-200 pb-safe pointer-events-auto">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className="flex flex-col items-center justify-center w-full h-full space-y-1 cursor-pointer">
                  <item.icon 
                    size={24} 
                    className={cn(
                      "transition-colors",
                      isActive ? "text-[#D93025]" : "text-gray-400"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span 
                    className={cn(
                      "text-[10px] font-medium",
                      isActive ? "text-[#D93025]" : "text-gray-400"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
