"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange, { passive: true });
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

/**
 * Whether the page has scrolled past `threshold` pixels.
 *
 * Returns a boolean rather than the raw offset, so a component re-renders only
 * when the answer flips, not on every scroll event. Server render is `false`.
 */
export function useScrolledPast(threshold: number): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > threshold,
    () => false,
  );
}
