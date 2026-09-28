"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Drives every `data-reveal` element on the site from one place.
 *
 * Pages stay server components: they only add an attribute, and this one
 * observer adds `is-visible` as each element scrolls into view and removes it
 * again when the element leaves, so sections fade in and out in both
 * directions. An element with `data-reveal-once` stays visible after its
 * first entrance. A mutation observer picks up elements that arrive later
 * (calculator results, a client-side navigation) without every component
 * wiring its own.
 *
 * If IntersectionObserver is missing, everything is revealed at once rather
 * than left invisible.
 */

/** How much of an element must show before it fades in. */
const ENTER_RATIO = 0.08;

export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const all = () => document.querySelectorAll<HTMLElement>("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      all().forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const watched = new WeakSet<Element>();
    const intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting && entry.intersectionRatio >= ENTER_RATIO) {
            element.classList.add("is-visible");
            if (element.hasAttribute("data-reveal-once")) intersection.unobserve(element);
          } else if (!entry.isIntersecting) {
            // Fully out of view: reset, so it fades in again next time.
            element.classList.remove("is-visible");
          }
        }
      },
      // Start slightly before the element is fully on screen, so the motion
      // is already under way as it arrives rather than after.
      { rootMargin: "0px 0px -6% 0px", threshold: [0, ENTER_RATIO] },
    );

    const watch = () =>
      all().forEach((element) => {
        if (watched.has(element)) return;
        watched.add(element);
        intersection.observe(element);
      });
    watch();

    const mutations = new MutationObserver(watch);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      intersection.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
