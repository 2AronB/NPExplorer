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

## Compare trips and review access

After calculating a route, expand **Core access needs review** to see modeled restrictions on its actual exploration dates, including shared arrival and departure mornings. Calendar marks affected dates without changing activity colors. CSV notes and the XLSX checklist use the same review. Monthly highlights guidance, published recurring visitor closures and unknown service availability remain separate. This is saved research, not live conditions; the review does not change route scoring or user overrides.

Use **Compare** to save up to eight named alternatives, with a separate recovery copy of the previous active trip. Compare days, estimated driving, seasonal quality, access flags and fixed-date conflicts. Saved reports include the displayed departure-month result. Viewing or exporting one leaves the active plan in place; **Restore inputs** preserves the previous active trip before replacing inputs and requires recalculation. Older results are labeled after application/data updates. JSON backups restore inputs; XLSX/CSV remain reports. Alternatives stay in this browser; export JSON backups for use elsewhere.

Calendar supports arrow-key date navigation, Home/End week edges and Page Up/Down month changes. **Next access concern** jumps between distinct flagged periods. Long route searches can be stopped with **Cancel calculation** without changing saved inputs or alternatives. Compare also expands the input differences behind each alternative's totals.

## Place rest between visits

Expand **Place rest days** below the map to assign whole days after selected destinations. These days come from the existing reserve: placed + unplaced always equals the total reserve. Deselecting a stop preserves its placement without using the active reserve; over-allocation must be resolved explicitly. Recalculate after edits. The scheduler finishes immediate return access transfers before resting at an unspecified nearby base/gateway, and preserves requested exploration days. A rest block prevents departure-morning sharing across that block, so moving reserve may change total time, later seasons, waits, appointments and regional service-window feasibility. Calendar, CSV/XLSX, JSON backups and Compare retain the placement and its accounting. Accommodation and bookings remain unassigned.

## Set park arrival dates

Open a national park’s details and expand **First exploration dates**. Set an earliest date, a latest date, or the same date in both fields for an exact arrival. Include the travel year. The constraint applies to the first exploration, including sightseeing shared with an arrival drive; personal-stop appointments still refer to their first full day. Deselecting a park preserves its dates without constraining the active route. Use **Clear arrival window** to remove them.

Recalculate after edits. Earlier arrivals can wait at a gateway; regional trips shift their whole excursion together. Date waiting remains separate from closures, service windows, rest and personal appointments. A missed latest date is flagged on the route and Calendar, with **Next arrival-date conflict** to review it. The search keeps all requested exploration and does not prove that no feasible itinerary exists. Check or revise the route and constraints before booking. Compare, JSON backups and CSV/XLSX reports retain the requested and calculated dates.

Calendar’s **Next waiting period** shortcut jumps to the start of each arrival, closure, transport or personal-appointment wait, including adjacent waits with different causes. It wraps to the first waiting period after the last.

## Track preparation

Use **Prepare** to record research and arrangements for selected parks and whole-trip logistics. Each topic has **Not checked**, **Researched**, **Ready to book**, **Booked**, or **Not needed** status, optional notes and a checked date you enter. Open the research link or park details for published release rounds, exceptions and sources. Programs are research prompts for your travel year; no future deadline or availability is inferred.

Saving a record keeps the calculated route. After recalculation, a changed exploration/departure date flags the record for review while retaining its status; save again after reviewing the new date. Reloading without a calculated route does not invent a date change. **Needs attention** includes records with changed dates. Deselecting a park retains its inactive records. **Reset record** clears that topic's status, notes and checked date.

Preparation is browser-local and travels with JSON backups and saved alternatives. Saved reports retain their preparation topics; their own exports use the saved records. XLSX Checklist and CSV notes include user statuses and notes. These records do not establish verified bookings or suppress scheduling/access conflicts. Export JSON for a portable backup.

## Discover stops Along the Way

After calculating a route, open **Along the Way** to browse other mainland NPS sites along it. Set **Maximum extra driving per stop** in minutes, search names/states, filter monuments, historic places or scenic sites, and sort by added driving or driving plus visit time. The saved limit also appears in Trip settings. It measures the estimated extra drive to leave and rejoin a displayed route leg, including home return; an open finish can move. It is a discovery filter, not a permanent route-order constraint or verified road-routing promise.

Each candidate has an editable visit allowance, starting at a quarter day for a new timebox. Your saved site overrides take precedence. **Preview schedule impact** inserts one stop while retaining the displayed order, departure month and regional gateways. It reports allocated-day changes, total date conflicts/days late, service conflicts and downstream visit-date changes. Preview keeps your active inputs untouched. **Add visit & recalculate** saves your chosen allowance and runs the full optimizer; its final order and dates can differ. Evaluate another stop against the updated route rather than adding independent detour estimates together.

Other NPS sites now accept **0.25-day increments** in Explore and location details, as well as this tab. A quarter day uses one quarter of your full exploration-day hours (two hours with the default eight). These are user timeboxes, not official minimum visit recommendations. Selected national parks and personal appointments keep their existing whole-day rules; saved whole-day site choices are retained.

Sites can share exploration with arrival/departure driving when enabled and when the activity budget fits. The current model supports the endpoints of a road day; it does not pack an arbitrary chain of stops into one date. With sharing off or insufficient time, standalone calendar dates round up and unused capacity stays visible. Full requested exploration, closures, placed rest, regional access and home return remain in the accounting. JSON, Compare, Calendar, CSV and XLSX preserve fractional visits. The CSV column named Full destination days retains its legacy name and reports exploration equivalents, including fractions. Verify site opening hours, entrances and any tour requirements.

## Family fast and slow estimates for other NPS sites

All 334 non-park sites have editorial family-tour estimates, shown in details and Along the Way. Comfortable Exploration uses slow estimates; Hit the Highlights uses fast estimates. Uniform park mode keeps slow site estimates. Explicit per-site day overrides always win; **Use route default for this site** removes only that site's duration override. Existing park presets and personal appointments retain their own rules.

The estimates weigh concentrated versus dispersed experiences, landscape extent, signature scenery/history, exhibits and likely family engagement.82 named-site judgments refine designation-based baselines; seven official experience references were checked on October 31, 2026. These are estimates, not an individually researched audit of all 334 sites, measured impressiveness rankings or official NPS minimums. Ages, interests, opening hours, tour reservations, weather and access can change the right stay. Long trails/parkways mean a selected local outing, not the entire corridor; avoid double-counting overlapping areas or memorial clusters. Restricted/access-intensive stops have explicit caution notes.

Download [all 334 fast/slow estimates](data/site-stays.csv), including rationales, basis, references and source-review status. Hour columns assume an 8-hour exploration day; the app uses your chosen full-day hours. Examples: Dinosaur 1/2 days fast/slow; Chaco 0.5/1.5; Florissant 0.25/0.75; compact memorials 0.25/0.25.
