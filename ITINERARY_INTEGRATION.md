# XLSX itinerary integration report

Prepared October 28, 2026. Public technical report; examples are synthetic.

## Delivery and integration boundary

- Branch: `itinerary-workbook`, isolated clone created from remote main at `7bc96163d2a5757897857b5afa2981c2009f3a25`.
- Main advanced during implementation to `67aaa2be1291b8c11b4f05c17fca294867e468ca`. This branch has **not** merged or rebased onto those changes. Delivery HEAD is the branch tip; the delivery message records its SHA.
- No optimizer, reservation, seasonal-data or deployment files were edited. Existing feature-workspace files were left untouched. No private planning notes or personal saved plans are committed.
- Original feature chat owns integration, merge and deployment. This work authorizes none of those actions. Do not discard newer main changes when integrating.

## Traveler document design

1. **Overview**: departure/last allocated date, allocation and exploration totals, road miles, driving and stop hours, other transport, regions, fixed-date conflicts and rest reserve. Compact portrait print layout.
2. **Itinerary**: chronological stop/transition allocations with typed dates and numbers, inclusive through dates, park links, shared-credit explanations and appointment warnings. No fictitious daily activities or overnight bases.
3. **Park guide**: defining experience choices in visit order, with short reasons, material access notes and clickable official-source experience names. Uncalculated exports explicitly have unoptimized selection order.
4. **Travel details**: modeled endpoints/map links, separate stop/other transport hours, regional access, mainland vehicle recovery and buffers. When newer solver daily activity splits are present, only shared road dates get additional explanatory detail, clearly labeled as already counted.
5. **Checklist**: fixed appointments/conflicts, regional transport research, park access research, overnight arrangements and placement of rest reserve. No booking is asserted. Fixed appointments are amber; conflicts are red and also labeled in text.

Arial 10-point body, restrained green headings, alternating light rows, wrapping and fitted row heights. Detail tabs freeze headings and have filters. Landscape Letter print setup repeats headings and fits width, allowing multiple vertical pages. Overview uses portrait. No Settings sheet or input/code appendix. JSON backup remains authoritative for restoration.

## Source and adapter changes

- `trip-export.mjs`: retains CSV tables and escaping; adds raw travel-document context and an asynchronous `xlsxBytes(tables, ExcelJS)` API. Includes a necessary fix retaining zero-calendar-day visits that still contain exploration credit. Accepts `stayStart`/`stayEnd` when present, falling back to the original arrival/departure contract.
- `itinerary-workbook.mjs`: presentation adapter, accounting guard, safe HTTPS hyperlinks and ExcelJS workbook writer. IDs are joins, not traveler labels. Missing values stay blank. Formula-like personal names are literal strings, never formulas.
- `park-highlights.mjs`: isolated reusable research module keyed by runtime site ID. Each experience has a title, description, official URL, caveat; each park record has a checked date.
- `app.mjs`: small asynchronous export-handler update and retryable lazy loading of the local workbook library. Imports/restores and solver calls are otherwise unchanged.
- `index.html`: export description and removal of the eager SheetJS script.
- `scripts/build-site.mjs`, `.gitignore`: additive source/runtime allowlist changes and substitution of ExcelJS assets for SheetJS in the published site. Version hashing and versioned asset imports remain intact.
- `scripts/sample-itineraries.mjs`, `tests/itinerary-workbook.test.mjs`, `tests/fixtures/morning-schedule.json`: synthetic fixtures and regression verification. The morning fixture identifies its newer-main source commit.
- `tests/trip-export.test.mjs`: CSV/accounting regressions retained; obsolete synchronous workbook-shape assertions replaced by the new workbook tests.

### Schedule accounting

The adapter owns no optimization decisions. It copies the displayed result, expands excursion parks and transport, and sums the raw, unrounded event values. It verifies allocated days, exploration equivalents, road miles, driving hours, stop allowance and other transport against result totals with a `1e-6` tolerance. A contract mismatch fails visibly instead of producing incomplete totals.

`calendarDays` is the additive visit allocation. `days` is equivalent exploration and can overlap driving. Shared credit is described but never added again to calendar totals. Displayed inclusive dates use an end-exclusive boundary minus one day, clamped at the start for zero/fractional visits. Old-contract fractional dates remain explicitly approximate. Rest labels precede final rounding. No exact time of day is inferred.

Newer-main fields preserved: `stayStart`, `stayEnd`, `sharedDays`, `departureSharedDays`, `departureDriveDate`, `unusedDays`, `legs[].dailyActivities`. The latter is supporting detail only; its rows do not create extra itinerary allocations. Arrival and departure shared credits are separately labeled. Legacy schedules without these fields continue to work.

### Upstream overlaps to resolve

Remote main contains optimizer and seasonal-research integrations that landed after the branch base. Overlapping files are `.gitignore`, `README.md`, `app.mjs`, `index.html`, `scripts/build-site.mjs`, `trip-export.mjs`, and `tests/trip-export.test.mjs`.

Keep main's seasonal-data fetch, evidence UI, data asset and allowlist entries; add this branch's workbook modules/assets beside them. Keep main's morning-exploration solver and CSV explanations/tests. Apply this branch's async XLSX handler and new workbook assertions. Do not restore the old synchronous SheetJS workbook assertions. This branch already accepts the newer schedule fields, but a final integrated browser check is still needed after resolving those overlaps.

## Research coverage and limits

All **64 runtime national parks** have **157 defining experience options**, 2–4 per park, researched against official NPS pages on October 28, 2026. Selection/order is editorial judgment, not an NPS ranking. All 74 distinct embedded source URLs returned HTTP 200 in the final link check. Source URLs, checked dates and caveats ship in the reusable module and the workbook links remain native XLSX hyperlinks.

Choices cover scenery, signature walks, cave and historic experiences, characteristic wildlife and remote boat/air access as appropriate. The guide identifies optional remote/demanding choices and separate islands/districts. It does not imply guaranteed wildlife, visible lava, available transport or that all options fit the allocated stay. Kings Canyon/Sequoia use the official jointly managed `seki` pages; North Cascades and Redwood note the broader jointly managed complexes where relevant.

This is a curated park guide, not a comprehensive closure/permit dataset. Current alerts and service availability can change. Examples of material researched notes include White Sands' safety corridor, Root Glacier access rerouting, Haleakalā sunrise reservations and ticketed cave tours. Broad access checklist entries are research tasks, not verified reservation flags. Connect the guide to the integrated seasonal/reservation contracts during feature-chat integration without duplicating their datasets.

## Dependencies and privacy

ExcelJS **4.4.0**, MIT, pinned standalone browser bundle: `https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js`. License is `vendor/EXCELJS-LICENSE.txt`. Bundle is 947,702 bytes uncompressed. It is loaded only on the first XLSX request, from the versioned local site assets. No CDN request, account, API, server processing or plan upload is required at export time. No npm dependency installation is needed for normal tests/build.

SheetJS CE and its license remain in source only for independent regression reads; they are no longer published or eagerly loaded. Workbook samples are generated by the actual browser-compatible writer, not a separate spreadsheet-authoring implementation. Artifact Tool imports/renders the resulting XLSX for visual QA.

## Verification and review artifacts

Run `node --test`, `node scripts/build-site.mjs`, and `node scripts/sample-itineraries.mjs`.

- **74 tests pass**, including independent SheetJS and ExcelJS reopen checks, typed dates/numbers, links, filters/frozen panes, print metadata, formula-injection safety, 64-park coverage and reconciliation.
- Synthetic samples: `mainland.xlsx`, `alaska-hawaii.xlsx`, `appointment-early.xlsx`, `appointment-missed.xlsx`, `uncalculated.xlsx`, `all-parks.xlsx`, under ignored `outputs/itinerary-review/`.
- Mainland sample: 14 allocated days, 9 exploration equivalents, 773.7365526508096 road miles, 13.76792991172953 driving hours, 1.75 arrival-shared exploration equivalents. Export sums match exactly within tolerance.
- Alaska/Hawaiʻi sample: 46 allocated days, 19 exploration equivalents, 3,196.677545291519 road miles, 56.692472099170615 driving hours. Individual parks, flights, regional drives/access and buffers are retained.
- Separate newer-main snapshot compatibility checks (no branch merge): mainland 13 days, early appointment 20 days, missed appointment 8 days, with exploration/miles/hours all reconciled. Departure-morning credits are retained and labeled.
- All five mainland worksheets visually inspected from actual saved XLSX renders. Also inspected regional, missed-appointment, uncalculated and all-park guide presentations. No formula errors found in Artifact Tool scans. Corrected overly wide layouts, repeated prose, header height and empty-string rendering artifacts during QA.
- Actual local built-app browser downloads pass in a disposable headless Chrome profile: uncalculated XLSX, calculated XLSX, CSV, JSON export/import/export, plus selecting a different displayed departure month and downloading that candidate. Downloaded workbooks reopen with five sheets and typed dates. No browser page errors. Existing JSON validation normalizes missing calibration `include` to true; restoration retains the same values and inclusion semantics.
- Evidence files beside samples: workbook PNG previews, `accounting.json`, `source-links.json`, `browser-verification.json`, downloaded browser artifacts and a synthetic browser screenshot. These outputs stay outside public commits and the site publication allowlist. A local review ZIP bundles them for handoff.

### Exactly what remains unverified

Native desktop Excel/LibreOffice UI rendering and physical printing were not exercised. Print controls were verified in the reopened file and layouts were inspected through Artifact Tool, so printer-specific pagination remains a manual integration check. Live future travel availability, bookings, navigation and changing access rules are not verified by this export. The combined newer-main website has not been merged or browser-tested on this branch; the original feature chat must perform that integrated check and own deployment.
