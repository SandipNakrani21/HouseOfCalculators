import type { NextRequest } from "next/server";
import { ADSTERRA_COOKIE, ADSTERRA_ENABLED, ADSTERRA_KEY, ADSTERRA_POLICY, parseAdsterraChoice } from "@/config/adsterra";

export const dynamic = "force-dynamic";
// This frame has its own narrow policy. No arbitrary creative frames or scripts.

export function GET(request: NextRequest) {
  const nativePolicy = ADSTERRA_POLICY;
  const allowed = ADSTERRA_ENABLED && request.headers.get("sec-fetch-dest") === "iframe" &&
    parseAdsterraChoice(request.cookies.get(ADSTERRA_COOKIE)?.value) === "granted";
  const metaPolicy = nativePolicy.split('; ').filter(d => !d.startsWith('frame-ancestors')).join('; ');
  const html = allowed ? `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${metaPolicy}"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;font:14px system-ui;background:white}html{overflow:hidden}body{display:flow-root}</style></head><body><script>
    // Tighten policy before destroying the realm, including unload beacons.
    window.hocStopNative=()=>{
      const policy=document.createElement('meta');policy.httpEquiv='Content-Security-Policy';
      policy.content="default-src 'none'; script-src 'none'; img-src 'none'; connect-src 'none'; frame-src 'none'";
      document.head.appendChild(policy);window.stop();
    };
    addEventListener('pagehide',window.hocStopNative);
    const report=()=>{const box=document.getElementById('container-${ADSTERRA_KEY}');const filled=!!box?.querySelector('a');parent.postMessage({type:'hoc:native-size',height:filled?Math.ceil(document.body.getBoundingClientRect().height):0},location.origin)};
    new ResizeObserver(report).observe(document.body);
    new MutationObserver(()=>{document.querySelectorAll('a').forEach(a=>a.rel='nofollow noopener noreferrer');report()}).observe(document.body,{childList:true,subtree:true});
  </script><script async="async" data-cfasync="false" src="https://bauval.org/21/${ADSTERRA_KEY}"></script><div id="container-${ADSTERRA_KEY}"></div></body></html>` : "<!doctype html><html><body></body></html>";
  return new Response(html, { headers: {
    "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store",
    "Content-Security-Policy": nativePolicy, "X-Frame-Options": "SAMEORIGIN",
    "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "strict-origin-when-cross-origin",
  } });
}
