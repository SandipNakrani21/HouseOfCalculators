import siteShareImage from "@/lib/site-share-image";

// Keep the public share-card URL and prerender it once. Localized pages set
// their absolute Open Graph/Twitter image URLs through buildMetadata.
export const dynamic = "force-static";

export async function GET() {
  return siteShareImage();
}
