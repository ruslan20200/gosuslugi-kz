import { toast } from "sonner";
import { imagesToPdfBlob } from "./imagesToPdf";

/*
 * Отправка готового PDF нативным окном «Поделиться» (как на iPhone/Android).
 *
 * Требования Web Share API с файлом:
 *  - защищённый контекст (HTTPS или localhost) — на Netlify это выполнено;
 *  - вызов navigator.share прямо в жесте нажатия — imagesToPdfBlob синхронный,
 *    поэтому между кликом и share нет await, и iOS считает это жестом;
 *  - navigator.canShare({ files }) === true (iOS Safari 15+, Android Chrome).
 *
 * Если файловый шэринг недоступен (десктоп и т.п.) — скачиваем PDF как фолбэк.
 */
export async function sharePdfFromImages(
  pages: string[],
  fileName: string,
  title: string
): Promise<void> {
  if (pages.length === 0) {
    toast("Документ ещё готовится — попробуйте через секунду");
    return;
  }

  const blob = imagesToPdfBlob(pages);
  const file = new File([blob], fileName, { type: "application/pdf" });

  const canShareFile =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    (!navigator.canShare || navigator.canShare({ files: [file] }));

  if (canShareFile) {
    try {
      await navigator.share({ files: [file], title });
      return; // успех — системное окно показалось и отработало
    } catch (err) {
      // Пользователь закрыл окно — это не ошибка, просто выходим
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Иная причина (share не отработал) — падаем в скачивание ниже
    }
  }

  downloadBlob(blob, fileName);
  toast("PDF сохранён — откройте файл, чтобы отправить");
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
