import { useEffect, useRef, type RefObject } from 'react';

export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Adds `.in` to every [data-reveal] element under `root` the first time it scrolls into view. */
export function useReveal(root: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = [...el.querySelectorAll<HTMLElement>('[data-reveal]:not(.in)')];
    if (reducedMotion() || !('IntersectionObserver' in window)) { items.forEach((i) => i.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Calls `fn(p)` every frame with the scroll progress of `ref` through the viewport:
 * 0 when its top meets the viewport bottom (or top, with `pinned`), 1 when its bottom leaves.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, fn: (p: number, dt: number) => void, pinned = false, continuous = pinned) {
  const cb = useRef(fn);
  cb.current = fn;
  useEffect(() => {
    let raf = 0, last = performance.now(), visible = false, lastY = NaN;
    const tick = (t: number) => {
      const el = ref.current;
      // non-continuous effects only depend on scroll position: skip layout reads while it hasn't moved
      const y = window.scrollY;
      if (el && (continuous || y !== lastY)) {
        lastY = y;
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = pinned ? -r.top / Math.max(1, r.height - vh) : (vh - r.top) / (vh + r.height);
        cb.current(Math.min(1, Math.max(0, p)), Math.min(64, t - last));
      }
      last = t;
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    // only animate while the element is on screen
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [ref, pinned, continuous]);
}
