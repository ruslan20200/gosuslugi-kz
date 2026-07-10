import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { requestPersistentStorage } from "./pwa/persistStorage";

createRoot(document.getElementById("root")!).render(<App />);

const win = window as Window & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
  ) => number;
};

/* Просим постоянное хранилище на любом устройстве (не только в PROD) */
const onIdle = (cb: () => void, timeout: number) => {
  if (typeof win.requestIdleCallback === "function") {
    win.requestIdleCallback(cb, { timeout });
  } else {
    window.setTimeout(cb, 0);
  }
};

onIdle(() => void requestPersistentStorage(), 2000);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  onIdle(() => void import("./pwa/registerServiceWorker"), 1000);
}
