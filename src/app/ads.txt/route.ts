import { ADSENSE_CLIENT } from "@/lib/ads";

/**
 * /ads.txt: declares Google as an authorised seller of this site's ad space.
 * AdSense asks for it before serving ads, and buyers skip inventory without
 * it. Built from the publisher id in config/adsense.ts (production builds).
 */
export const dynamic = "force-static";

export function GET() {
  const publisher = ADSENSE_CLIENT.replace(/^ca-/, "");
  if (!/^pub-\d{10,20}$/.test(publisher)) return new Response("Not found", { status: 404 });
  // f08c47fec0942fa0 is Google's certification authority ID, the same for every publisher.
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
