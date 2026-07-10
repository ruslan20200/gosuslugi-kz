import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/*
 * Плавный зум с НАТИВНОЙ прокруткой.
 *
 * Идея: прокрутку (вертикаль + в приближении горизонталь) делает сам браузер —
 * это идёт на потоке композитора, поэтому скролл плавный и с инерцией, как везде.
 * Масштаб — это transform: scale на контенте, а «sizer» (обёртка) растягивается
 * до размера контента × масштаб, создавая область прокрутки под увеличенный документ.
 *
 *   container (нативный скролл, overflow:auto)
 *     └ sizer   (размер = натуральный × scale — создаёт полосу прокрутки)
 *         └ content (transform: scale(s), origin 0 0)
 *
 * Зум к точке — меняем scale и подгоняем scrollLeft/scrollTop, чтобы точка под
 * пальцем осталась на месте. Двойной тап — плавная анимация scale + прокрутки.
 * Пинч — масштаб к центру щипка. Панорама в приближении — нативный скролл.
 *
 * collapseRef — блок (переключатель Документ/Реквизиты), который уезжает вверх и
 * прячется под шапку по мере прокрутки вниз (привязан к scrollTop). collapseHeight —
 * его высота в px (0 = выключено).
 */

const MIN_SCALE = 1;
const MAX_SCALE = 3.5;
const DOUBLE_TAP_MS = 300;
const TAP_MOVE = 12;
const DOUBLE_TAP_SCALE = 2.4;
const ANIM_MS = 220;

export function useDocumentZoom(collapseHeight = 0) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sizerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const collapseRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const scaleRef = useRef(1);
  const natRef = useRef({ w: 0, h: 0 });
  const rafRef = useRef<number | null>(null);

  const clampScale = (s: number) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));

  const updateCollapse = useCallback(() => {
    const tabs = collapseRef.current;
    const container = containerRef.current;
    if (!tabs || !container || collapseHeight <= 0) return;
    /* В приближении переключатель всегда виден; на масштабе 1 — уезжает за скроллом */
    const c =
      scaleRef.current > 1.02
        ? 0
        : Math.min(collapseHeight, Math.max(0, container.scrollTop));
    tabs.style.transform = `translate3d(0, ${-c}px, 0)`;
  }, [collapseHeight]);

  const setTouchAction = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.style.touchAction = scaleRef.current > 1.02 ? "pan-x pan-y" : "pan-y";
  }, []);

  /* Пересчёт натурального размера контента и размера sizer под текущий масштаб */
  const measure = useCallback(() => {
    const container = containerRef.current;
    const sizer = sizerRef.current;
    const content = contentRef.current;
    if (!container || !sizer || !content) return;

    const natW = container.clientWidth;
    content.style.width = `${natW}px`;
    const natH = content.offsetHeight;
    natRef.current = { w: natW, h: natH };

    const s = scaleRef.current;
    sizer.style.width = `${natW * s}px`;
    sizer.style.height = `${natH * s}px`;
  }, []);

  const applyScale = useCallback(() => {
    const content = contentRef.current;
    if (content) {
      content.style.transformOrigin = "0 0";
      content.style.transform = `scale(${scaleRef.current})`;
    }
    measure();
  }, [measure]);

  const cancelRaf = () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  /* Мгновенный зум к точке экрана (px,py — относительно контейнера) */
  const zoomToPoint = useCallback(
    (target: number, px: number, py: number) => {
      const container = containerRef.current;
      if (!container) return;
      const old = scaleRef.current;
      const next = clampScale(target);
      const contentX = (container.scrollLeft + px) / old;
      const contentY = (container.scrollTop + py) / old;

      scaleRef.current = next;
      applyScale();
      container.scrollLeft = contentX * next - px;
      container.scrollTop = contentY * next - py;
      setTouchAction();
      updateCollapse();
      setZoom(next);
    },
    [applyScale, setTouchAction, updateCollapse]
  );

  /* Плавный зум к точке (двойной тап) */
  const animateZoom = useCallback(
    (target: number, px: number, py: number) => {
      const container = containerRef.current;
      if (!container) return;
      cancelRaf();

      const startScale = scaleRef.current;
      const endScale = clampScale(target);
      const contentX = (container.scrollLeft + px) / startScale;
      const contentY = (container.scrollTop + py) / startScale;
      const startLeft = container.scrollLeft;
      const startTop = container.scrollTop;
      const endLeft = contentX * endScale - px;
      const endTop = contentY * endScale - py;
      const t0 = performance.now();
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);

      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / ANIM_MS);
        const e = ease(k);
        scaleRef.current = startScale + (endScale - startScale) * e;
        applyScale();
        container.scrollLeft = startLeft + (endLeft - startLeft) * e;
        container.scrollTop = startTop + (endTop - startTop) * e;
        updateCollapse();
        if (k < 1) {
          rafRef.current = window.requestAnimationFrame(step);
        } else {
          rafRef.current = null;
          scaleRef.current = endScale;
          applyScale();
          container.scrollLeft = endLeft;
          container.scrollTop = endTop;
          setTouchAction();
          updateCollapse();
          setZoom(endScale);
        }
      };
      rafRef.current = window.requestAnimationFrame(step);
    },
    [applyScale, setTouchAction, updateCollapse]
  );

  const resetView = useCallback(() => {
    cancelRaf();
    const container = containerRef.current;
    scaleRef.current = 1;
    applyScale();
    if (container) {
      container.scrollLeft = 0;
      container.scrollTop = 0;
    }
    setTouchAction();
    updateCollapse();
    setZoom(1);
  }, [applyScale, setTouchAction, updateCollapse]);

  /* Первичный замер + пересчёт при изменении размеров контента (загрузка страниц) */
  useLayoutEffect(() => {
    measure();
    setTouchAction();
    const content = contentRef.current;
    const container = containerRef.current;
    if (!content || !container) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(content);
    ro.observe(container);
    return () => ro.disconnect();
  }, [measure, setTouchAction]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const distOf = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const midOf = (t: TouchList) => ({
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2,
    });

    let pinching = false;
    let pinchStartDist = 0;
    let pinchStartScale = 1;
    let pinchContentX = 0;
    let pinchContentY = 0;
    let tapTime = 0;
    let tapX = 0;
    let tapY = 0;
    let tapMoved = false;
    let lastTapTime = 0;

    const onScroll = () => updateCollapse();

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        cancelRaf();
        pinching = true;
        const rect = container.getBoundingClientRect();
        const mid = midOf(e.touches);
        const mx = mid.x - rect.left;
        const my = mid.y - rect.top;
        pinchStartDist = distOf(e.touches);
        pinchStartScale = scaleRef.current;
        pinchContentX = (container.scrollLeft + mx) / scaleRef.current;
        pinchContentY = (container.scrollTop + my) / scaleRef.current;
      } else if (e.touches.length === 1) {
        const t = e.touches[0];
        tapTime = Date.now();
        tapX = t.clientX;
        tapY = t.clientY;
        tapMoved = false;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (pinching && e.touches.length === 2) {
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        const mid = midOf(e.touches);
        const mx = mid.x - rect.left;
        const my = mid.y - rect.top;
        const ratio = distOf(e.touches) / (pinchStartDist || 1);
        scaleRef.current = clampScale(pinchStartScale * ratio);
        applyScale();
        container.scrollLeft = pinchContentX * scaleRef.current - mx;
        container.scrollTop = pinchContentY * scaleRef.current - my;
        updateCollapse();
        return;
      }
      if (e.touches.length === 1) {
        const t = e.touches[0];
        if (
          Math.abs(t.clientX - tapX) > TAP_MOVE ||
          Math.abs(t.clientY - tapY) > TAP_MOVE
        ) {
          tapMoved = true;
        }
        /* одиночный палец не трогаем — работает нативный скролл */
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (pinching) {
        if (e.touches.length === 0) {
          pinching = false;
          setTouchAction();
          setZoom(scaleRef.current);
        }
        return;
      }
      if (e.touches.length === 0 && !tapMoved) {
        const now = Date.now();
        if (now - lastTapTime < DOUBLE_TAP_MS) {
          lastTapTime = 0;
          const rect = container.getBoundingClientRect();
          const px = tapX - rect.left;
          const py = tapY - rect.top;
          const zoomIn = scaleRef.current < 1.05;
          animateZoom(zoomIn ? DOUBLE_TAP_SCALE : 1, px, py);
        } else {
          lastTapTime = now;
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; // обычное колесо — нативный скролл
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      zoomToPoint(scaleRef.current * factor, e.clientX - rect.left, e.clientY - rect.top);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    container.addEventListener("touchstart", onTouchStart, { passive: false });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd);
    container.addEventListener("touchcancel", onTouchEnd);
    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelRaf();
      container.removeEventListener("scroll", onScroll);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);
      container.removeEventListener("wheel", onWheel);
    };
  }, [animateZoom, applyScale, setTouchAction, updateCollapse, zoomToPoint]);

  return { containerRef, sizerRef, contentRef, collapseRef, resetView, zoom };
}
