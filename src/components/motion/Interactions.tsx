"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Site-wide pointer and scroll effects, delegated from one listener each so
 * the components that use them can stay server components:
 *
 *   ripple    a press on any .btn draws an ink circle from the pointer
 *   parallax  [data-parallax] layers drift against the scroll by their --depth
 *             (set in their style; negative drifts the other way)
 *
 * Both are skipped under reduced motion. Parallax only writes one CSS variable
 * on <html> (applied through `translate`), inside requestAnimationFrame.
 */
export function Interactions() {
  const pathname = usePathname();

  // Ripple.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPointerDown = (event: PointerEvent) => {
      if (reduced.matches || event.button !== 0) return;
      const target = (event.target instanceof Element ? event.target : null)?.closest<HTMLElement>(".btn, .btn-primary, .btn-outline, .btn-white");
      if (!target) return;
      const box = target.getBoundingClientRect();
      const size = Math.max(box.width, box.height) * 2.2;
      const ink = document.createElement("span");
      ink.className = "ripple-ink";
      ink.style.width = ink.style.height = `${size}px`;
      ink.style.left = `${event.clientX - box.left}px`;
      ink.style.top = `${event.clientY - box.top}px`;
      target.appendChild(ink);
      ink.addEventListener("animationend", () => ink.remove(), { once: true });
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Parallax: one variable on <html>; each layer's CSS multiplies it by its
  // own --depth. Writing to the layers themselves would race hydration.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!document.querySelector("[data-parallax]")) return;

    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      // Nothing to move once the hero is well out of view.
      const y = Math.min(window.scrollY, window.innerHeight * 1.5);
      root.style.setProperty("--scroll-y", y.toFixed(0));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
