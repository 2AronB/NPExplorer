# Proposed seasonal/access consumer contract

Status: research proposal, checked 2026-10-28. This directory is separate from runtime defaults and the static-site build. Adoption requires a deliberate integration change. No optimizer, scoring, saved-plan, transport or UI behavior is changed by these files.

## Identity and provenance

`seasonal-access.json` has `schemaVersion`, `researchAsOf`, `inventoryBasis`, `numericPolicy`, `sources` and `parks`. Park keys are current runtime `siteID` values derived from `currentInventory(data/sites.json)` plus `REMOTE_PARKS`, filtered to `type === 'park'`. The inventory is an application scope, not a fresh legal designation audit. Other NPS units remain unresearched. Preserve runtime IDs such as `jeff`, `kica` and `sequ`; shared Sequoia/Kings Canyon sources use `seki` in source IDs only.

Every claim has a stable-within-this-release `id`, `scope`, `asset`, `transportModes`, `impact`, `temporal`, `confidence`, `evidenceStatus`, `sourceIDs`, `checkedDate`, `rationale`, `uncertainty`, `recheck` and `consumerDecisions`. Follow each source ID into the source registry for URL, title, issuing authority, evidence type and checked/publication dates. A checked date records reading the page; it does not certify that its status is still current. Source update dates may be missing or substantially older.

Do not derive identity or relationships by splitting claim IDs. Future revisions should preserve IDs for unchanged claims; material claim edits should receive a revision history before production adoption.

## Independent dimensions

| Field | Intended interpretation | Possible consumer decision |
|---|---|---|
| `accessRules` with park/full closure | Confirmed visitor closure within the stated scope | Candidate legal infeasibility, after scope/date/exception checks |
| Road/entrance/area rules | Named asset restriction, mode and route role | Gateway/through-route review and warnings |
| `experienceWindows` | Signature drive, ordinary hiking or optional winter mode | Experience-aware visit guidance |
| `climateNotes` | Recurring climate and hazards, never a forecast | Weather suitability explanation |
| `crowdEvidence` | Official measured visits or qualitative narrative | Separate crowd guidance; not access feasibility |
| `services` | Transport, camping, reservations and other material facilities | Booking, camper and transport review |
| `unknowns`, `reviewNotes` | Gaps, ambiguous scope or conflicting pages | Explicit uncertainty display and recheck queue |

Road claims also carry `role`, `affectedGateways`, `alternateAccess` and `essentialHighlightsReachable`. An empty gateway list means not researched, never every gateway. `some` highlights reachable does not promise all signature sights or that the user can complete an intended itinerary. A road rule with `open_window` describes its published open season; its complement is not automatically a verified whole-park closure. `open_baseline` never overrides a narrower rule or a contemporary legal order.

## Temporal discriminated union

All intervals have explicit `startInclusive`, `endInclusive` and `crossYear`. Annual endpoints are `MM-DD`; dated schedules use ISO `YYYY-MM-DD`. ISO weekdays are 1 Monday through 7 Sunday. Calendar rules use `{month, weekday, ordinal}` (e.g. fourth Thursday in November). Daylight/event boundaries may carry `boundaryTimes` and `precision`; date-only consumers must display these as partial-day limitations and cannot treat them as a whole-day closure.

| `temporal.type` | Consumer handling |
|---|---|
| `fixed_recurring_rule` | Recurring published baseline; apply its intervals/calendar rules only to its named scope and mode. Recheck before travel. |
| `typical_weather_dependent_range` | Approximate climate/operations guidance. Narrative endpoints such as late May remain narrative; empty intervals must not become exact dates. |
| `current_year_published_schedule` | Only the stated dated intervals/years, subject to qualifiers. Cross-year schedules retain both years. Never repeat in another year. |
| `temporary_alert` | Snapshot requiring recheck; nullable `validUntil` is a review horizon, never a promised reopening. Do not project into future years. |
| `unknown` | No machine-enforceable timing. No zero, no implicit infeasibility and no optimistic availability. |
| `historical_measurement` | Explicit completed observation years and count series; never an access interval. |

Within a cross-year annual interval, November 1–April 15 means November/December of one year and January–April of the next. Same-day start/end means that single day; it is not an empty or year-long interval. Campground checkout/service closing times remain in the text and must be respected when allocating an overnight. Dated road opening plans are not observations that a road opened.

This release's validator deliberately permits park/full closure only for confirmed recurring visitor closures. A future emergency whole-park closure would require a contract/validation extension supporting fresh, bounded temporary park orders. Do not cram it into a recurring field to bypass validation.

## Numeric proposals

All numeric 0–10 monthly vectors are **modeled judgments, not official NPS ratings**. Highlights and hiking: 10 means most suitable for the stated conventional family experience. Crowd pressure: 10 means busiest relative to that park's own seasonal peak, not equally congested across parks. Null means insufficient evidence. Unknown values must not be coerced to zero.

Highlights/hiking vectors are proposed only for the two pilots. Each month includes rationale, confidence and underlying claim IDs. These are coarse ordinal judgments, not probabilities, safety certifications, forecasts or verified scores. Winter recreation requires an explicit experience mode; it must not automatically satisfy a summer highlights objective.

Where measured monthly counts are available, crowd vectors use the mean reported monthly recreation visits for complete 2023–2025 years, divided by that park's largest monthly mean, multiplied by 10, rounded to one decimal. The mapping is a model choice. Low reported counts, especially remote estimates, are not evidence of safety, access or booking availability. Retain counts and years alongside the vector; normalize neither hiking nor highlights from visitation. If a complete nonzero series is unavailable, leave the vector null. No forecast is generated from partial 2026 data.

## Adoption and precedence

1. Display facts, modeled guidance and saved user preferences with separate provenance. Preserve user season overrides until the user explicitly chooses new defaults.
2. Add an optional provider interface such as `getSeasonalEvidence(siteID, visitDates, mode, travelYear)` returning `{accessWarnings, experienceGuidance, climateGuidance, crowdGuidance, serviceWarnings, uncertainty, provenance}`. Return unknown for absent fields. This is a proposed interface, not an implemented evaluator.
3. Review each stop against actual visit dates and experience mode. Route feasibility requires gateway/road topology, vehicle dimensions and alternatives; a park-center-only optimizer cannot safely enforce these road rules yet.
4. Only a confirmed park-scope visitor closure can support whole-stop infeasibility. RMNP's Trail Ridge restriction and Yellowstone's ordinary-car interior restriction must never populate the legacy whole-stop `closure` interval.
5. Do not silently replace `monthlyQuality`, `season-quality.mjs`, remote transport windows or existing scores. Keep highlights/hiking/crowds separate until an explicit aggregation decision. Crowds do not reverse access restrictions.
6. Integration must address multiple intervals, scoped modes, cross-year dates, partial days, current-year schedules, stale alerts and unknowns. The legacy single annual interval is insufficient; a consumer must reject unsupported enforcement rather than discard qualifiers.
7. A static snapshot can ship with the app without keys/accounts/live required APIs. Live rechecks remain a trip-planning task. This research directory is intentionally absent from the build allowlist.

## Proposed acceptance checks for the integrating chat

- January RMNP: park baseline open; Bear Lake distinct; no Trail Ridge east–west through route; ordinary high-country hiking reduced.
- January Yellowstone: North–Northeast ordinary-car corridor distinct from Old Faithful; eastward Cooke City connection restricted; winter tours require separate mode/service confirmation.
- January Isle Royale: island visitor closure; mainland headquarters must not satisfy park visit.
- April 20 Isle Royale: legal season alone does not establish public transport service.
- A 2040 plan: no 2026 repair schedule, 2027 bus plan or stale flood alert repeated as an annual fact.
- A camper at Crater Lake / Great Basin / Black Canyon: road restrictions and facility opening are separate checks.
- A remote air taxi with no verified schedule: unknown availability; neither guaranteed trip nor whole-park closure.
- Saved personal season overrides retain precedence after evidence-provider adoption.

These are integration scenarios, not assertions that the current app implements this contract.
