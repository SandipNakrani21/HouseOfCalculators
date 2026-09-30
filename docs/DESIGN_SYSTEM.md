# The Calculators House design system

The whole site is built from one set of tokens and one component library.
**Every new page, calculator or feature uses them.** If something new is truly
needed, add it to the library first (with tokens), then use it.

Live reference: `/{locale}/design-system` (e.g. `/en-us/design-system`)
renders every token and component from the production code. It is `noindex`
and not in the sitemap.

## 1. Where things live

| Path | What |
|---|---|
| `src/styles/tokens.css` | **The only place** colours, radius, shadows, type scale, motion and layout values are defined. Light theme only. Exposed to Tailwind via `@theme` |
| `src/styles/base.css` | Element defaults (`@layer base`) |
| `src/styles/components.css` | `.card`, `.card-link`, `.btn-*`, `.badge-*`, `.chip`, `.input`, `.select`, `.segment`, `.switch`, `.result-box`, `.skeleton`, `.ad-*`, `.tone-*` (`@layer components`) |
| `src/styles/utilities.css` | `container-page` (1200px), `container-narrow`, `container-prose`, `section-gap`, `text-gradient` |
| `src/styles/animations.css` | Keyframes, `data-reveal`, stagger, parallax, reduced motion |
| `src/app/globals.css` | Imports the five files above. Do not add styles here |
| `src/components/ui/` | The component library (below) |
| `src/components/layout/` | `SiteHeader`, `TopBar`, `SiteFooter`, `Logo`, `DetailPage` (the calculator template) |
| `src/components/motion/` | `RevealObserver`, `Interactions` (ripple, parallax), `RouteProgress`, `CountUp` |
| `src/hooks/` | `useScrolledPast`, `useInView` |
| `src/app/[locale]/layout.tsx` | The main layout: TopBar + Header, `<main>`, Footer, toasts, back-to-top |

**Never** write a hex colour, a pixel radius or a one-off shadow in a component.
Illustrations in `components/home/` are the only exception.

## 2. Tokens

| Token | Value | Tailwind |
|---|---|---|
| `--primary` / `-dark` / `-light` | #2563EB / #1D4ED8 / #EFF6FF | `bg-primary`, `hover:bg-primary-dark`, `bg-primary-light` |
| `--navy` | #0F1B3D | `bg-navy` (top bar, footer) |
| `--heading` / `--text` | #0F172A / #475569 | `text-heading`, `text-text` |
| `--muted` / `--subtle` | #64748B / #94A3B8 | `text-muted` (small copy, passes AA), `text-subtle` (placeholders, icons only) |
| `--border` / `--border-strong` | #E2E8F0 / #CBD5E1 | `border-border` (cards), `border-border-strong` (inputs, field selects) |
| `--border-control` | #94A3B8 | `border-border-control`: dropdown triggers and the header search field, so a control never reads as a card |
| Header height | one row at every width: `--header-height` 5.75rem, 4.75rem once scrolled | sticky offsets and scroll padding read it |
| `--bg` / `--bg-soft` / `--bg-tint` | #FFFFFF / #F8FAFC / #F1F6FF | `bg-bg-soft`, `section-soft`, `section-tint` |
| `--gradient-cta` | 90° #1D4ED8 → #3B82F6 | `bg-gradient-cta` |
| Category pairs | blue, green, violet, orange, pink, teal, rose, amber (+ sky, indigo) | `tone-{name}` on a parent, then `.tile`, `.badge-tone`, `.tone-text` |
| Radius | sm 8 / md 12 / lg 16 / xl 24 / pill | `rounded-sm` … `rounded-xl`, `rounded-pill` |
| Shadow | card / lift (hover, blue-tinted) / primary | `shadow-card`, `shadow-lift`, `shadow-primary` |
| Type | display 36→56, h1 30→44, h2 24→32, h3 18, body 15–16, small 13 | `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-small` |
| Motion | `--ease-premium` cubic-bezier(0.22,1,0.36,1), 200/300/600ms, stagger 90ms | `ease-premium` |
| Breakpoints | 480 / 640 / 768 / 1024 / 1280 / 1536 / 1600 | `xs:` `sm:` `md:` `lg:` `xl:` `2xl:` `3xl:` |

The spec's muted grey (#94A3B8) fails WCAG AA for text on white, so it is
`--subtle` and never used for readable copy.

## 3. Components (`src/components/ui`)

| Component | Use |
|---|---|
| `Button`, `ButtonLink` | `variant` primary / outline / ghost / white · `size` sm / md / lg · `icon`, `iconEnd`, `square`. Hover lift and ripple are automatic |
| `Badge` | `variant` soft / tone / outline, `tone`, `icon`. `.chip` for quick links |
| `SectionHeader`, `ViewAllLink` | Title (+ eyebrow, icon, intro) left, "View all →" right |
| `ContentCard`, `CategoryCard`, `CalculatorCard` | Link cards with the lift / blue border / sliding arrow hover |
| `CardGrid` | 4 → 2 → 1 grid with staggered reveal. `pageSize` + `loadMoreLabel` turn on load-more-on-scroll |
| `LoadMore` | Used by `CardGrid`. All items stay in the HTML (SEO, no-JS) |
| `Hero`, `SearchBar` | Two-column hero with gradient second line; search with "Popular" chips |
| `StatsStrip`, `StatCard` | Icon + counting number + label. Real, computed numbers only |
| `FeatureItem` | Icon circle + title + text |
| `CountryFlagItem` | Round flag + name |
| `BlogCard` | Picture + tag + title + "Read more →" |
| `CTABanner` | Blue gradient call to action with a white button |
| `AdSlot` | `placement` leaderboard (728×90, 320×100 on phones) / rectangle (300×250) / rail (300×600). Reserves its height. Labelled placeholder in development, nothing in production without a publisher id |
| `Select` (ui/Select) | The only dropdown: `variant` field / pill, `searchable`, custom `trigger`. The list renders into <body>, so nothing clips it; full keyboard support. Used by the country and language pickers and the welcome popup |
| `Field`, `Input`, `Select`, `SegmentedControl`, `Switch`, `Slider`, `ResultBox`, `FactList` | Every calculator/tool form |
| `ActionBar` | Reset · Print · Download CSV (when given `onDownloadCsv`) · Copy link · Share, equal-height buttons on a 2-column grid. `layout="row"` puts them in one row from tablet up (the tools). `shareUrl` builds a link that carries the inputs |
| `.data-table` (CSS class) | Every data table: header row, row dividers, cell padding and the blue row hover. Just `<table className="data-table">` |
| `Skeleton`, `SkeletonText`, `SkeletonCard`, `SkeletonImage`, `SkeletonGrid` | Loading placeholders |
| `ToastProvider` / `useToast()` | `toast.show("Copied")` |
| `Modal` | `variant` dialog / drawer. Esc, backdrop, focus trap, scroll lock |
| `TabList` | Controlled pill tabs with arrow-key navigation |
| `Accordion` | FAQ, built on `<details>` |
| `Breadcrumbs` | Visible trail + BreadcrumbList JSON-LD |
| `PageHeader` | Every inner page's heading |
| `Icon`, `IconTile` | lucide icons by name; pastel icon circle. Names and colours per item come from `lib/visuals.ts` |
| `ScrollToTop` | Mounted once in the layout |

## 4. Motion

- `data-reveal="up|down|left|right|zoom|fade"` on any element: fades in when it
  enters the viewport and back out when it leaves. Add `data-reveal-once` to
  keep it visible after the first time.
- `data-reveal="stagger"` on a list: children cascade in 90ms apart.
- `data-parallax` + `style={{ "--depth": 0.15 }}`: drifts against the scroll.
- Above-the-fold content uses `animate-fade-up` (with `--delay`); the page's
  main heading uses `animate-rise` (never fades: it is the LCP element).
- Animate only `transform` / `opacity` / `translate`. Everything is off under
  `prefers-reduced-motion`.
- Marquee (`.marquee` > `.marquee-track`, content twice, the copy `aria-hidden`): drifts sideways,
  pauses under the pointer and while anything inside has focus, and stands still and wraps under
  reduced motion. Used by the TopBar and the homepage's country flags (`home/CountryMarquee`,
  whose hover/focus card is portalled to `<body>` so the moving row neither carries nor clips it).
- Handled globally, no wiring needed: header shrink after 50px, top progress
  bar and page fade on navigation, button ripple, back-to-top button.

## 5. Page templates

**Calculator, converter, tool, chart:** use `components/layout/DetailPage.tsx`:

Breadcrumb → title + intro → calculator card (inputs left, result right) →
AdSlot → How it works / formula → FAQ accordion → related grid → CTABanner,
with a sticky ad rail on desktop that moves below the content on phones.
`rail={false}` gives the card the full width and shows that ad as a banner
instead (the tools). `schema="page"` for reference material (the charts).
The banner's copy and link come from `calculatorsCta(t, locale)` in `lib/cta.ts`.

**Listing pages** (section indexes, categories, a country): use
`components/layout/ListingPage.tsx`: Breadcrumb → title + intro → cards, as
`groups` under subheadings or one `items` grid → AdSlot, plus the list as
CollectionPage structured data.

**Homepage:** `Hero` → `StatsStrip` → categories → popular → more ways →
why choose (`FeatureItem`) → countries (`CountryFlagItem`) → guides
(`BlogCard`) → `CTABanner`.

## 6. Rules

1. Use the tokens and components. No new one-off styles when one exists.
2. Need something new? Add it to `src/components/ui` (and tokens if needed),
   show it on the design-system page, then use it.
3. One `<h1>` per page (`PageHeader` or `Hero` renders it); semantic sections;
   metadata through `buildMetadata`.
4. Images: explicit width/height, `loading="lazy"` below the fold.
5. Every figure shown as a stat must be computed, never typed in.
6. Accessibility: visible focus, AA contrast, `aria-label` on icon-only
   buttons, keyboard access for every control.
7. Features that need outside accounts stay off until configured:
   social links and the newsletter (`src/config/site.ts`), ads (`lib/ads.ts`).
