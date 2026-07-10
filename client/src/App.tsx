import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { APP_ROUTES } from "@/shared/config/routes";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import React, { Suspense, lazy, useEffect, useState } from "react";
import AccessCode from "./pages/AccessCode";
import DigitalDocuments from "./pages/DigitalDocuments";
import DocumentsLoading from "./pages/DocumentsLoading";
import GovernmentServices from "./pages/GovernmentServices";
import Home from "./pages/Home";
import KaspiQr from "./pages/KaspiQr";
import Messages from "./pages/Messages";
import Services from "./pages/Services";
const Udostoverenie = lazy(() => import("./pages/Udostoverenie"));
const Settings = lazy(() => import("./pages/Settings"));
const Education = lazy(() => import("./pages/Education"));
const Passport = lazy(() => import("./pages/Passport"));
const License = lazy(() => import("./pages/License"));

function Router() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] w-full bg-white flex items-center justify-center">
          <div className="h-9 w-9 rounded-full border-2 border-gray-200 border-t-[#F14635] animate-spin" />
        </div>
      }
    >
      <Switch>
        <Route path={APP_ROUTES.home} component={Home} />
        <Route path={APP_ROUTES.services} component={Services} />
        <Route path={APP_ROUTES.accessCode} component={AccessCode} />
        <Route path={APP_ROUTES.govServices} component={GovernmentServices} />
        <Route path={APP_ROUTES.documentsLoading} component={DocumentsLoading} />
        <Route path={APP_ROUTES.digitalDocuments} component={DigitalDocuments} />
        <Route path={APP_ROUTES.identityDocument} component={Udostoverenie} />
        <Route path={APP_ROUTES.education} component={Education} />
        <Route path={APP_ROUTES.passport} component={Passport} />
        <Route path={APP_ROUTES.license} component={License} />
        <Route path={APP_ROUTES.qr} component={KaspiQr} />
        <Route path={APP_ROUTES.messages} component={Messages} />
        <Route path={APP_ROUTES.settings} component={Settings} />
        <Route path={APP_ROUTES.notFound} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [blockDesktop, setBlockDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setBlockDesktop(mq.matches);
    update();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const warmupRoutes = () => {
      void import("./pages/Udostoverenie");
      void import("./pages/Settings");
      // Образование тяжёлое (pdfjs) — греем последним, тоже в простое
      window.setTimeout(() => void import("./pages/Education"), 2500);
    };

    if (typeof win.requestIdleCallback === "function") {
      const idleId = win.requestIdleCallback(warmupRoutes, { timeout: 1500 });
      return () => {
        if (typeof win.cancelIdleCallback === "function") {
          win.cancelIdleCallback(idleId);
        }
      };
    }

    const timeoutId = window.setTimeout(warmupRoutes, 1200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (blockDesktop) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="text-[18px] font-semibold text-black mb-2">
            Только для телефона
          </div>
          <div className="text-[14px] text-gray-500 leading-snug">
            Откройте сайт на мобильном устройстве или уменьшите ширину окна.
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
