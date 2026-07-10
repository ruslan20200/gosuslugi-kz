export type IdentityDocumentTab = "document" | "details";

const TABS: { key: IdentityDocumentTab; label: string }[] = [
  { key: "document", label: "Документ" },
  { key: "details", label: "Реквизиты" },
];

/* Стиль переключателя — как «Все услуги / Мои заявки» в Госуслугах (SlidingTabs) */
export function DocumentTabs({
  activeTab,
  onChange,
}: {
  activeTab: IdentityDocumentTab;
  onChange: (tab: IdentityDocumentTab) => void;
}) {
  const activeIndex = activeTab === "document" ? 0 : 1;

  return (
    <div className="bg-white px-4 pb-3 pt-2">
      <div className="relative grid h-[46px] grid-cols-2 rounded-xl bg-kaspi-surface p-1">
        {/* «Ездящий» белый индикатор активного таба */}
        <span
          className="absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${activeIndex === 0 ? "4px" : "calc(100% + 4px)"})` }}
          aria-hidden="true"
        />
        {TABS.map((tab, index) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative z-10 rounded-lg text-[15px] font-medium transition-colors duration-200 ${
              activeIndex === index ? "text-kaspi-text" : "text-kaspi-text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
