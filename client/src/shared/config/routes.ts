export const APP_ROUTES = {
  home: "/",
  services: "/services",
  accessCode: "/access-code",
  govServices: "/gosuslugi",
  documentsLoading: "/documents/loading",
  digitalDocuments: "/documents",
  identityDocument: "/udostoverenie",
  education: "/obrazovanie",
  passport: "/pasport",
  license: "/prava",
  qr: "/qr",
  messages: "/messages",
  settings: "/settings",
  notFound: "/404",
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
