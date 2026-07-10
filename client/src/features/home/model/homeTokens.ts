export const homeTokens = {
  mobileLayout: "pb-20",
  header:
    "bg-white px-4 pt-[max(env(safe-area-inset-top),12px)] pb-4 shrink-0",
  headerRow: "h-11 flex items-center",
  backButton: "p-2 -ml-2",
  backIcon: "rotate-180 text-gray-400",
  title: "flex-1 text-center text-[17px] font-semibold text-black",
  headerSpacer: "w-10",
  tabs: "bg-[#F2F2F7] p-1 rounded-xl flex mb-4",
  tabActive:
    "flex-1 bg-white rounded-lg py-1.5 text-[13px] font-medium shadow-sm text-black",
  tabInactive: "flex-1 py-1.5 text-[13px] font-medium text-gray-500",
  searchWrap: "relative",
  searchIcon: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",
  searchInput:
    "w-full bg-[#F2F2F7] rounded-xl py-2.5 pl-10 pr-4 text-[15px] placeholder:text-gray-400 outline-none",
  content: "p-4 space-y-6 overflow-y-auto flex-1 scroll-smooth",
  documentGrid: "grid grid-cols-2 gap-3",
  documentCard:
    "bg-[#EFEFEF] rounded-2xl p-4 flex flex-col justify-between h-32 relative overflow-hidden cursor-pointer active:scale-95 transition-transform",
  documentTitle:
    "text-[13px] leading-tight font-medium text-gray-800 whitespace-pre-line",
  documentsLinkRow: "flex items-center justify-between",
  documentsLinkText: "text-[17px] font-medium text-blue-600",
  documentsLinkIcon: "text-gray-400",
  badgeBase: "w-10 h-7 rounded-md mb-2 relative border",
  badgeCenter: "absolute inset-0 flex items-center justify-center",
  badgeOuterDot: "w-4 h-4 rounded-full flex items-center justify-center",
  badgeInnerDot: "w-2 h-2 rounded-full",
  serviceList: "space-y-6",
  serviceItem: "flex items-start gap-4 cursor-pointer active:opacity-70",
  serviceIconWrap: "mt-1",
  serviceIcon: "text-[#D93025]",
  serviceContent: "flex-1 border-b border-gray-200 pb-4",
  serviceRow: "flex items-start justify-between",
  serviceTextWrap: "pr-4",
  serviceTitle: "text-[16px] text-black leading-snug mb-0.5",
  serviceSubtitle: "text-[13px] text-gray-500 leading-snug",
  serviceChevron: "text-gray-300 shrink-0 mt-1",
};

export const documentToneTokens = {
  green: {
    badge: "bg-[#D4E8D4] border-green-200/50",
    outerDot: "bg-green-300/50",
    innerDot: "bg-green-600",
  },
  blue: {
    badge: "bg-[#CCE4F0] border-blue-200/50",
    outerDot: "bg-blue-300/50",
    innerDot: "bg-blue-600",
  },
} as const;
