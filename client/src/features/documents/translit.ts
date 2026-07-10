/* Кириллица (КЗ/РУ) -> латиница для полей документов (паспорт, права) */
const MAP: Record<string, string> = {
  А: "A", Ә: "A", Б: "B", В: "V", Г: "G", Ғ: "G", Д: "D", Е: "E", Ё: "E",
  Ж: "ZH", З: "Z", И: "I", Й: "I", І: "I", К: "K", Қ: "Q", Л: "L", М: "M",
  Н: "N", Ң: "N", О: "O", Ө: "O", П: "P", Р: "R", С: "S", Т: "T", У: "U",
  Ұ: "U", Ү: "U", Ф: "F", Х: "H", Һ: "H", Ц: "TS", Ч: "CH", Ш: "SH",
  Щ: "SCH", Ъ: "", Ы: "Y", Ь: "", Э: "E", Ю: "YU", Я: "YA",
};

export function translit(input: string): string {
  return input
    .toUpperCase()
    .split("")
    .map((ch) => (ch in MAP ? MAP[ch] : ch))
    .join("");
}
