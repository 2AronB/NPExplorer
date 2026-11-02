# Family visit allowances for other NPS inventory records

Reviewed November 1, 2026. The audit covers every one of the **334 non-park records in this application's retained boundary inventory**. It is not a current official list of NPS units or a completeness audit of every US historic site. National park stay presets remain separate.

Each record now has an individually considered fast outing, slow outing, access/family caveat, planning tags, reviewed source URL, source-page update date when stated, and review depth. The full table is available in `data/site-stays.csv`; `data/site-stay-audit.json` is the canonical structured record. The generated browser module and CSV are checked against that JSON by the test suite.

## What the time means

These numbers are editorial starting points for a family US road trip. Fast selects a focused experience; slow adds specifically described trails, interpretation, another district, or time for children and reflection. They do not measure importance or rank cultures, history or landscapes. There is no acreage-to-time formula or universal “impressiveness” score. A compact museum can justify more time than a large preserve's selected roadside outing.

Allowances use quarter exploration-day increments. At the default eight exploration hours per day, 0.25/0.5/0.75 days represent 2/4/6 hours of allowance. Changing exploration hours changes that conversion. They are not official NPS minimums, verified opening-hour fits, or a clock-time itinerary. A fractional allowance can still consume a whole calendar date when sharing with driving is disabled or the activity budget is full. Arbitrary chains of short visits are not packed into a single date.

Road travel is estimated separately. Local boats, security queues, shuttle schedules, boarding cutoffs and waiting are **not** verified transport allocations for these sites. A generous island allowance does not establish a feasible end-to-end excursion. Choose and check the real launch, gateway or trailhead before adopting the calculated dates.

## Evidence depth

`activity-overview` means the official activities or planning overview was read to establish a sensible proposed outing. `access-detail` adds selected official tour, road, eligibility or access checks. Neither label certifies every rule, current opening or future operating season. Exact numerical time judgments remain editorial in both groups. Source update dates and our review date are distinct; an unstated publication date stays unstated. Successful retrieval alone was not treated as a review.

NPS sources are used wherever possible. The Reagan Boyhood Home record uses the current visitor operator's page; it is not presented as an NPS-run tour. Temporary project closures and dated reopening announcements remain “confirm before travel” caveats rather than permanent annual solver constraints. For example, the Carter G. Woodson tour page and reopening material need reconciliation for the intended travel date.

## Important inventory and access findings

- **Hohokam Pima (`pima`)**: NPS states it is not open to the public. The positive duration is a compatibility placeholder, not an on-site itinerary or permission to visit. It is omitted from automatic detours and circle additions. Existing explicit selections remain visible with a warning.
- **National Capital Parks (`naca`)**: an administrative umbrella rather than one visitor destination. Choose a specific component; automatic discovery omits the umbrella.
- **Rainbow Bridge**: no road access. Boats or a permitted long hike and changing shoreline approaches need independent planning.
- **Port Chicago**: active military installation; advance NPS tour arrangements and current clearance, citizenship and ID rules govern access.
- **Oregon Caves**: the reviewed Discovery tour requires a minimum child height and independent walking; children cannot be carried through. Jewel Cave tour types have different stairs, footwear and child-carrying rules.
- **Minuteman Missile**: a Delta-01 tour has explicit child height/age and emergency-ladder ability requirements. The visitor center is a different experience.
- **Saint Croix Island**: the public outing is from the mainland, not a landing on the protected island.
- **Weir Farm**: the visitor parking lot cannot accommodate RVs or other large vehicles.
- **Overlapping records**: the National Mall and individual memorials, Craters monument/preserve, Timucuan/Fort Caroline, and riverway components require distinct outing scopes. Do not sum allowances for one shared experience twice.
- **Long trails, parkways and dispersed parks**: allowances describe a chosen local segment or cluster, not a complete traversal or every district. The retained centroid is not an entrance.

Follow the record's reviewed sources for the actual restrictions; recheck them for the travel year. No background booking, user eligibility decision, automatically enforced tour deadline, or invented future timetable is added.

## Saved plans, preparation and reports

The **All site profiles** view within Along the Way works without a route. It compares the two outing scopes, allows searches across the descriptions, and supports allowance-hour, inventory-state, logistics and selection filters. Fast/slow comparison is independent of the actual route preset: using a guide filter never overwrites an explicit visit duration. Name and outing matches take precedence over incidental caveat mentions in ordinary search ordering. Non-public and umbrella records are available for audit review, while the automatic-candidate filter omits them.

Comfortable Exploration uses slow site allowances; Hit the Highlights uses fast allowances. Uniform-days mode applies to national parks and uses slow site allowances. Explicit per-site durations always win. The detail-panel reset removes only that site's duration override.

Every selected other site has a stable `site:<id>:visit` preparation topic. User statuses and notes remain separate from the source caveats: “Booked” does not make a non-public visit valid or silence access notes. Saving preparation metadata keeps the calculated route. Date-change prompts use actual first exploration, including shared road dates. Deselected records remain available when the destination is reselected.

CSV, XLSX and Calendar retain the site caveats, including visits fully shared with a drive. New Compare snapshots freeze a compact copy of the site research. Historical snapshots without that copy do not silently acquire today's audit facts; their reports identify the missing archived review and require fresh research. The travel ledger still reconciles exploration, calendar days and travel totals.

Calendar concern navigation includes boat, tour, vehicle and restricted-access notes on the visit activities. These cautions do not establish actual operating dates and do not become scheduler closure constraints. A user-entered preparation status cannot remove them.

## Updating the audit

Edit the canonical record, retain exact inventory IDs, and state what each source supports. Keep source facts separate from editorial durations. Then run:

```text
node scripts/build-site-stays.mjs
node --test
node scripts/build-site.mjs
git diff --check
```

The generator preserves the existing first eleven CSV columns and appends scope, caveat, review and provenance fields. It rejects missing IDs, invalid quarter increments, fast values above slow, and unreviewed primary references. Browser tests remain necessary for changed controls and report workflows.
