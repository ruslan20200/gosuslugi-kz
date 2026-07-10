import { Home, Menu, MessageSquare, QrCode, type LucideIcon } from "lucide-react";
import { APP_ROUTES, type AppRoute } from "@/shared/config/routes";

export type BottomNavItem = {
  icon: LucideIcon;
  label: string;
  path: AppRoute;
};

export const bottomNavItems: BottomNavItem[] = [
  { icon: Home, label: "Главная", path: APP_ROUTES.home },
  { icon: QrCode, label: "Kaspi QR", path: APP_ROUTES.qr },
  { icon: MessageSquare, label: "Сообщения", path: APP_ROUTES.messages },
  { icon: Menu, label: "Сервисы", path: APP_ROUTES.services },
];
