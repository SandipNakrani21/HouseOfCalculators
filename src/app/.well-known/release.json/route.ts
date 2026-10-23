/** Public, non-sensitive marker for verifying which release the CDN serves. */
export const dynamic = "force-static";
export function GET() {
  return Response.json({ release: "qa-release-2026-10-23-portugal-cent-rounding" });
}
