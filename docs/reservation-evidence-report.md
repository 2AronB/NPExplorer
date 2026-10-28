# Reservation and signature-experience evidence report

Research checked **2026-10-28**. Branch: `reservation-data`. Base remote main: `67aaa2be1291b8c11b4f05c17fca294867e468ca`. The isolated clone initially started at `7bc96163d2a5757897857b5afa2981c2009f3a25`; remote main advanced during research, so only this research branch was rebased before commit. Runtime park IDs were unchanged.

This is an informational research contribution for integration by the feature chat. It adds no runtime imports, UI, build allowlist entries, optimizer behavior, scores, closures, stay lengths or saved overrides. No merge, deployment, booking, lottery entry, account creation or third-party messaging was performed. Publishing this branch and an integration report was authorized; integration and deployment remain outside this assignment. Private handoff files, planning notes and raw page caches are excluded.

## Coverage and meaning

- 64 of 64 runtime national parks reviewed against current remote inventory, including Chiricahua and the 12 remote park records. Runtime siteIDs are preserved, including `sequ` / `kica` with joint `seki` NPS sources. Runtime display names are carried unchanged.
- 120 scoped records: 112 current-published programs, 4 discontinued entry programs for 2026, 3 announced 2027 programs, 1 unresolved operator requirement. A current-published program can be out of season today.
- 206 successfully read official source pages. Each source has URL, title, issuing authority, checked date, last-updated text when present and HTTP result. Booking URLs are distinct from evidence URLs; generic Recreation.gov links are explicitly search portals, not verified program endpoints.
- 104 rules have at least one explicitly recorded gap. Most gaps concern exact release clocks, undated annual schedules, direct booking endpoints or source inconsistencies. A confirmed permit requirement is not the same as a completely verified schedule. Every park is `reviewed_with_gaps` because future travel-year rules remain unverified.
- Parks without a scoped reservation record: badl, chir, cuva, indu, neri, pinn, wrst. These were reviewed; no record is not a claim of unrestricted camping or no bookable experiences. Review notes and assessments retain the bounded findings.

## Method and evidence

Read current NPS basic-information and permit pages, then follow relevant wilderness, named-hike, road, ferry and tour pages. Search was used to locate changed URLs and issuing authorities, not as evidence by itself. Read full relevant page text rather than relying on snippets. Check Recreation.gov when NPS wording conflicts or is incomplete, and the NPS-designated Redwood Parks Conservancy reservation service. No blogs or unofficial summaries are used as evidence. HTTP success alone does not establish a usable page: 404 pages, NPS Page In-Progress responses and short redirect stubs were excluded from the source registry.

General entry has three distinct negative states: `confirmed_not_required` requires an explicit statement, `no_requirement_found` is a bounded negative finding, and `conflicting_sources` preserves unresolved disagreement. The data does not convert silence into a park-wide exemption. Each rule carries claim-group evidence, release-round source references, scope, exceptions and uncertainty. Sources are shared by ID to avoid copying official text. Paraphrases are research notes, not complete permit conditions.

The four pilots were Rocky Mountain (general/corridor timing), Angels Landing (named-hike lottery), Dry Tortugas (boat access), and Arches (2026 discontinued entry pilot). The schema was then extended for multiple rounds, crossing-year windows, assigned-access lotteries, unavailable experiences and announced 2027 programs.

## Consequential findings and unresolved conflicts

- **2026 changes:** Arches, Yosemite, Glacier and Mount Rainier entry programs are not active requirements in 2026. The records are `discontinued`, year-bound, and must not produce active warning badges. This is not a permanent abolition claim.
- **Glacier:** the 2026 Logan Pass shuttle is ticketed, with 60-day and evening-before releases. Vehicle entry remains separate. A ticket is required from age two under the detailed seating rule; introductory wording says over two.
- **Glacier Bay:** the specific 2026 boating page replaces a stale 60-day statement in Basic Information with two advance lotteries and a three-calendar-day short-notice lottery. Boat entry, overnight permits and tour seats are separate.
- **Crater Lake:** Basic Information says entry reservations are unnecessary, while Permits & Reservations says they are required without identifying a program. Preserve `conflicting_sources`; no confirmed entry badge. The boat-tour page explicitly suspends boat tours in 2026–2027 despite generic summer-operation text lower down.
- **Timezones:** Congaree NPS says EST for April, but Recreation.gov explicitly says EDT; use issuer EDT / America/New_York. Redwood, Olympic, SEKI, Great Sand Dunes and Voyageurs contain PST/CST wording during DST months; unresolved fields stay null with original wording retained. Canyonlands overview says MST while its detailed page says MT; the detailed program page supports America/Denver, with the conflict retained. Do not use the computer timezone.
- **Other mixed text:** Grand Teton has stale 2025 text alongside an explicit 2026 release; use the dated 2026 section. Mount Rainier wilderness/climbing pages mix old graphics, seasonal dates and quota percentages; no invented annual lottery timestamps. Yellowstone early access ends April 24 in its summary versus April 25 in its FAQ. Zion Narrows has a misdirected overnight link in prose; use its dedicated overnight link. Katmai’s broad no-recreation-permits statement is qualified by its specific Brooks River corridor rule.
- **2027:** North Cascades publishes dated lottery/public-sale windows; Denali publishes a January 1 climbing-registration opening; Great Smoky Mountains publishes only a provisional Elkmont timeline. Their statuses are `announced_future`; exact missing clocks remain unknown.
- **Scope:** Angels Landing is the chains section; Subway permits also apply bottom-up; Narrows bottom-up has no permit, but top-down does. Tuweep vehicle permits are separate from Grand Canyon general entry. Mount Whitney east-side permits are issued by Inyo National Forest; west-side park origins use different wilderness rules.

## Consumer contract and integration

Read `data/reservation-requirements.json` as optional planning metadata. `informationalOnly` must remain true and `projectionPolicy.affectsOptimizer` false. No rule changes route ranking, feasibility, dates, scores or stays. Fees/passes are not reservations. Lottery application is not an award; an early-access award is not an itinerary; an online reservation may still require in-person permit activation. Last-minute inventory is never guaranteed.

For a future 2040/2042 trip, show “Current program; recheck before your travel year” as background only, or “Travel-year rules not announced.” Never turn a year-specific rule or undated recurring page into a verified future deadline. Do not calculate calendars from this dataset in this task. Resolve missing clocks/DST and actual seasonal dates with the issuer first. Avoid whole-park reservation-only labels for partial/optional experiences. Do not surface discontinued/historical/unknown records as active requirements, or unavailable experiences as bookable inventory.

`programYear` and exact dates are independent from recurring month-day descriptions. Units are explicit: days, calendar_days, weeks, calendar_months, calendar_years or hours. A null value is unknown, not midnight, no restriction or zero-day notice. `releaseRounds.event` distinguishes application, result, inventory release and permit issuance. `basis` distinguishes person, group, vehicle and vessel; `scope.accessType` distinguishes entry, parking, overnight, transport and tour access. Unknown dates never silently roll forward.

Integration should first resolve the high-impact conflicts above, select the desired badges/details/checklist presentation, and agree a runtime/build allowlist addition in the feature branch. The research branch intentionally does neither. No global instructions were changed. The local handoff and PLANNING.md remain private.

## Validation and limitations

Run `node scripts/validate-reservations.mjs` and `node --test tests/reservations.test.mjs`. Checks cover runtime inventory equality, unique IDs, referenced official sources, valid dates/URLs/IANA zones, enum/shape consistency, year-specific and discontinued handling, explicit unknowns, partial hike scope, multiple release rounds and zero verified applicability in 2040. This is source-data validation, not booking availability validation or a comprehensive legal-compendium audit.

Validation completed on 2026-10-28: the standalone validator passed, all **9 focused tests passed**, and `git diff --cached --check` passed. The runtime publication allowlist excludes reservation research. Optimizer searches and manual booking-account flows were not run because this branch adds only research artifacts and validation.

All evidence URLs were successfully fetched while researching. Live operator availability, all external booking endpoints, current closures on every trail, every permit exception, special-use/commercial permits and detailed campground/lodging release inventories remain unverified or intentionally deferred. Dedicated backcountry determinations remain incomplete for: **badl, jeff, hosp, indu, meve, pinn, gaar, katm, kova, npsa**. General-entry negative searches remain unconfirmed for **41 parks**. These are gaps, not unrestricted-access findings. Link health and published rules can change after the checked date.

## Park-by-park evidence index

| siteID | Runtime park | General entry finding | Scoped records | Rule gaps | Primary entry evidence |
| --- | --- | --- | ---: | ---: | --- |
| acad | Acadia National Park | confirmed_not_required | 2 | 2 | [Official source](https://www.nps.gov/acad/planyourvisit/vehicle_reservations.htm) |
| arch | Arches National Park | confirmed_not_required (2026) | 4 | 3 | [Official source](https://www.nps.gov/arch/learn/news/news02182026.htm) |
| badl | Badlands National Park | no_requirement_found | 0 | 0 | [Official source](https://www.nps.gov/badl/planyourvisit/basicinfo.htm) |
| bibe | Big Bend National Park | confirmed_not_required | 2 | 2 | [Official source](https://www.nps.gov/bibe/planyourvisit/permitsandreservations.htm) |
| bisc | Biscayne National Park | no_requirement_found | 1 | 1 | [Official source](https://www.nps.gov/bisc/planyourvisit/basicinfo.htm) |
| blca | Black Canyon of the Gunnison National Park | confirmed_not_required | 3 | 2 | [Official source](https://www.nps.gov/blca/planyourvisit/basicinfo.htm) |
| brca | Bryce Canyon National Park | confirmed_not_required | 2 | 2 | [Official source](https://www.nps.gov/brca/planyourvisit/permitsandreservations.htm) |
| cany | Canyonlands National Park | confirmed_not_required | 3 | 2 | [Official source](https://www.nps.gov/cany/planyourvisit/permitsandreservations.htm) |
| care | Capitol Reef National Park | confirmed_not_required | 2 | 2 | [Official source](https://www.nps.gov/care/planyourvisit/permitsandreservations.htm) |
| cave | Carlsbad Caverns National Park | no_requirement_found | 2 | 2 | [Official source](https://www.nps.gov/cave/planyourvisit/basicinfo.htm) |
| chir | Chiricahua National Park | confirmed_not_required | 0 | 0 | [Official source](https://www.nps.gov/chir/planyourvisit/permitsandreservations.htm) |
| chis | Channel Islands National Park | no_requirement_found | 3 | 3 | [Official source](https://www.nps.gov/chis/planyourvisit/basicinfo.htm) |
| cong | Congaree National Park | no_requirement_found | 2 | 2 | [Official source](https://www.nps.gov/cong/planyourvisit/basicinfo.htm) |
| crla | Crater Lake National Park | conflicting_sources | 3 | 2 | [Official source](https://www.nps.gov/crla/planyourvisit/basicinfo.htm) |
| cuva | Cuyahoga Valley National Park | no_requirement_found | 0 | 0 | [Official source](https://www.nps.gov/cuva/planyourvisit/basicinfo.htm) |
| dena | Denali National Park | no_requirement_found | 3 | 2 | [Official source](https://www.nps.gov/dena/planyourvisit/basicinfo.htm) |
| deva | Death Valley National Park | no_requirement_found | 2 | 2 | [Official source](https://www.nps.gov/deva/planyourvisit/basicinfo.htm) |
| drto | Dry Tortugas National Park | no_requirement_found | 2 | 1 | [Official source](https://www.nps.gov/drto/planyourvisit/permitsandreservations.htm) |
| ever | Everglades National Park | no_requirement_found | 2 | 1 | [Official source](https://www.nps.gov/ever/planyourvisit/basicinfo.htm) |
| gaar | Gates of the Arctic National Park | confirmed_not_required | 1 | 1 | [Official source](https://www.nps.gov/gaar/planyourvisit/permits.htm) |
| glac | Glacier National Park | confirmed_not_required (2026) | 3 | 2 | [Official source](https://www.nps.gov/glac/planyourvisit/vehicle-reservations2026.htm) |
| glba | Glacier Bay National Park | no_requirement_found | 4 | 3 | [Official source](https://www.nps.gov/glba/planyourvisit/basicinfo.htm) |
| grba | Great Basin National Park | no_requirement_found | 2 | 2 | [Official source](https://www.nps.gov/grba/planyourvisit/basicinfo.htm) |
| grca | Grand Canyon National Park | confirmed_not_required | 3 | 3 | [Official source](https://www.nps.gov/grca/planyourvisit/permitsandreservations.htm) |
| grsa | Great Sand Dunes National Park | no_requirement_found | 1 | 1 | [Official source](https://www.nps.gov/grsa/planyourvisit/basicinfo.htm) |
| grsm | Great Smoky Mountains National Park | no_requirement_found | 3 | 2 | [Official source](https://www.nps.gov/grsm/planyourvisit/basicinfo.htm) |
| grte | Grand Teton National Park | confirmed_not_required | 1 | 1 | [Official source](https://www.nps.gov/grte/planyourvisit/permitsandreservations.htm) |
| gumo | Guadalupe Mountains National Park | no_requirement_found | 1 | 1 | [Official source](https://www.nps.gov/gumo/planyourvisit/basicinfo.htm) |
| hale | Haleakalā National Park | no_requirement_found | 2 | 2 | [Official source](https://www.nps.gov/hale/planyourvisit/basicinfo.htm) |
| havo | Hawaiʻi Volcanoes National Park | no_requirement_found | 1 | 1 | [Official source](https://www.nps.gov/havo/planyourvisit/basicinfo.htm) |
| hosp | Hot Springs National Park | confirmed_not_required | 2 | 2 | [Official source](https://www.nps.gov/hosp/planyourvisit/permitsandreservations.htm) |
| indu | Indiana Dunes National Park | no_requirement_found | 0 | 0 | [Official source](https://www.nps.gov/indu/planyourvisit/basicinfo.htm) |
| isro | Isle Royale National Park | no_requirement_found | 2 | 2 | [Official source](https://www.nps.gov/isro/planyourvisit/basicinfo.htm) |
| jeff | Gateway Arch National Park | confirmed_not_required | 1 | 1 | [Official source](https://www.nps.gov/jeff/planyourvisit/fees.htm) |
| jotr | Joshua Tree National Park | confirmed_not_required | 2 | 2 | [Official source](https://www.nps.gov/jotr/planyourvisit/permitsandreservations.htm) |
| katm | Katmai National Park | no_requirement_found | 3 | 2 | [Official source](https://www.nps.gov/katm/planyourvisit/basicinfo.htm) |
| kefj | Kenai Fjords National Park | no_requirement_found | 1 | 1 | [Official source](https://www.nps.gov/kefj/planyourvisit/basicinfo.htm) |
| kica | Kings Canyon National Park | no_requirement_found | 1 | 1 | [Official source](https://www.nps.gov/seki/planyourvisit/basicinfo.htm) |
| kova | Kobuk Valley National Park | confirmed_not_required | 1 | 1 | [Official source](https://www.nps.gov/kova/planyourvisit/permits.htm) |
| lacl | Lake Clark National Park | confirmed_not_required | 2 | 2 | [Official source](https://www.nps.gov/lacl/planyourvisit/permitsandreservations.htm) |
| lavo | Lassen Volcanic National Park | no_requirement_found | 1 | 1 | [Official source](https://www.nps.gov/lavo/planyourvisit/basicinfo.htm) |
| maca | Mammoth Cave National Park | no_requirement_found | 2 | 2 | [Official source](https://www.nps.gov/maca/planyourvisit/basicinfo.htm) |
| meve | Mesa Verde National Park | no_requirement_found | 1 | 0 | [Official source](https://www.nps.gov/meve/planyourvisit/basicinfo.htm) |
| mora | Mount Rainier National Park | confirmed_not_required (2026) | 3 | 2 | [Official source](https://www.nps.gov/mora/planyourvisit/fees.htm) |
| neri | New River Gorge National Park and Preserve | no_requirement_found | 0 | 0 | [Official source](https://www.nps.gov/neri/planyourvisit/basicinfo.htm) |
| noca | North Cascades National Park | no_requirement_found | 2 | 2 | [Official source](https://www.nps.gov/noca/planyourvisit/basicinfo.htm) |
| npsa | National Park of American Samoa National Park | no_requirement_found | 1 | 1 | [Official source](https://www.nps.gov/npsa/planyourvisit/basicinfo.htm) |
| olym | Olympic National Park | no_requirement_found | 1 | 1 | [Official source](https://www.nps.gov/olym/planyourvisit/basicinfo.htm) |
| pefo | Petrified Forest National Park | no_requirement_found | 2 | 2 | [Official source](https://www.nps.gov/pefo/planyourvisit/basicinfo.htm) |
| pinn | Pinnacles National Park | no_requirement_found | 0 | 0 | [Official source](https://www.nps.gov/pinn/planyourvisit/basicinfo.htm) |
| redw | Redwood National Park | no_requirement_found | 3 | 3 | [Official source](https://www.nps.gov/redw/planyourvisit/basicinfo.htm) |
| romo | Rocky Mountain National Park | seasonal_requirement (2026) | 3 | 3 | [Official source](https://www.nps.gov/romo/planyourvisit/timed-entry-permit-system.htm) |
| sagu | Saguaro National Park | no_requirement_found | 1 | 1 | [Official source](https://www.nps.gov/sagu/planyourvisit/basicinfo.htm) |
| sequ | Sequoia National Park | no_requirement_found | 2 | 2 | [Official source](https://www.nps.gov/seki/planyourvisit/basicinfo.htm) |
| shen | Shenandoah National Park | no_requirement_found | 2 | 2 | [Official source](https://www.nps.gov/shen/planyourvisit/basicinfo.htm) |
| thro | Theodore Roosevelt National Park | no_requirement_found | 1 | 1 | [Official source](https://www.nps.gov/thro/planyourvisit/basicinfo.htm) |
| viis | Virgin Islands National Park | no_requirement_found | 1 | 0 | [Official source](https://www.nps.gov/viis/planyourvisit/basicinfo.htm) |
| voya | Voyageurs National Park | no_requirement_found | 3 | 2 | [Official source](https://www.nps.gov/voya/planyourvisit/basicinfo.htm) |
| whsa | White Sands National Park | no_requirement_found | 2 | 2 | [Official source](https://www.nps.gov/whsa/planyourvisit/basicinfo.htm) |
| wica | Wind Cave National Park | no_requirement_found | 2 | 2 | [Official source](https://www.nps.gov/wica/planyourvisit/basicinfo.htm) |
| wrst | Wrangell–St. Elias National Park | no_requirement_found | 0 | 0 | [Official source](https://www.nps.gov/wrst/planyourvisit/basicinfo.htm) |
| yell | Yellowstone National Park | confirmed_not_required | 3 | 3 | [Official source](https://www.nps.gov/yell/planyourvisit/permitsandreservations.htm) |
| yose | Yosemite National Park | confirmed_not_required (2026) | 4 | 3 | [Official source](https://www.nps.gov/yose/planyourvisit/permitsandreservations.htm) |
| zion | Zion National Park | confirmed_not_required | 5 | 5 | [Official source](https://www.nps.gov/zion/planyourvisit/permitsandreservations.htm) |

Rule-level evidence, release rounds and full gaps are in the JSON. The source registry provides the exact checked URLs for each claim group. Counts do not imply complete verification.
