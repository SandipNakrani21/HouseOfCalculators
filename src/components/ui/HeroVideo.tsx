"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's decorative background video.
 *
 * The poster (a 17 KB still of the first frame) paints with the page and is
 * what speed tools measure as the hero; the video itself is only fetched once
 * the page has finished loading and the browser is idle, so it never competes
 * with the page's own content. Phones get a 360p file, larger screens 720p.
 * Visitors who ask for reduced motion or less data keep the still frame.
 */
export function HeroVideo({ src, mobileSrc, poster }: { src: string; mobileSrc?: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    // Play once enough has arrived. Calling play() straight after load() can
    // be refused while the new source is still being opened. Autoplay can
    // also be refused outright (battery saver, some in-app browsers); the
    // poster then simply stays.
    const play = () => {
      if (!cancelled) video.play().catch(() => {});
    };
    const start = () => {
      if (cancelled) return;
      video.addEventListener("canplay", play, { once: true });
      video.preload = "auto";
      video.load();
    };
    // Safari has no requestIdleCallback; a short timeout after load does the same job there.
    const whenIdle = () => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(start, { timeout: 2000 });
      else setTimeout(start, 200);
    };

    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", whenIdle);
      video.removeEventListener("canplay", play);
    };
  }, []);

  return (
    <video
      ref={ref}
      aria-hidden
      tabIndex={-1}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover motion-reduce:hidden"
    >
      {mobileSrc ? <source src={mobileSrc} type="video/mp4" media="(max-width: 767px)" /> : null}
      <source src={src} type="video/mp4" />
    </video>
  );
}
