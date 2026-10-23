# Performance and deployment size update

Generated on 2026-10-23 from commit `6d6834c6b69d914d22f633e3b2fc62494355e792`.

## Measured changes

- The local `.next` build footprint fell from 3,916.3 MiB to 2,450.2 MiB (37.4%). This includes local build files and is not the Hostinger directory size.
- The production standalone package is 993.2 MiB (1,041,409,185 bytes). It includes the Next runtime, pre-rendered pages, static assets, public files and only traced runtime data. It excludes tests, QA scripts/reports, source modules except traced runtime JSON, Git history, development dependencies, caches and development output.
- Mortgage HTML fell from 315,763 to 187,755 bytes (40.5%); gzip size fell from 75,007 to 29,084 bytes (61.2%). Its RSC payload fell from 205,845 to 53,010 bytes (74.2%).
- The shared English dictionary had been repeated in each generated page. Locale dictionaries now load as separate cacheable modules. Calculator display metadata now replaces the full reviewed-model registry in the shared calculator UI.
- Page hero animation and large blurred layers were replaced with static gradients to reduce moving/composited work on mobile devices.

## Checks

- `npm run check`: pass; 106 tests passed. One pre-existing ESLint warning remains in a private QA helper.
- `npm run build`: pass; 4,067 routes generated, standalone output enabled.
- `npm run package:deploy`: pass; 993.2 MiB Windows validation package created at `dist/deploy-6ACslyWsbqBU5T3njkaNT-win32-x64`.
- Standalone smoke check: pass; 48 routes (home, mortgage, salary and length converter across 12 locales) returned HTTP 200 with the correct page language and server-rendered calculator controls/results; all 18 page scripts loaded.

The workflow builds and archives a Linux x64 release so it can run on a Linux hosting account. Deploy the contents of that Linux package with `node server.js` (or `npm start`), following `docs/SLIM-DEPLOYMENT.md`. Hostinger storage and field Core Web Vitals were not accessible from this workspace, so neither deployed disk savings nor a Lighthouse/CWV score is claimed. The owner controls Hostinger deployment and removal of old server backups.
