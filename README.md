# NPExplorer — The Long Way

A browser-based national park road-trip planner. Explore park seasons, choose visit lengths and priorities, compare mainland routes and off-mainland excursions, and export an itinerary as XLSX or CSV. JSON backups can restore complete planning inputs.

The app needs no shared accounts, API keys, server database or package installation. Plans stay in each visitor's browser. Travel estimates, seasonal scores and transport windows are provisional planning assumptions, not verified navigation, schedules or reservations.

## Publish this repository

1. Upload this package's contents to the root of `2AronB/NPExplorer` on the `main` branch. `index.html` and `.github/workflows/pages.yml` must be at those exact paths; do not upload the ZIP itself or an enclosing folder.
2. In **Settings → Pages**, choose **GitHub Actions** under **Build and deployment → Source**.
3. In **Actions**, open **Test and deploy NPExplorer**, choose **Run workflow**, and run it on `main`. If the initial upload triggered a deployment before Pages was enabled, this manual run replaces that failed attempt.
4. When the deployment succeeds, open https://2AronB.github.io/NPExplorer/ .

Later pushes to `main` run the tests and publish automatically. Pull requests run the checks without deploying. The build publishes only an explicit allowlist of runtime files into `dist/`; developer notes, plan exports and test files are not included in the website artifact.

## Local development

Use Node.js 24 (Node 22 also works). No `npm install` is needed.

```text
npm start
npm test
npm run build
```

The local app opens at http://127.0.0.1:4173/ . `dist/` is generated and replaced on each build. Add new runtime assets to `scripts/build-site.mjs` and the source allowlist in `.gitignore`.

The public site is a separate browser origin, so its saved plans are independent from localhost. Use a JSON export/import to transfer an existing local plan. XLSX and CSV are reports rather than restorable backups.

## Data and software notices

CONUS park/site positions use a retained November 2022 public NPS boundary snapshot; coordinates are approximate. Separately maintained park metadata adds off-mainland parks and the current Chiricahua designation. Access-source links and draft seasonal assumptions are available in the app. Maps and optimization are schematic and heuristic.

Bundled third-party libraries: Leaflet 1.9.4, topojson-client, US Census-derived us-atlas geometry, and ExcelJS 4.4.0 (MIT). Their notices are in `vendor/`. The pinned ExcelJS browser bundle is loaded locally on the first XLSX export, without a CDN or external plan processing. SheetJS Community Edition 0.20.3 is retained only for independent export regression reads and its notice remains in `vendor/`.

XLSX exports contain an overview, chronological allocation itinerary, sourced park guide, travel details and action checklist. JSON remains the restorable input backup. Park experiences are editorial options researched from official NPS sources, not assigned activities. Generate synthetic review workbooks with `node scripts/sample-itineraries.mjs`; see `ITINERARY_INTEGRATION.md` for adapter assumptions and validation.
