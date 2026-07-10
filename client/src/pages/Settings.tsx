import MobileLayout from "@/components/MobileLayout";
import { getStoredAccessCode } from "@/features/access-code/accessCodeStorage";
import { HowToUseCard } from "@/features/settings/components/HowToUseCard";
import { SettingsCollapsible } from "@/features/settings/components/SettingsCollapsible";
import { SettingsInput } from "@/features/settings/components/SettingsInput";
import { SettingsSection } from "@/features/settings/components/SettingsSection";
import { SettingsSelect } from "@/features/settings/components/SettingsSelect";
import {
  formatDateInput,
  normalizeDoc,
  onlyDigits,
  onlyLetters,
} from "@/features/settings/lib/inputFormatters";
import { optimizePhoto } from "@/features/settings/lib/optimizePhoto";
import {
  addYears,
  DOCUMENT_VALIDITY_YEARS,
  EDUCATION_COURSES,
  EDUCATION_GROUPS,
  formatEducationGroup,
  formatShortName,
  iinPrefixFromBirthDate,
  randomDocNumber,
  randomIinTail,
  useUserData,
} from "@/hooks/useUserData";
import { APP_ROUTES } from "@/shared/config/routes";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Dices,
  LockKeyhole,
  Trash2,
  UserRound,
} from "lucide-react";
import { Link } from "wouter";
import React from "react";

export default function Settings() {
  const { data, update, reset } = useUserData();
  const hasAccessCode = Boolean(getStoredAccessCode());
  /* Первые 6 цифр ИИН = дата рождения; пользователь задаёт только последние 6 */
  const iinPrefix = iinPrefixFromBirthDate(data.birthDate);
  const iinTail = data.iin.slice(6);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("image")) return;

    try {
      const optimized = await optimizePhoto(file);
      update({ photo: optimized, pdf: undefined });
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        update({ photo: result, pdf: undefined });
      };
      reader.readAsDataURL(file);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <MobileLayout className="bg-kaspi-surface">
      <header className="sticky top-0 left-0 right-0 z-20 flex h-12 items-center bg-white px-2">
        <Link href={APP_ROUTES.services}>
          <button className="grid h-11 w-11 place-items-center rounded-xl active:bg-gray-100" aria-label="Назад">
            <ChevronLeft size={26} strokeWidth={1.8} />
          </button>
        </Link>
        <h1 className="flex-1 pr-11 text-center text-[17px] font-bold text-kaspi-text">Настройки</h1>
      </header>

      <div
        className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Инструкция — как пользоваться сайтом */}
        <HowToUseCard />

        {/* Профиль */}
        <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-[#E3E3E8] bg-kaspi-surface text-[#B0B0B6]">
            {data.photo ? (
              <img src={data.photo} alt="Фото профиля" className="h-full w-full object-cover" />
            ) : (
              <UserRound size={40} strokeWidth={1.3} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[18px] font-semibold text-kaspi-text">{formatShortName(data)}</div>
            <div className="truncate text-[13px] text-kaspi-text-muted">ИИН {data.iin || "не указан"}</div>
          </div>
          <label className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full bg-kaspi-surface text-kaspi-text-secondary active:bg-[#ECECEF]" aria-label="Загрузить фото">
            <Camera size={22} strokeWidth={1.6} />
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
        </div>

        {/* Безопасность */}
        <div className="mt-4 rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Link href={`${APP_ROUTES.accessCode}?mode=change`}>
            <button className="flex min-h-[64px] w-full items-center gap-4 rounded-2xl px-4 text-left active:bg-[#F7F7F8]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#FEECEA] text-kaspi-red">
                <LockKeyhole size={21} strokeWidth={1.6} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[16px] text-kaspi-text">
                  {hasAccessCode ? "Сменить код доступа" : "Установить код доступа"}
                </span>
                <span className="block text-[13px] text-kaspi-text-muted">
                  Код запрашивается при входе в Госуслуги
                </span>
              </span>
              <ChevronRight className="shrink-0 text-[#C6C6CB]" size={22} strokeWidth={1.8} />
            </button>
          </Link>
        </div>

        <div className="mt-4 space-y-4">
          {/* Основные данные — то, что нужно почти всем, всегда на виду */}
          <SettingsSection title="Основные данные">
            <SettingsInput
              label="Фамилия"
              value={data.lastName}
              onChange={(v) => update({ lastName: onlyLetters(v) })}
              placeholder="Например Иванов"
            />
            <SettingsInput
              label="Имя"
              value={data.firstName}
              onChange={(v) => update({ firstName: onlyLetters(v) })}
              placeholder="Например Иван"
            />
            <SettingsInput
              label="Отчество"
              value={data.middleName}
              onChange={(v) => update({ middleName: onlyLetters(v) })}
              placeholder="Например Иванович"
            />
            <SettingsInput
              label="Дата рождения"
              value={data.birthDate}
              onChange={(v) => {
                const birthDate = formatDateInput(v);
                /* Первые 6 цифр ИИН пересобираем из даты, хвост сохраняем */
                const prefix = iinPrefixFromBirthDate(birthDate);
                update(prefix ? { birthDate, iin: prefix + iinTail } : { birthDate });
              }}
              placeholder="ДД.ММ.ГГГГ"
              inputMode="numeric"
            />
            <SettingsSelect
              label="Пол"
              value={data.gender}
              onChange={(v) => update({ gender: v as "М" | "Ж" })}
              options={[
                { value: "М", label: "Мужской (М)" },
                { value: "Ж", label: "Женский (Ж)" },
              ]}
            />

            {/* ИИН: первые 6 цифр — из даты рождения, остальные 6 вводятся или 🎲 */}
            <div className="block space-y-1">
              <span className="text-[13px] text-kaspi-text-muted">ИИН</span>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center rounded-xl bg-kaspi-surface px-3 py-2.5 text-[15px] font-medium tracking-wide text-kaspi-text focus-within:bg-white focus-within:ring-1 focus-within:ring-kaspi-red">
                  <span className="text-kaspi-text-muted">{iinPrefix || "??????"}</span>
                  <input
                    value={iinTail}
                    onChange={(e) =>
                      update({ iin: iinPrefix + onlyDigits(e.target.value, 6) })
                    }
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="ml-1 w-full bg-transparent outline-none placeholder:text-kaspi-text-muted"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    update({ iin: iinPrefix + randomIinTail(data.birthDate, data.gender) })
                  }
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-kaspi-surface text-kaspi-text-secondary active:bg-[#ECECEF]"
                  aria-label="Сгенерировать случайные цифры"
                >
                  <Dices size={20} strokeWidth={1.7} />
                </button>
              </div>
              <span className="text-[12px] text-kaspi-text-muted">
                Первые 6 цифр — дата рождения. Остальные впишите или нажмите{" "}
                <Dices size={12} strokeWidth={2} className="inline align-[-1px]" />
              </span>
            </div>
          </SettingsSection>

          {/* Дополнительно — меняется редко, поэтому свёрнуто */}
          <SettingsCollapsible
            title="Данные документа"
            hint="Номер, даты, место рождения — обычно менять не нужно"
          >
            {/* Номер документа: ввод или случайный (🎲) */}
            <div className="block space-y-1">
              <span className="text-[13px] text-kaspi-text-muted">Номер документа</span>
              <div className="flex items-center gap-2">
                <input
                  value={data.docNumber}
                  onChange={(e) => update({ docNumber: normalizeDoc(e.target.value) })}
                  placeholder="Например 123456789"
                  inputMode="numeric"
                  className="w-full flex-1 rounded-xl border border-transparent bg-kaspi-surface px-3 py-2.5 text-[15px] font-medium text-kaspi-text outline-none transition-colors placeholder:text-kaspi-text-muted focus:border-kaspi-red focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => update({ docNumber: randomDocNumber() })}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-kaspi-surface text-kaspi-text-secondary active:bg-[#ECECEF]"
                  aria-label="Сгенерировать случайный номер"
                >
                  <Dices size={20} strokeWidth={1.7} />
                </button>
              </div>
            </div>
            <SettingsInput
              label="Дата выдачи"
              value={data.issueDate}
              onChange={(v) => {
                const issueDate = formatDateInput(v);
                /* Срок действия считаем автоматически: дата выдачи + N лет */
                const expiryDate = addYears(issueDate, DOCUMENT_VALIDITY_YEARS);
                update(expiryDate ? { issueDate, expiryDate } : { issueDate });
              }}
              placeholder="ДД.ММ.ГГГГ"
              inputMode="numeric"
            />

            {/* Срок действия считается автоматически — только для чтения */}
            <div className="block space-y-1">
              <span className="text-[13px] text-kaspi-text-muted">Срок действия</span>
              <div className="flex w-full items-center justify-between rounded-xl bg-kaspi-surface px-3 py-2.5 text-[15px] font-medium text-kaspi-text">
                <span>{data.expiryDate || "—"}</span>
                <span className="text-[12px] font-normal text-kaspi-text-muted">
                  +{DOCUMENT_VALIDITY_YEARS} лет от выдачи
                </span>
              </div>
            </div>
            <SettingsInput
              label="Место рождения"
              value={data.birthPlace}
              onChange={(v) => update({ birthPlace: onlyLetters(v) })}
              placeholder="Например Алматы"
            />
            <SettingsInput
              label="Национальность"
              value={data.nationality}
              onChange={(v) => update({ nationality: onlyLetters(v) })}
              placeholder="Казах"
            />
            <SettingsInput
              label="Гражданство"
              value={data.citizenship}
              onChange={(v) => update({ citizenship: v.toUpperCase() })}
              placeholder="Например КАЗАХСТАН"
            />
            <SettingsInput
              label="Орган выдачи"
              value={data.issuingAuthority}
              onChange={(v) => update({ issuingAuthority: v.toUpperCase() })}
              placeholder="Например МВД РК"
            />
          </SettingsCollapsible>

          {/* Образование — отдельный редкий блок */}
          <SettingsCollapsible
            title="Образование"
            hint="Группа, курс и источник документа"
          >
            <SettingsSelect
              label="Группа"
              value={data.educationGroup}
              onChange={(v) => update({ educationGroup: v })}
              options={EDUCATION_GROUPS}
            />
            <SettingsSelect
              label="Курс"
              value={data.educationCourse}
              onChange={(v) => update({ educationCourse: v })}
              options={EDUCATION_COURSES.map((c) => ({ value: c, label: `${c} курс` }))}
            />
            <div className="text-[13px] text-kaspi-text-muted">
              В документе будет:{" "}
              <b className="text-kaspi-text">
                {formatEducationGroup(data.educationGroup, data.educationCourse)}
              </b>
            </div>
            <SettingsSelect
              label="Источник документа"
              value={data.educationDocSource}
              onChange={(v) =>
                update({ educationDocSource: v as "builtin" | "upload" })
              }
              options={[
                { value: "builtin", label: "Встроенный документ (данные из настроек)" },
                { value: "upload", label: "Загрузить свой PDF" },
              ]}
            />
          </SettingsCollapsible>
        </div>

        <button
          onClick={reset}
          className="mt-6 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-white text-[16px] font-medium text-kaspi-red shadow-[0_1px_2px_rgba(0,0,0,0.04)] active:bg-[#FFF3F2]"
        >
          <Trash2 size={20} strokeWidth={1.7} /> Очистить данные
        </button>
      </div>
    </MobileLayout>
  );
}
