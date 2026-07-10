const STORAGE_KEY = "gosuslugi_education_pdf";

export function getStoredEducationPdf(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredEducationPdf(dataUrl: string): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, dataUrl);
    return true;
  } catch {
    // Файл не поместился в localStorage (лимит ~5 МБ)
    return false;
  }
}

export function clearStoredEducationPdf() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
