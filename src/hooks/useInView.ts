"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Calls `onEnter` each time the element scrolls into view (or only the first
 * time, with `once`). Used by count-ups and "load more on scroll".
 *
 * Without IntersectionObserver, `onEnter` runs once straight away, so content
 * that waits on it is never stranded.
 */
export function useInView<T extends Element>(
  onEnter: () => void,
  { once = true, rootMargin = "0px", threshold = 0 }: {
    once?: boolean;
    rootMargin?: string;
    threshold?: number;
  } = {},
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const callback = useRef(onEnter);

  useEffect(() => {
    callback.current = onEnter;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      callback.current();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        callback.current();
        if (once) observer.disconnect();
      },
      { rootMargin, threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return ref;
}
