# Seasonal and access evidence report

Research checked: 2026-10-28. Branch: `seasonal-data`. Base: `7bc96163d2a5757897857b5afa2981c2009f3a25`. Scope: all 64 application runtime national parks.

This is a baseline evidence release with explicit gaps, suitable for review and staged integration. It is not a fully verified itinerary or a live access feed. All 64 parks have climate notes and measured monthly visitation. Independent experience windows, legal baselines and service details are uneven; empty fields remain unknown. No runtime scores, optimizer algorithms, user preferences or deployment configuration are changed.

## Coverage and validation

- 346 linked claims: 264 primary-page factual paraphrases, 17 official qualitative visitation descriptions, 64 measured visitation series and 1 explicitly inferred service interval.
- 219 cited primary sources, all NPS planning/climate/visitor guide or NPS Visitor Use Statistics. Each claim retains checked date, confidence, uncertainty, source IDs and recheck guidance.
- 192 complete park-year monthly visitation series (2023–2025); all 12-month sums match reported annual totals. Partial 2026 observations excluded.
- Highlights/hiking monthly proposals: 2 parks each. Crowd proxy: 64 parks. 816 proposed monthly numeric values, all labeled modeled judgments, never official NPS ratings.
- 222 explicit gap/recheck entries, including a live-alert/capacity recheck for every park. This count is a list of limitations, not an estimate of closed parks.
- Data validator and eight negative checks pass. Existing app suite: 65/65 pass. Static build: 28 runtime files; research data/reports are excluded. Browser interaction was not tested because no runtime behavior changed.

| Dimension | Parks with at least one claim | Meaning of missing coverage |
|---|---:|---|
| accessRules | 62/64 | Explicit unknown; no inference of open/closed/suitable |
| experienceWindows | 28/64 | Explicit unknown; no inference of open/closed/suitable |
| climateNotes | 64/64 | Explicit unknown; no inference of open/closed/suitable |
| crowdEvidence | 64/64 | Explicit unknown; no inference of open/closed/suitable |
| services | 52/64 | Explicit unknown; no inference of open/closed/suitable |

| Temporal category | Claims |
|---|---:|
| unknown | 9 |
| typical_weather_dependent_range | 178 |
| historical_measurement | 64 |
| current_year_published_schedule | 7 |
| fixed_recurring_rule | 81 |
| temporary_alert | 7 |

## Method and interpretation

Inventory was derived from current-inventory.mjs and remote-parks.mjs over the retained data/sites.json at the base commit, not the historical 63-park list. Runtime names/IDs were retained, including Chiricahua and the separate Sequoia/Kings Canyon records. Other NPS unit types are unresearched.

The pilots were authored first with legal baseline, named road topology, ordinary highlights, high-country hiking, optional winter experience, weather, crowds and services separated. The validator passes on the pilot subset and on all runtime records. The full release adds mountain/seasonal restrictions, Alaska/island transfers and baseline climate/operating evidence. NPS pages were fetched and their substantive text read, not merely search snippets. Forecast-widget text was not used as climate evidence. The final dated “Last updated” statement was retained where available; blank widget timestamps were ignored.

A “verified” evidence status means the paraphrase is supported by the cited primary page as read. It does not certify the completeness or continuing accuracy of that page. Subject locators in sourceSections aid reading but are not necessarily literal HTML headings. Page-specific dates remain in the source registry. An old page is not refreshed merely by checking it today.

Typical windows remain approximate narrative ranges when NPS says “late”, “mid”, “usually” or “weather permitting”. No artificial exact MM-DD boundary was substituted. Fixed rules retain calendar rules and inclusive dates. Current-year schedules carry actual years. Temporary alerts have mandatory recheck and nullable review expiry; expiry does not imply reopening. The Voyageurs seasonal-center closed interval is explicitly inferred between stated final-open/reopen dates.

Every numeric value is a modeled judgment. Pilot highlights/hiking values are coarse ordinal interpretations of cited road and snow facts. They have no statistical calibration. Crowd vectors normalize the mean of 2023–2025 monthly recreation visits to each park’s own largest monthly mean; they are seasonal demand proxies rather than measured crowd density. They cannot be compared as absolute congestion across parks. Remote estimates, cruise visits, counting-method changes and unusual closures can distort the pattern. Measurement-method continuity was not audited.

## Pilot findings and boundary examples

- Rocky Mountain: year-round park baseline and Bear Lake access coexist with Trail Ridge’s typical mid-October–late-May through restriction. Estes Park and Grand Lake must not be connected across that pass simply because the park is open. Subalpine snow and ordinary hiking are separate. Shuttle service and Hiker Shuttle reservations have year-specific records.
- Yellowstone: Gardiner–Cooke City corridor differs from interior regular-vehicle roads, Old Faithful winter tours and the external winter gap east of Cooke City. Interior roads/services have distinct seasons. Published 2026 and 2026–27 dates are not recurring rules.
- Isle Royale: confirmed November 1–April 15 island visitor closure, with mainland Houghton headquarters distinguished. Legal opening April 16 does not promise public ferry/seaplane service, generally described as mid-May–September.
- Gates of the Arctic/Kobuk/Lake Clark and island parks: transport modes and unverified operator windows are explicit. Absence of a booked flight, boat or ferry is not a legal whole-park closure.

## Conflicts, stale material and unresolved work

- RMNP hours page retains 2025 timed-entry dates; these were not adopted as 2026 reservations. Current-year reservation research beyond the Hiker Shuttle is incomplete.
- Yellowstone seasons overview is more general than facility operating tables. No claim that every campground opens by June was adopted. North–Northeast access does not establish an eastward winter exit from Cooke City.
- Mount Rainier: general Carbon River access language differs from newer SR 165 bridge closure. The current specific road notice is retained separately; no recurring closure is manufactured.
- North Cascades: road page has month/day-only landslide/flood notices without a reliable year. They are quarantined in reviewNotes; typical Stehekin shuttle timing is not confirmation that service currently runs.
- Grand Canyon: North Rim recovery/scenic-road work and flood closures are temporary/year-bound. The North Rim and hiking notices disagree on some South Kaibab/River Trail segments. Disputed segments are not encoded as machine access rules; no assumed rim-to-rim availability.
- Gateway Arch: holiday closure language conflicts in scope with year-round grounds wording. No whole-park holiday infeasibility encoded.
- Everglades: visitor-service seasons use different transition months from meteorological seasons. Both meanings are preserved rather than forcing an exact annual boundary.
- Denali: current conditions explicitly supersedes general pages. Full-length 2027 bus service is a published plan, not current or perpetual service.
- American Samoa: direct directions/hours URLs returned 404. The linked official visitor-guide PDF supplies baseline access and inter-island context. Its publication year is unestablished; old carrier names/frequencies were not adopted as current schedules.
- No exhaustive alert feed, trail-by-trail audit, campground inventory, travel-year booking inventory, exact airline/ferry capacity, vehicle-specific route validation or current reservation-policy audit was completed. Many ordinary hiking windows remain unknown; climate notes alone do not guarantee trail availability. Explicit unknowns are listed per park below.

Initial research base was 385cc6b3357c46706a17274b92bb980fb803bf90. Main advanced during research; the branch was rebased to 7bc96163d2a5757897857b5afa2981c2009f3a25. Runtime inventory was unchanged, and validation, the 65-test suite and build passed again on the new base.

## Integration handoff

Use [INTEGRATION_CONTRACT.md](INTEGRATION_CONTRACT.md) for scope/date/mode handling, proposed provider output, precedence and consumer acceptance scenarios. Keep legacy runtime scores until the integrating chat deliberately adopts a compatible contract. Preserve saved user overrides. Road closures require gateway-aware route review; do not feed them into the current single whole-stop closure interval. No merge or deployment is authorized by this release.

Reproduce local checks from the repository root:

```text
node scripts/validate-seasonal-data.mjs --pilot --self-test
node scripts/validate-seasonal-data.mjs --self-test
node --test
node scripts/build-site.mjs
```

The validator checks runtime inventory IDs, claim/schema metadata, date bounds/inclusivity/cross-year behavior, source/claim links, measured totals and park IDs, monthly vector lengths/ranges/provenance/formula, duplicates, equivalent-calendar conflicts, full-closure scope and unknown handling. Eight deliberate invalid mutations must fail. It does not automatically establish source truth, discover differently worded conflicting pages, or prove future accessibility.

## Per-park evidence

Each row links directly to its supporting source. Detailed source metadata, structured intervals, gateway fields and monthly model rationales are in [seasonal-access.json](seasonal-access.json). Confidence applies to the cited claim, not to a prediction of travel success.

### acad: Acadia National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| acad-25 | accessRules / area | Asset operating seasons | Roads and campgrounds have different seasons; their dates do not establish whole-park closure. **unknown**: Whole-park baseline not established by asset table. high confidence; verified_primary_source. | [acad-hours](https://www.nps.gov/acad/planyourvisit/hours.htm) |
| acad-26 | accessRules / road | Park Loop Road and paved seasonal roads | Published hours table lists April 15–December 1; no annual guarantee or explicit year attached to this row. **typical_weather_dependent_range**: Table seasonal window April 15–December 1; verify travel year. high confidence; verified_primary_source. | [acad-hours](https://www.nps.gov/acad/planyourvisit/hours.htm) |
| acad-27 | climateNotes / climate | Climate and outdoor conditions | Spring fog and variable fall weather; winter cold. Mountain conditions differ from Bar Harbor. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [acad-weather](https://www.nps.gov/acad/planyourvisit/weather.htm) |
| acad-29 | crowdEvidence / visitation | Visitor seasonality | Fall foliage attracts visitors; peak color generally mid-October. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [acad-weather](https://www.nps.gov/acad/planyourvisit/weather.htm) |
| acad-283 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [acad-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=ACAD&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| acad-28 | services / service | Campgrounds | Published 2026 Blackwoods May 1–October 19 closing at 10 a.m.; no winter camper availability inferred. **current_year_published_schedule**: 2026 Blackwoods only; end date closes 10 a.m.; 2026-05-01 → 2026-10-19. high confidence; verified_primary_source. | [acad-hours](https://www.nps.gov/acad/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### arch: Arches National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| arch-30 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [arch-hours](https://www.nps.gov/arch/planyourvisit/hours.htm) |
| arch-217 | experienceWindows / experience | Strenuous hiking conditions | Summer heat makes strenuous exercise difficult; spring and fall have milder temperatures. **typical_weather_dependent_range**: Climate suitability, not trail availability. high confidence; verified_primary_source. | [arch-weather](https://www.nps.gov/arch/planyourvisit/weather.htm) |
| arch-31 | climateNotes / climate | Climate and outdoor conditions | Spring/fall milder; summer often over 100°F, late-summer flash floods, winter ice can impede trails. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [arch-weather](https://www.nps.gov/arch/planyourvisit/weather.htm) |
| arch-32 | crowdEvidence / visitation | Visitor seasonality | March–October busy. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [arch-hours](https://www.nps.gov/arch/planyourvisit/hours.htm) |
| arch-284 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [arch-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=ARCH&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| arch-225 | services / service | Internal transportation | No public transport inside park; vehicle scenic drive reaches many viewpoints/trailheads. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [arch-directions](https://www.nps.gov/arch/planyourvisit/directions.htm) |

Unknown/recheck items:

- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### badl: Badlands National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| badl-33 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [badl-hours](https://www.nps.gov/badl/planyourvisit/hours.htm) |
| badl-35 | accessRules / road | Park roads | Winter or extreme weather can close roads; no fixed annual closure established. **typical_weather_dependent_range**: Event-dependent; winter risk. high confidence; verified_primary_source. | [badl-hours](https://www.nps.gov/badl/planyourvisit/hours.htm) |
| badl-34 | climateNotes / climate | Climate and outdoor conditions | Hot, dry summers with violent thunderstorms; cold snowy winters. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [badl-weather](https://www.nps.gov/badl/planyourvisit/weather.htm) |
| badl-285 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [badl-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=BADL&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **services**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### bibe: Big Bend National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| bibe-36 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [bibe-hours](https://www.nps.gov/bibe/planyourvisit/hours.htm) |
| bibe-37 | climateNotes / climate | Climate and outdoor conditions | May–August extreme heat, July–September rain/flash floods; Chisos cooler than desert and river corridor. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [bibe-weather](https://www.nps.gov/bibe/planyourvisit/weather.htm) |
| bibe-38 | crowdEvidence / visitation | Visitor seasonality | November–April busy; spring busiest. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [bibe-hours](https://www.nps.gov/bibe/planyourvisit/hours.htm) |
| bibe-286 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [bibe-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=BIBE&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| bibe-39 | services / service | Camping | All park campgrounds require reservations; check current facility closures. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [bibe-hours](https://www.nps.gov/bibe/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### bisc: Biscayne National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| bisc-40 | accessRules / park | Park baseline access | Navigable waters open 24 hours; Convoy Point and island facilities have separate daily limits. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [bisc-hours](https://www.nps.gov/bisc/planyourvisit/hours.htm) |
| bisc-42 | accessRules / road | Elliott and Boca Chita Keys | Boat access required for these camping islands; mainland visitor access is different. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [bisc-hours](https://www.nps.gov/bisc/planyourvisit/hours.htm) |
| bisc-41 | climateNotes / climate | Climate and outdoor conditions | Dry mild winter; hot humid summer thunderstorms; hurricane season June–November. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [bisc-weather](https://www.nps.gov/bisc/planyourvisit/weather.htm) |
| bisc-287 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [bisc-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=BISC&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **services**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### blca: Black Canyon of the Gunnison National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| blca-43 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [blca-hours](https://www.nps.gov/blca/planyourvisit/hours.htm) |
| blca-45 | accessRules / road | South Rim Road beyond visitor center | Generally vehicle access late April–mid-November; winter road ends at Gunnison Point. **typical_weather_dependent_range**: late April–mid-November vehicle season. high confidence; verified_primary_source. | [blca-hours](https://www.nps.gov/blca/planyourvisit/hours.htm) |
| blca-46 | accessRules / road | North Rim Road | Winter vehicle closure generally mid-November–May. **typical_weather_dependent_range**: mid-November–May. high confidence; verified_primary_source. | [blca-hours](https://www.nps.gov/blca/planyourvisit/hours.htm) |
| blca-44 | climateNotes / climate | Climate and outdoor conditions | Rim versus canyon floor differ; snow common winter and shoulder seasons, summer storms. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [blca-weather](https://www.nps.gov/blca/planyourvisit/weather.htm) |
| blca-288 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [blca-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=BLCA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **services**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### brca: Bryce Canyon National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| brca-47 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [brca-hours](https://www.nps.gov/brca/planyourvisit/hours.htm) |
| brca-48 | climateNotes / climate | Climate and outdoor conditions | High-elevation snow through spring, summer July–August lightning; freezing nights October–May. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [brca-weather](https://www.nps.gov/brca/planyourvisit/weather.htm) |
| brca-49 | crowdEvidence / visitation | Visitor seasonality | May–September most popular. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [brca-hours](https://www.nps.gov/brca/planyourvisit/hours.htm) |
| brca-289 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [brca-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=BRCA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| brca-50 | services / service | Camper services | North Campground year-round; RV dump typically May–September, Sunset seasonal. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [brca-hours](https://www.nps.gov/brca/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### cany: Canyonlands National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| cany-51 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [cany-hours](https://www.nps.gov/cany/planyourvisit/hours.htm) |
| cany-226 | accessRules / road | District access network | Districts have no connecting roads/bridges within park; Maze access unpaved and may become impassable wet. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [cany-directions](https://www.nps.gov/cany/planyourvisit/directions.htm) |
| cany-218 | experienceWindows / experience | Strenuous hiking conditions | Summer heat impairs strenuous exercise, winter ice may impede trails; spring/fall milder. **typical_weather_dependent_range**: Climate suitability, not route availability. high confidence; verified_primary_source. | [cany-weather](https://www.nps.gov/cany/planyourvisit/weather.htm) |
| cany-52 | climateNotes / climate | Climate and outdoor conditions | April–May and mid-September–October milder/popular; summer heat, monsoon flash floods and winter trail ice. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [cany-weather](https://www.nps.gov/cany/planyourvisit/weather.htm) |
| cany-290 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [cany-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CANY&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| cany-53 | services / service | District facilities | Separate district visitor centers; some facilities close in winter. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [cany-hours](https://www.nps.gov/cany/planyourvisit/hours.htm) |

Unknown/recheck items:

- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### care: Capitol Reef National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| care-54 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [care-hours](https://www.nps.gov/care/planyourvisit/hours.htm) |
| care-55 | climateNotes / climate | Climate and outdoor conditions | July–September monsoon downpours can produce canyon flash floods; conditions vary along the Waterpocket Fold. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [care-weather](https://www.nps.gov/care/planyourvisit/weather.htm) |
| care-291 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [care-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CARE&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| care-56 | services / service | Camping | Park campgrounds described as year-round; roads may close for weather. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [care-hours](https://www.nps.gov/care/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### cave: Carlsbad Caverns National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| cave-57 | accessRules / park | Holiday whole-park closure | NPS explicitly includes cavern, visitor center, roads and trails on Thanksgiving, Christmas and New Year closures. **fixed_recurring_rule**: Thanksgiving (fourth Thursday November), December 25, January 1; 12-25 → 12-25; 01-01 → 01-01. high confidence; verified_primary_source. | [cave-hours](https://www.nps.gov/cave/planyourvisit/hours.htm) |
| cave-58 | climateNotes / climate | Climate and outdoor conditions | Hot summer surface, windy spring, late-summer rain and occasional winter ice. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [cave-weather](https://www.nps.gov/cave/planyourvisit/weather.htm) |
| cave-292 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [cave-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CAVE&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| cave-59 | services / service | Cavern entry | Timed entry ticket required; cavern entry has daily cutoff distinct from park season. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [cave-hours](https://www.nps.gov/cave/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### chis: Channel Islands National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| chis-60 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [chis-hours](https://www.nps.gov/chis/planyourvisit/hours.htm) |
| chis-62 | accessRules / road | Island landing access | Concessionaire boats operate year-round; no island ground transportation, visitors walk or boat. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [chis-transport](https://www.nps.gov/chis/planyourvisit/directions.htm) |
| chis-61 | climateNotes / climate | Climate and outdoor conditions | Rough seas and high winds possible all year; late-summer into fall often calmer; winter storms December–March. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [chis-weather](https://www.nps.gov/chis/planyourvisit/weather.htm) |
| chis-293 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [chis-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CHIS&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| chis-63 | services / service | Island Packers sailings | Year-round service does not mean every island or daily sailing; exact route/year schedules unverified. **unknown**: Route-specific schedule not established. high confidence; verified_primary_source. | [chis-transport](https://www.nps.gov/chis/planyourvisit/directions.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### chir: Chiricahua National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| chir-64 | accessRules / area | Bonita Canyon Drive and trail highlights | Hours page identifies scenic drive and hiking; it does not establish a legal annual closure interval. **unknown**: Baseline legal hours not established from hours page. high confidence; verified_primary_source. | [chir-hours](https://www.nps.gov/chir/planyourvisit/hours.htm) |
| chir-65 | climateNotes / climate | Climate and outdoor conditions | Higher elevations cooler/windier; summer highs 80s/90s, winter nights near/below freezing. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [chir-weather](https://www.nps.gov/chir/planyourvisit/weather.htm) |
| chir-294 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [chir-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CHIR&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **services**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### cong: Congaree National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| cong-280 | accessRules / park | Park baseline access | NPS describes park as accessible in all seasons; flooding can restrict actual hiking/paddling. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [cong-climate2](https://home.nps.gov/cong/planyourvisit/weather.htm) |
| cong-66 | experienceWindows / experience | Forest hiking and paddling | Spring/fall more comfortable; summer heat/insects and winter flooding change the experience. **typical_weather_dependent_range**: Spring/fall preferred conditions. high confidence; verified_primary_source. | [cong-climate2](https://home.nps.gov/cong/planyourvisit/weather.htm) |
| cong-67 | climateNotes / climate | Climate and outdoor conditions | Mild winters, hot wet summers; flooding most frequent winter and can arise without local rain. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [cong-climate2](https://home.nps.gov/cong/planyourvisit/weather.htm) |
| cong-295 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [cong-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CONG&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |

Unknown/recheck items:

- **services**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### crla: Crater Lake National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| crla-68 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [crla-hours](https://www.nps.gov/crla/planyourvisit/hours.htm) |
| crla-70 | accessRules / road | Rim Drive and North Entrance Road | Close at first large snowstorm or November 1; reopening has no fixed date, commonly all roads ready by mid-July. **typical_weather_dependent_range**: autumn snowfall–summer plowing; road-specific variability. high confidence; verified_primary_source. | [crla-hours](https://www.nps.gov/crla/planyourvisit/hours.htm) |
| crla-210 | experienceWindows / experience | Rim-loop highlights | July–mid-September summer operations differ from winter snow recreation; transition months unpredictable. **typical_weather_dependent_range**: July–mid-September general summer season. high confidence; verified_primary_source. | [crla-hours](https://www.nps.gov/crla/planyourvisit/hours.htm) |
| crla-69 | climateNotes / climate | Climate and outdoor conditions | Deep snow restricts roads and facilities; May/June/October operations unpredictable. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [crla-hours](https://www.nps.gov/crla/planyourvisit/hours.htm) |
| crla-296 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [crla-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CRLA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| crla-71 | services / service | Camping and boat tours | Snowmelt affects campground and boat tour availability; no guaranteed annual dates. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [crla-hours](https://www.nps.gov/crla/planyourvisit/hours.htm) |

Unknown/recheck items:

- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### cuva: Cuyahoga Valley National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| cuva-72 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [cuva-hours](https://www.nps.gov/cuva/planyourvisit/hours.htm) |
| cuva-74 | accessRules / road | Falls and selected day-use areas | Brandywine Falls and other listed sites close dusk to morning; not whole-park closure. **fixed_recurring_rule**: Recurring daily dusk closure; no seasonal infeasibility; 01-01 → 12-31. high confidence; verified_primary_source. | [cuva-hours](https://www.nps.gov/cuva/planyourvisit/hours.htm) |
| cuva-73 | climateNotes / climate | Climate and outdoor conditions | Humid summer, fall foliage often mid-October, lake-effect winter snow. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [cuva-weather](https://www.nps.gov/cuva/planyourvisit/weather.htm) |
| cuva-297 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [cuva-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CUVA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **services**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### deva: Death Valley National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| deva-75 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [deva-hours](https://www.nps.gov/deva/planyourvisit/hours.htm) |
| deva-221 | experienceWindows / experience | Low-elevation hiking conditions | Summer heat is extreme, while low-elevation winter/spring temperatures are milder; higher terrain differs. **typical_weather_dependent_range**: Climate suitability only; road/area status separate. high confidence; verified_primary_source. | [deva-weather](https://www.nps.gov/deva/planyourvisit/weather.htm) |
| deva-76 | climateNotes / climate | Climate and outdoor conditions | Summer often exceeds 120°F; winter/spring lower elevations milder; thunderstorms can cause flash floods. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [deva-weather](https://www.nps.gov/deva/planyourvisit/weather.htm) |
| deva-298 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [deva-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=DEVA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |

Unknown/recheck items:

- **services**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### drto: Dry Tortugas National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| drto-77 | accessRules / park | Park baseline access | Garden Key year-round; Fort Jefferson sunrise–sunset. Other islands have separate closures. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [drto-hours](https://www.nps.gov/drto/planyourvisit/hours.htm) |
| drto-79 | accessRules / road | Key West–Garden Key transfer | Only boat or seaplane access; no roads to the park. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [drto-transport](https://www.nps.gov/drto/planyourvisit/directions.htm) |
| drto-80 | accessRules / area | Bush Key nesting closure | Usually accessible mid-October–mid-January; nesting season closure affects Bush Key only. **typical_weather_dependent_range**: mid-October–mid-January usual open season. high confidence; verified_primary_source. | [drto-hours](https://www.nps.gov/drto/planyourvisit/hours.htm) |
| drto-78 | climateNotes / climate | Climate and outdoor conditions | Wet summer thunderstorm risk; drier winter often has windier, rougher seas. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [drto-climate](https://www.nps.gov/drto/learn/nature/weather.htm) |
| drto-299 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [drto-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=DRTO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| drto-81 | services / service | Ferry / seaplane bookings | NPS lists ferry, seaplane and charters; precise operator season, capacity and cancellation rules not verified. **unknown**: Operator schedules require booking-year verification. high confidence; verified_primary_source. | [drto-transport](https://www.nps.gov/drto/planyourvisit/directions.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### ever: Everglades National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| ever-82 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [ever-hours](https://www.nps.gov/ever/planyourvisit/hours.htm) |
| ever-85 | accessRules / road | Park entrance network | Homestead, Shark Valley and Gulf Coast entrances do not interconnect. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [ever-hours](https://www.nps.gov/ever/planyourvisit/hours.htm) |
| ever-84 | experienceWindows / experience | Wildlife and ranger programs | November–March dry visitor season offers more programs; seasonal labels differ on weather page. **typical_weather_dependent_range**: Visitor services November–March; meteorological transition varies. high confidence; verified_primary_source. | [ever-hours](https://www.nps.gov/ever/planyourvisit/hours.htm) |
| ever-83 | climateNotes / climate | Climate and outdoor conditions | Hot humid wet summer with thunderstorms; mild dry winter, hurricanes June–November. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [ever-weather](https://www.nps.gov/ever/planyourvisit/weather.htm) |
| ever-300 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [ever-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=EVER&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |

Review: Hours uses April–October wet / November–March dry visitor seasons; weather describes mid-May–November wet season. Different definitions retained, not exact boundary conflict resolution.

Unknown/recheck items:

- **services**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### jeff: Gateway Arch National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| jeff-86 | accessRules / park | Park baseline access | Grounds daily 5 a.m.–11 p.m.; indoor facilities have separate hours and holiday closures. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [jeff-hours](https://www.nps.gov/jeff/planyourvisit/hours.htm) |
| jeff-87 | climateNotes / climate | Climate and outdoor conditions | Summer outdoor heat/humidity; indoor visitor center offers shelter. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [jeff-weather](https://www.nps.gov/jeff/planyourvisit/weather.htm) |
| jeff-88 | crowdEvidence / visitation | Visitor seasonality | June/July high season; school groups in May and fall; January/February quieter. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [jeff-weather](https://www.nps.gov/jeff/planyourvisit/weather.htm) |
| jeff-301 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [jeff-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=JEFF&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| jeff-89 | services / service | Tram and holiday access | Advance tram reservations recommended; page says park closed Thanksgiving, Christmas and New Year while also describing year-round grounds. Scope needs clarification. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [jeff-hours](https://www.nps.gov/jeff/planyourvisit/hours.htm) |

Review: Holiday statement and year-round grounds wording conflict in scope. No whole-park holiday infeasibility encoded until clarified.

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### glac: Glacier National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| glac-90 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [glac-hours](https://www.nps.gov/glac/planyourvisit/hours.htm) |
| glac-92 | accessRules / road | Going-to-the-Sun Road alpine crossing | No set Logan Pass opening; typically fully open by early July until third Monday October, weather permitting. **typical_weather_dependent_range**: early July–third Monday October typical full crossing. high confidence; verified_primary_source. | [glac-roads](https://www.nps.gov/glac/planyourvisit/gtsrinfo.htm) |
| glac-227 | accessRules / road | Going-to-the-Sun Road vehicle-size restriction | Vehicles/combinations over 21 feet long or 8 feet wide prohibited between Avalanche Creek and Rising Sun. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [glac-roads](https://www.nps.gov/glac/planyourvisit/gtsrinfo.htm) |
| glac-93 | experienceWindows / experience | High-country hiking | Higher trails may remain dangerous and snow-covered until late June. **typical_weather_dependent_range**: Snowmelt-dependent late June onward. high confidence; verified_primary_source. | [glac-hours](https://www.nps.gov/glac/planyourvisit/hours.htm) |
| glac-91 | climateNotes / climate | Climate and outdoor conditions | East/west climates differ; snow any time at elevation, autumn snow can begin September. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [glac-weather](https://www.nps.gov/glac/planyourvisit/weather.htm) |
| glac-95 | crowdEvidence / visitation | Visitor seasonality | Fall generally less crowded; September trails still busy. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [glac-hours](https://www.nps.gov/glac/planyourvisit/hours.htm) |
| glac-302 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [glac-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GLAC&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| glac-94 | services / service | Campgrounds/lodging | Most services late May–September; primitive Apgar/St. Mary camping described year-round. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [glac-hours](https://www.nps.gov/glac/planyourvisit/hours.htm) |

Unknown/recheck items:

- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### grca: Grand Canyon National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| grca-96 | accessRules / area | South Rim baseline | South Rim year-round, with most services; North Rim status separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [grca-hours](https://www.nps.gov/grca/planyourvisit/hours.htm) |
| grca-98 | accessRules / area | North Kaibab / Phantom Ranch / river bridges | Current hiking page lists flood closures with no estimated reopening; cannot assume rim-to-rim hike is available. **temporary_alert**: Flood closure snapshot; no estimated end. high confidence; verified_primary_source. | [grca-hiking](https://www.nps.gov/grca/planyourvisit/key-messages.htm) |
| grca-99 | accessRules / road | Cape Royal / Point Imperial roads | Repair closure sunset October 15–sunrise November 3, 2026. **current_year_published_schedule**: 2026 repair closure; local sunset/sunrise endpoints; 2026-10-15 → 2026-11-03. high confidence; verified_primary_source. | [grca-north](https://www.nps.gov/grca/northrimstatus.htm) |
| grca-97 | climateNotes / climate | Climate and outdoor conditions | Summer inner canyon far hotter than rims; winter rim snow/ice, summer monsoon lightning and flash floods. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [grca-climate](https://www.nps.gov/grca/learn/nature/weather.htm) |
| grca-303 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [grca-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GRCA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| grca-100 | services / service | North Rim campground / fuel | Campground and general store closed for 2026 season October 15; fuel closed, campsite tentative May 15, 2027 reopening. **temporary_alert**: 2026–27 service snapshot; reopening tentative. high confidence; verified_primary_source. | [grca-north](https://www.nps.gov/grca/northrimstatus.htm) |

Review: North Rim page and key hiking page disagree on some South Kaibab/River Trail segment status; exclude those disputed segments from machine rules. Key hiking page updated October 27, 2026. No current whole-park closure inferred.

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### grte: Grand Teton National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| grte-101 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [grte-hours](https://www.nps.gov/grte/planyourvisit/hours.htm) |
| grte-103 | accessRules / road | Teton Park Road: Taggart Lake–Signal Mountain | Ordinary vehicle closure November 1–April 30; winter recreation conditions separate. **fixed_recurring_rule**: Recurring scheduled ordinary-vehicle closure; 11-01 → 04-30. high confidence; verified_primary_source. | [grte-roads](https://www.nps.gov/grte/planyourvisit/roads.htm) |
| grte-104 | accessRules / road | Moose-Wilson Road: Death Canyon–Granite Canyon | Closed/unplowed November 1 until mid-May depending on conditions. **typical_weather_dependent_range**: November 1–mid-May weather-dependent. high confidence; verified_primary_source. | [grte-roads](https://www.nps.gov/grte/planyourvisit/roads.htm) |
| grte-209 | experienceWindows / experience | Ordinary highlights | Most roads/facilities available during summer; November–April some roads and all campgrounds closed. **typical_weather_dependent_range**: Summer broader highlights; winter partial access. high confidence; verified_primary_source. | [grte-hours](https://www.nps.gov/grte/planyourvisit/hours.htm) |
| grte-102 | climateNotes / climate | Climate and outdoor conditions | Snowy winter and warm summer; significant weather in either season. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [grte-weather](https://www.nps.gov/grte/planyourvisit/weather.htm) |
| grte-106 | crowdEvidence / visitation | Visitor seasonality | May–September most popular. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [grte-hours](https://www.nps.gov/grte/planyourvisit/hours.htm) |
| grte-304 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [grte-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GRTE&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| grte-105 | services / service | Campgrounds | All campgrounds closed in November–April; do not infer no park access. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [grte-hours](https://www.nps.gov/grte/planyourvisit/hours.htm) |

Unknown/recheck items:

- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### grba: Great Basin National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| grba-107 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [grba-hours](https://www.nps.gov/grba/planyourvisit/hours.htm) |
| grba-109 | accessRules / road | Wheeler Peak Scenic Drive | Winter/snow closure; most roads generally Memorial Day–late October. **typical_weather_dependent_range**: Memorial Day–late October road season; variable. high confidence; verified_primary_source. | [grba-conditions](https://www.nps.gov/grba/planyourvisit/conditions.htm) |
| grba-211 | experienceWindows / experience | High-country hiking conditions | Valley heat in late spring/early summer does not mean high-elevation snow has melted. **typical_weather_dependent_range**: Snowmelt-dependent; valley and high country differ. high confidence; verified_primary_source. | [grba-weather](https://www.nps.gov/grba/planyourvisit/weather.htm) |
| grba-108 | climateNotes / climate | Climate and outdoor conditions | Hot valley can coexist with high-country snow into early summer; summer thunderstorms. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [grba-weather](https://www.nps.gov/grba/planyourvisit/weather.htm) |
| grba-305 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [grba-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GRBA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| grba-110 | services / service | Camping and caves | Lower Lehman Creek only year-round campground; cave ticket needed, winter holiday exceptions. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [grba-conditions](https://www.nps.gov/grba/planyourvisit/conditions.htm) |

Unknown/recheck items:

- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### grsa: Great Sand Dunes National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| grsa-111 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [grsa-hours](https://www.nps.gov/grsa/planyourvisit/hours.htm) |
| grsa-114 | accessRules / road | Medano Pass Primitive Road | High-clearance 4WD road, usually late spring–fall conditions permitting. **typical_weather_dependent_range**: late spring–fall. high confidence; verified_primary_source. | [grsa-hours](https://www.nps.gov/grsa/planyourvisit/hours.htm) |
| grsa-112 | climateNotes / climate | Climate and outdoor conditions | Spring wind/snow, summer hot sand and July/August storms, cold winter nights. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [grsa-weather](https://www.nps.gov/grsa/planyourvisit/weather.htm) |
| grsa-306 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [grsa-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GRSA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| grsa-113 | services / service | Piñon Flats camper access | Campground April–October; no car camping in park/preserve November–March. **fixed_recurring_rule**: Recurring campground open season; 04-01 → 10-31. high confidence; verified_primary_source. | [grsa-hours](https://www.nps.gov/grsa/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### grsm: Great Smoky Mountains National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| grsm-115 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [grsm-hours](https://www.nps.gov/grsm/planyourvisit/hours.htm) |
| grsm-116 | climateNotes / climate | Climate and outdoor conditions | Low summer areas hot/humid; high country cooler; winter snow and shoulder-season variability. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [grsm-weather](https://www.nps.gov/grsm/planyourvisit/weather.htm) |
| grsm-307 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [grsm-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GRSM&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| grsm-117 | services / service | Secondary roads/camping | Seasonal roads, campsites and visitor facilities have individual schedules. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [grsm-hours](https://www.nps.gov/grsm/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### gumo: Guadalupe Mountains National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| gumo-118 | accessRules / park | Park baseline access | Most trails and both campgrounds available anytime; some locations day-use only. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [gumo-hours](https://www.nps.gov/gumo/planyourvisit/hours.htm) |
| gumo-119 | climateNotes / climate | Climate and outdoor conditions | High winds, winter snow/freezing fog, and elevation differences require separate hike assessment. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [gumo-weather](https://www.nps.gov/gumo/planyourvisit/weather.htm) |
| gumo-308 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [gumo-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GUMO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| gumo-224 | services / service | Camper and transport services | Campgrounds are primitive dry camping for tents/RVs; no park fuel, grocery, restaurant or shuttle. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [gumo-directions](https://www.nps.gov/gumo/planyourvisit/directions.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### hosp: Hot Springs National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| hosp-120 | climateNotes / climate | Climate and outdoor conditions | Hot humid summer, wetter spring/fall, winter ice possible; severe weather can occur any season. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [hosp-weather](https://www.nps.gov/hosp/planyourvisit/weather.htm) |
| hosp-309 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [hosp-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=HOSP&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| hosp-121 | services / service | Bathhouses and tower | Private/non-profit operators set bathhouse hours; tower hours vary seasonally. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [hosp-hours](https://www.nps.gov/hosp/planyourvisit/hours.htm) |

Unknown/recheck items:

- **accessRules**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### indu: Indiana Dunes National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| indu-281 | accessRules / area | Public use areas and beach hours | Most public use areas daily 6 a.m.–11 p.m.; individual beach/gate exceptions apply. **fixed_recurring_rule**: Recurring daily limits; exceptions by area; 01-01 → 12-31. high confidence; verified_primary_source. | [indu-hours](https://www.nps.gov/indu/planyourvisit/hours.htm) |
| indu-122 | climateNotes / climate | Climate and outdoor conditions | Lake Michigan affects conditions; warm humid summers, cold winters, rip currents and shelf ice hazards. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [indu-climate2](https://home.nps.gov/indu/planyourvisit/weather.htm) |
| indu-310 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [indu-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=INDU&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| indu-123 | services / service | Dunewood Campground | Published April 1–November 1 season; verify date/time of final overnight. **typical_weather_dependent_range**: April 1–November 1 published season. high confidence; verified_primary_source. | [indu-hours](https://www.nps.gov/indu/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### isro: Isle Royale National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| isro-124 | accessRules / park | Island and surrounding closure area | Island closed November 1–April 15, extending 4.5 miles into Lake Superior; mainland headquarters separate. **fixed_recurring_rule**: Recurring island visitor closure; 11-01 → 04-15. high confidence; verified_primary_source. | [isro-hours](https://www.nps.gov/isro/planyourvisit/hours.htm) |
| isro-126 | experienceWindows / experience | Island exploration | Legal open interval April 16–October 31 does not assure scheduled transport. **typical_weather_dependent_range**: [object Object]. high confidence; verified_primary_source. | [isro-hours](https://www.nps.gov/isro/planyourvisit/hours.htm) |
| isro-222 | climateNotes / climate | Climate and outdoor conditions | Extreme winter weather is cited for the recurring island closure; safe boat/ice dates not established. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [isro-hours](https://www.nps.gov/isro/planyourvisit/hours.htm) |
| isro-311 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [isro-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=ISRO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| isro-125 | services / service | Ferries and seaplane | Public transport generally mid-May–September, narrower than legal season; vehicles stay mainland. **typical_weather_dependent_range**: mid-May–September public transport; exact operator dates unknown. high confidence; verified_primary_source. | [isro-transport](https://www.nps.gov/isro/planyourvisit/directions.htm) |

Unknown/recheck items:

- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### jotr: Joshua Tree National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| jotr-278 | accessRules / park | Park baseline access | Park open 24/7 year-round; hot conditions do not constitute a legal annual closure. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [jotr-basic6](https://www.nps.gov/jotr/planyourvisit/basicinfo.htm) |
| jotr-219 | experienceWindows / experience | Outdoor highlights conditions | Spring/fall moderate temperatures differ from hot summer and freezing winter nights. **typical_weather_dependent_range**: Climate suitability; current roads/trails need recheck. high confidence; verified_primary_source. | [jotr-hours](https://www.nps.gov/jotr/planyourvisit/hours.htm) |
| jotr-127 | climateNotes / climate | Climate and outdoor conditions | Spring/fall more comfortable, winter freezing nights, summer over 100°F. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [jotr-hours](https://www.nps.gov/jotr/planyourvisit/hours.htm) |
| jotr-312 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [jotr-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=JOTR&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| jotr-279 | services / service | Internal supplies | No park gas, restaurants, groceries or hotels; bring water and supplies. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [jotr-basic6](https://www.nps.gov/jotr/planyourvisit/basicinfo.htm) |

Unknown/recheck items:

- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### kica: Kings Canyon National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| kica-128 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [kica-hours](https://www.nps.gov/seki/planyourvisit/hours.htm) |
| kica-138 | accessRules / road | Highway 180 into Cedar Grove | Typically closed early/mid-November until late April/early May. **typical_weather_dependent_range**: early/mid-November–late April/early May closure. high confidence; verified_primary_source. | [seki-roads](https://www.nps.gov/seki/planyourvisit/road-conditions.htm) |
| kica-130 | experienceWindows / experience | Elevation-dependent hiking | Spring/summer foothills heat differs from snow-retaining grove/high-country trails. **typical_weather_dependent_range**: Elevation-dependent; no park-wide hiking date. high confidence; verified_primary_source. | [kica-hours](https://www.nps.gov/seki/planyourvisit/hours.htm) |
| kica-129 | climateNotes / climate | Climate and outdoor conditions | Foothills and groves can differ by 20–30°F; snowy groves may coexist with foothill flowers. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [kica-weather](https://www.nps.gov/seki/planyourvisit/weather.htm) |
| kica-132 | crowdEvidence / visitation | Visitor seasonality | Summer is the main visitor season. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [kica-hours](https://www.nps.gov/seki/planyourvisit/hours.htm) |
| kica-313 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [kica-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=KICA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| kica-131 | services / service | Visitor/camper facilities | Year-round service areas include Grant Grove, Foothills, Giant Forest/Lodgepole; reductions in fall. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [kica-hours](https://www.nps.gov/seki/planyourvisit/hours.htm) |

Unknown/recheck items:

- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### lavo: Lassen Volcanic National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| lavo-140 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [lavo-hours](https://www.nps.gov/lavo/planyourvisit/hours.htm) |
| lavo-142 | accessRules / road | Lassen National Park Highway | Snow-season vehicle closure; skiing/snowshoeing distinct from summer through-drive. **typical_weather_dependent_range**: November–April snow accumulation; spring plowing determines reopening. high confidence; verified_primary_source. | [lavo-snow](https://www.nps.gov/lavo/planyourvisit/oversnow_route_conditions.htm) |
| lavo-143 | experienceWindows / experience | Bumpass Hell | Closed during snowy season due to hazards; hiking opening typically June or July. **typical_weather_dependent_range**: June/July snow-dependent opening. high confidence; verified_primary_source. | [lavo-snow](https://www.nps.gov/lavo/planyourvisit/oversnow_route_conditions.htm) |
| lavo-141 | climateNotes / climate | Climate and outdoor conditions | Winter conditions November–May, often through June high up; spring snow into June. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [lavo-weather](https://www.nps.gov/lavo/planyourvisit/weather.htm) |
| lavo-314 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [lavo-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=LAVO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| lavo-144 | services / service | Camping | Campgrounds have separate service/dry-camping seasons; Juniper Lake currently closed pending work. **temporary_alert**: Facility snapshot; exact reopening unknown. high confidence; verified_primary_source. | [lavo-hours](https://www.nps.gov/lavo/planyourvisit/hours.htm) |

Unknown/recheck items:

- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### maca: Mammoth Cave National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| maca-282 | accessRules / park | Park baseline access | NPS invites park visits in any season; cave tour availability is separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [maca-basic6](https://www.nps.gov/maca/planyourvisit/basicinfo.htm) |
| maca-146 | climateNotes / climate | Climate and outdoor conditions | Warm moist summer, winter snow/ice possible; deep cave stays about 54°F. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [maca-climate2](https://home.nps.gov/maca/planyourvisit/weather.htm) |
| maca-315 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [maca-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=MACA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| maca-145 | services / service | Cave tours | Surface entry free; cave tours require separate paid admission. Tour availability not inferred from surface access. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [maca-basic](https://www.nps.gov/maca/planyourvisit/basicinfo.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### meve: Mesa Verde National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| meve-147 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [meve-hours](https://www.nps.gov/meve/planyourvisit/hours.htm) |
| meve-151 | accessRules / facility | Mesa Verde Museum | Museum closed from October 25, 2026 for renovation; planned late spring 2027 reopening. **temporary_alert**: 2026–27 renovation; end not guaranteed. high confidence; verified_primary_source. | [meve-hours](https://www.nps.gov/meve/planyourvisit/hours.htm) |
| meve-149 | experienceWindows / experience | Cliff dwelling tours | Tours generally begin early May and end mid/late October; winter overlooks are a different experience. **typical_weather_dependent_range**: early May–mid/late October typical tour season. high confidence; verified_primary_source. | [meve-hours](https://www.nps.gov/meve/planyourvisit/hours.htm) |
| meve-148 | climateNotes / climate | Climate and outdoor conditions | Warm/hot June–September, July/August storms, possible snow October–May. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [meve-weather](https://www.nps.gov/meve/planyourvisit/weather.htm) |
| meve-152 | crowdEvidence / visitation | Visitor seasonality | Summer highest visitation; fall quieter. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [meve-hours](https://www.nps.gov/meve/planyourvisit/hours.htm) |
| meve-316 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [meve-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=MEVE&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| meve-150 | services / service | Morefield camping and lodging | Many facilities including Morefield Campground/Far View Lodge close in winter. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [meve-hours](https://www.nps.gov/meve/planyourvisit/hours.htm) |

Unknown/recheck items:

- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### mora: Mount Rainier National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| mora-153 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [mora-hours](https://www.nps.gov/mora/planyourvisit/hours.htm) |
| mora-155 | accessRules / road | Winter vehicle access | Nisqually is the winter ordinary-vehicle entrance toward Paradise, subject to weather/gates. **typical_weather_dependent_range**: Winter access pattern. high confidence; verified_primary_source. | [mora-hours](https://www.nps.gov/mora/planyourvisit/hours.htm) |
| mora-156 | accessRules / road | SR 165 access to Carbon River / Mowich Lake | Current notice says bridge closed to pedestrians, bicycles and vehicles with no alternate route. **temporary_alert**: Bridge closure, no confirmed end. high confidence; verified_primary_source. | [mora-roads](https://www.nps.gov/mora/planyourvisit/road-status.htm) |
| mora-212 | experienceWindows / experience | High-country hiking conditions | Snow can remain at 5,000–8,000 feet into mid-July. **typical_weather_dependent_range**: Mid-July snow persistence is possible, not a trail-opening guarantee. high confidence; verified_primary_source. | [mora-weather](https://www.nps.gov/mora/planyourvisit/weather.htm) |
| mora-154 | climateNotes / climate | Climate and outdoor conditions | Late July/August usually driest; snow at 5,000–8,000 feet persists into mid-July. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [mora-weather](https://www.nps.gov/mora/planyourvisit/weather.htm) |
| mora-157 | crowdEvidence / visitation | Visitor seasonality | July/August peak; busiest weekends can have long entrance waits. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [mora-hours](https://www.nps.gov/mora/planyourvisit/hours.htm) |
| mora-317 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [mora-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=MORA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| mora-158 | services / service | Ohanapecosh Campground | Closed for 2026 construction; not recurring. **temporary_alert**: 2026 construction only. high confidence; verified_primary_source. | [mora-hours](https://www.nps.gov/mora/planyourvisit/hours.htm) |

Review: General hours text says Carbon River entrance open for foot/bicycle access; newer road-status bridge closure overrides that baseline. Temporary road record must be rechecked, not repeated annually.

Unknown/recheck items:

- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### neri: New River Gorge National Park and Preserve

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| neri-159 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [neri-hours](https://www.nps.gov/neri/planyourvisit/hours.htm) |
| neri-160 | climateNotes / climate | Climate and outdoor conditions | Mountain storms change quickly; July warmest and wettest on average. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [neri-weather](https://www.nps.gov/neri/planyourvisit/weather.htm) |
| neri-318 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [neri-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=NERI&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| neri-161 | services / service | Visitor centers | Thurmond/Grandview seasonal; Canyon Rim/Sandstone year-round with holiday exceptions. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [neri-hours](https://www.nps.gov/neri/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### noca: North Cascades National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| noca-163 | accessRules / road | State Route 20 / North Cascades Highway | Snow/avalanche usually closes crossing late November/early December until April/early May. **typical_weather_dependent_range**: late November/early December–April/early May closure. high confidence; verified_primary_source. | [noca-roads](https://www.nps.gov/noca/planyourvisit/road-conditions.htm) |
| noca-213 | experienceWindows / experience | High-country hiking conditions | Most trails lose snow by July, but highest trails later. **typical_weather_dependent_range**: July snowmelt typical; highest routes require recheck. high confidence; verified_primary_source. | [noca-weather](https://www.nps.gov/noca/planyourvisit/weather.htm) |
| noca-162 | climateNotes / climate | Climate and outdoor conditions | Best weather generally mid-June–late September; most trails snow-free by July, highest trails later. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [noca-weather](https://www.nps.gov/noca/planyourvisit/weather.htm) |
| noca-319 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [noca-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=NOCA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| noca-164 | services / service | Stehekin shuttle | Normal service late May–mid-October; page also carries landslide notice with no clear year. **typical_weather_dependent_range**: late May–mid-October normal schedule; current operability uncertain. high confidence; verified_primary_source. | [noca-roads](https://www.nps.gov/noca/planyourvisit/road-conditions.htm) |

Review: Road status includes month/day-only flood/landslide entries and no reliable year. Quarantined as unresolved; normal shuttle window is not confirmed current service.

Unknown/recheck items:

- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### olym: Olympic National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| olym-165 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [olym-hours](https://www.nps.gov/olym/planyourvisit/hours.htm) |
| olym-166 | climateNotes / climate | Climate and outdoor conditions | Wet lowland winters and deep mountain snow; high trails can retain snow into June; July/August warmer but rain possible. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [olym-weather](https://www.nps.gov/olym/planyourvisit/weather.htm) |
| olym-168 | crowdEvidence / visitation | Visitor seasonality | June–September popular, especially July/August. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [olym-weather](https://www.nps.gov/olym/planyourvisit/weather.htm) |
| olym-320 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [olym-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=OLYM&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| olym-167 | services / service | Seasonal facilities | October–May many roads/campgrounds/facilities reduced or closed; Hurricane Ridge Road and visitor centers holiday exceptions. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [olym-hours](https://www.nps.gov/olym/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### pefo: Petrified Forest National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| pefo-169 | accessRules / park | Holiday closure | Park closed Thanksgiving and Christmas; daily road hours 8 a.m.–5 p.m. Mountain Standard Time. **fixed_recurring_rule**: Thanksgiving and December 25; daily limits separate; 12-25 → 12-25. high confidence; verified_primary_source. | [pefo-hours](https://www.nps.gov/pefo/planyourvisit/hours.htm) |
| pefo-170 | climateNotes / climate | Climate and outdoor conditions | Semi-arid, hot summer storms and winter freezing/snow. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [pefo-weather](https://www.nps.gov/pefo/planyourvisit/weather.htm) |
| pefo-321 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [pefo-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=PEFO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **services**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### pinn: Pinnacles National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| pinn-171 | accessRules / park | Park baseline access | East trails 24-hour access; west gate day use 7:30 a.m.–8 p.m. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [pinn-hours](https://www.nps.gov/pinn/planyourvisit/hours.htm) |
| pinn-220 | experienceWindows / experience | Hiking conditions | Spring and fall generally most pleasant; summer heat and winter flood hazards change hiking suitability. **typical_weather_dependent_range**: Spring/fall climate suitability, not guaranteed cave access. high confidence; verified_primary_source. | [pinn-weather](https://www.nps.gov/pinn/planyourvisit/weather.htm) |
| pinn-172 | climateNotes / climate | Climate and outdoor conditions | Spring/fall milder; summer frequently over 100°F; winter rain can flood cave crossings. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [pinn-weather](https://www.nps.gov/pinn/planyourvisit/weather.htm) |
| pinn-173 | crowdEvidence / visitation | Visitor seasonality | Spring weekends/holidays especially busy. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [pinn-hours](https://www.nps.gov/pinn/planyourvisit/hours.htm) |
| pinn-322 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [pinn-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=PINN&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| pinn-174 | services / service | East-side shuttle | Late winter/spring seasonal shuttle; current page says season ended, no dated next-year schedule. **typical_weather_dependent_range**: late winter–spring; exact operating dates unknown. high confidence; verified_primary_source. | [pinn-hours](https://www.nps.gov/pinn/planyourvisit/hours.htm) |

Unknown/recheck items:

- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### redw: Redwood National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| redw-175 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [redw-hours](https://www.nps.gov/redw/planyourvisit/hours.htm) |
| redw-176 | climateNotes / climate | Climate and outdoor conditions | Cool coast year-round; October–April storm rainfall, summer fog; inland warmer. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [redw-weather](https://www.nps.gov/redw/planyourvisit/weather.htm) |
| redw-323 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [redw-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=REDW&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| redw-177 | services / service | Visitor centers / camping | Seasonal facility schedules require travel-year check. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [redw-hours](https://www.nps.gov/redw/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### romo: Rocky Mountain National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| romo-1 | accessRules / park | Park baseline access | Park open year-round, weather permitting. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [romo-hours](https://www.nps.gov/romo/planyourvisit/hours.htm) |
| romo-2 | accessRules / road | Bear Lake Road | Year-round road, with winter/spring snow, ice and possible traction requirements. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [romo-roads](https://www.nps.gov/romo/planyourvisit/road_status.htm) |
| romo-3 | accessRules / road | Trail Ridge Road / US 34 | Typically unavailable for through travel mid-October to late May. **typical_weather_dependent_range**: mid-October through late May; no exact recurring endpoints. high confidence; verified_primary_source. | [romo-hours](https://www.nps.gov/romo/planyourvisit/hours.htm) |
| romo-4 | accessRules / road | Old Fall River Road | Seasonal one-way uphill road, generally early July to early October; trailers and vehicles over 25 feet prohibited. **typical_weather_dependent_range**: early July–early October vehicle season. high confidence; verified_primary_source. | [romo-roads](https://www.nps.gov/romo/planyourvisit/road_status.htm) |
| romo-5 | experienceWindows / experience | High-country ordinary hiking | Subalpine spring arrives in June; trails can retain snow. Snow is possible even in July. **typical_weather_dependent_range**: Summer hiking depends on elevation and snowmelt. high confidence; verified_primary_source. | [romo-climate](https://www.nps.gov/romo/planyourvisit/all-about-weather.htm) |
| romo-6 | experienceWindows / experience | Conventional road highlights | Trail Ridge connects Estes Park and Grand Lake in summer; Bear Lake offers a separate east-side destination. **typical_weather_dependent_range**: Summer through-road versus year-round east-side access. high confidence; verified_primary_source. | [romo-roads](https://www.nps.gov/romo/planyourvisit/road_status.htm) |
| romo-7 | experienceWindows / experience | Optional winter recreation | January–March generally offers the best skiing and snowshoeing conditions. **typical_weather_dependent_range**: January–March; winter mode only. high confidence; verified_primary_source. | [romo-climate](https://www.nps.gov/romo/planyourvisit/all-about-weather.htm) |
| romo-8 | climateNotes / climate | Climate and outdoor conditions | Summer afternoon storms and wind; early autumn snow possible. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [romo-climate](https://www.nps.gov/romo/planyourvisit/all-about-weather.htm) |
| romo-9 | crowdEvidence / visitation | Visitor seasonality | Late May–October and winter weekends are busy. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [romo-hours](https://www.nps.gov/romo/planyourvisit/hours.htm) |
| romo-324 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [romo-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=ROMO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| romo-10 | services / service | Camping | Summer campground reservations required; individual campground operating dates need recheck. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [romo-hours](https://www.nps.gov/romo/planyourvisit/hours.htm) |
| romo-11 | services / service | Bear Lake and Moraine Park shuttles | Published 2026 daily service May 22–October 18. **current_year_published_schedule**: 2026 daily service only; 2026-05-22 → 2026-10-18. high confidence; verified_primary_source. | [romo-shuttle](https://www.nps.gov/romo/planyourvisit/shuttle-buses-and-public-transit.htm) |
| romo-12 | services / service | Hiker Shuttle | Tickets required; 2026 daily May 22–September 7 and weekends September 12–October 18. **current_year_published_schedule**: 2026: daily interval followed by weekend-only interval; 2026-05-22 → 2026-09-07 (ISO weekdays 1,2,3,4,5,6,7); 2026-09-12 → 2026-10-18 (ISO weekdays 6,7). high confidence; verified_primary_source. | [romo-shuttle](https://www.nps.gov/romo/planyourvisit/shuttle-buses-and-public-transit.htm) |

Review: Hours page retains 2025 timed-entry dates. Do not reuse those dates as 2026 policy; reservation details beyond the Hiker Shuttle remain unverified.

Review: Road page through-travel status is a dated snapshot, not a live guarantee. No current open/closed flag inferred from it.

Unknown/recheck items:

- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### sagu: Saguaro National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| sagu-179 | experienceWindows / experience | Ordinary hiking | NPS advises finish by 10 a.m. when highs 95–110°F; avoid hiking above 110°F. **typical_weather_dependent_range**: Temperature-dependent guidance; not annual legal closure. high confidence; verified_primary_source. | [sagu-climate2](https://home.nps.gov/sagu/planyourvisit/weather.htm) |
| sagu-178 | climateNotes / climate | Climate and outdoor conditions | Summer extreme heat and monsoon flash floods; winter lowlands milder but high mountains snowy. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [sagu-climate2](https://home.nps.gov/sagu/planyourvisit/weather.htm) |
| sagu-325 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [sagu-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=SAGU&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| sagu-180 | services / service | Ranger programs | Late spring/summer programs intermittent; more offered in winter. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [sagu-climate2](https://home.nps.gov/sagu/planyourvisit/weather.htm) |

Unknown/recheck items:

- **accessRules**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### sequ: Sequoia National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| sequ-133 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [sequ-hours](https://www.nps.gov/seki/planyourvisit/hours.htm) |
| sequ-139 | accessRules / road | Mineral King Road | Winter vehicle closure at park boundary; RVs/trailers not recommended and not allowed in Mineral King campgrounds. **typical_weather_dependent_range**: winter vehicle closure; verify travel-year reopening. high confidence; verified_primary_source. | [seki-roads](https://www.nps.gov/seki/planyourvisit/road-conditions.htm) |
| sequ-135 | experienceWindows / experience | Elevation-dependent hiking | Spring/summer foothills heat differs from snow-retaining grove/high-country trails. **typical_weather_dependent_range**: Elevation-dependent; no park-wide hiking date. high confidence; verified_primary_source. | [sequ-hours](https://www.nps.gov/seki/planyourvisit/hours.htm) |
| sequ-134 | climateNotes / climate | Climate and outdoor conditions | Foothills and groves can differ by 20–30°F; snowy groves may coexist with foothill flowers. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [sequ-weather](https://www.nps.gov/seki/planyourvisit/weather.htm) |
| sequ-137 | crowdEvidence / visitation | Visitor seasonality | Summer is the main visitor season. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [sequ-hours](https://www.nps.gov/seki/planyourvisit/hours.htm) |
| sequ-326 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [sequ-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=SEQU&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| sequ-136 | services / service | Visitor/camper facilities | Year-round service areas include Grant Grove, Foothills, Giant Forest/Lodgepole; reductions in fall. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [sequ-hours](https://www.nps.gov/seki/planyourvisit/hours.htm) |

Unknown/recheck items:

- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### shen: Shenandoah National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| shen-181 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [shen-hours](https://www.nps.gov/shen/planyourvisit/hours.htm) |
| shen-183 | accessRules / road | Skyline Drive | Weather can close drive while foot entry remains possible. **typical_weather_dependent_range**: Weather-triggered closures; no fixed winter closure. high confidence; verified_primary_source. | [shen-hours](https://www.nps.gov/shen/planyourvisit/hours.htm) |
| shen-182 | climateNotes / climate | Climate and outdoor conditions | Ridge usually about 10°F cooler than valley; location-specific conditions. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [shen-weather](https://www.nps.gov/shen/planyourvisit/weather.htm) |
| shen-327 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [shen-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=SHEN&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| shen-184 | services / service | Camper / visitor facilities | Most seasonal facilities open from March and close by late November; individual 2026 table dates differ. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [shen-hours](https://www.nps.gov/shen/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### thro: Theodore Roosevelt National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| thro-185 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [thro-hours](https://www.nps.gov/thro/planyourvisit/hours.htm) |
| thro-187 | accessRules / road | North Scenic Road / South Scenic Loop | Snow/ice may close portions in winter. **typical_weather_dependent_range**: Winter weather-dependent. high confidence; verified_primary_source. | [thro-hours](https://www.nps.gov/thro/planyourvisit/hours.htm) |
| thro-186 | climateNotes / climate | Climate and outdoor conditions | Warm summers with violent storm risk; winter cold/blizzards, wind year-round. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [thro-weather](https://www.nps.gov/thro/planyourvisit/weather.htm) |
| thro-328 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [thro-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=THRO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **services**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### voya: Voyageurs National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| voya-188 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [voya-hours](https://www.nps.gov/voya/planyourvisit/hours.htm) |
| voya-189 | accessRules / road | Lake campsites | All campsites except primitive require boat access; some mainland trails/centers reachable by car. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [voya-directions](https://www.nps.gov/voya/planyourvisit/directions.htm) |
| voya-190 | experienceWindows / experience | Summer water versus winter ice recreation | Summer boating and hiking differ from winter snowmobiling/skiing; ice is not guaranteed safe. **typical_weather_dependent_range**: Season-specific mode choice required. high confidence; verified_primary_source. | [voya-hours](https://www.nps.gov/voya/planyourvisit/hours.htm) |
| voya-223 | climateNotes / climate | Climate and outdoor conditions | Winter frozen-lake recreation differs from summer open-water boating; no safe-ice dates established. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [voya-hours](https://www.nps.gov/voya/planyourvisit/hours.htm) |
| voya-329 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [voya-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=VOYA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| voya-191 | services / service | Seasonal visitor centers | Ash River/Kabetogama/Crane Lake seasonal centers close September 27, 2026 and planned reopen May 29, 2027. **current_year_published_schedule**: Published closed interval inferred between stated last-open/reopen dates; 2026-09-28 → 2027-05-28. medium confidence; inferred_from_primary. | [voya-hours](https://www.nps.gov/voya/planyourvisit/hours.htm) |

Unknown/recheck items:

- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### whsa: White Sands National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| whsa-192 | accessRules / park | Holiday park closure | Thanksgiving and Christmas closed; other daily hours vary by season. **fixed_recurring_rule**: Thanksgiving and December 25; 12-25 → 12-25. high confidence; verified_primary_source. | [whsa-hours](https://www.nps.gov/whsa/planyourvisit/hours.htm) |
| whsa-194 | accessRules / entrance | Missile-test access interruption | Tests occasionally close park entry road and US 70 up to three hours; exact days require day-before check. **unknown**: Event dates unknown; not annual season. high confidence; verified_primary_source. | [whsa-hours](https://www.nps.gov/whsa/planyourvisit/hours.htm) |
| whsa-193 | climateNotes / climate | Climate and outdoor conditions | Hot summer, July–September storms, windy spring and cold winter nights. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [whsa-weather](https://www.nps.gov/whsa/planyourvisit/weather.htm) |
| whsa-330 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [whsa-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=WHSA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **services**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### wica: Wind Cave National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| wica-195 | accessRules / park | Park baseline access | Surface open all day every day; cave tours separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [wica-hours](https://www.nps.gov/wica/planyourvisit/hours.htm) |
| wica-196 | climateNotes / climate | Climate and outdoor conditions | Summer thunderstorms/hail, winter snow road risk; cave stays about 54°F. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [wica-weather](https://www.nps.gov/wica/planyourvisit/weather.htm) |
| wica-331 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [wica-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=WICA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| wica-197 | services / service | Cave tours | Times vary by season and need confirmation; surface openness does not guarantee tours. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [wica-hours](https://www.nps.gov/wica/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### yell: Yellowstone National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| yell-13 | accessRules / park | Park baseline access | Park open year-round; roads and facilities have separate seasons. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [yell-hours](https://www.nps.gov/yell/planyourvisit/hours.htm) |
| yell-14 | accessRules / road | North Entrance–Tower Junction–Cooke City corridor | Generally open year-round to regular vehicles, weather permitting. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [yell-roads](https://www.nps.gov/yell/planyourvisit/parkroads.htm) |
| yell-15 | accessRules / road | Interior park roads | Most close to regular vehicles early November–late April; oversnow season typically mid-December–mid-March. **typical_weather_dependent_range**: early November–late April regular-vehicle restriction. high confidence; verified_primary_source. | [yell-roads](https://www.nps.gov/yell/planyourvisit/parkroads.htm) |
| yell-16 | accessRules / road | Cooke City–Pilot Creek / US 212 connection | Winter wheeled-vehicle gap prevents eastward through travel from Cooke City. **typical_weather_dependent_range**: wheeled connection generally mid-May–early November. high confidence; verified_primary_source. | [yell-roads](https://www.nps.gov/yell/planyourvisit/parkroads.htm) |
| yell-17 | accessRules / road | West Entrance–Madison–Old Faithful | Projected 2026 regular-vehicle season; weather dependent. **current_year_published_schedule**: Published 2026 planned open interval; 2026-04-17 → 2026-10-31. high confidence; verified_primary_source. | [yell-roads](https://www.nps.gov/yell/planyourvisit/parkroads.htm) |
| yell-19 | experienceWindows / experience | Ordinary high-country hiking | May and June retain high-elevation snow; July and August offer broader hiking opportunities. **typical_weather_dependent_range**: Snowmelt-dependent summer. high confidence; verified_primary_source. | [yell-seasons](https://www.nps.gov/yell/planyourvisit/seasons.htm) |
| yell-20 | experienceWindows / experience | Old Faithful winter visit | Guided winter tours are an alternative to ordinary-car access; most facilities close. **typical_weather_dependent_range**: Limited winter services; verify tour availability. high confidence; verified_primary_source. | [yell-winter](https://www.nps.gov/yell/planyourvisit/visiting-yellowstone-in-winter.htm) |
| yell-21 | climateNotes / climate | Climate and outdoor conditions | Snow possible every month; summer afternoon storms and freezing high-elevation nights. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [yell-weather](https://www.nps.gov/yell/planyourvisit/weather.htm) |
| yell-22 | crowdEvidence / visitation | Visitor seasonality | NPS classifies June–September busiest, May/October moderate, winter and early spring least busy. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [yell-seasons](https://www.nps.gov/yell/planyourvisit/seasons.htm) |
| yell-332 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [yell-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=YELL&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| yell-18 | services / service | West/South/East groomed oversnow routes | Projected December 15, 2026–March 15, 2027; segments have different closing dates. **current_year_published_schedule**: 2026–27 published oversnow schedule; not annual rule; 2026-12-15 → 2027-03-15. high confidence; verified_primary_source. | [yell-roads](https://www.nps.gov/yell/planyourvisit/parkroads.htm) |
| yell-23 | services / service | Camper and visitor services | Few facilities are year-round; services are limited early November–late April. Campgrounds close at 11 a.m. on listed closing dates. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [yell-hours](https://www.nps.gov/yell/planyourvisit/hours.htm) |
| yell-24 | services / service | Winter camping and lodging | Mammoth camping and selected winter hotels are described; this does not establish camper access to Old Faithful. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [yell-winter](https://www.nps.gov/yell/planyourvisit/visiting-yellowstone-in-winter.htm) |

Review: Monthly seasons page is general guidance; operating-dates tables take precedence for individual facilities. No assertion that all campgrounds open in June.

Unknown/recheck items:

- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### yose: Yosemite National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| yose-198 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [yose-hours](https://www.nps.gov/yose/planyourvisit/hours.htm) |
| yose-200 | accessRules / road | Tioga Road | Typically late May/June–November; winter closure prevents eastern crossing. **typical_weather_dependent_range**: late May/June–November normal vehicle season. high confidence; verified_primary_source. | [yose-roads](https://www.nps.gov/yose/planyourvisit/tioga.htm) |
| yose-201 | accessRules / road | Glacier Point Road | Typically May–November vehicle access, plowing dependent. **typical_weather_dependent_range**: May–November. high confidence; verified_primary_source. | [yose-roads](https://www.nps.gov/yose/planyourvisit/tioga.htm) |
| yose-202 | experienceWindows / experience | High-country hiking | Widespread snow roughly November–May is distinct from Valley access. **typical_weather_dependent_range**: Snowmelt-dependent high country. high confidence; verified_primary_source. | [yose-weather](https://www.nps.gov/yose/planyourvisit/weather.htm) |
| yose-199 | climateNotes / climate | Climate and outdoor conditions | Most precipitation October–May; high country generally snowy November–May, Valley conditions differ. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [yose-weather](https://www.nps.gov/yose/planyourvisit/weather.htm) |
| yose-333 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [yose-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=YOSE&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |

Unknown/recheck items:

- **services**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### zion: Zion National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| zion-203 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [zion-hours](https://www.nps.gov/zion/planyourvisit/hours.htm) |
| zion-205 | accessRules / road | Zion Canyon Scenic Drive | During shuttle operations personal vehicles generally excluded; other park roads separate. **typical_weather_dependent_range**: Shuttle operating season; confirm exact dates and authorized exceptions. high confidence; verified_primary_source. | [zion-hours](https://www.nps.gov/zion/planyourvisit/hours.htm) |
| zion-206 | experienceWindows / experience | Narrows hiking | Spring snowmelt may close Narrows for extended periods; summer flash flood and winter cold require separate review. **typical_weather_dependent_range**: Runoff/weather dependent; no guaranteed hiking season. high confidence; verified_primary_source. | [zion-seasons](https://www.nps.gov/zion/planyourvisit/seasons.htm) |
| zion-204 | climateNotes / climate | Climate and outdoor conditions | Summer hot, July–September flash floods; winter ice and spring runoff can restrict hikes. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [zion-seasons](https://www.nps.gov/zion/planyourvisit/seasons.htm) |
| zion-207 | crowdEvidence / visitation | Visitor seasonality | Summer busiest; March spring-break increase; November quieter. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [zion-seasons](https://www.nps.gov/zion/planyourvisit/seasons.htm) |
| zion-334 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [zion-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=ZION&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| zion-208 | services / service | Camping / lodge | Watchman campground and lodge year-round; other camping seasonal, verify construction/availability. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [zion-hours](https://www.nps.gov/zion/planyourvisit/hours.htm) |

Unknown/recheck items:

- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### dena: Denali National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| dena-228 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [dena-hours](https://www.nps.gov/dena/planyourvisit/hours.htm) |
| dena-230 | accessRules / road | Denali Park Road beyond Savage River | Summer private vehicle restrictions beyond mile 15; use transit/tour buses. **typical_weather_dependent_range**: Summer bus season. high confidence; verified_primary_source. | [dena-directions](https://www.nps.gov/dena/planyourvisit/directions.htm) |
| dena-229 | climateNotes / climate | Climate and outdoor conditions | North interior climate differs from south maritime; short summer and cold winter. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [dena-climate](https://www.nps.gov/dena/learn/nature/climate.htm) |
| dena-233 | crowdEvidence / visitation | Visitor seasonality | Mid-June–mid-August largest visitation. **typical_weather_dependent_range**: Qualitative recurring visitation pattern. high confidence; official_qualitative. | [dena-hours](https://www.nps.gov/dena/planyourvisit/hours.htm) |
| dena-335 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [dena-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=DENA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| dena-231 | services / service | Transit buses | General season begins May 20 through second Thursday after Labor Day; exact annual service must be confirmed. **typical_weather_dependent_range**: May 20–second Thursday after Labor Day. high confidence; verified_primary_source. | [dena-hours](https://www.nps.gov/dena/planyourvisit/hours.htm) |
| dena-232 | services / service | Full road bus service | Current page announces full-length service resuming 2027 with reservations opening December 1, 2026; planned, not recurring. **temporary_alert**: 2027 planned reopening; confirm before booking. high confidence; verified_primary_source. | [dena-roads](https://www.nps.gov/dena/planyourvisit/conditions.htm) |

Review: Current conditions explicitly supersedes other planning pages; 2027 full-road service is a plan, not an assumption that the complete road is currently open.

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### gaar: Gates of the Arctic National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| gaar-234 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [gaar-hours](https://www.nps.gov/gaar/planyourvisit/hours.htm) |
| gaar-236 | accessRules / road | Wilderness park entry | No roads/trails into park; most use air taxi; experienced visitors may hike in with river crossings. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [gaar-directions](https://www.nps.gov/gaar/planyourvisit/directions.htm) |
| gaar-215 | experienceWindows / experience | Backcountry hiking | Mid-June–September generally best for backpacking/hiking; snow/freezing still possible. **typical_weather_dependent_range**: mid-June–September typical. high confidence; verified_primary_source. | [gaar-weather](https://www.nps.gov/gaar/planyourvisit/weather.htm) |
| gaar-235 | climateNotes / climate | Climate and outdoor conditions | Snow/freezing possible any month; breakup river crossings unsafe; mid-June–September generally best hiking. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [gaar-weather](https://www.nps.gov/gaar/planyourvisit/weather.htm) |
| gaar-336 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [gaar-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GAAR&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| gaar-237 | services / service | Air taxis/outfitters | Summer/fall services described, exact operator windows not established. **unknown**: Operator-specific availability not verified. high confidence; verified_primary_source. | [gaar-hours](https://www.nps.gov/gaar/planyourvisit/hours.htm) |

Unknown/recheck items:

- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### glba: Glacier Bay National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| glba-239 | accessRules / road | Gustavus / Bartlett Cove | Plane/boat arrival; local road does not connect to Alaska mainland highway network. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [glba-directions](https://www.nps.gov/glba/planyourvisit/directions.htm) |
| glba-238 | climateNotes / climate | Climate and outdoor conditions | Cool moist maritime summers; April–June driest, September/October wettest. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [glba-weather](https://www.nps.gov/glba/planyourvisit/weather.htm) |
| glba-337 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [glba-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GLBA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| glba-240 | services / service | Air / ferry / bay tours | Summer jet service and typical summer ferry calls differ from year-round small aircraft; no exact travel-year schedules. **typical_weather_dependent_range**: Operator-dependent; summer expanded services. high confidence; verified_primary_source. | [glba-directions](https://www.nps.gov/glba/planyourvisit/directions.htm) |
| glba-241 | services / service | Visitor facilities | Busy summer visitor season, winter limited services. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [glba-hours](https://www.nps.gov/glba/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### katm: Katmai National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| katm-242 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [katm-hours](https://www.nps.gov/katm/planyourvisit/hours.htm) |
| katm-246 | accessRules / road | King Salmon–Brooks Camp | Most park destinations require air or boat access; no ordinary road connection from King Salmon to Brooks. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [katm-directions](https://www.nps.gov/katm/planyourvisit/directions.htm) |
| katm-216 | experienceWindows / experience | Backcountry exploration | Most backcountry activities best June–September; Brooks bear viewing is a different window. **typical_weather_dependent_range**: June–September typical backcountry season. high confidence; verified_primary_source. | [katm-hours](https://www.nps.gov/katm/planyourvisit/hours.htm) |
| katm-244 | experienceWindows / experience | Brooks Camp bear viewing | July and September prime bear viewing; coastal viewing June–August is distinct. **typical_weather_dependent_range**: July/September Brooks versus June–August coast. high confidence; verified_primary_source. | [katm-hours](https://www.nps.gov/katm/planyourvisit/hours.htm) |
| katm-243 | climateNotes / climate | Climate and outdoor conditions | Rapid maritime weather changes; rain and wind affect access. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [katm-weather](https://www.nps.gov/katm/planyourvisit/weather.htm) |
| katm-338 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [katm-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=KATM&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| katm-245 | services / service | Brooks Camp services | NPS/concessioner services described June 1–September 17, very limited September 18–month end; older page, verify year. **typical_weather_dependent_range**: June 1–September 17 published typical services. high confidence; verified_primary_source. | [katm-hours](https://www.nps.gov/katm/planyourvisit/hours.htm) |

Unknown/recheck items:

- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### kefj: Kenai Fjords National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| kefj-247 | accessRules / park | Park baseline access | Park open year-round; winter car and coastal access greatly reduced. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [kefj-hours](https://www.nps.gov/kefj/planyourvisit/hours.htm) |
| kefj-249 | accessRules / road | Exit Glacier Road | Not plowed winter; snow usually blocks cars sometime October–May. **typical_weather_dependent_range**: October–May snow-dependent car closure. high confidence; verified_primary_source. | [kefj-hours](https://www.nps.gov/kefj/planyourvisit/hours.htm) |
| kefj-214 | experienceWindows / experience | High-country hiking conditions | Higher elevations often retain snow through June or July. **typical_weather_dependent_range**: Snowmelt-dependent June/July and later. high confidence; verified_primary_source. | [kefj-weather](https://www.nps.gov/kefj/planyourvisit/weather.htm) |
| kefj-248 | climateNotes / climate | Climate and outdoor conditions | Cool rainy summers; snow often remains high up through June/July, rough seas constrain coast. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [kefj-weather](https://www.nps.gov/kefj/planyourvisit/weather.htm) |
| kefj-339 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [kefj-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=KEFJ&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| kefj-250 | services / service | Boat tours / regional train | Boat tours reach fjords; train Anchorage–Seward summer May–September; exact schedules unverified. **typical_weather_dependent_range**: Summer expanded transport. high confidence; verified_primary_source. | [kefj-directions](https://www.nps.gov/kefj/planyourvisit/directions.htm) |

Unknown/recheck items:

- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### kova: Kobuk Valley National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| kova-252 | accessRules / road | Kobuk Valley entry | No road access; air taxis usual, boats/foot alternatives; winter aircraft/weather constraints. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [kova-directions](https://www.nps.gov/kova/planyourvisit/directions.htm) |
| kova-251 | climateNotes / climate | Climate and outdoor conditions | Short mild summer can still bring snow, wind, rain and freezing; severe cold/dark winter. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [kova-weather](https://www.nps.gov/kova/planyourvisit/weather.htm) |
| kova-340 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [kova-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=KOVA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| kova-253 | services / service | Air taxi landings | Village flights are not a guaranteed park landing; backcountry charter windows not verified. **unknown**: Weather/landing/operator availability unknown. high confidence; verified_primary_source. | [kova-directions](https://www.nps.gov/kova/planyourvisit/directions.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### lacl: Lake Clark National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| lacl-254 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [lacl-hours](https://www.nps.gov/lacl/planyourvisit/hours.htm) |
| lacl-256 | accessRules / road | Lake Clark entry | Not on road system; aircraft landing gear must suit destination; weather delays require flexibility. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [lacl-directions](https://www.nps.gov/lacl/planyourvisit/directions.htm) |
| lacl-255 | climateNotes / climate | Climate and outdoor conditions | Wet/foggy coast versus colder/drier interior; ice changes float/ski-plane landing options. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [lacl-weather](https://www.nps.gov/lacl/planyourvisit/weather.htm) |
| lacl-341 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [lacl-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=LACL&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| lacl-257 | services / service | Lodging/transport/guides | Wider services June–October; winter ski-plane access depends on conditions. **typical_weather_dependent_range**: June–October expanded services; operator dates unknown. high confidence; verified_primary_source. | [lacl-hours](https://www.nps.gov/lacl/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### wrst: Wrangell–St. Elias National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| wrst-258 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [wrst-hours](https://www.nps.gov/wrst/planyourvisit/hours.htm) |
| wrst-260 | accessRules / road | Nabesna / McCarthy roads | Open year-round but not maintained regularly in winter. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [wrst-hours](https://www.nps.gov/wrst/planyourvisit/hours.htm) |
| wrst-259 | climateNotes / climate | Climate and outdoor conditions | Winter arrives early; snow usually by late September, visitor services limited thereafter. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [wrst-hours](https://www.nps.gov/wrst/planyourvisit/hours.htm) |
| wrst-342 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [wrst-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=WRST&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| wrst-261 | services / service | Visitor stations | Mid-May–mid-September primary season; contact stations closed October–April. **typical_weather_dependent_range**: summer stations; exact year schedules need check. high confidence; verified_primary_source. | [wrst-hours](https://www.nps.gov/wrst/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### hale: Haleakalā National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| hale-262 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [hale-hours](https://www.nps.gov/hale/planyourvisit/hours.htm) |
| hale-265 | accessRules / road | Summit versus Kīpahulu | Districts do not connect by an internal road; no public transportation to either district. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [hale-directions](https://www.nps.gov/hale/planyourvisit/directions.htm) |
| hale-263 | climateNotes / climate | Climate and outdoor conditions | Summit cold/windy with freezing possible; Kīpahulu much warmer and wetter. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [hale-weather](https://www.nps.gov/hale/planyourvisit/weather.htm) |
| hale-343 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [hale-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=HALE&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| hale-264 | services / service | Sunrise entry reservation | Required daily 3–7 a.m.; permanent daily rule, not annual season. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [hale-hours](https://www.nps.gov/hale/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### havo: Hawaiʻi Volcanoes National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| havo-266 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [havo-hours](https://www.nps.gov/havo/planyourvisit/hours.htm) |
| havo-267 | climateNotes / climate | Climate and outdoor conditions | Kīlauea summit chilly/rainy anytime, coast hot/dry, Maunaloa high summit can have snow. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [havo-weather](https://www.nps.gov/havo/planyourvisit/weather.htm) |
| havo-344 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [havo-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=HAVO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| havo-268 | services / service | Internal transportation | No internal park shuttle; county bus arrival is different from reaching all highlights. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [havo-directions](https://www.nps.gov/havo/planyourvisit/directions.htm) |

Unknown/recheck items:

- **Volcanic highlights**: Eruption visibility and gas/eruption closures are not predictable recurring seasons; live alerts required.
- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### npsa: National Park of American Samoa National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| npsa-269 | accessRules / park | Park baseline access | Guide states year-round 24-hour park access, with temporary maintenance/safety closures possible. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [npsa-guide](https://www.nps.gov/npsa/planyourvisit/upload/NPSA-Visitor-Guide.pdf) |
| npsa-270 | accessRules / road | Tutuila versus Manu’a islands | Guide describes inter-island air/boat transport to Manu’a as limited and sometimes unreliable; Tutuila arrival is not an Ofu/Ta’ū visit. **unknown**: Current inter-island routes and frequencies unverified. medium confidence; verified_primary_source. | [npsa-guide](https://www.nps.gov/npsa/planyourvisit/upload/NPSA-Visitor-Guide.pdf) |
| npsa-273 | experienceWindows / experience | Hiking and coastal visits | Ask about current trails; local village permissions and Sunday customs affect visits. **typical_weather_dependent_range**: Community/day-specific access, not a seasonal park closure. high confidence; verified_primary_source. | [npsa-basic](https://www.nps.gov/npsa/planyourvisit/basicinfo.htm) |
| npsa-272 | climateNotes / climate | Climate and outdoor conditions | Wet October–May, relatively drier June–September; heat/humidity year-round, muddy/slippery hiking. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [npsa-weather](https://www.nps.gov/npsa/planyourvisit/weather.htm) |
| npsa-345 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [npsa-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=NPSA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| npsa-271 | services / service | Inter-island transport | Current-year flight/boat availability unknown; older guide not adopted as a current carrier schedule. **unknown**: Operator schedule requires recheck. high confidence; verified_primary_source. | [npsa-guide](https://www.nps.gov/npsa/planyourvisit/upload/NPSA-Visitor-Guide.pdf) |

Unknown/recheck items:

- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

### viis: Virgin Islands National Park

| Claim | Dimension / scope | Asset | Evidence and timing | Source |
|---|---|---|---|---|
| viis-274 | accessRules / park | Park baseline access | NPS describes year-round park access; asset restrictions are separate. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [viis-hours](https://www.nps.gov/viis/planyourvisit/hours.htm) |
| viis-276 | accessRules / road | St Thomas–St John ferry | No airport on St John; ferry/barge from St Thomas for this approach. **fixed_recurring_rule**: Year-round baseline; exceptions and current conditions require recheck; 01-01 → 12-31. high confidence; verified_primary_source. | [viis-directions](https://www.nps.gov/viis/planyourvisit/directions.htm) |
| viis-275 | climateNotes / climate | Climate and outdoor conditions | Winter stronger winds and north-shore waves; summer wetter with tropical storm/hurricane risk. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [viis-climate](https://www.nps.gov/viis/learn/nature/weather.htm) |
| viis-346 | crowdEvidence / visitation | Reported monthly recreation visits | NPS monthly recreation visits for complete 2023–2025 years; each monthly series reconciles with its reported annual total. **historical_measurement**: Complete calendar-year observations, not a recurring access rule. high confidence; official_measured. | [viis-monthly-visits](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=VIIS&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29) |
| viis-277 | services / service | Camping | Cinnamon Bay open with reservation booking; exact future-year availability unverified. **typical_weather_dependent_range**: Seasonal pattern; precise boundaries not established. high confidence; verified_primary_source. | [viis-hours](https://www.nps.gov/viis/planyourvisit/hours.htm) |

Unknown/recheck items:

- **experienceWindows**: No sufficiently specific claim established in this research pass; empty does not imply open, closed, safe, or uncrowded.
- **major_hiking**: No independent park-wide hiking window established; climate notes alone do not establish trail availability.
- **highlights_and_hiking_models**: No numeric highlights/hiking vectors proposed; insufficient evidence to calibrate 12 monthly values across experiences. Crowd proxy is independent.
- **live_alerts_and_capacity**: Not a live alert feed or booking inventory; recheck legal orders, roads, transport and reservations before travel.

## Source registry

All sources checked 2026-10-28. Full registry is in the JSON; update dates below refer to source pages, not to verification freshness.

- **romo-hours** — [Operating Hours & Seasons - Rocky Mountain National Park (U.S. National Park Service)](https://www.nps.gov/romo/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: January 2, 2025.
- **romo-roads** — [Park Roads - Rocky Mountain National Park (U.S. National Park Service)](https://www.nps.gov/romo/planyourvisit/road_status.htm); U.S. National Park Service; official_planning_page; source update: October 6, 2026.
- **romo-climate** — [All About Weather - Rocky Mountain National Park (U.S. National Park Service)](https://www.nps.gov/romo/planyourvisit/all-about-weather.htm); U.S. National Park Service; official_climate_description; source update: October 14, 2026.
- **romo-shuttle** — [Shuttle Buses and Public Transit - Rocky Mountain National Park (U.S. National Park Service)](https://www.nps.gov/romo/planyourvisit/shuttle-buses-and-public-transit.htm); U.S. National Park Service; official_planning_page; source update: May 22, 2026.
- **yell-hours** — [Operating Dates - Yellowstone National Park (U.S. National Park Service)](https://www.nps.gov/yell/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: October 28, 2026.
- **yell-roads** — [Park Roads - Yellowstone National Park (U.S. National Park Service)](https://www.nps.gov/yell/planyourvisit/parkroads.htm); U.S. National Park Service; official_planning_page; source update: October 28, 2026.
- **yell-seasons** — [Seasons - Yellowstone National Park (U.S. National Park Service)](https://www.nps.gov/yell/planyourvisit/seasons.htm); U.S. National Park Service; official_planning_page; source update: October 20, 2026.
- **yell-winter** — [Explore in Winter - Yellowstone National Park (U.S. National Park Service)](https://www.nps.gov/yell/planyourvisit/visiting-yellowstone-in-winter.htm); U.S. National Park Service; official_planning_page; source update: August 28, 2025.
- **yell-weather** — [Weather - Yellowstone National Park (U.S. National Park Service)](https://www.nps.gov/yell/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: September 30, 2025.
- **acad-hours** — [Operating Hours & Seasons - Acadia National Park (U.S. National Park Service)](https://www.nps.gov/acad/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: August 27, 2026.
- **acad-weather** — [Weather - Acadia National Park (U.S. National Park Service)](https://www.nps.gov/acad/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: October 7, 2021.
- **arch-hours** — [Operating Hours & Seasons - Arches National Park (U.S. National Park Service)](https://www.nps.gov/arch/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: April 18, 2025.
- **arch-weather** — [Weather - Arches National Park (U.S. National Park Service)](https://www.nps.gov/arch/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: April 18, 2025.
- **badl-hours** — [Operating Hours & Seasons - Badlands National Park (U.S. National Park Service)](https://www.nps.gov/badl/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: August 20, 2025.
- **badl-weather** — [Weather - Badlands National Park (U.S. National Park Service)](https://www.nps.gov/badl/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: December 1, 2020.
- **bibe-hours** — [Operating Hours & Seasons - Big Bend National Park (U.S. National Park Service)](https://www.nps.gov/bibe/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: October 27, 2026.
- **bibe-weather** — [Weather - Big Bend National Park (U.S. National Park Service)](https://www.nps.gov/bibe/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: December 23, 2025.
- **bisc-hours** — [Operating Hours & Seasons - Biscayne National Park (U.S. National Park Service)](https://www.nps.gov/bisc/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: April 28, 2021.
- **bisc-weather** — [Weather - Biscayne National Park (U.S. National Park Service)](https://www.nps.gov/bisc/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: August 13, 2019.
- **blca-hours** — [Operating Hours & Seasons - Black Canyon Of The Gunnison National Park (U.S. National Park Service)](https://www.nps.gov/blca/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: November 13, 2025.
- **blca-weather** — [Weather - Black Canyon Of The Gunnison National Park (U.S. National Park Service)](https://www.nps.gov/blca/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: April 24, 2025.
- **brca-hours** — [Operating Hours & Seasons - Bryce Canyon National Park (U.S. National Park Service)](https://www.nps.gov/brca/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: August 14, 2026.
- **brca-weather** — [Weather - Bryce Canyon National Park (U.S. National Park Service)](https://www.nps.gov/brca/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: October 31, 2022.
- **cany-hours** — [Operating Hours & Seasons - Canyonlands National Park (U.S. National Park Service)](https://www.nps.gov/cany/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: April 29, 2025.
- **cany-weather** — [Weather - Canyonlands National Park (U.S. National Park Service)](https://www.nps.gov/cany/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: January 6, 2026.
- **care-hours** — [Operating Hours & Seasons - Capitol Reef National Park (U.S. National Park Service)](https://www.nps.gov/care/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: March 11, 2026.
- **care-weather** — [Weather - Capitol Reef National Park (U.S. National Park Service)](https://www.nps.gov/care/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: June 13, 2024.
- **cave-hours** — [Operating Hours & Seasons - Carlsbad Caverns National Park (U.S. National Park Service)](https://www.nps.gov/cave/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: May 6, 2025.
- **cave-weather** — [Weather - Carlsbad Caverns National Park (U.S. National Park Service)](https://www.nps.gov/cave/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: May 5, 2025.
- **chis-hours** — [Operating Hours & Seasons - Channel Islands National Park (U.S. National Park Service)](https://www.nps.gov/chis/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: June 26, 2024.
- **chis-weather** — [Weather - Channel Islands National Park (U.S. National Park Service)](https://www.nps.gov/chis/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: May 23, 2018.
- **chis-transport** — [Directions & Transportation - Channel Islands National Park (U.S. National Park Service)](https://www.nps.gov/chis/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: August 12, 2026.
- **chir-hours** — [Operating Hours & Seasons - Chiricahua National Park (U.S. National Park Service)](https://www.nps.gov/chir/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: October 21, 2026.
- **chir-weather** — [Weather - Chiricahua National Park (U.S. National Park Service)](https://www.nps.gov/chir/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: October 17, 2026.
- **cong-climate2** — [Weather - Congaree National Park (U.S. National Park Service)](https://home.nps.gov/cong/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: June 21, 2021.
- **crla-hours** — [Operating Hours & Seasons - Crater Lake National Park (U.S. National Park Service)](https://www.nps.gov/crla/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: July 9, 2023.
- **cuva-hours** — [Operating Hours & Seasons - Cuyahoga Valley National Park (U.S. National Park Service)](https://www.nps.gov/cuva/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: August 14, 2025.
- **cuva-weather** — [Weather - Cuyahoga Valley National Park (U.S. National Park Service)](https://www.nps.gov/cuva/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: May 29, 2025.
- **deva-hours** — [Operating Hours & Seasons - Death Valley National Park (U.S. National Park Service)](https://www.nps.gov/deva/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: May 12, 2026.
- **deva-weather** — [Weather - Death Valley National Park (U.S. National Park Service)](https://www.nps.gov/deva/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: May 15, 2024.
- **drto-hours** — [Operating Hours & Seasons - Dry Tortugas National Park (U.S. National Park Service)](https://www.nps.gov/drto/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: August 14, 2020.
- **drto-climate** — [Weather - Dry Tortugas National Park (U.S. National Park Service)](https://www.nps.gov/drto/learn/nature/weather.htm); U.S. National Park Service; official_climate_description; source update: February 24, 2025.
- **drto-transport** — [Directions - Dry Tortugas National Park (U.S. National Park Service)](https://www.nps.gov/drto/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: September 25, 2026.
- **ever-hours** — [Operating Hours & Seasons - Everglades National Park (U.S. National Park Service)](https://www.nps.gov/ever/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: November 20, 2025.
- **ever-weather** — [Weather - Everglades National Park (U.S. National Park Service)](https://www.nps.gov/ever/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: February 14, 2025.
- **jeff-hours** — [Operating Hours & Seasons - Gateway Arch National Park (U.S. National Park Service)](https://www.nps.gov/jeff/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: February 17, 2026.
- **jeff-weather** — [Weather - Gateway Arch National Park (U.S. National Park Service)](https://www.nps.gov/jeff/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: September 17, 2024.
- **glac-hours** — [Operating Hours & Seasons - Glacier National Park (U.S. National Park Service)](https://www.nps.gov/glac/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: September 13, 2022.
- **glac-weather** — [Weather - Glacier National Park (U.S. National Park Service)](https://www.nps.gov/glac/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: July 9, 2026.
- **glac-roads** — [Going-to-the-Sun Road General Info - Glacier National Park (U.S. National Park Service)](https://www.nps.gov/glac/planyourvisit/gtsrinfo.htm); U.S. National Park Service; official_planning_page; source update: April 19, 2024.
- **grca-hours** — [Operating Hours & Seasons - Grand Canyon National Park (U.S. National Park Service)](https://www.nps.gov/grca/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: December 13, 2025.
- **grca-climate** — [Weather and Climate - Grand Canyon National Park (U.S. National Park Service)](https://www.nps.gov/grca/learn/nature/weather.htm); U.S. National Park Service; official_climate_description; source update: February 18, 2025.
- **grca-hiking** — [Key Hiking Messages - Critical Updates and Closures - Grand Canyon National Park (U.S. National Park Service)](https://www.nps.gov/grca/planyourvisit/key-messages.htm); U.S. National Park Service; official_planning_page; source update: October 27, 2026.
- **grca-north** — [Status of the North Rim - Grand Canyon National Park (U.S. National Park Service)](https://www.nps.gov/grca/northrimstatus.htm); U.S. National Park Service; official_planning_page; source update: October 25, 2026.
- **grte-hours** — [Operating Hours & Seasons - Grand Teton National Park (U.S. National Park Service)](https://www.nps.gov/grte/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: September 10, 2026.
- **grte-weather** — [Weather - Grand Teton National Park (U.S. National Park Service)](https://www.nps.gov/grte/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: September 11, 2026.
- **grte-roads** — [Park Roads - Grand Teton National Park (U.S. National Park Service)](https://www.nps.gov/grte/planyourvisit/roads.htm); U.S. National Park Service; official_planning_page; source update: October 9, 2026.
- **grba-hours** — [Operating Hours & Seasons - Great Basin National Park (U.S. National Park Service)](https://www.nps.gov/grba/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: June 22, 2025.
- **grba-weather** — [Weather - Great Basin National Park (U.S. National Park Service)](https://www.nps.gov/grba/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: November 27, 2024.
- **grba-conditions** — [Alerts & Conditions - Great Basin National Park (U.S. National Park Service)](https://www.nps.gov/grba/planyourvisit/conditions.htm); U.S. National Park Service; official_planning_page; source update: October 27, 2026.
- **grsa-hours** — [Operating Hours & Seasons - Great Sand Dunes National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/grsa/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: June 8, 2026.
- **grsa-weather** — [Weather - Great Sand Dunes National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/grsa/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: November 13, 2024.
- **grsm-hours** — [Operating Hours & Seasons - Great Smoky Mountains National Park (U.S. National Park Service)](https://www.nps.gov/grsm/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: January 28, 2026.
- **grsm-weather** — [Weather - Great Smoky Mountains National Park (U.S. National Park Service)](https://www.nps.gov/grsm/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: October 23, 2024.
- **gumo-hours** — [Operating Hours & Seasons - Guadalupe Mountains National Park (U.S. National Park Service)](https://www.nps.gov/gumo/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: July 25, 2023.
- **gumo-weather** — [Weather - Guadalupe Mountains National Park (U.S. National Park Service)](https://www.nps.gov/gumo/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: January 9, 2023.
- **hosp-weather** — [Weather - Hot Springs National Park (U.S. National Park Service)](https://www.nps.gov/hosp/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: August 18, 2024.
- **hosp-hours** — [Operating Hours & Seasons - Hot Springs National Park (U.S. National Park Service)](https://www.nps.gov/hosp/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: May 22, 2026.
- **indu-climate2** — [Weather - Indiana Dunes National Park (U.S. National Park Service)](https://home.nps.gov/indu/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: August 27, 2024.
- **indu-hours** — [Operating Hours & Seasons - Indiana Dunes National Park (U.S. National Park Service)](https://www.nps.gov/indu/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: November 4, 2025.
- **isro-hours** — [Operating Hours & Seasons - Isle Royale National Park (U.S. National Park Service)](https://www.nps.gov/isro/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: June 6, 2026.
- **isro-transport** — [Directions & Transportation - Isle Royale National Park (U.S. National Park Service)](https://www.nps.gov/isro/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: January 22, 2025.
- **jotr-hours** — [Operating Hours & Seasons - Joshua Tree National Park (U.S. National Park Service)](https://www.nps.gov/jotr/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: April 21, 2025.
- **kica-hours** — [Operating Hours & Seasons - Sequoia & Kings Canyon National Parks (U.S. National Park Service)](https://www.nps.gov/seki/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: September 17, 2025.
- **kica-weather** — [Weather - Sequoia & Kings Canyon National Parks (U.S. National Park Service)](https://www.nps.gov/seki/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: September 18, 2025.
- **sequ-hours** — [Operating Hours & Seasons - Sequoia & Kings Canyon National Parks (U.S. National Park Service)](https://www.nps.gov/seki/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: September 17, 2025.
- **sequ-weather** — [Weather - Sequoia & Kings Canyon National Parks (U.S. National Park Service)](https://www.nps.gov/seki/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: September 18, 2025.
- **seki-roads** — [Road Conditions - Sequoia & Kings Canyon National Parks (U.S. National Park Service)](https://www.nps.gov/seki/planyourvisit/road-conditions.htm); U.S. National Park Service; official_planning_page; source update: October 28, 2026.
- **lavo-hours** — [Operating Hours & Seasons - Lassen Volcanic National Park (U.S. National Park Service)](https://www.nps.gov/lavo/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: September 16, 2026.
- **lavo-weather** — [Weather - Lassen Volcanic National Park (U.S. National Park Service)](https://www.nps.gov/lavo/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: January 21, 2025.
- **lavo-snow** — [Oversnow Route Conditions - Lassen Volcanic National Park (U.S. National Park Service)](https://www.nps.gov/lavo/planyourvisit/oversnow_route_conditions.htm); U.S. National Park Service; official_planning_page; source update: May 7, 2026.
- **maca-basic** — [Basic Information - Mammoth Cave National Park (U.S. National Park Service)](https://www.nps.gov/maca/planyourvisit/basicinfo.htm); U.S. National Park Service; official_planning_page; source update: March 23, 2023.
- **maca-climate2** — [Weather - Mammoth Cave National Park (U.S. National Park Service)](https://home.nps.gov/maca/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: March 23, 2023.
- **meve-hours** — [Operating Hours & Seasons - Mesa Verde National Park (U.S. National Park Service)](https://www.nps.gov/meve/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: October 26, 2026.
- **meve-weather** — [Weather - Mesa Verde National Park (U.S. National Park Service)](https://www.nps.gov/meve/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: December 31, 2025.
- **mora-hours** — [Operating Hours & Seasons - Mount Rainier National Park (U.S. National Park Service)](https://www.nps.gov/mora/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: October 23, 2026.
- **mora-weather** — [Weather - Mount Rainier National Park (U.S. National Park Service)](https://www.nps.gov/mora/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: September 3, 2024.
- **mora-roads** — [Road Status - Mount Rainier National Park (U.S. National Park Service)](https://www.nps.gov/mora/planyourvisit/road-status.htm); U.S. National Park Service; official_planning_page; source update: October 28, 2026.
- **neri-hours** — [Operating Hours & Seasons - New River Gorge National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/neri/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: October 1, 2024.
- **neri-weather** — [Weather - New River Gorge National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/neri/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: July 27, 2021.
- **noca-weather** — [Weather - North Cascades National Park (U.S. National Park Service)](https://www.nps.gov/noca/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: July 8, 2025.
- **noca-roads** — [Road Conditions - North Cascades National Park (U.S. National Park Service)](https://www.nps.gov/noca/planyourvisit/road-conditions.htm); U.S. National Park Service; official_planning_page; source update: July 3, 2026.
- **olym-hours** — [Operating Hours & Seasons - Olympic National Park (U.S. National Park Service)](https://www.nps.gov/olym/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: April 18, 2024.
- **olym-weather** — [Weather - Olympic National Park (U.S. National Park Service)](https://www.nps.gov/olym/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: March 18, 2025.
- **pefo-hours** — [Operating Hours & Seasons - Petrified Forest National Park (U.S. National Park Service)](https://www.nps.gov/pefo/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: February 24, 2025.
- **pefo-weather** — [Weather - Petrified Forest National Park (U.S. National Park Service)](https://www.nps.gov/pefo/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: February 10, 2015.
- **pinn-hours** — [Operating Hours & Seasons - Pinnacles National Park (U.S. National Park Service)](https://www.nps.gov/pinn/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: May 29, 2026.
- **pinn-weather** — [Weather - Pinnacles National Park (U.S. National Park Service)](https://www.nps.gov/pinn/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: November 23, 2024.
- **redw-hours** — [Operating Hours & Seasons - Redwood National and State Parks (U.S. National Park Service)](https://www.nps.gov/redw/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: February 3, 2025.
- **redw-weather** — [Weather - Redwood National and State Parks (U.S. National Park Service)](https://www.nps.gov/redw/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: October 13, 2022.
- **sagu-climate2** — [Weather - Saguaro National Park (U.S. National Park Service)](https://home.nps.gov/sagu/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: May 5, 2025.
- **shen-hours** — [Operating Dates & Hours - Shenandoah National Park (U.S. National Park Service)](https://www.nps.gov/shen/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: September 22, 2026.
- **shen-weather** — [Weather Forecast - Shenandoah National Park (U.S. National Park Service)](https://www.nps.gov/shen/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: July 10, 2025.
- **thro-hours** — [Operating Hours & Seasons - Theodore Roosevelt National Park (U.S. National Park Service)](https://www.nps.gov/thro/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: July 1, 2026.
- **thro-weather** — [Weather - Theodore Roosevelt National Park (U.S. National Park Service)](https://www.nps.gov/thro/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: January 26, 2025.
- **voya-hours** — [Operating Hours & Seasons - Voyageurs National Park (U.S. National Park Service)](https://www.nps.gov/voya/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: September 9, 2026.
- **voya-directions** — [Directions - Voyageurs National Park (U.S. National Park Service)](https://www.nps.gov/voya/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: August 12, 2024.
- **whsa-hours** — [Operating Hours & Seasons - White Sands National Park (U.S. National Park Service)](https://www.nps.gov/whsa/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: June 26, 2025.
- **whsa-weather** — [Weather - White Sands National Park (U.S. National Park Service)](https://www.nps.gov/whsa/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: January 30, 2024.
- **wica-hours** — [Operating Hours & Seasons - Wind Cave National Park (U.S. National Park Service)](https://www.nps.gov/wica/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: January 18, 2026.
- **wica-weather** — [Weather - Wind Cave National Park (U.S. National Park Service)](https://www.nps.gov/wica/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: January 18, 2026.
- **yose-hours** — [Operating Hours & Seasons - Yosemite National Park (U.S. National Park Service)](https://www.nps.gov/yose/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: May 26, 2026.
- **yose-weather** — [Weather - Yosemite National Park (U.S. National Park Service)](https://www.nps.gov/yose/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: October 20, 2024.
- **yose-roads** — [Tioga and Glacier Point Roads Plowing and Road Opening Update - Yosemite National Park (U.S. National Park Service)](https://www.nps.gov/yose/planyourvisit/tioga.htm); U.S. National Park Service; official_planning_page; source update: May 13, 2026.
- **zion-hours** — [Operating Hours & Seasons - Zion National Park (U.S. National Park Service)](https://www.nps.gov/zion/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: September 16, 2026.
- **zion-seasons** — [Spring, Summer, Fall, and Winter - Zion National Park (U.S. National Park Service)](https://www.nps.gov/zion/planyourvisit/seasons.htm); U.S. National Park Service; official_planning_page; source update: July 27, 2024.
- **kefj-weather** — [Weather - Kenai Fjords National Park (U.S. National Park Service)](https://www.nps.gov/kefj/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: March 26, 2025.
- **gaar-weather** — [Weather - Gates Of The Arctic National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/gaar/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: November 15, 2022.
- **katm-hours** — [Operating Hours & Seasons - Katmai National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/katm/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: September 28, 2020.
- **gumo-directions** — [Directions - Guadalupe Mountains National Park (U.S. National Park Service)](https://www.nps.gov/gumo/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: March 23, 2023.
- **arch-directions** — [Directions - Arches National Park (U.S. National Park Service)](https://www.nps.gov/arch/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: April 18, 2025.
- **cany-directions** — [Directions - Canyonlands National Park (U.S. National Park Service)](https://www.nps.gov/cany/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: May 29, 2025.
- **dena-hours** — [Operating Hours & Seasons - Denali National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/dena/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: January 29, 2025.
- **dena-climate** — [Weather and Climate - Denali National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/dena/learn/nature/climate.htm); U.S. National Park Service; official_climate_description; source update: January 30, 2025.
- **dena-directions** — [Directions & Transportation - Denali National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/dena/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: October 31, 2024.
- **dena-roads** — [Current Conditions - Denali National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/dena/planyourvisit/conditions.htm); U.S. National Park Service; official_planning_page; source update: October 19, 2026.
- **gaar-hours** — [Operating Hours & Seasons - Gates Of The Arctic National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/gaar/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: July 10, 2026.
- **gaar-directions** — [Directions - Gates Of The Arctic National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/gaar/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: June 20, 2022.
- **glba-weather** — [Weather - Glacier Bay National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/glba/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: September 22, 2026.
- **glba-directions** — [Directions - Glacier Bay National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/glba/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: December 17, 2025.
- **glba-hours** — [Operating Hours & Seasons - Glacier Bay National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/glba/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: May 18, 2026.
- **katm-weather** — [Weather - Katmai National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/katm/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: April 1, 2026.
- **katm-directions** — [Directions and Transportation - Katmai National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/katm/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: October 28, 2026.
- **kefj-hours** — [Operating Hours & Seasons - Kenai Fjords National Park (U.S. National Park Service)](https://www.nps.gov/kefj/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: April 29, 2026.
- **kefj-directions** — [Directions - Kenai Fjords National Park (U.S. National Park Service)](https://www.nps.gov/kefj/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: August 24, 2026.
- **kova-weather** — [Weather - Kobuk Valley National Park (U.S. National Park Service)](https://www.nps.gov/kova/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: August 9, 2024.
- **kova-directions** — [Directions - Kobuk Valley National Park (U.S. National Park Service)](https://www.nps.gov/kova/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: October 1, 2024.
- **lacl-hours** — [Operating Hours and Seasons - Lake Clark National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/lacl/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: October 16, 2023.
- **lacl-weather** — [Weather - Lake Clark National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/lacl/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: May 11, 2020.
- **lacl-directions** — [Directions - Lake Clark National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/lacl/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: June 29, 2026.
- **wrst-hours** — [Operating Hours & Seasons - Wrangell - St Elias National Park & Preserve (U.S. National Park Service)](https://www.nps.gov/wrst/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: April 24, 2026.
- **hale-hours** — [Operating Hours & Seasons - Haleakalā National Park (U.S. National Park Service)](https://www.nps.gov/hale/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: May 7, 2026.
- **hale-weather** — [Weather - Haleakalā National Park (U.S. National Park Service)](https://www.nps.gov/hale/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: January 30, 2023.
- **hale-directions** — [Directions - Haleakalā National Park (U.S. National Park Service)](https://www.nps.gov/hale/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: July 27, 2022.
- **havo-hours** — [Operating Hours & Seasons - Hawaiʻi Volcanoes National Park (U.S. National Park Service)](https://www.nps.gov/havo/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: February 20, 2025.
- **havo-weather** — [Weather and Climate - Hawaiʻi Volcanoes National Park (U.S. National Park Service)](https://www.nps.gov/havo/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: April 7, 2025.
- **havo-directions** — [Directions - Hawaiʻi Volcanoes National Park (U.S. National Park Service)](https://www.nps.gov/havo/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: February 20, 2025.
- **npsa-guide** — [Visitor Guide, National Park of American Samoa, Volume 1](https://www.nps.gov/npsa/planyourvisit/upload/NPSA-Visitor-Guide.pdf); U.S. National Park Service; official_visitor_guide; source update: not established.
- **npsa-weather** — [Weather - National Park of American Samoa  (U.S. National Park Service)](https://www.nps.gov/npsa/planyourvisit/weather.htm); U.S. National Park Service; official_climate_description; source update: September 28, 2024.
- **npsa-basic** — [Basic Information - National Park of American Samoa  (U.S. National Park Service)](https://www.nps.gov/npsa/planyourvisit/basicinfo.htm); U.S. National Park Service; official_planning_page; source update: September 30, 2024.
- **viis-hours** — [Operating Hours & Seasons - Virgin Islands National Park (U.S. National Park Service)](https://www.nps.gov/viis/planyourvisit/hours.htm); U.S. National Park Service; official_planning_page; source update: December 6, 2024.
- **viis-climate** — [Weather - Virgin Islands National Park (U.S. National Park Service)](https://www.nps.gov/viis/learn/nature/weather.htm); U.S. National Park Service; official_climate_description; source update: September 8, 2022.
- **viis-directions** — [Directions - Virgin Islands National Park (U.S. National Park Service)](https://www.nps.gov/viis/planyourvisit/directions.htm); U.S. National Park Service; official_planning_page; source update: March 21, 2022.
- **jotr-basic6** — [Basic Information - Joshua Tree National Park (U.S. National Park Service)](https://www.nps.gov/jotr/planyourvisit/basicinfo.htm); U.S. National Park Service; official_planning_page; source update: February 10, 2025.
- **maca-basic6** — [Basic Information - Mammoth Cave National Park (U.S. National Park Service)](https://www.nps.gov/maca/planyourvisit/basicinfo.htm); U.S. National Park Service; official_planning_page; source update: March 23, 2023.
- **acad-monthly-visits** — [Recreation Visits by Month Acadia NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=ACAD&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **arch-monthly-visits** — [Recreation Visits by Month Arches NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=ARCH&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **badl-monthly-visits** — [Recreation Visits by Month Badlands NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=BADL&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **bibe-monthly-visits** — [Recreation Visits by Month Big Bend NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=BIBE&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **bisc-monthly-visits** — [Recreation Visits by Month Biscayne NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=BISC&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **blca-monthly-visits** — [Recreation Visits by Month Black Canyon of the Gunnison NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=BLCA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **brca-monthly-visits** — [Recreation Visits by Month Bryce Canyon NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=BRCA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **cany-monthly-visits** — [Recreation Visits by Month Canyonlands NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CANY&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **care-monthly-visits** — [Recreation Visits by Month Capitol Reef NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CARE&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **cave-monthly-visits** — [Recreation Visits by Month Carlsbad Caverns NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CAVE&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **chis-monthly-visits** — [Recreation Visits by Month Channel Islands NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CHIS&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **chir-monthly-visits** — [Recreation Visits by Month Chiricahua NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CHIR&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **cong-monthly-visits** — [Recreation Visits by Month Congaree NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CONG&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **crla-monthly-visits** — [Recreation Visits by Month Crater Lake NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CRLA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **cuva-monthly-visits** — [Recreation Visits by Month Cuyahoga Valley NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=CUVA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **deva-monthly-visits** — [Recreation Visits by Month Death Valley NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=DEVA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **drto-monthly-visits** — [Recreation Visits by Month Dry Tortugas NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=DRTO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **ever-monthly-visits** — [Recreation Visits by Month Everglades NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=EVER&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **jeff-monthly-visits** — [Recreation Visits by Month Gateway Arch NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=JEFF&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **glac-monthly-visits** — [Recreation Visits by Month Glacier NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GLAC&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **grca-monthly-visits** — [Recreation Visits by Month Grand Canyon NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GRCA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **grte-monthly-visits** — [Recreation Visits by Month Grand Teton NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GRTE&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **grba-monthly-visits** — [Recreation Visits by Month Great Basin NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GRBA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **grsa-monthly-visits** — [Recreation Visits by Month Great Sand Dunes NP & PRES](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GRSA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **grsm-monthly-visits** — [Recreation Visits by Month Great Smoky Mountains NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GRSM&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **gumo-monthly-visits** — [Recreation Visits by Month Guadalupe Mountains NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GUMO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **hosp-monthly-visits** — [Recreation Visits by Month Hot Springs NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=HOSP&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **indu-monthly-visits** — [Recreation Visits by Month Indiana Dunes NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=INDU&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **isro-monthly-visits** — [Recreation Visits by Month Isle Royale NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=ISRO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **jotr-monthly-visits** — [Recreation Visits by Month Joshua Tree NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=JOTR&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **kica-monthly-visits** — [Recreation Visits by Month Kings Canyon NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=KICA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **lavo-monthly-visits** — [Recreation Visits by Month Lassen Volcanic NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=LAVO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **maca-monthly-visits** — [Recreation Visits by Month Mammoth Cave NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=MACA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **meve-monthly-visits** — [Recreation Visits by Month Mesa Verde NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=MEVE&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **mora-monthly-visits** — [Recreation Visits by Month Mount Rainier NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=MORA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **neri-monthly-visits** — [Recreation Visits by Month New River Gorge NP & PRES](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=NERI&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **noca-monthly-visits** — [Recreation Visits by Month North Cascades NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=NOCA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **olym-monthly-visits** — [Recreation Visits by Month Olympic NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=OLYM&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **pefo-monthly-visits** — [Recreation Visits by Month Petrified Forest NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=PEFO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **pinn-monthly-visits** — [Recreation Visits by Month Pinnacles NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=PINN&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **redw-monthly-visits** — [Recreation Visits by Month Redwood NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=REDW&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **romo-monthly-visits** — [Recreation Visits by Month Rocky Mountain NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=ROMO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **sagu-monthly-visits** — [Recreation Visits by Month Saguaro NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=SAGU&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **sequ-monthly-visits** — [Recreation Visits by Month Sequoia NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=SEQU&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **shen-monthly-visits** — [Recreation Visits by Month Shenandoah NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=SHEN&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **thro-monthly-visits** — [Recreation Visits by Month Theodore Roosevelt NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=THRO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **voya-monthly-visits** — [Recreation Visits by Month Voyageurs NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=VOYA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **whsa-monthly-visits** — [Recreation Visits by Month White Sands NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=WHSA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **wica-monthly-visits** — [Recreation Visits by Month Wind Cave NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=WICA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **yell-monthly-visits** — [Recreation Visits by Month Yellowstone NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=YELL&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **yose-monthly-visits** — [Recreation Visits by Month Yosemite NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=YOSE&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **zion-monthly-visits** — [Recreation Visits by Month Zion NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=ZION&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **dena-monthly-visits** — [Recreation Visits by Month Denali NP & PRES](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=DENA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **gaar-monthly-visits** — [Recreation Visits by Month Gates of the Arctic NP & PRES](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GAAR&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **glba-monthly-visits** — [Recreation Visits by Month Glacier Bay NP & PRES](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=GLBA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **katm-monthly-visits** — [Recreation Visits by Month Katmai NP & PRES](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=KATM&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **kefj-monthly-visits** — [Recreation Visits by Month Kenai Fjords NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=KEFJ&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **kova-monthly-visits** — [Recreation Visits by Month Kobuk Valley NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=KOVA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **lacl-monthly-visits** — [Recreation Visits by Month Lake Clark NP & PRES](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=LACL&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **wrst-monthly-visits** — [Recreation Visits by Month Wrangell-St. Elias NP & PRES](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=WRST&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **hale-monthly-visits** — [Recreation Visits by Month Haleakala NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=HALE&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **havo-monthly-visits** — [Recreation Visits by Month Hawaii Volcanoes NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=HAVO&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **npsa-monthly-visits** — [Recreation Visits by Month National Park of American Samoa](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=NPSA&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
- **viis-monthly-visits** — [Recreation Visits by Month Virgin Islands NP](https://irma.nps.gov/Stats/MvcReportViewer.aspx?Park=VIIS&_15=True&_16=True&_18=True&_19=True&_34=False&_35=False&_39=880px&_id=6808e869-492e-4a08-b772-0d2e5177a9f4&_m=Remote&_r=%2FIRMA+Prod%2FSTATS%2FPark+Specific+Reports%2FRecreation+Visitors+By+Month+%281979+-+Last+Calendar+Year%29); NPS Visitor Use Statistics; official_measured_recreation_visits; source update: not established; observed years 2023, 2024, 2025.
