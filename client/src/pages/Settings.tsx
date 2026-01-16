import MobileLayout from "@/components/MobileLayout";
import { useUserData } from "@/hooks/useUserData";
import { ChevronRight, Trash2, Upload } from "lucide-react";
import { Link } from "wouter";
import React from "react";

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join(".");
}

function onlyLetters(input: string) {
  return input.replace(/[^А-Яа-яA-Za-z\s\-]/g, "");
}

function onlyDigits(input: string, max = 12) {
  return input.replace(/\D/g, "").slice(0, max);
}

function normalizeDoc(input: string) {
  return input.replace(/[^A-Za-z0-9]/g, "").slice(0, 20).toUpperCase();
}

export default function Settings() {
  const { data, update, reset } = useUserData();

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (file.type.includes("image")) {
        update({ photo: result, pdf: undefined });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <MobileLayout className="bg-white">
      <header className="sticky top-0 left-0 right-0 z-20 bg-white flex items-center h-14 px-2">
        <Link href="/">
          <button className="p-2 -ml-1 flex items-center text-[#000000]">
            <ChevronRight className="rotate-180 w-6 h-6" />
          </button>
        </Link>
        <h1 className="flex-1 text-center font-semibold text-[17px] pr-8">Настройки</h1>
      </header>

      <div className="flex-1 overflow-y-auto bg-white px-4 pb-6">
        <div className="pt-3 pb-4">
          <h2 className="text-lg font-semibold">Мои данные</h2>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Заполните и сохраните — данные используются в удостоверении.</p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>⚠️ Важно: первые 6 цифр ИИН — это дата рождения в формате <b>ГГММДД</b>.</li>
              <li>✅ Пример: <b>070918</b> → год <b>07</b>, месяц <b>09</b>, день <b>18</b> → дата рождения <b>18.09.2007</b>.</li>
              <li>🔎 Если ИИН и дата рождения не совпадают — в документе будет неправильно.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <Section title="ФИО">
            <Input
              label="Фамилия"
              value={data.lastName}
              onChange={(v) => update({ lastName: onlyLetters(v) })}
              placeholder="Например Иванов"
            />
            <Input
              label="Имя"
              value={data.firstName}
              onChange={(v) => update({ firstName: onlyLetters(v) })}
              placeholder="Например Иван"
            />
            <Input
              label="Отчество"
              value={data.middleName}
              onChange={(v) => update({ middleName: onlyLetters(v) })}
              placeholder="Например Иванович"
            />
          </Section>

          <Section title="Документ">
            <Input
              label="ИИН"
              value={data.iin}
              onChange={(v) => update({ iin: onlyDigits(v, 12) })}
              placeholder="Например 990101123456"
              inputMode="numeric"
            />
            <Input
              label="Номер документа"
              value={data.docNumber}
              onChange={(v) => update({ docNumber: normalizeDoc(v) })}
              placeholder="Например 123456789"
            />
            <Input
              label="Дата рождения"
              value={data.birthDate}
              onChange={(v) => update({ birthDate: formatDateInput(v) })}
              placeholder="ДД.ММ.ГГГГ"
              inputMode="numeric"
            />
            <Input
              label="Дата выдачи"
              value={data.issueDate}
              onChange={(v) => update({ issueDate: formatDateInput(v) })}
              placeholder="ДД.ММ.ГГГГ"
              inputMode="numeric"
            />
            <Input
              label="Срок действия"
              value={data.expiryDate}
              onChange={(v) => update({ expiryDate: formatDateInput(v) })}
              placeholder="ДД.ММ.ГГГГ"
              inputMode="numeric"
            />
            <Input
              label="Место рождения"
              value={data.birthPlace}
              onChange={(v) => update({ birthPlace: onlyLetters(v) })}
              placeholder="Например Алматы"
            />
            <Input
              label="Национальность"
              value={data.nationality}
              onChange={(v) => update({ nationality: onlyLetters(v) })}
              placeholder="Казах"
            />
          </Section>

          <Section title="Фото">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 aspect-3/4 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center text-sm text-gray-500">
                  {data.photo ? (
                    <img src={data.photo} alt="Фото" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-center leading-tight">
                      Нет
                      <br />
                      фото
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium text-gray-900">Фото</div>
                  <div className="text-xs text-gray-500">PNG/JPG</div>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#007AFF] text-white text-sm font-semibold cursor-pointer active:scale-[0.98] transition-transform">
                <Upload size={18} />
                Загрузить
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            </div>
          </Section>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full border-2 border-red-500 text-red-600 font-semibold py-3 rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Trash2 size={20} /> Очистить данные
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
      <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}

function Input({ label, value, onChange, placeholder, inputMode }: InputProps) {
  return (
    <label className="block space-y-1">
      <span className="text-[13px] text-gray-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[15px] font-medium text-black outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/50"
      />
    </label>
  );
}
