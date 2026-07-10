import type { UserData } from "@/hooks/useUserData";

const TRANSLIT_MAP: Record<string, string> = {
  А: "A",
  Б: "B",
  В: "V",
  Г: "G",
  Д: "D",
  Е: "E",
  Ё: "E",
  Ж: "ZH",
  З: "Z",
  И: "I",
  Й: "Y",
  К: "K",
  Л: "L",
  М: "M",
  Н: "N",
  О: "O",
  П: "P",
  Р: "R",
  С: "S",
  Т: "T",
  У: "U",
  Ф: "F",
  Х: "KH",
  Ц: "TS",
  Ч: "CH",
  Ш: "SH",
  Щ: "SHCH",
  Ъ: "",
  Ы: "Y",
  Ь: "",
  Э: "E",
  Ю: "YU",
  Я: "YA",
};

export type Requisite = {
  key: string;
  label: string;
  value: string;
};

export function buildRequisites(userData: UserData): Requisite[] {
  return [
    {
      key: "fio",
      label: "ФИО",
      value:
        `${userData.lastName} ${userData.firstName} ${userData.middleName}`.trim(),
    },
    { key: "iin", label: "ИИН", value: userData.iin },
    { key: "birthDate", label: "Дата рождения", value: userData.birthDate },
    { key: "docNumber", label: "Номер документа", value: userData.docNumber },
    { key: "issueDate", label: "Дата выдачи", value: userData.issueDate },
    { key: "expiryDate", label: "Срок действия", value: userData.expiryDate },
  ];
}

export function formatRequisites(requisites: Requisite[]) {
  const lines = requisites.map((item) => `${item.label}: ${item.value}`);
  return ["Удостоверение личности", ...lines].join("\n");
}

export function buildMrzLine(userData: UserData) {
  const surname = translit(userData.lastName);
  const name = translit(userData.firstName);
  let line = `${surname}<<${name}`;

  while (line.length < 33) {
    line += "<";
  }

  return line;
}

export function buildQrPayload({
  userData,
  issuedAt,
  code,
}: {
  userData: UserData;
  issuedAt: number;
  code: string;
}) {
  return JSON.stringify({
    iin: userData.iin,
    docNumber: userData.docNumber,
    fullName: `${userData.lastName} ${userData.firstName}`,
    timestamp: issuedAt,
    code,
  });
}

function translit(value: string) {
  return value
    .toUpperCase()
    .split("")
    .map((char) => TRANSLIT_MAP[char] || char)
    .join("");
}
