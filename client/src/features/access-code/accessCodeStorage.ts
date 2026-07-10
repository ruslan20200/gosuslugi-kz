const STORAGE_KEY = "gosuslugi_access_code";

export const ACCESS_CODE_LENGTH = 4;

export function getStoredAccessCode(): string | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value && value.length === ACCESS_CODE_LENGTH ? value : null;
  } catch {
    return null;
  }
}

export function setStoredAccessCode(code: string) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // ignore quota / privacy-mode errors — prototype only
  }
}

export function clearStoredAccessCode() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/* Сессия: после верного кода 5 минут не спрашиваем повторно */
const SESSION_KEY = "gosuslugi_access_session";
const SESSION_TTL_MS = 5 * 60 * 1000;

export function markAccessSession() {
  try {
    localStorage.setItem(SESSION_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function hasActiveAccessSession(): boolean {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const startedAt = Number(raw);
    if (!Number.isFinite(startedAt)) return false;
    return Date.now() - startedAt < SESSION_TTL_MS;
  } catch {
    return false;
  }
}

export function clearAccessSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
