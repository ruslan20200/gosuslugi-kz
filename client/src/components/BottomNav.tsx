import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { bottomNavItems } from "@/shared/navigation/bottomNavItems";
import { APP_ROUTES } from "@/shared/config/routes";

export default function BottomNav() {
  const [location] = useLocation();
  /* Госуслуги открываются с Главной — таб «Главная» остаётся активным (как в Kaspi) */
  const homeRoutes = new Set<string>([
    APP_ROUTES.home,
    APP_ROUTES.govServices,
    APP_ROUTES.digitalDocuments,
  ]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div
        className="w-full max-w-[430px] bg-white/95 border-t border-gray-200 pointer-events-auto backdrop-blur"
        style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
      >
        <nav className="flex h-16 items-center justify-around" aria-label="Нижняя навигация">
          {bottomNavItems.map((item) => {
            const isActive =
              location === item.path ||
              (item.path === APP_ROUTES.home && homeRoutes.has(location));
            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex h-full min-w-[78px] flex-col items-center justify-center gap-1 rounded-xl px-2 active:bg-[#F7F7F8]"
                aria-current={isActive ? "page" : undefined}
              >
                <span className="flex flex-col items-center justify-center gap-1">
                  <item.icon
                    size={25}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-kaspi-red" : "text-[#5F5F66]"
                    )}
                    strokeWidth={isActive ? 1.9 : 1.6}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none",
                      isActive ? "text-kaspi-red" : "text-[#5F5F66]"
                    )}
                  >
                    {item.label}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
