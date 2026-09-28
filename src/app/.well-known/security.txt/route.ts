import { OPERATOR } from "@/config/legal/definitions";
import { absoluteUrl } from "@/lib/routes";

/**
 * RFC 9116 security.txt: where to report a vulnerability. It needs a real
 * contact, so it answers 404 until the operator's email is filled in
 * (config/legal/definitions.ts) rather than publishing a placeholder.
 */
export const dynamic = "force-static";

/** The RFC asks for an expiry under a year away; renewed on every build. */
const VALID_DAYS = 180;

export function GET() {
  if (!OPERATOR.email) return new Response("Not found", { status: 404 });

  const expires = new Date(Date.now() + VALID_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const body = [
    `Contact: mailto:${OPERATOR.email}`,
    `Expires: ${expires}`,
    "Preferred-Languages: en",
    `Canonical: ${absoluteUrl("/.well-known/security.txt")}`,
    `Policy: ${absoluteUrl("/en-us/terms")}`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
