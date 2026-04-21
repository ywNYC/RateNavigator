# Rate Navigator — Bloomberg × Monocle Edition

## Aesthetic
Financial print magazine look:
- **Palette**: paperwhite `#F5F1E8` default · newsprint `#ECE3D0` · mist `#E4E6E2` · near-black ink `#1A1611`
  - 墨绿 ink-green `#2F5D3C` — savings / positive / ARM
  - 铁锈红 rust-red `#8B3A2B` — overpay / warning
  - 威士忌金 whiskey gold `#9B7A3A` — caveats
  - ink-navy `#2F4A5C` — fixed rate
  - muted plum `#5C4775` — refinance / income
- **Typography**: Fraunces serif (headlines, large numbers, italics) · Noto Sans SC (Chinese body) · JetBrains Mono (tabular data)
- **Layout**: 0.5px ink hairlines, flat square corners, no shadows, paper-grain dot texture behind everything

## Quick restore
Upload this zip, tell Claude:
```
Restore from rate-navigator.jsx. This is my Bloomberg × Monocle themed Rate Navigator.
Copy it to /home/claude/v2/rate-navigator.jsx. Build: cd /home/claude/v2 && bash build.sh.
```

## Build
```
bash build.sh
# outputs dist/index.html (single-file UMD bundle, ready to upload to Cloudflare Pages)
```

## File structure
- `rate-navigator.jsx` — 4500-line React source (single file)
- `index.html` — pre-built UMD bundle (drop straight into Cloudflare Pages)
- `build.sh` — bash script that converts JSX → UMD HTML
- `RESTORE.md` — this file

## Tools
1. **月供估算** (Mortgage Estimator) — MGIC PMI, 17 states / 74 counties property tax, A/B/C compare, interactive magazine report
2. **ARM vs Fixed** — 8 rate scenarios, interactive chart, magazine report
3. **Points Comparison** — break-even, multi-scenario, APR, magazine report
4. **Refinance Analysis** — CEMA / NY mortgage tax, magazine report
5. **1031 Exchange** — dual-state CG tax, depreciation recapture, §121 stacking, magazine report

## Current feature set (reverse chronological)

### MortgageEstimator
- **HERO A/B/C toggle** in magazine report — switches the big payment + 2×2 stat grid + breakdown between scenarios A/B/C, colored to match
- **Rate sensitivity table** (5-column: rate · pmt · pt-cost · Δ/mo · break-even) — buy-down rows show point cost + savings + break-even years
- **Compare diff column** + percent column in both main compare table and report table; 6 directional permutations (A−B, B−A, A−C, C−A, B−C, C−B); rate row has noPct flag
- **Default compareMode=ON** with 3 prefilled scenarios: $859k/10%/5.800%, $859k/20%/5.800%, $859k/20%/5.525%/1pt
- **Scenario drag-reorder** — long-press ⠿ handle (350ms), ghost card follows finger, swap with A, pulse-hint animation on first render, haptic + toast on drop
- **Utility defaults by property type** — sfh $300 · townhouse $250 · condo $150 · coop $0; `utilityUserSet` flag prevents override after manual drag
- **Optional closing cost toggles** — escrow (locked on if LTV>80%), owner's title insurance, home inspection; "(省 $X,XXX)" display when off
- **Compact fine-tune panel** — collapsible with tight spacing

### All 5 reports — unified Magazine Brief template
Masthead (Vol. I · JMJ + title + PDF/Copy/✕) → HEADLINE (Fraunces italic) → HERO 2-column → Comparison/Sensitivity tables → Key Metrics → State/Tax Notes → Italic Recommendation → Footer

### Global
- `SettingsContext` — theme + lang share across all 5 tools
- 3 theme swatches: paperwhite (default) · newsprint · mist — persist via localStorage `rn_theme`
- CN/EN toggle — persist
- Glossary sections default collapsed
- Added: Discount Points glossary entry (mortgage), NIIT entry (1031 exchange)

## Key architecture notes
- Build script greps for `} from "recharts";` — preserve recharts import formatting on exactly 5 lines
- MortgageEstimator useState order: homePrice, downPct, rate, termYears, propType, state, locationPreset, customTaxRate, creditScore, hoaOverride, insOverride, utilityMonthly, utilityUserSet, showReport, points, compareMode, scenarios, diffPair, closingOverrides, closingExpanded, includeEscrow, includeOwnerTitle, includeInspection, reportClosingExpanded, reportDiffPair, heroView, dragSrc, dragTarget, dragPos, ghostCard, recentSwap
- All themes use CSS variables via `C.paper`, `C.ink`, etc. — do not concatenate hex alpha suffixes
- `@keyframes swapToast` + `@keyframes dragHandleHint` injected inline in MortgageEstimator render
