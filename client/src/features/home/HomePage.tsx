import BottomNav from "@/components/BottomNav";
import MobileLayout from "@/components/MobileLayout";
import { DocumentShortcuts } from "./components/DocumentShortcuts";
import { HomeHeader } from "./components/HomeHeader";
import { ServiceList } from "./components/ServiceList";
import { documentShortcuts, serviceItems } from "./model/homeContent";
import { homeTokens } from "./model/homeTokens";

export default function HomePage() {
  return (
    <MobileLayout className={homeTokens.mobileLayout}>
      <HomeHeader />

      <div
        className={homeTokens.content}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <DocumentShortcuts documents={documentShortcuts} />
        <ServiceList services={serviceItems} />
      </div>

      <BottomNav />
    </MobileLayout>
  );
}
