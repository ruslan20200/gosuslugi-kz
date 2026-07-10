export function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 4),
    digits.slice(4, 8),
  ].filter(Boolean);

  return parts.join(".");
}

export function onlyLetters(input: string) {
  return input.replace(/[^А-Яа-яA-Za-z\s\-]/g, "").toUpperCase();
}

export function onlyDigits(input: string, max = 12) {
  return input.replace(/\D/g, "").slice(0, max);
}

export function normalizeDoc(input: string) {
  return input.replace(/[^A-Za-z0-9]/g, "").slice(0, 20).toUpperCase();
}
