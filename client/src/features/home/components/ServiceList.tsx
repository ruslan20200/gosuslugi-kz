import {
  Car,
  ChevronRight,
  CreditCard,
  FileText,
  Home as HomeIcon,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { ServiceItemData } from "../model/homeContent";
import { homeTokens } from "../model/homeTokens";

const serviceIcons: Record<ServiceItemData["icon"], LucideIcon> = {
  fileText: FileText,
  home: HomeIcon,
  wallet: Wallet,
  car: Car,
  creditCard: CreditCard,
};

export function ServiceList({ services }: { services: ServiceItemData[] }) {
  return (
    <div className={homeTokens.serviceList}>
      {services.map((service) => (
        <ServiceItem key={service.title} service={service} />
      ))}
    </div>
  );
}

function ServiceItem({ service }: { service: ServiceItemData }) {
  const Icon = serviceIcons[service.icon];

  return (
    <div className={homeTokens.serviceItem}>
      <div className={homeTokens.serviceIconWrap}>
        <Icon className={homeTokens.serviceIcon} />
      </div>
      <div className={homeTokens.serviceContent}>
        <div className={homeTokens.serviceRow}>
          <div className={homeTokens.serviceTextWrap}>
            <h3 className={homeTokens.serviceTitle}>
              {service.title}
            </h3>
            {service.subtitle && (
              <p className={homeTokens.serviceSubtitle}>
                {service.subtitle}
              </p>
            )}
          </div>
          <ChevronRight className={homeTokens.serviceChevron} size={20} />
        </div>
      </div>
    </div>
  );
}
