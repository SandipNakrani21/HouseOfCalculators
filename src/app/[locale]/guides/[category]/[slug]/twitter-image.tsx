// The same image for X / Twitter cards as for Open Graph. Segment config is
// written out here rather than re-exported: Next reads it statically.
export { default, alt, size, contentType, generateStaticParams } from "./opengraph-image";

export const dynamic = "force-static";
export const dynamicParams = false;
