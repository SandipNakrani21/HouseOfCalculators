import type { ReactNode } from "react";

import { JsonLd } from "@/components/seo/JsonLd";
import { AdSlot } from "@/components/ui/AdSlot";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import { CardGrid, ContentCard } from "@/components/ui/ContentCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { LocaleCode } from "@/config/locales";
import { collectionPageSchema } from "@/lib/seo";
import type { Visual } from "@/lib/visuals";

export type ListingItem = {
  key: string;
  href: string;
  title: string;
  description?: string;
  visual?: Visual;
  /** In place of the icon tile, e.g. a country's flag. */
  media?: ReactNode;
};

export type ListingGroup = {
  key: string;
  title: string;
  visual?: Visual;
  /** Beside the group title, e.g. a "View all" link. */
  action?: ReactNode;
  items: ListingItem[];
};

/**
 * The template every listing page follows - a section index (/calculators),
 * a category (/tools/date-time) or a country (/countries/us):
 *
 *   Breadcrumb → title and intro → cards (in groups, or one grid) → ad
 *
 * plus the list as schema.org CollectionPage data. Pass `groups` for a page
 * split under subheadings, or `items` for a single grid.
 */
export function ListingPage({
  locale,
  trail,
  breadcrumbLabel,
  header,
  groups,
  items,
  loadMoreLabel,
  emptyLabel,
  adSlot,
}: {
  locale: LocaleCode;
  /** Home first, this page last (its path is the page's own). */
  trail: Crumb[];
  breadcrumbLabel: string;
  header: {
    title: string;
    description: string;
    eyebrow?: string;
    visual?: Visual;
    media?: ReactNode;
    /** Extra content under the intro, e.g. a country's facts. */
    children?: ReactNode;
  };
  groups?: ListingGroup[];
  items?: ListingItem[];
  loadMoreLabel: string;
  /** Shown instead of an empty grid. */
  emptyLabel?: string;
  adSlot: string;
}) {
  const shownGroups = groups?.filter((group) => group.items.length) ?? [];
  const all = groups ? shownGroups.flatMap((group) => group.items) : (items ?? []);

  return (
    <>
      <PageHeader
        width="page"
        breadcrumbLabel={breadcrumbLabel}
        trail={trail}
        visual={header.visual}
        media={header.media}
        eyebrow={header.eyebrow}
        title={header.title}
        description={header.description}
      >
        {header.children}
      </PageHeader>
      <div className="container-page pb-12 sm:pb-16">
        {groups ? (
          shownGroups.map((group) => (
            <section key={group.key} className="mb-16 sm:mb-20">
              <SectionHeader visual={group.visual} title={group.title} action={group.action} />
              <Cards items={group.items} pageSize={9} loadMoreLabel={loadMoreLabel} />
            </section>
          ))
        ) : all.length ? (
          <Cards items={all} pageSize={12} loadMoreLabel={loadMoreLabel} />
        ) : emptyLabel ? (
          <p className="rounded-lg border border-dashed border-border-strong p-10 text-center text-sm text-muted">
            {emptyLabel}
          </p>
        ) : null}

        <AdSlot slot={adSlot} placement="leaderboard" />

        {/* The list above as structured data, for search and answer engines. */}
        <JsonLd
          data={collectionPageSchema({
            name: header.title,
            description: header.description,
            path: trail[trail.length - 1]?.path ?? "/",
            locale,
            items: all.map((item) => ({ name: item.title, path: item.href })),
          })}
        />
      </div>
    </>
  );
}

function Cards({ items, pageSize, loadMoreLabel }: { items: ListingItem[]; pageSize: number; loadMoreLabel: string }) {
  return (
    <CardGrid pageSize={pageSize} loadMoreLabel={loadMoreLabel}>
      {items.map((item) => (
        <li key={item.key}>
          <ContentCard
            href={item.href}
            visual={item.visual}
            media={item.media}
            title={item.title}
            description={item.description}
          />
        </li>
      ))}
    </CardGrid>
  );
}
