/*
 * Просим у браузера ПОСТОЯННОЕ хранилище, чтобы данные пользователя
 * (localStorage: ФИО, ИИН, фото, PDF образования, код доступа) не стирались
 * при нехватке места и не чистились автоматически (в т.ч. правило iOS о
 * 7 днях бездействия для не установленных на экран PWA).
 *
 * navigator.storage.persist() надёжнее всего срабатывает, когда сайт добавлен
 * на домашний экран (установлен как приложение).
 */
export async function requestPersistentStorage(): Promise<void> {
  try {
    const storage = navigator.storage;
    if (!storage || typeof storage.persist !== "function") return;

    if (typeof storage.persisted === "function") {
      const already = await storage.persisted();
      if (already) return; // уже постоянное — ничего не делаем
    }

    await storage.persist();
  } catch {
    /* браузер не поддерживает — не критично */
  }
}
