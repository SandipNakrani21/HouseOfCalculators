@AGENTS.md

## Working rules (from the project owner)

1. **White theme only.** The site is light, on a white background, on every
   device. No dark mode, no `dark:` classes, no `prefers-color-scheme` styles.
2. **One environment.** Everything runs and is checked on the local dev
   server (`calculator-dev` in `.claude/launch.json`, port 3000). No separate
   production server, staging or CI.
3. **No test cases.** Do not write automated tests unless the owner
   explicitly asks for them. The test suite was removed on purpose.
4. **QA every task from every angle** on the dev server before calling it
   done: the changed pages at desktop (1440px), tablet (768px) and phone
   (390px) widths,
   every interaction touched (clicks, keyboard, forms, menus), console and
   server errors, horizontal overflow, 404s for bad URLs, links, and
   `npm run check` (lint, types, i18n) plus `npm run build`. Report what was
   checked and what was found.
5. **If the dev server fails with "Can't resolve ../styles/*.css" (every page
   a 500), stop it, delete `.next`, and restart.** It happens after
   `npm run build`, or when a stylesheet is replaced rather than edited in
   place (scripted `perl -i` / `sed -i` edits do that), so edit CSS files in
   place while the dev server runs.

## UI work

Every page, calculator and feature is built from the design system: tokens in
`src/styles/tokens.css`, components in `src/components/ui`, the calculator
template in `src/components/layout/DetailPage.tsx`. Read
`docs/DESIGN_SYSTEM.md` before any UI change. Do not write one-off colours,
radii, shadows or buttons; add to the library first if something is missing.
