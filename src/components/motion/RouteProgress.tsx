"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * The thin bar across the top while a page loads, and the soft fade-in of the
 * page that arrives.
 *
 * The bar starts when an internal link to another page is clicked, creeps
 * towards 90% and completes when the new path renders. The fade-in runs only
 * on client-side navigations: on a first load the page is already painted,
 * and fading it in would delay Largest Contentful Paint for nothing.
 *
 * Everything is done on the DOM through refs, so no state updates run on
 * every navigation.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const bar = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const safety = useRef(0);

  // Start on internal link clicks.
  useEffect(() => {
    const start = () => {
      const element = bar.current;
      if (!element) return;
      element.style.transition = "none";
      element.style.opacity = "1";
      element.style.transform = "scaleX(0.02)";
      void element.offsetWidth;
      element.style.transition = "transform 8s cubic-bezier(0.1, 0.7, 0.2, 1)";
      element.style.transform = "scaleX(0.9)";
      window.clearTimeout(safety.current);
      safety.current = window.setTimeout(() => finish(element), 10000);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target instanceof Element ? event.target : null)?.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      start();
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      window.clearTimeout(safety.current);
    };
  }, []);

  // Finish, and fade the new page in, when the path changes.
  useEffect(() => {
    const element = bar.current;
    if (element) finish(element);
    window.clearTimeout(safety.current);

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const main = document.getElementById("main");
    if (!main) return;
    main.classList.remove("page-enter");
    void main.offsetWidth;
    main.classList.add("page-enter");
  }, [pathname]);

  return <div ref={bar} aria-hidden className="route-progress" style={{ opacity: 0, transform: "scaleX(0)" }} />;
}

function finish(element: HTMLElement) {
  if (element.style.opacity === "0") return;
  element.style.transition = "transform 250ms ease, opacity 350ms ease 200ms";
  element.style.transform = "scaleX(1)";
  element.style.opacity = "0";
}
