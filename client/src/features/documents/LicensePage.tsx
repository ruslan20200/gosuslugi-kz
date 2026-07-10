import type { Requisite } from "@/features/identity-document/lib/documentData";
import { useUserData, type UserData } from "@/hooks/useUserData";
import { PdfDocumentPage } from "./PdfDocumentPage";
import { translit } from "./translit";
import type { OverlayImage, PageOverlay } from "./pdfRender";

const TEMPLATE_URL = "/license-template.pdf";
const FONT_SIZE = 12;
/* Фото в шаблоне прав (PDF-координаты, нижний-левый угол) */
const PHOTO: OverlayImage = { src: undefined, x: 69, y: 531, w: 135, h: 180 };

/* Права: меняются только пункты 1–4 (ФИО, дата рождения, даты выдачи/действия, ИИН).
   Образцы данных физически удалены из шаблона — поля пустые, просто пишем текст. */
function buildOverlays(d: UserData): PageOverlay[] {
  const last = d.lastName.toUpperCase();
  const first = d.firstName.toUpperCase();
  const middle = d.middleName.toUpperCase();

  const F = { fontSize: FONT_SIZE, bold: true };
  return [
    [
      { text: `1. ${last}/ ${translit(last)}`, x: 219, y: 711, ...F },
      {
        text: `2. ${[first, middle].filter(Boolean).join(" ")}/ ${translit(first)}`,
        x: 219,
        y: 687,
        ...F,
      },
      { text: `3. ${d.birthDate}`, x: 219, y: 662, ...F },
      { text: `4a) ${d.issueDate} 4b) ${d.expiryDate}`, x: 219, y: 638, ...F },
      { text: `4d) ЖСН/IIN ${d.iin}`, x: 219, y: 590, ...F },
    ],
  ];
}

function buildRequisites(d: UserData): Requisite[] {
  return [
    { key: "fio", label: "ФИО", value: `${d.lastName} ${d.firstName} ${d.middleName}`.trim() },
    { key: "birthDate", label: "Дата рождения", value: d.birthDate },
    { key: "issueDate", label: "Дата выдачи", value: d.issueDate },
    { key: "expiryDate", label: "Срок действия", value: d.expiryDate },
    { key: "iin", label: "ИИН", value: d.iin },
    { key: "category", label: "Категория", value: "B" },
  ];
}

export function LicensePage() {
  const { data } = useUserData();
  const images: OverlayImage[][] = [[{ ...PHOTO, src: data.photo }]];
  const renderKey = [
    data.lastName,
    data.firstName,
    data.middleName,
    data.birthDate,
    data.issueDate,
    data.expiryDate,
    data.iin,
    `photo:${data.photo ? data.photo.length : 0}`,
  ].join("|");

  return (
    <PdfDocumentPage
      title="Водительские права"
      templateUrl={TEMPLATE_URL}
      overlays={buildOverlays(data)}
      images={images}
      requisites={buildRequisites(data)}
      renderKey={renderKey}
    />
  );
}
