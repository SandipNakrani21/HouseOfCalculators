/** Public, non-sensitive marker for verifying which release the CDN serves. */
export const dynamic = "force-static";
export function GET() {
  return Response.json({ release: "publisher-readiness-2026-10-19-1" });
}
