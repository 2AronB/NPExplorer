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

Run `npm run benchmark` (or `node scripts/optimizer-benchmark.mjs`) for repeatable optimizer timings and route-quality checks. Use `--compare <commit>` for exact-result comparisons against a baseline. See [performance measurements and methodology](docs/optimizer-performance.md). Benchmarks are development-only and are excluded from the published website.

## Optimizer calendar contract

Requested `visit.days` are exploration equivalents and never shrink to meet the trip target. With shared exploration/driving enabled, `sharedDays` credits the final road day's spare hours at the destination, rounded down to quarter-day equivalents. Road days fit both the selected driving ceiling and the activity budget after stop allowance and camp setup/teardown. Impossible activity budgets fail with an explanatory error instead of shortening stays. Callers omitting `dayBudget` retain legacy drive-only day counts.

The final exploration morning can be followed by driving, including the return-home leg. The first road day's driving capacity is `min(pace limit, hard limit, (day budget - camp overhead - morning exploration hours) / (1 + break fraction))`. Drive as far as that capacity permits; split a longer leg across that date and later road days. Later driving days divide the remaining driving evenly. Any destination arrival credit subtracts the morning exploration already used, so two parks cannot both claim the same spare hours. A mixed road date is counted once even if it includes exploration at both parks. A full eight-hour exploration day can precede a very short drive if the entire activity budget still fits.

For example, two requested exploration days can be supplied by 0.5 day on arrival, one full day, and 0.5 day on departure morning. With a 10-hour budget, eight-hour exploration equivalent, 1.5-hour camp allowance and 10% breaks, that final four-hour morning leaves `(10 - 4 - 1.5) / 1.1 = 4.09` driving hours (also subject to pace/hard limits). A 24-minute leg finishes that afternoon; a 10-hour leg drives about 4.09 hours that afternoon and 5.91 hours the next day. Arrival sightseeing, if any, must fit what remains of that same day's budget.

`arrival` is the first exploration date. `departure` remains the exclusive end of exploration dates. `stayStart` / new `stayEnd` delimit only the standalone calendar allocation; `calendarDays = ceil(days - sharedDays - departureSharedDays)`. New `departureSharedDays` records the final morning's exploration equivalents, and `departureDriveDate` identifies its shared road date. `unusedDays = calendarDays - (days - sharedDays - departureSharedDays)` records capacity still reserved locally when no departure drive can use it. `sharedParkDays` totals arrival and departure equivalents. Each mainland leg exposes `dailyActivities` with date, driveHours, breakHours, campHours, departureExplorationHours, arrivalExplorationHours and totalHours. Disabling sharing retains full standalone park days and disables both morning sharing and arrival credits; activity-budget road limits still apply.

Seasonal quality and priority-weighted penalties sample exploration on its actual dates, including arrival and departure dates, and weight every sample by exploration equivalents. Closure checks cover those same occupied dates. Personal stops, closure waits, park-access transfers and regional visits do not release a shared departure morning. Regional access, flights and buffers remain explicit whole-day allocations; a mainland morning drive to a departure gateway still completes before the regional block starts on the next date. Hawaii car transfers retain a one-day minimum and expand if driving limits require it.

Reports allocate stay rows from `stayStart` through exclusive `stayEnd`; notes identify arrival and departure exploration. Road rows own shared calendar dates, with notes breaking down each day's activity hours. A zero-calendar-day stay still reports its requested exploration. Total days reconcile as driving + requested exploration - shared exploration + reserved stay fractions + transfers + waits + rest + final rounding. Regional blocks reconcile through their own transport/visit ledger. `roundingDays` remains the final trip rounding field, separate from per-visit `unusedDays`. This is an hour-budget model rather than a clock-time itinerary: actual sunrise, daylight, entrances, schedules and hiking fatigue are unverified. A visit completed entirely on its arrival road date does not start another road leg that same date.

## Data and software notices

CONUS park/site positions use a retained November 2022 public NPS boundary snapshot; coordinates are approximate. Separately maintained park metadata adds off-mainland parks and the current Chiricahua designation. Access-source links and draft seasonal assumptions are available in the app. Maps and optimization are schematic and heuristic.

Bundled third-party libraries: Leaflet 1.9.4, topojson-client, US Census-derived us-atlas geometry, and ExcelJS 4.4.0 (MIT). Their notices are in `vendor/`. The pinned ExcelJS browser bundle is loaded locally on the first XLSX export, without a CDN or external plan processing. SheetJS Community Edition 0.20.3 is retained only for independent export regression reads and its notice remains in `vendor/`.

XLSX exports contain an overview, chronological allocation itinerary, sourced park guide, travel details and action checklist. JSON remains the restorable input backup. Park experiences are editorial options researched from official NPS sources, not assigned activities. Generate synthetic review workbooks with `node scripts/sample-itineraries.mjs`; see `ITINERARY_INTEGRATION.md` for adapter assumptions and validation.
