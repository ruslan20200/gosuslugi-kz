import BottomNav from "@/components/BottomNav";
import MobileLayout from "@/components/MobileLayout";
import {
  CarIcon,
  DocCheckIcon,
  HouseIcon,
  MegaphoneIcon,
  StrollerIcon,
} from "@/features/kaspi/GovCategoryIcons";
import {
  ACCESS_CODE_LENGTH,
  clearStoredAccessCode,
  getStoredAccessCode,
  hasActiveAccessSession,
  markAccessSession,
  setStoredAccessCode,
} from "@/features/access-code/accessCodeStorage";
import { formatShortName, useUserData } from "@/hooks/useUserData";
import { APP_ROUTES } from "@/shared/config/routes";
import {
  Briefcase,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Delete,
  FileText,
  Gift,
  GraduationCap,
  Hand,
  IdCard,
  Landmark,
  ListTodo,
  LogOut,
  Luggage,
  MapPin,
  MessageSquare,
  Newspaper,
  QrCode,
  ReceiptText,
  Repeat2,
  ScanFace,
  Search,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Link, useLocation, useSearch } from "wouter";

/* Тонкие иконки — как фирменные outline-иконки Kaspi */
const ICON_STROKE = 1.5;

type ServiceIcon = {
  label: string;
  Icon: LucideIcon;
  href?: string;
  badge?: string;
};

type CategoryIcon = {
  label: string;
  emoji: string;
  active?: boolean;
};

function SearchBar({
  placeholder,
  withActions = false,
}: {
  placeholder: string;
  withActions?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4">
      <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#F1F1F4] px-3 text-[#A3A3A8]">
        <Search size={21} strokeWidth={2} />
        <input
          className="min-w-0 flex-1 bg-transparent text-[16px] font-normal text-kaspi-text outline-none placeholder:text-[#A3A3A8]"
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </label>
      {withActions && (
        <div className="flex items-center gap-2 text-[#424247]">
          <button className="grid h-11 w-11 place-items-center rounded-xl active:bg-gray-100" aria-label="Сканировать">
            <Camera size={24} strokeWidth={1.7} />
          </button>
          <button className="relative grid h-11 w-11 place-items-center rounded-xl active:bg-gray-100" aria-label="Корзина">
            <ShoppingCart size={24} strokeWidth={1.7} />
            <span className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-kaspi-red px-1 text-[10px] font-bold text-white">
              1
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function SectionBreak() {
  return <div className="h-3 bg-kaspi-surface" aria-hidden="true" />;
}

function PromoBanner() {
  return (
    <section className="mx-4 mt-3 overflow-hidden rounded-xl bg-[#6DB3E5] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
      <div className="relative h-[118px] px-4 py-4 text-white">
        <div className="relative z-10 max-w-[178px] text-[21px] font-bold leading-[1.04]">
          Пора за новой
          <br />
          техникой!
        </div>
        <div className="relative z-10 mt-3 inline-flex rounded-lg bg-kaspi-yellow px-3 py-1.5 text-[22px] font-extrabold leading-none text-black">
          0-0-24
        </div>
        <div className="absolute bottom-4 right-[132px] h-16 w-[88px] rounded-[8px] bg-[#1E2533] shadow-lg">
          <div className="absolute inset-x-2 top-2 h-10 rounded bg-gradient-to-br from-[#07D8EF] via-[#782DF1] to-[#1B1536]" />
          <div className="absolute -bottom-2 left-1/2 h-2 w-16 -translate-x-1/2 rounded-b bg-[#242938]" />
        </div>
        <div className="absolute bottom-7 right-[76px] h-12 w-16 rounded-t-full border-[7px] border-[#D6DCE4] border-b-0" />
        <div className="absolute bottom-6 right-[56px] h-8 w-[74px] rounded-xl bg-[#E8E9ED]" />
        <div className="absolute bottom-5 right-3 h-[80px] w-[54px] rounded-lg bg-[#F2F4F6] shadow-md">
          <div className="mx-auto mt-2 h-1 w-5 rounded-full bg-[#D7DCE2]" />
        </div>
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {Array.from({ length: 8 }).map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full ${index === 1 ? "w-4 bg-white" : "w-1.5 bg-white/55"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ZeroBadge({ className = "", text = "0-0-24" }: { className?: string; text?: string }) {
  return (
    <span className={`rounded bg-kaspi-yellow px-1.5 py-[2px] text-[10px] font-black leading-none text-black ${className}`}>
      {text}
    </span>
  );
}

function NewBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`rounded bg-kaspi-red px-1.5 py-[2px] text-[9px] font-black uppercase leading-none text-white ${className}`}>
      NEW
    </span>
  );
}

function MagnumIcon() {
  return (
    <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#D90056] text-[24px] font-black leading-none text-white shadow-sm">
      m
    </div>
  );
}

function ServiceButton({ item }: { item: ServiceIcon }) {
  const body = (
    <button className="relative flex min-h-[76px] w-full flex-col items-center justify-start gap-2 rounded-xl px-1 py-1 text-center active:bg-[#F6F6F7]">
      <div className="relative grid h-11 w-11 place-items-center">
        {item.label === "Magnum" ? (
          <MagnumIcon />
        ) : (
          <item.Icon className="text-kaspi-red" size={38} strokeWidth={ICON_STROKE} />
        )}
        {item.badge === "NEW" ? (
          <NewBadge className="absolute -right-2 top-0" />
        ) : (
          item.badge && <ZeroBadge className="absolute -right-2 top-0" text={item.badge} />
        )}
      </div>
      <span className="text-[14px] leading-[1.1] text-kaspi-text">{item.label}</span>
    </button>
  );

  if (!item.href) return body;

  return <Link href={item.href}>{body}</Link>;
}

const homeServices: ServiceIcon[] = [
  { label: "Магазин", Icon: ShoppingCart, badge: "0-0-24" },
  { label: "Мой Банк", Icon: Smartphone },
  { label: "Платежи", Icon: ReceiptText },
  { label: "Переводы", Icon: Repeat2 },
  { label: "Magnum", Icon: ShoppingCart },
  { label: "Travel", Icon: Luggage, badge: "0-0-24" },
  { label: "Госуслуги", Icon: Landmark, href: APP_ROUTES.accessCode },
  { label: "Работа", Icon: Briefcase },
];

const servicesPageGrid: ServiceIcon[] = [
  { label: "Магазин", Icon: ShoppingCart, badge: "0-0-24" },
  { label: "Мой Банк", Icon: Smartphone },
  { label: "Платежи", Icon: ReceiptText },
  { label: "Переводы", Icon: Repeat2 },
  { label: "Акции", Icon: Gift },
  { label: "Travel", Icon: Luggage, badge: "0-0-24" },
  { label: "Госуслуги", Icon: Landmark, href: APP_ROUTES.accessCode },
  { label: "Объявления", Icon: Newspaper },
  { label: "Гид", Icon: UserRound },
  { label: "Kaspi Maps", Icon: MapPin },
  { label: "Сертификаты", Icon: Gift },
  { label: "Работа", Icon: Briefcase },
  { label: "Kaspi Alaqan", Icon: Hand, badge: "NEW" },
];

function ServiceGrid({ items }: { items: ServiceIcon[] }) {
  return (
    <div className="grid grid-cols-4 gap-y-4 px-4 py-5">
      {items.map((item) => (
        <ServiceButton key={item.label} item={item} />
      ))}
    </div>
  );
}

function ProductFinanceStrip() {
  const items = [
    { tag: "0-0-24", title: "Рассрочка 0-0-24", color: "bg-kaspi-yellow", tone: "text-black" },
    { tag: "0-0-12", title: "Рассрочка 0-0-12", color: "bg-kaspi-yellow", tone: "text-black" },
    { tag: "Red+", title: "Kaspi Red+", subtitle: "Рассрочка до 500 000 ₸", color: "bg-kaspi-red", tone: "text-white" },
    { tag: "₸", title: "Кредит", subtitle: "до 2,2 млн ₸", color: "bg-[#93D333]", tone: "text-white" },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-4 px-4 py-4">
      {items.map((item) => (
        <button key={item.title} className="flex min-h-[58px] items-center gap-3 rounded-xl text-left active:bg-[#F7F7F8]">
          <div className={`grid h-11 w-14 shrink-0 place-items-center rounded-lg ${item.color} ${item.tone} text-[15px] font-black`}>
            {item.tag}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-medium leading-tight text-kaspi-text">{item.title}</div>
            {item.subtitle && <div className="truncate text-[12px] text-kaspi-text-muted">{item.subtitle}</div>}
          </div>
        </button>
      ))}
    </div>
  );
}

function RecentlyViewed() {
  const products = [
    { name: "Наушники Sams...", price: "69 900 ₸", bonus: "67 803 ₸", color: "bg-[#E8EEF7]", tag: "GALAXY BUDS3 PRO" },
    { name: "Раковина Minot...", price: "18 890 ₸", old: "20 990", bonus: "17 757 ₸", color: "bg-[#E6E2DE]", tag: "MINOTTI" },
    { name: "AXIS-Y Dark Spo...", price: "19 980 ₸", bonus: "19 381 ₸", color: "bg-[#F4EFEF]", tag: "Новогодний набор" },
    { name: "GIGABYTE...", price: "679 990 ₸", bonus: "659 600 ₸", color: "bg-[#EDEAF5]", tag: "RTX" },
  ];

  return (
    <section className="px-4 pb-24">
      <h2 className="mb-3 text-[19px] font-bold text-kaspi-text">Вы недавно смотрели</h2>
      <div className="kaspi-scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {products.map((product) => (
          <article key={product.name} className="w-[122px] shrink-0">
            <div className={`relative h-[116px] overflow-hidden rounded-xl ${product.color}`}>
              <div className="absolute left-2 top-2 rounded bg-white/80 px-1.5 py-1 text-[7px] font-bold text-[#51515A]">
                {product.tag}
              </div>
              <div className="absolute bottom-3 left-1/2 h-14 w-20 -translate-x-1/2 rounded-xl bg-white/75 shadow-inner" />
              <div className="absolute bottom-3 right-2 rounded bg-[#3EAD35] px-1.5 py-0.5 text-[10px] font-bold text-white">
                599 Б
              </div>
            </div>
            <div className="mt-2 text-[16px] font-bold leading-none text-kaspi-text">
              {product.price}
              {product.old && (
                <span className="ml-1 text-[11px] font-normal text-kaspi-text-muted line-through">{product.old}</span>
              )}
            </div>
            <div className="mt-1 rounded-lg bg-[#D9F0CB] px-2 py-1 text-[13px] font-semibold leading-tight text-[#477537]">
              {product.bonus}
              <br />
              <span className="font-normal">с учетом Бонусов</span>
            </div>
            <div className="mt-1 truncate text-[12px] text-kaspi-text-secondary">{product.name}</div>
            <div className="text-[12px] font-semibold text-kaspi-text">
              4.9 <span className="text-kaspi-red">★</span> (740)
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function KaspiHome() {
  return (
    <MobileLayout className="bg-white">
      <main className="flex-1 overflow-y-auto overscroll-contain pt-3" style={{ WebkitOverflowScrolling: "touch" }}>
        <SearchBar placeholder="Поиск по Kaspi.kz" withActions />
        <PromoBanner />
        <ServiceGrid items={homeServices} />
        <SectionBreak />
        <ProductFinanceStrip />
        <RecentlyViewed />
      </main>
      <BottomNav />
    </MobileLayout>
  );
}

function ProfileRow() {
  const { data } = useUserData();
  return (
    <Link href={APP_ROUTES.settings}>
      <button className="flex min-h-[76px] w-full items-center gap-4 px-4 text-left active:bg-[#F7F7F8]">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-[#C9C9CE] bg-[#F3F3F5] text-[#A0A0A6]">
          {data.photo ? (
            <img src={data.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserRound size={32} strokeWidth={1.5} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[17px] font-medium text-kaspi-text">{formatShortName(data)}</div>
          <div className="text-[13px] text-[#6E6E73]">Настройки</div>
        </div>
        <ChevronRight className="text-[#B9B9BE]" size={24} strokeWidth={1.8} />
      </button>
    </Link>
  );
}

function ServicesHeader() {
  return (
    <header className="shrink-0 bg-white">
      <div className="relative flex h-12 items-center justify-center px-4">
        <h1 className="text-[17px] font-bold text-kaspi-text">Сервисы</h1>
        <div className="absolute right-4 flex items-center gap-2 text-[15px]">
          <button className="px-1 text-kaspi-text">Қаз</button>
          <button className="rounded-full border border-kaspi-red px-2.5 py-0.5 font-semibold text-kaspi-red">
            Рус
          </button>
        </div>
      </div>
    </header>
  );
}

function PartnerServices() {
  const partners = [
    { name: "Magnum", subtitle: "Продукты с бесплатной доставкой", mark: "m", color: "bg-[#D90056] text-white" },
    { name: "Glovo", subtitle: "Сервис доставки еды", mark: "g", color: "bg-[#FFD629] text-[#12895E]" },
    { name: "Alipay+", subtitle: "Оплата за границей через QR", mark: "Alipay+", color: "bg-white text-[#4F5965] border border-[#D6D6DB] !text-[10px]" },
  ];

  return (
    <section className="bg-white px-4 py-5">
      <h2 className="mb-4 text-[18px] font-bold text-kaspi-text">Партнерские сервисы</h2>
      <div className="space-y-1">
        {partners.map((partner) => (
          <button key={partner.name} className="flex min-h-[70px] w-full items-center gap-4 rounded-xl text-left active:bg-[#F7F7F8]">
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-[18px] font-black ${partner.color}`}>
              {partner.mark}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[17px] text-kaspi-text">{partner.name}</div>
              <div className="truncate text-[13px] text-[#6E6E73]">{partner.subtitle}</div>
            </div>
            <ChevronRight className="text-[#B8B8BD]" strokeWidth={1.8} />
          </button>
        ))}
      </div>
    </section>
  );
}

export function ServicesPage() {
  return (
    <MobileLayout className="bg-white">
      <ServicesHeader />
      <main className="flex-1 overflow-y-auto overscroll-contain pb-24" style={{ WebkitOverflowScrolling: "touch" }}>
        <ProfileRow />
        <SectionBreak />
        <ServiceGrid items={servicesPageGrid} />
        <SectionBreak />
        <PartnerServices />
        <div className="kaspi-scrollbar-none flex gap-3 overflow-x-auto bg-kaspi-surface px-4 py-4">
          {["Объявления", "Объявления", "Авто"].map((title, index) => (
            <div key={`${title}-${index}`} className="h-20 w-[156px] shrink-0 rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-kaspi-text-secondary">
              <Newspaper className="mb-2 text-kaspi-red" size={20} strokeWidth={ICON_STROKE} />
              {title}
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </MobileLayout>
  );
}

function HeaderBar({
  title,
  backTo,
  right,
}: {
  title: string;
  backTo?: string;
  right?: ReactNode;
}) {
  return (
    <header className="relative z-20 shrink-0 bg-white">
      <div className="relative flex h-12 items-center justify-center px-3">
        {backTo && (
          <Link href={backTo}>
            <button
              className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-xl active:bg-gray-100"
              aria-label="Назад"
            >
              <ChevronLeft size={26} strokeWidth={1.8} />
            </button>
          </Link>
        )}
        <h1 className="max-w-[270px] truncate text-center text-[17px] font-bold text-kaspi-text">{title}</h1>
        {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
    </header>
  );
}

function EgovLogo() {
  return (
    <div className="grid h-[82px] w-[82px] place-items-center rounded-full border border-[#D4D4DA] bg-white text-[23px] font-black tracking-[-0.04em] text-[#365FAD]">
      e.gov
    </div>
  );
}

function KaspiLogo() {
  /* Официальный логотип Kaspi (SVG с kaspi.kz) — красный круг с белыми фигурами */
  return (
    <img
      src="/kaspi-logo.svg"
      alt="Kaspi.kz"
      className="h-[82px] w-[82px] select-none"
      draggable={false}
    />
  );
}

function EgovKaspiSplash({ onDone }: { onDone?: () => void }) {
  useEffect(() => {
    if (!onDone) return;
    const timer = window.setTimeout(onDone, 1100);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <MobileLayout className="bg-white">
      <button className="absolute right-5 top-5 z-30 grid h-11 w-11 place-items-center rounded-xl active:bg-black/5" aria-label="Закрыть">
        <X size={28} strokeWidth={1.6} className="text-kaspi-text" />
      </button>
      <main className="relative flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex items-center gap-4">
          <EgovLogo />
          <span className="text-[36px] font-light text-[#9E9EA6]">+</span>
          <KaspiLogo />
        </div>
        <div className="absolute bottom-16 text-center text-[15px] leading-tight text-[#6F6F76]">
          При поддержке Министерства
          <br />
          цифрового развития
        </div>
      </main>
    </MobileLayout>
  );
}

type CodeStage = "enter" | "verify-current" | "create" | "confirm";

const STAGE_TITLES: Record<CodeStage, string> = {
  enter: "Код доступа",
  "verify-current": "Введите текущий код",
  create: "Придумайте код доступа",
  confirm: "Повторите код доступа",
};

export function AccessCodePage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const isChangeMode = new URLSearchParams(search).get("mode") === "change";
  const { data } = useUserData();

  const [stage, setStage] = useState<CodeStage>(() => {
    const hasCode = Boolean(getStoredAccessCode());
    if (isChangeMode) return hasCode ? "verify-current" : "create";
    return hasCode ? "enter" : "create";
  });
  const [code, setCode] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const fullName = formatShortName(data);
  const exitHref = isChangeMode ? APP_ROUTES.settings : APP_ROUTES.home;

  /* Активная сессия (< 5 минут после верного кода) — пропускаем экран кода */
  const skipByActiveSession =
    !isChangeMode && Boolean(getStoredAccessCode()) && hasActiveAccessSession();

  useEffect(() => {
    if (skipByActiveSession) {
      setLocation(APP_ROUTES.govServices, { replace: true });
    }
  }, [skipByActiveSession, setLocation]);

  const failAttempt = (message: string, nextStage?: CodeStage) => {
    setError(message);
    setShakeKey((key) => key + 1);
    window.setTimeout(() => {
      setCode("");
      if (nextStage) setStage(nextStage);
    }, 420);
  };

  const succeed = () => {
    markAccessSession();
    /* replace: жест «назад» с Госуслуг ведёт на Главную, а не на экран кода */
    setLocation(APP_ROUTES.govServices, { replace: true });
  };

  const handleComplete = (entered: string) => {
    const stored = getStoredAccessCode();

    switch (stage) {
      case "enter": {
        if (entered === stored) {
          succeed();
        } else {
          failAttempt("Неверный код");
        }
        break;
      }
      case "verify-current": {
        if (entered === stored) {
          setError(null);
          window.setTimeout(() => {
            setCode("");
            setStage("create");
          }, 180);
        } else {
          failAttempt("Неверный код");
        }
        break;
      }
      case "create": {
        setDraft(entered);
        setError(null);
        window.setTimeout(() => {
          setCode("");
          setStage("confirm");
        }, 180);
        break;
      }
      case "confirm": {
        if (entered === draft) {
          setStoredAccessCode(entered);
          if (isChangeMode) {
            toast.success("Код доступа изменён");
            setLocation(APP_ROUTES.settings, { replace: true });
          } else {
            toast.success("Код доступа установлен");
            succeed();
          }
        } else {
          setDraft("");
          failAttempt("Коды не совпадают", "create");
        }
        break;
      }
    }
  };

  const pressDigit = (digit: string) => {
    setCode((prev) => {
      if (prev.length >= ACCESS_CODE_LENGTH) return prev;
      const next = prev + digit;
      if (next.length === ACCESS_CODE_LENGTH) {
        window.setTimeout(() => handleComplete(next), 140);
      }
      return next;
    });
  };

  const forgotCode = () => {
    clearStoredAccessCode();
    setCode("");
    setDraft("");
    setError(null);
    setStage("create");
    toast("Придумайте новый код доступа");
  };

  const showFaceId = stage === "enter";

  if (skipByActiveSession) {
    return (
      <MobileLayout className="bg-white">
        <div aria-hidden="true" />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout className="bg-white">
      <header className="relative z-20 flex h-12 items-center justify-between px-5 pt-2">
        {isChangeMode ? (
          <Link href={APP_ROUTES.settings}>
            <button className="grid h-11 w-11 place-items-center rounded-xl active:bg-black/5" aria-label="Назад">
              <ChevronLeft size={26} strokeWidth={1.7} />
            </button>
          </Link>
        ) : (
          <button className="grid h-11 w-11 place-items-center rounded-xl active:bg-black/5" aria-label="Выйти">
            <LogOut size={24} strokeWidth={1.6} />
          </button>
        )}
        <Link href={exitHref}>
          <button className="grid h-11 w-11 place-items-center rounded-xl active:bg-black/5" aria-label="Закрыть">
            <X size={27} strokeWidth={1.6} />
          </button>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center px-8 pb-8">
        <div className="mt-2 grid h-[82px] w-[82px] place-items-center overflow-hidden rounded-full border border-[#C9C9CE] bg-[#F4F4F6] text-[#B0B0B6]">
          {data.photo ? (
            <img src={data.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserRound size={54} strokeWidth={1.3} />
          )}
        </div>
        <div className="mt-4 text-[17px] text-kaspi-text">{fullName}</div>

        <div className="mt-[100px] text-[17px] text-kaspi-text">{STAGE_TITLES[stage]}</div>
        <div
          key={shakeKey}
          className={`mt-7 flex gap-6 ${error ? "animate-kaspi-shake" : ""}`}
          aria-label={`Введено ${code.length} цифр из ${ACCESS_CODE_LENGTH}`}
        >
          {Array.from({ length: ACCESS_CODE_LENGTH }).map((_, index) => (
            <span
              key={index}
              className={`h-3 w-3 rounded-full transition-colors ${
                index < code.length ? (error ? "bg-kaspi-red" : "bg-kaspi-red") : "bg-[#EBEBEF]"
              }`}
            />
          ))}
        </div>
        <div className="mt-4 h-5 text-[14px] text-kaspi-red">{error ?? ""}</div>

        <div className="mt-auto grid w-full grid-cols-3 gap-y-7 pb-5">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              className="mx-auto grid h-16 w-16 place-items-center rounded-full text-[31px] font-light text-kaspi-text active:bg-[#F2F2F4]"
              onClick={() => pressDigit(digit)}
            >
              {digit}
            </button>
          ))}
          {showFaceId ? (
            <button
              className="mx-auto grid h-16 w-16 place-items-center rounded-full active:bg-[#F2F2F4]"
              aria-label="Face ID"
              onClick={succeed}
            >
              <ScanFace size={33} strokeWidth={1.4} className="text-kaspi-text" />
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
          <button
            className="mx-auto grid h-16 w-16 place-items-center rounded-full text-[31px] font-light text-kaspi-text active:bg-[#F2F2F4]"
            onClick={() => pressDigit("0")}
          >
            0
          </button>
          <button
            className="mx-auto grid h-16 w-16 place-items-center rounded-full text-[#777780] active:bg-[#F2F2F4]"
            onClick={() => setCode((prev) => prev.slice(0, -1))}
            aria-label="Стереть цифру"
          >
            <Delete size={26} strokeWidth={1.5} />
          </button>
        </div>

        {stage === "enter" ? (
          <button
            className="mb-1 min-h-11 rounded-xl px-4 text-[15px] text-[#6E6E78] active:bg-[#F2F2F4]"
            onClick={forgotCode}
          >
            Забыли код доступа?
          </button>
        ) : (
          <div className="mb-1 min-h-11" aria-hidden="true" />
        )}
      </main>
    </MobileLayout>
  );
}

/* Миниатюры документов — цветные, как в приложении Kaspi */
function IdCardArt() {
  return (
    <svg viewBox="0 0 64 40" className="h-10 w-16" aria-hidden="true">
      <rect x="1" y="3" width="62" height="34" rx="4" fill="#DCEEDD" />
      <rect x="1" y="3" width="62" height="8" rx="4" fill="#BFE0C2" />
      <rect x="6" y="14" width="13" height="16" rx="1.5" fill="#8FBF93" />
      <rect x="23" y="15" width="26" height="3" rx="1.5" fill="#7FB585" />
      <rect x="23" y="21" width="20" height="3" rx="1.5" fill="#A5CDA9" />
      <rect x="23" y="27" width="24" height="3" rx="1.5" fill="#A5CDA9" />
      <circle cx="55" cy="7" r="2.5" fill="#5E9E66" />
    </svg>
  );
}

function DiplomaArt() {
  return (
    <svg viewBox="0 0 64 40" className="h-10 w-16" aria-hidden="true">
      <rect x="14" y="1" width="36" height="38" rx="2.5" fill="#E3EEFA" />
      <rect x="19" y="7" width="26" height="3" rx="1.5" fill="#7FA8D9" />
      <rect x="19" y="13" width="20" height="2.5" rx="1.25" fill="#A9C4E8" />
      <rect x="19" y="18" width="24" height="2.5" rx="1.25" fill="#A9C4E8" />
      <circle cx="26" cy="30" r="5" fill="#3B74C2" opacity="0.85" />
      <path d="M24 33.5l-1.6 4 3.6-1.6 3.6 1.6-1.6-4" fill="#E4B33C" />
    </svg>
  );
}

function PassportArt() {
  return (
    <svg viewBox="0 0 64 40" className="h-10 w-16" aria-hidden="true">
      <rect x="15" y="1" width="34" height="38" rx="3" fill="#2D9AD6" />
      <rect x="15" y="1" width="34" height="38" rx="3" fill="url(#none)" />
      <circle cx="32" cy="15" r="7" fill="#F8DA1C" opacity="0.95" />
      <circle cx="32" cy="15" r="4" fill="#2D9AD6" opacity="0.35" />
      <rect x="23" y="27" width="18" height="2.5" rx="1.25" fill="#BFE3F7" />
      <rect x="26" y="32" width="12" height="2.5" rx="1.25" fill="#BFE3F7" />
    </svg>
  );
}

function LicenseArt() {
  return (
    <svg viewBox="0 0 64 40" className="h-10 w-16" aria-hidden="true">
      <rect x="1" y="3" width="62" height="34" rx="4" fill="#FBE2E2" />
      <rect x="1" y="3" width="62" height="8" rx="4" fill="#F5C6C6" />
      <rect x="6" y="14" width="13" height="16" rx="1.5" fill="#E59A9A" />
      <rect x="23" y="15" width="26" height="3" rx="1.5" fill="#DD8484" />
      <rect x="23" y="21" width="18" height="3" rx="1.5" fill="#EFB3B3" />
      <rect x="23" y="27" width="22" height="3" rx="1.5" fill="#EFB3B3" />
    </svg>
  );
}

const docShortcuts = [
  { title: "Удостоверение\nличности", Art: IdCardArt, href: APP_ROUTES.identityDocument },
  { title: "Сведения об\nобразовании", Art: DiplomaArt, href: APP_ROUTES.education },
  { title: "Паспорт\nгражданина РК", Art: PassportArt, href: APP_ROUTES.passport },
  { title: "Водительские\nправа", Art: LicenseArt, href: APP_ROUTES.license },
];

const govCategories: {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}[] = [
  { label: "Популярные", Icon: MegaphoneIcon, active: true },
  { label: "Справки", Icon: DocCheckIcon },
  { label: "Авто", Icon: CarIcon },
  { label: "Жилье", Icon: HouseIcon },
  { label: "Семья", Icon: StrollerIcon },
];

function GovernmentDocumentCards() {
  return (
    <section className="bg-white px-4 pt-4">
      <div data-hscroll className="kaspi-scrollbar-none flex gap-3 overflow-x-auto pb-3">
        {docShortcuts.map((doc) => (
          <Link key={doc.title} href={doc.href}>
            <button className="flex h-[136px] w-[128px] shrink-0 flex-col justify-between rounded-2xl bg-kaspi-surface p-4 text-left active:scale-[0.98]">
              <doc.Art />
              <div className="whitespace-pre-line text-[15px] font-medium leading-tight text-kaspi-text">{doc.title}</div>
            </button>
          </Link>
        ))}
      </div>
      <Link href={APP_ROUTES.documentsLoading}>
        <button className="flex min-h-[52px] w-full items-center justify-between text-left active:bg-[#F7F7F8]">
          <span className="text-[17px] font-medium text-[#2E7DE1]">Все документы</span>
          <ChevronRight className="text-[#2E7DE1]" size={26} strokeWidth={1.8} />
        </button>
      </Link>
    </section>
  );
}

function GovCategories() {
  return (
    <div
      data-hscroll
      className="kaspi-scrollbar-none flex gap-6 overflow-x-auto border-y border-[#ECECF0] bg-white px-5 py-4"
    >
      {govCategories.map((category) => (
        <button key={category.label} className="relative flex shrink-0 flex-col items-center gap-2 rounded-xl px-1 pb-2 active:bg-[#F7F7F8]">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-kaspi-surface">
            <category.Icon className="h-8 w-8" />
          </div>
          <span className={`text-[14px] ${category.active ? "font-semibold text-kaspi-red" : "text-kaspi-text"}`}>
            {category.label}
          </span>
          {category.active && <span className="absolute bottom-0 h-[2px] w-full rounded-full bg-kaspi-red" />}
        </button>
      ))}
    </div>
  );
}

function PopularServicesList() {
  const items = [
    { title: "Стать самозанятым", subtitle: "Открыть счет и начать принимать оплату в Kaspi.kz", Icon: UserRound },
    { title: "Переоформление автомобиля", Icon: CreditCard },
    { title: "Проверка прописки", badge: "NEW", Icon: Search },
    { title: "Прописка", subtitle: "Временная и постоянная", Icon: FileText },
  ];

  return (
    <section className="bg-white px-4 pt-5">
      <h2 className="mb-5 text-[18px] font-bold text-kaspi-text">Популярные и новые</h2>
      <div className="space-y-1">
        {items.map((item) => (
          <button key={item.title} className="flex min-h-[76px] w-full items-center gap-4 rounded-xl text-left active:bg-[#F7F7F8]">
            <item.Icon className="shrink-0 text-kaspi-red" size={27} strokeWidth={ICON_STROKE} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[17px] font-normal text-kaspi-text">{item.title}</div>
              {item.subtitle && <div className="truncate text-[13px] text-[#6E6E76]">{item.subtitle}</div>}
            </div>
            {item.badge && (
              <span className="rounded-full bg-kaspi-red px-3 py-1 text-[12px] font-bold text-white">
                {item.badge}
              </span>
            )}
            <ChevronRight className="shrink-0 text-[#C7C7CC]" size={24} strokeWidth={1.8} />
          </button>
        ))}
      </div>
    </section>
  );
}

function MyApplicationsEmpty() {
  return (
    <>
      {/* Пустое состояние — как в приложении */}
      <div className="flex flex-col items-center bg-white px-6 pb-20 pt-16">
        <ListTodo size={78} strokeWidth={1.2} className="text-[#D6D6DB]" />
        <div className="mt-10 text-center text-[18px] font-bold text-kaspi-text">
          У вас нет активных заявок
        </div>
      </div>
      <SectionBreak />
      <button className="flex min-h-[64px] w-full items-center gap-4 bg-white px-5 text-left active:bg-[#F7F7F8]">
        <Clock size={24} strokeWidth={1.6} className="shrink-0 text-[#BE5B4B]" />
        <span className="min-w-0 flex-1 text-[17px] text-kaspi-text">История заявок</span>
        <ChevronRight className="shrink-0 text-[#C6C6CB]" size={24} strokeWidth={1.8} />
      </button>
    </>
  );
}

/* Переключатель с «ездящим» белым индикатором — как в приложении */
function SlidingTabs({
  tabs,
  activeIndex,
  onChange,
}: {
  tabs: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}) {
  return (
    <div className="relative grid h-[46px] grid-cols-2 rounded-xl bg-kaspi-surface p-1">
      <span
        className="absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${activeIndex === 0 ? "4px" : "calc(100% + 4px)"})` }}
        aria-hidden="true"
      />
      {tabs.map((label, index) => (
        <button
          key={label}
          className={`relative z-10 rounded-lg text-[15px] font-medium transition-colors duration-200 ${
            activeIndex === index ? "text-kaspi-text" : "text-kaspi-text-secondary"
          }`}
          onClick={() => onChange(index)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* Свайп между панелями: возвращает обработчики touch-событий */
function useTabSwipe(activeIndex: number, count: number, onChange: (index: number) => void) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    /* Жест начался внутри горизонтального скроллера (ряд документов/категорий) —
       не переключаем вкладку, чтобы его листание не кидало в «Мои заявки» */
    if (
      e.touches.length !== 1 ||
      (e.target as HTMLElement)?.closest?.("[data-hscroll]")
    ) {
      startRef.current = null;
      return;
    }
    startRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = startRef.current;
    startRef.current = null;
    if (!start) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    /* Требуем явно горизонтальный, длинный жест — вертикальный скролл не считается */
    if (Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
    if (dx < 0 && activeIndex < count - 1) onChange(activeIndex + 1);
    if (dx > 0 && activeIndex > 0) onChange(activeIndex - 1);
  };

  return { onTouchStart, onTouchEnd };
}

export function GovernmentServicesPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const swipe = useTabSwipe(tabIndex, 2, setTabIndex);

  return (
    <MobileLayout className="bg-white">
      {/* Шапка и табы зафиксированы — контент скользит под ними */}
      <HeaderBar title="Госуслуги" backTo={APP_ROUTES.home} />
      <div className="relative z-20 shrink-0 bg-white px-4 pb-3 pt-2">
        <SlidingTabs
          tabs={["Все услуги", "Мои заявки"]}
          activeIndex={tabIndex}
          onChange={setTabIndex}
        />
      </div>
      {/* Панели скользят вбок, у каждой свой скролл */}
      <div className="relative flex-1 overflow-hidden" {...swipe}>
        <div
          className="flex h-full w-[200%] transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${tabIndex === 0 ? "0" : "-50%"})` }}
        >
          <section
            className="h-full w-1/2 overflow-y-auto overscroll-contain pb-24"
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
          >
            <div className="pb-4 pt-1">
              <SearchBar placeholder="Поиск по Госуслугам" />
            </div>
            <SectionBreak />
            <GovernmentDocumentCards />
            <GovCategories />
            <PopularServicesList />
          </section>
          <section
            className="h-full w-1/2 overflow-y-auto overscroll-contain pb-24"
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
          >
            <MyApplicationsEmpty />
          </section>
        </div>
      </div>
      <BottomNav />
    </MobileLayout>
  );
}

export function DocumentsLoadingPage() {
  const [, setLocation] = useLocation();
  /* replace: жест «назад» с документов не возвращает на экран загрузки */
  return (
    <EgovKaspiSplash
      onDone={() => setLocation(APP_ROUTES.digitalDocuments, { replace: true })}
    />
  );
}

function DocumentListItem({
  title,
  Icon,
  badge,
  href,
}: {
  title: string;
  Icon: LucideIcon;
  badge?: string;
  href?: string;
}) {
  const body = (
    <button className="flex min-h-[78px] w-full items-center gap-4 rounded-xl px-2 text-left active:bg-[#F7F7F8]">
      <Icon className="shrink-0 text-[#616169]" size={26} strokeWidth={ICON_STROKE} />
      <span className="min-w-0 flex-1 text-[17px] leading-tight text-kaspi-text">{title}</span>
      {badge && <span className="rounded-full bg-kaspi-red px-3 py-1 text-[13px] font-bold text-white">{badge}</span>}
      <ChevronRight className="text-[#C6C6CB]" size={24} strokeWidth={1.8} />
    </button>
  );

  if (!href) return body;
  return <Link href={href}>{body}</Link>;
}

export function DigitalDocumentsPage() {
  const documents = [
    { title: "Удостоверение личности", Icon: IdCard, href: APP_ROUTES.identityDocument },
    { title: "Сведения об образовании", Icon: GraduationCap, href: APP_ROUTES.education },
    { title: "Паспорт гражданина РК", Icon: FileText, href: APP_ROUTES.passport },
    { title: "Водительские права", Icon: CreditCard, href: APP_ROUTES.license },
  ];

  return (
    <MobileLayout className="bg-white">
      {/* Шапка зафиксирована — список скроллится под ней */}
      <HeaderBar title="Цифровые документы" backTo={APP_ROUTES.govServices} />
      <main
        className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <h1 className="mt-5 text-[24px] font-bold leading-none text-kaspi-text">Мои документы</h1>
        <div className="mt-6">
          {documents.map((doc) => (
            <DocumentListItem key={doc.title} {...doc} />
          ))}
        </div>
      </main>
      {/* Нижняя кнопка зафиксирована */}
      <footer
        className="shrink-0 bg-white px-4 pt-2"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <button className="h-[54px] w-full rounded-xl border border-[#9FBAF3] text-[16px] font-medium text-[#2E7DE1] active:bg-[#F2F6FE]">
          Обновить список документов
        </button>
      </footer>
    </MobileLayout>
  );
}

export function PlaceholderPage({
  title,
  Icon,
}: {
  title: string;
  Icon: LucideIcon;
}) {
  return (
    <MobileLayout className="bg-white">
      <HeaderBar title={title} backTo={APP_ROUTES.home} />
      <main className="grid flex-1 place-items-center px-8 pb-24 text-center">
        <div>
          <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-kaspi-surface text-kaspi-red">
            <Icon size={38} strokeWidth={ICON_STROKE} />
          </div>
          <div className="text-[20px] font-bold text-kaspi-text">{title}</div>
          <div className="mt-2 text-[15px] leading-snug text-[#777780]">
            Раздел оставлен как заглушка, чтобы нижняя панель работала без ошибки.
          </div>
        </div>
      </main>
      <BottomNav />
    </MobileLayout>
  );
}

export function QrPlaceholderPage() {
  return <PlaceholderPage title="Kaspi QR" Icon={QrCode} />;
}

export function MessagesPlaceholderPage() {
  return <PlaceholderPage title="Сообщения" Icon={MessageSquare} />;
}
