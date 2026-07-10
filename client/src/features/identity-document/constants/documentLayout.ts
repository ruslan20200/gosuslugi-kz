/* Базовая ширина карточки: все координаты подогнаны под неё,
   сама карточка масштабируется под ширину экрана целиком */
export const CARD_BASE_WIDTH = 398;
export const CARD_ASPECT = 1.58;

export const POSITIONS = {
  photo: { left: 17, top: "56%", translateY: "-50%", width: 29 },
  lastName: {
    left: 39,
    top: 38,
    translateY: "-50%",
    fontSize: 12,
    fontWeight: 460,
  },
  firstName: {
    left: 39,
    top: 52,
    translateY: "-50%",
    fontSize: 12,
    fontWeight: 460,
  },
  middleName: {
    left: 39,
    top: 66,
    translateY: "-50%",
    fontSize: 12,
    fontWeight: 460,
  },
  birthDate: {
    left: 39,
    top: 80,
    translateY: "-50%",
    fontSize: 12,
    fontWeight: 460,
  },
  gender: {
    left: 75,
    top: 80,
    translateY: "-50%",
    fontSize: 12,
    fontWeight: 460,
  },
  iin: {
    bottom: 8,
    left: 62,
    fontSize: 14,
    fontWeight: 480,
    letterSpacing: 0.02,
  },
  barcode: { top: -21, left: 10, width: 130, height: 50 },
  docNumber: { top: 10, right: 16, fontSize: 20, fontWeight: 460 }, // НОМЕР ДОКУМЕНТА (справа сверху) — меняй fontSize
  mrz: { bottom: 26, left: 30, fontSize: 14 },
  // ↓↓↓ ОБОРОТНАЯ СТОРОНА — двигай top/left (в пикселях) чтобы подогнать под фон ↓↓↓
  birthPlace: { top: 48, left: 110, fontSize: 12, fontWeight: 460 }, // МЕСТО РОЖДЕНИЯ
  nationality: { top: 75, left: 110, fontSize: 12, fontWeight: 460 }, // НАЦИОНАЛЬНОСТЬ
  citizenship: { top: 100, left: 110, fontSize: 12, fontWeight: 460 }, // ГРАЖДАНСТВО
  dates: { top: 127, left: 110, fontSize: 12, fontWeight: 460 }, // ДАТА ВЫДАЧИ - СРОК
  issuingAuthority: { top: 127, left: 330, fontSize: 12, fontWeight: 460 }, // ОРГАН ВЫДАЧИ (МВД РК)
  buttons: { paddingBottom: 30 },
};
