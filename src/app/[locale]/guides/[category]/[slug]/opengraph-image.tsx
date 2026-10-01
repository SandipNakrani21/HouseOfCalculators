import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { GUIDES, getGuide } from "@/config/guides/definitions";
import { LOCALES, localeFromPath } from "@/config/locales";
import { createTranslator } from "@/lib/i18n";
import { ogFont } from "@/lib/og-font";
import { SITE_NAME, readyLocales } from "@/lib/seo";

/**
 * Each guide's share image, also its Article `image` for Google: the guide's
 * title in the page's own language on the brand's navy, with the logo. 16:9 at
 * 1200 wide, the shape and size Google asks for in article results and
 * Discover. Generated at build time for every guide in every language.
 */
export const alt = `${SITE_NAME} guide`;
export const size = { width: 1200, height: 675 };
export const contentType = "image/png";

type Params = { locale: string; category: string; slug: string };

// Built once per guide and language at build time, like the pages themselves.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return readyLocales().flatMap((code) =>
    GUIDES.map((guide) => ({ locale: LOCALES[code].path, category: guide.category, slug: guide.slug })),
  );
}

export default async function GuideImage({ params }: { params: Promise<Params> }) {
  const { locale: path, slug } = await params;
  const locale = localeFromPath(path);
  const guide = getGuide(slug);
  const t = locale ? createTranslator(locale.language, locale.code) : null;
  const title = guide && t ? t(guide.titleKey) : SITE_NAME;
  const label = t ? t("section.guides") : "Guides";

  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/logo.png"))).toString("base64")}`;
  // Only the characters drawn on the image, so the font fetch stays tiny. The
  // label is drawn in capitals, so it is the capitals that must be in the font.
  const font = await ogFont(locale?.language ?? "en", `${title}${label.toUpperCase()}${SITE_NAME}thecalculatorshouse.com`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: "linear-gradient(135deg, #0F172A 0%, #0B1F4D 60%, #1D4ED8 140%)",
          color: "#F8FAFC",
          fontFamily: font ? font.name : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 76,
              height: 76,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 18,
              background: "#FFFFFF",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img */}
            <img src={logo} width={66} height={66} alt="" />
          </div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>{SITE_NAME}</div>
        </div>

        {font ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                color: "#38BDF8",
                textTransform: "uppercase",
                letterSpacing: 3,
              }}
            >
              {label}
            </div>
            <div style={{ display: "flex", fontSize: title.length > 40 ? 64 : 76, fontWeight: 700, lineHeight: 1.12 }}>
              {title}
            </div>
          </div>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ height: 8, width: 200, borderRadius: 4, background: "#14B8A6" }} />
          <div style={{ fontSize: 26, color: "#94A3B8" }}>thecalculatorshouse.com</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: font.name, data: font.data, weight: 700, style: "normal" }] : undefined,
    },
  );
}
