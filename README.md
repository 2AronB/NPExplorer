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

## Optimizer calendar contract

Requested `visit.days` are exploration equivalents and never shrink to meet the trip target. With arrival sightseeing enabled, `sharedDays` credits only the final road day's spare hours, rounded down to quarter-day equivalents. Road days divide driving evenly and fit both the selected driving ceiling and the activity budget after stop allowance and camp setup/teardown. Impossible activity budgets fail with an explanatory error instead of shortening stays. Callers omitting `dayBudget` retain legacy drive-only day counts.

Mainland visits end at whole-day boundaries. `arrival` is the first exploration date (possibly the last travel date); new `stayStart` is the start of the standalone stay allocation. `calendarDays = ceil(days - sharedDays)` includes new `unusedDays = calendarDays - (days - sharedDays)` as reserved capacity at the end of that stay. Partial credits preserve exploration but remove a calendar day only when the credit reaches a full day. There is no departure sightseeing or time-of-day carry into the next road leg or excursion. Disabling sharing retains full standalone park days; activity-budget road limits still apply.

Seasonal quality and priority-weighted penalties sample credited arrival exploration on its actual date and weight every sample by its exploration equivalents. Closure checks cover those same occupied dates. Personal stops, closure waits and park-access transfers receive no arrival credit. Regional access, flights and buffers remain explicit whole-day allocations; Hawaii car transfers retain a one-day minimum and expand if driving limits require it.

Reports allocate stay rows from `stayStart` through exclusive `departure`; notes identify arrival-day exploration, and a zero-calendar-day stay still reports its requested exploration. For mainland schedules, total days reconcile as driving + requested exploration - shared exploration + reserved stay fractions + transfers + waits + rest + final rounding. Regional blocks reconcile through their own transport/visit ledger. `roundingDays` remains the final trip rounding field, separate from per-visit `unusedDays`. All dates remain planning estimates; actual daylight, entrances and transport schedules are unverified.

## Data and software notices

CONUS park/site positions use a retained November 2022 public NPS boundary snapshot; coordinates are approximate. Separately maintained park metadata adds off-mainland parks and the current Chiricahua designation. Access-source links and draft seasonal assumptions are available in the app. Maps and optimization are schematic and heuristic.

Bundled third-party libraries: Leaflet 1.9.4, topojson-client, US Census-derived us-atlas geometry, and SheetJS Community Edition 0.20.3. Their notices are in `vendor/`. SheetJS browser exports use the official standalone distribution: https://docs.sheetjs.com/docs/getting-started/installation/standalone/ .
