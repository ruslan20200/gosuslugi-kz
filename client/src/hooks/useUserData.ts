import { useEffect, useMemo, useState } from "react";

export interface UserData {
  firstName: string;
  lastName: string;
  middleName: string;
  iin: string;
  birthDate: string; // format DD.MM.YYYY
  docNumber: string;
  issueDate: string;
  expiryDate: string;
  birthPlace: string;
  nationality: string;
  citizenship: string; // АЗАМАТТЫҒЫ / ГРАЖДАНСТВО
  issuingAuthority: string; // БЕРГЕН ОРГАН / ОРГАН ВЫДАЧИ (напр. "МВД РК")
  gender: "М" | "Ж"; // ЖЫНЫСЫ / ПОЛ на удостоверении
  photo?: string; // base64
  pdf?: string; // base64 or url
  /* Сведения об образовании */
  educationGroup: string; // базовая группа, напр. "23-ПО-103-1к-2"
  educationCourse: string; // "1".."4" — заменяет цифру в "1к"/"1р"
  educationDocSource: "builtin" | "upload"; // встроенный шаблон или свой PDF
}

/* Список групп (выбор в настройках) */
export const EDUCATION_GROUPS = [
  "23-ПО-103-1к-1",
  "23-ПО-103-1к-2",
  "23-ПО-103-1к-3",
  "23-ПО-103-1р-4",
  "23-ЦТ-504-1к",
  "23-РЭиТ-902-1к-1",
  "23-РЭиТ-902-1р",
  "23-СИБ-202-1к-2",
  "23-СИБ-202-1р-2",
  "23-ПД-101-1р-2",
] as const;

export const EDUCATION_COURSES = ["1", "2", "3", "4"] as const;

/** "23-ПО-103-1к-2" + курс "3" -> "23-ПО-103-3к-2" */
export function formatEducationGroup(group: string, course: string): string {
  return group.replace(/-\d(к|р)/, `-${course}$1`);
}

export const DEFAULT_USER_DATA: UserData = {
  firstName: "ИВАН",
  lastName: "ИВАНОВ",
  middleName: "ИВАНОВИЧ",
  iin: "070918000064",
  birthDate: "18.09.2007",
  docNumber: "123456789",
  issueDate: "27.06.2024",
  expiryDate: "27.06.2034",
  birthPlace: "АЛМАТЫ",
  nationality: "КАЗАХ",
  citizenship: "КАЗАХСТАН",
  issuingAuthority: "МВД РК",
  gender: "М",
  educationGroup: "23-ПО-103-1к-2",
  educationCourse: "3",
  educationDocSource: "builtin",
};

const STORAGE_KEY = "gosuslugi_user_data";

/** Срок действия документа (лет от даты выдачи) — считаем автоматически */
export const DOCUMENT_VALIDITY_YEARS = 10;

/** Первые 6 цифр ИИН (ГГММДД) из даты рождения "ДД.ММ.ГГГГ" */
export function iinPrefixFromBirthDate(birthDate: string): string {
  const m = birthDate.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return "";
  const [, dd, mm, yyyy] = m;
  return `${yyyy.slice(2)}${mm}${dd}`;
}

/** 7-я цифра ИИН: век + пол (1/2 → 1800-е, 3/4 → 1900-е, 5/6 → 2000-е) */
function centuryGenderDigit(birthDate: string, gender: "М" | "Ж"): number {
  const m = birthDate.match(/^\d{2}\.\d{2}\.(\d{4})$/);
  const year = m ? Number(m[1]) : 2000;
  const base = year < 1900 ? 1 : year < 2000 ? 3 : 5;
  return base + (gender === "Ж" ? 1 : 0);
}

/** Контрольная (12-я) цифра ИИН по стандартному алгоритму; null — если невалидно */
function iinChecksum(first11: string): number | null {
  const d = first11.split("").map(Number);
  const w1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  let s = d.reduce((acc, n, i) => acc + n * w1[i], 0) % 11;
  if (s === 10) {
    const w2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];
    s = d.reduce((acc, n, i) => acc + n * w2[i], 0) % 11;
    if (s === 10) return null;
  }
  return s;
}

/**
 * Случайные последние 6 цифр ИИН — валидные: цифра века/пола + серийник (8–11) +
 * правильная контрольная. Выглядит как настоящий ИИН, а не «000064».
 */
export function randomIinTail(birthDate: string, gender: "М" | "Ж"): string {
  const prefix = iinPrefixFromBirthDate(birthDate);
  if (!prefix) return String(Math.floor(Math.random() * 1e6)).padStart(6, "0");
  const c7 = centuryGenderDigit(birthDate, gender);
  for (let attempt = 0; attempt < 50; attempt++) {
    const serial = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    const checksum = iinChecksum(`${prefix}${c7}${serial}`);
    if (checksum !== null) return `${c7}${serial}${checksum}`;
  }
  return `${c7}00000`;
}

/** Прибавить годы к дате "ДД.ММ.ГГГГ" (для срока действия документа) */
export function addYears(dateStr: string, years: number): string {
  const m = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return "";
  const [, dd, mm, yyyy] = m;
  const month = Number(mm);
  const year = Number(yyyy) + years;
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.min(Number(dd), daysInMonth);
  return `${String(day).padStart(2, "0")}.${mm}.${year}`;
}

/** Случайный номер документа — 9 цифр */
export function randomDocNumber(): string {
  return String(Math.floor(100000000 + Math.random() * 900000000));
}

/** "РУСЛАНБЕК" + "КУРАЛБАЕВ" -> "Русланбек К." (как в приложении Kaspi) */
export function formatShortName(data: UserData): string {
  const first = data.firstName.trim();
  const last = data.lastName.trim();
  const firstName = first
    ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
    : "";
  const lastInitial = last ? `${last.charAt(0).toUpperCase()}.` : "";
  return [firstName, lastInitial].filter(Boolean).join(" ") || "Пользователь";
}
const STORAGE_WRITE_DEBOUNCE_MS = 180;

export function useUserData() {
  const [data, setData] = useState<UserData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // merge с дефолтами: новые поля получают значения по умолчанию
      if (stored) return { ...DEFAULT_USER_DATA, ...(JSON.parse(stored) as Partial<UserData>) };
    } catch (err) {
      console.warn("Failed to read user data", err);
    }
    return DEFAULT_USER_DATA;
  });

  useEffect(() => {
    const saveTimer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.warn("Failed to save user data", err);
      }
    }, STORAGE_WRITE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(saveTimer);
    };
  }, [data]);

  const actions = useMemo(() => {
    const update = (partial: Partial<UserData>) =>
      setData((prev) => {
        const next: UserData = { ...prev, ...partial };

        for (const rawKey of Object.keys(partial)) {
          const key = rawKey as keyof UserData;
          if (prev[key] !== next[key]) {
            return next;
          }
        }

        return prev;
      });

    const reset = () => {
      localStorage.removeItem(STORAGE_KEY);
      setData(DEFAULT_USER_DATA);
    };

    return { update, reset };
  }, []);

  return { data, setData, ...actions };
}
