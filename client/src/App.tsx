import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Udostoverenie from "./pages/Udostoverenie";
import Settings from "./pages/Settings";
import React, { useEffect, useState } from "react";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/udostoverenie"} component={Udostoverenie} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const [blockDesktop, setBlockDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setBlockDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (blockDesktop) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="text-[18px] font-semibold text-black mb-2">Только для телефона</div>
          <div className="text-[14px] text-gray-500 leading-snug">
            Откройте сайт на мобильном устройстве или уменьшите ширину окна.
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
