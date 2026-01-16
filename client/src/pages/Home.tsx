import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { Search, ChevronRight, FileText, Home as HomeIcon, Car, Wallet, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <MobileLayout className="pb-20">
      {/* Header */}
      <header className="bg-white px-4 pt-[max(env(safe-area-inset-top),12px)] pb-4 shrink-0">
        <div className="h-11 flex items-center">
          <Link href="/">
            <button className="p-2 -ml-2" aria-label="Назад">
              <ChevronRight className="rotate-180 text-gray-400" size={28} />
            </button>
          </Link>
          <h1 className="flex-1 text-center text-[17px] font-semibold text-black">Госуслуги</h1>
          <div className="w-10" aria-hidden="true" />
        </div>

        {/* Tabs */}
        <div className="bg-[#F2F2F7] p-1 rounded-xl flex mb-4">
          <button className="flex-1 bg-white rounded-lg py-1.5 text-[13px] font-medium shadow-sm text-black">
            Все услуги
          </button>
          <button className="flex-1 py-1.5 text-[13px] font-medium text-gray-500">
            Мои заявки
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Поиск по Госуслугам" 
            className="w-full bg-[#F2F2F7] rounded-xl py-2.5 pl-10 pr-4 text-[15px] placeholder:text-gray-400 outline-none"
          />
        </div>
      </header>

      <div
        className="p-4 space-y-6 overflow-y-auto flex-1 scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Documents Section */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/udostoverenie">
            <div className="bg-[#EFEFEF] rounded-2xl p-4 flex flex-col justify-between h-32 relative overflow-hidden cursor-pointer active:scale-95 transition-transform">
              <div className="w-10 h-7 bg-[#D4E8D4] rounded-md mb-2 relative border border-green-200/50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-green-300/50 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                </div>
              </div>
              <span className="text-[13px] leading-tight font-medium text-gray-800">
                Удостоверение<br/>личности
              </span>
            </div>
          </Link>
          
          <div className="bg-[#EFEFEF] rounded-2xl p-4 flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="w-10 h-7 bg-[#CCE4F0] rounded-md mb-2 relative border border-blue-200/50">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-blue-300/50 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>
            <span className="text-[13px] leading-tight font-medium text-gray-800">
              Паспорт<br/>гражданина РК
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[17px] font-medium text-blue-600">Все документы</span>
          <ChevronRight className="text-gray-400" size={20} />
        </div>

        {/* Services List */}
        <div className="space-y-6">
          <ServiceItem 
            icon={<FileText className="text-[#D93025]" />} 
            title="Справки" 
            subtitle="Социальные, по недвижимости и медицинские" 
          />
          <ServiceItem 
            icon={<HomeIcon className="text-[#D93025]" />} 
            title="Прописка и снятие с прописки по месту жительства" 
          />
          <ServiceItem 
            icon={<Wallet className="text-[#D93025]" />} 
            title="Пособия и выплаты" 
            subtitle="На ребенка, для многодетных, при потере работы" 
          />
          <ServiceItem 
            icon={<Car className="text-[#D93025]" />} 
            title="Переоформление автомобиля" 
          />
          <ServiceItem 
            icon={<CreditCard className="text-[#D93025]" />} 
            title="Декларация по форме 270" 
            subtitle="О доходах и имуществе" 
          />
          <ServiceItem 
            icon={<CreditCard className="text-[#D93025]" />} 
            title="Декларация по форме 250" 
            subtitle="Об активах и обязательствах" 
          />
        </div>
      </div>

      <BottomNav />
    </MobileLayout>
  );
}

function ServiceItem({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle?: string }) {
  return (
    <div className="flex items-start gap-4 cursor-pointer active:opacity-70">
      <div className="mt-1">
        {icon}
      </div>
      <div className="flex-1 border-b border-gray-200 pb-4">
        <div className="flex items-start justify-between">
          <div className="pr-4">
            <h3 className="text-[16px] text-black leading-snug mb-0.5">{title}</h3>
            {subtitle && <p className="text-[13px] text-gray-500 leading-snug">{subtitle}</p>}
          </div>
          <ChevronRight className="text-gray-300 shrink-0 mt-1" size={20} />
        </div>
      </div>
    </div>
  );
}
