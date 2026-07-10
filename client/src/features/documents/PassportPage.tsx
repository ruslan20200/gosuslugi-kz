import type { Requisite } from "@/features/identity-document/lib/documentData";
import { useUserData, type UserData } from "@/hooks/useUserData";
import { PdfDocumentPage } from "./PdfDocumentPage";
import { translit } from "./translit";
import type { OverlayImage, PageOverlay } from "./pdfRender";

const TEMPLATE_URL = "/passport-template.pdf";
const FONT_SIZE = 13;
/* Фото в шаблоне паспорта (PDF-координаты, нижний-левый угол) */
const PHOTO: OverlayImage = { src: undefined, x: 119, y: 446, w: 195, h: 255 };

/* Машиносчитываемая зона (MRZ) — строка с ФИО пересобирается из данных */
function buildMrzName(last: string, first: string): string {
  const raw = `${translit(last)}<<${translit(first)}`.replace(/[^A-Z<]/g, "");
  return (raw + "<".repeat(40)).slice(0, 40);
}

/* Паспорт: все данные из удостоверения; номер паспорта не меняется.
   Образцы данных физически удалены из шаблона — поля пустые, просто пишем текст. */
function buildOverlays(d: UserData): PageOverlay[] {
  const last = d.lastName.toUpperCase();
  const first = d.firstName.toUpperCase();

  return [
    [
      /* Левая колонка */
      { text: last, x: 366, y: 707, fontSize: FONT_SIZE, bold: true },
      { text: translit(last), x: 366, y: 694, fontSize: FONT_SIZE, bold: true },
      { text: first, x: 366, y: 663, fontSize: FONT_SIZE, bold: true },
      { text: translit(first), x: 366, y: 651, fontSize: FONT_SIZE, bold: true },
      { text: d.birthDate, x: 366, y: 571, fontSize: FONT_SIZE, bold: true },
      { text: d.issueDate, x: 366, y: 526, fontSize: FONT_SIZE, bold: true },
      { text: d.expiryDate, x: 366, y: 484, fontSize: FONT_SIZE, bold: true },
      /* Правая колонка */
      { text: d.gender, x: 614, y: 614, fontSize: FONT_SIZE, bold: true },
      { text: d.iin, x: 689, y: 614, fontSize: FONT_SIZE, bold: true },
      { text: d.birthPlace, x: 610, y: 571, fontSize: FONT_SIZE, bold: true },
      /* MRZ — средняя строка с ФИО (моноширинно, фиксированный шаг ≈18px) */
      { text: buildMrzName(last, first), x: 119, y: 304, fontSize: 24, mono: true, pitch: 18.18 },
    ],
  ];
}

function buildRequisites(d: UserData): Requisite[] {
  return [
    { key: "fio", label: "ФИО", value: `${d.lastName} ${d.firstName} ${d.middleName}`.trim() },
    { key: "iin", label: "ИИН", value: d.iin },
    { key: "birthDate", label: "Дата рождения", value: d.birthDate },
    { key: "gender", label: "Пол", value: d.gender },
    { key: "birthPlace", label: "Место рождения", value: d.birthPlace },
    { key: "issueDate", label: "Дата выдачи", value: d.issueDate },
    { key: "expiryDate", label: "Срок действия", value: d.expiryDate },
  ];
}

export function PassportPage() {
  const { data } = useUserData();
  const images: OverlayImage[][] = [[{ ...PHOTO, src: data.photo }]];
  const renderKey = [
    data.lastName,
    data.firstName,
    data.birthDate,
    data.issueDate,
    data.expiryDate,
    data.iin,
    data.gender,
    data.birthPlace,
    `photo:${data.photo ? data.photo.length : 0}`,
  ].join("|");

  return (
    <PdfDocumentPage
      title="Паспорт гражданина РК"
      templateUrl={TEMPLATE_URL}
      overlays={buildOverlays(data)}
      images={images}
      requisites={buildRequisites(data)}
      renderKey={renderKey}
    />
  );
}
