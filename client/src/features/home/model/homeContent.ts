import { APP_ROUTES, type AppRoute } from "@/shared/config/routes";

export type DocumentShortcut = {
  title: string;
  href?: AppRoute;
  tone: "green" | "blue";
};

export type ServiceItemData = {
  icon: "fileText" | "home" | "wallet" | "car" | "creditCard";
  title: string;
  subtitle?: string;
};

export const homeHeaderContent = {
  title: "Госуслуги",
  backLabel: "Назад",
  searchPlaceholder: "Поиск по Госуслугам",
  tabs: [
    { key: "all", label: "Все услуги", isActive: true },
    { key: "requests", label: "Мои заявки", isActive: false },
  ],
} as const;

export const homeSectionLabels = {
  allDocuments: "Все документы",
} as const;

export const documentShortcuts: DocumentShortcut[] = [
  {
    title: "Удостоверение\nличности",
    href: APP_ROUTES.identityDocument,
    tone: "green",
  },
  {
    title: "Паспорт\nгражданина РК",
    tone: "blue",
  },
];

export const serviceItems: ServiceItemData[] = [
  {
    icon: "fileText",
    title: "Справки",
    subtitle: "Социальные, по недвижимости и медицинские",
  },
  {
    icon: "home",
    title: "Прописка и снятие с прописки по месту жительства",
  },
  {
    icon: "wallet",
    title: "Пособия и выплаты",
    subtitle: "На ребенка, для многодетных, при потере работы",
  },
  {
    icon: "car",
    title: "Переоформление автомобиля",
  },
  {
    icon: "creditCard",
    title: "Декларация по форме 270",
    subtitle: "О доходах и имуществе",
  },
  {
    icon: "creditCard",
    title: "Декларация по форме 250",
    subtitle: "Об активах и обязательствах",
  },
];
