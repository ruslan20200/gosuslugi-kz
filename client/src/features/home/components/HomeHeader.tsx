import { ChevronRight, Search } from "lucide-react";
import { Link } from "wouter";
import { APP_ROUTES } from "@/shared/config/routes";
import { homeHeaderContent } from "../model/homeContent";
import { homeTokens } from "../model/homeTokens";

export function HomeHeader() {
  return (
    <header className={homeTokens.header}>
      <div className={homeTokens.headerRow}>
        <Link href={APP_ROUTES.home}>
          <button className={homeTokens.backButton} aria-label={homeHeaderContent.backLabel}>
            <ChevronRight className={homeTokens.backIcon} size={28} />
          </button>
        </Link>
        <h1 className={homeTokens.title}>{homeHeaderContent.title}</h1>
        <div className={homeTokens.headerSpacer} aria-hidden="true" />
      </div>

      <div className={homeTokens.tabs}>
        {homeHeaderContent.tabs.map((tab) => (
          <button
            key={tab.key}
            className={tab.isActive ? homeTokens.tabActive : homeTokens.tabInactive}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={homeTokens.searchWrap}>
        <Search
          className={homeTokens.searchIcon}
          size={20}
        />
        <input
          type="text"
          placeholder={homeHeaderContent.searchPlaceholder}
          className={homeTokens.searchInput}
        />
      </div>
    </header>
  );
}
