"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Drives every `data-reveal` element on the site from one place.
 *
 * Pages stay server components: they only add an attribute, and this one
 * observer adds `is-visible` as each element scrolls into view. A mutation
 * observer picks up elements that arrive later - calculator results, a
 * client-side navigation - without every component wiring its own.
 *
 * If IntersectionObserver is missing, everything is revealed at once rather
 * than left invisible.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const pending = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)");

    if (!("IntersectionObserver" in window)) {
      pending().forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          intersection.unobserve(entry.target);
        }
      },
      // Start slightly before the element is fully on screen, so the motion
      // is already under way as it arrives rather than after.
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );

    const watch = () => pending().forEach((element) => intersection.observe(element));
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
