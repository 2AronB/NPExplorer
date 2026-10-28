# Optimizer performance baseline

Measured 2026-10-28 against integrated main commit `90b11f6a41bc6a3f14870cac4fe2a18446c6697f`. That base includes morning exploration/afternoon driving, fixed-date personal visits, seasonal research and informational booking flags.

## What changed

The search revisits the same dates millions of times. A Node CPU profile of the mixed twelve-month case attributed about 41% of sampled time to `iso` and 31% to regional `inWindow`, both repeatedly formatting dates. This profile is diagnostic, not a separate speed benchmark.

The runtime change is deliberately small:

- Memoize UTC date labels by the Date's exact millisecond timestamp, with a maximum of 4,096 entries per module/worker and a clear on capacity.
- Use that same helper for regional annual-window comparisons instead of formatting dates again.

Date object identity is not used because Date instances are mutable. Editable park scores, priorities, closures and access windows are not cached by this change. There are no new settings or output fields, fewer search candidates, early exits, shorter stays or changes to arithmetic/order/scoring. Search call counts remain available for comparison.

## Reproduce

Node 24, Git and the checked-out repository are sufficient. No packages or network services are needed. From the repository root:

```text
node scripts/optimizer-benchmark.mjs --compare 90b11f6 --runs 3 --output benchmark-results.json
```

Or run `npm run benchmark -- --compare 90b11f6 --runs 3`. The baseline commit must be available locally. A quick smoke comparison is:

```text
node scripts/optimizer-benchmark.mjs --cases mainland-single,alaska-compare --compare 90b11f6 --runs 1
```

The default cases are:

The three-run paired comparison takes longer than an interactive calculation, especially when it also runs the slower baseline. Use the smaller `--cases` / `--runs 1` command above during iteration.

| Case | Scope |
| --- | --- |
| mainland-single | Ten mainland parks, including Yellowstone/Gateway Arch and Colorado/Utah |
| alaska-compare | All eight Alaska parks, driving versus flying, all default departure airports |
| mixed-single | Mainland parks, Alaska, Hawaii, Virgin Islands and a fixed-date personal visit |
| all-parks-single | All 64 parks, Comfortable Exploration, all 23 default departure airports |
| mainland-monthly | Twelve independent full searches for the ten-park mainland case |
| mixed-monthly | Twelve independent full searches for the mixed case |

All cases use round-trip Colorado Springs defaults, an April 1, 2040 saved departure, seasonal objective, 15% seasonal distance allowance, 24 rest days, shared driving/exploration and a 365-day reporting target. The mixed case's four-day personal visit starts August 15, 2040. The original fixed-date contract remains in force. Runtime inventory/default priorities are loaded from each version being compared; differing input hashes fail the comparison rather than silently comparing different problems.

An all-park monthly case is available only by explicitly selecting `--cases all-parks-monthly`. It is not part of the routine default suite, and it was not used for these measurements.

## Method and quality checks

Every timing sample runs in a fresh Node subprocess with fresh module caches, starting the timer after fixture/module loading and stopping immediately after `optimizeTrip`. Baseline/current ordering alternates between samples. Report and invariant checks run after the timer. Median/min/max or individual samples should be considered together; timings are hardware-, runtime- and load-dependent and are not browser latency guarantees.

The harness creates task-owned temporary source snapshots from the baseline Git revision and current tracked runtime sources, then removes them. It does not change the checkout, index or branches. Counters are injected into separate temporary snapshots, outside the timed runs, so production has no instrumentation overhead.

It records:

- Exact input and complete-result SHA-256 hashes, including all month results, calendars, road-day ledgers, regional access dates, scores and appointment reporting.
- Schedule, travel, closure-check, excursion and excursion-cache-hit counts.
- Score, mileage, trip/exploration days, seasonal quality, waits and appointment conflicts.

All repeated current runs and every baseline result must have identical complete-result hashes. Instrumented runs must also match. The harness additionally checks requested exploration, route uniqueness, seasonal distance budgets, road mileage reconciliation, per-date activity/driving limits, report day/exploration totals, contiguous/nonoverlapping report allocations and consistency of the winning departure month.

This establishes unchanged results on a representative corpus, not global route optimality or verified travel estimates. Small-route/order and calendar-specific correctness tests remain in the normal test suite. Future heuristic changes that intentionally improve results need a separate quality comparison rather than weakening the exact-result gate.

## Measurements

win32, v24.22.1, AMD Ryzen 5 7235HS                             . Three fresh-process samples per version/case; medians shown. All-park baseline samples: 35.24, 34.48, 28.53 seconds; improved samples: 10.93, 10.43, 8.53 seconds. Variation is why a single timing is not used as the final claim.

| Case | Baseline median (s) | Improved median (s) | Less time |
| --- | ---: | ---: | ---: |
| mainland-single | 0.083 | 0.045 | 45.5% |
| alaska-compare | 0.053 | 0.026 | 50.8% |
| mixed-single | 0.812 | 0.311 | 61.7% |
| all-parks-single | 34.475 | 10.425 | 69.8% |
| mainland-monthly | 0.635 | 0.276 | 56.4% |
| mixed-monthly | 16.498 | 3.505 | 78.8% |

The following counts and complete-result hashes are identical between versions. Each twelve-month hash covers all twelve candidates as well as the selected result.

| Case | Schedules | Travel calls | Closure checks | Excursion calls | Excursion cache hits | Result SHA-256 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| mainland-single | 418 | 20548 | 61053 | 0 | 0 | d05fbcb0129d8b698964068fdc1a7f56390898e85bffb036eac22cf3508e0c9a |
| alaska-compare | 74 | 250 | 17640 | 74 | 50 | 6cbe1cbea459e9f5a43e92ff7ca9638d466f316975e91c3b31ad334c11aaf8dd |
| mixed-single | 1656 | 16811 | 327941 | 4387 | 3755 | 399d020ac3debe0ca23629f89ea394c3aa1ff360502bdbc16638c89d06acc276 |
| all-parks-single | 23183 | 2137083 | 18206833 | 54999 | 48346 | 2027b85226fc94f97285c26a4fc6153552a3725aa506ecbcf8f576df14d9a1fc |
| mainland-monthly | 3930 | 190080 | 572847 | 0 | 0 | e375fe0783c67fae87b028db30fad1136ad4374ad5d460935f9a17d19446967f |
| mixed-monthly | 20191 | 212384 | 7307160 | 52770 | 42502 | 9b94448ad954a7556445e5da4a1b5898a4511813c6f5a1f51877a638e9ea8160 |

## Validation and limits

The normal suite exercises date mutation, leap days, timezone boundaries, invalid dates and cache turnover, alongside the existing calendar, appointment, season, remote and export tests. Build tests ensure the benchmark script, documentation, raw timing output and CPU profiles are excluded from the website artifact.

Validation for this change: all 92 tests pass, the 31-file production build passes, and the built browser worker completes an all-64-parks Comfortable Exploration trip with 238 requested exploration days, 367 allocated calendar days and about 19,982 road miles. The browser reports no warning/error logs. Browser completion is a smoke check; the paired timings above measure Node computation, not browser latency.

The algorithm still performs a full independent search for each requested departure month. This change does not add optional stay extensions or a new search dimension. Keep future performance work tied to this baseline: first remove equivalent repeated work; then deliberately decide whether saved time should reduce latency or fund a bounded quality improvement.
