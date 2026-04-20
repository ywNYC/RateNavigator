# Changelog

All notable changes to Rate Navigator. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versioning is informal.

## [3.0.0] — 2026-04-20

Initial public release.

### Architecture

- Single-file JSX source that builds to a single-file HTML artifact.
- Five tools: Mortgage Estimator, ARM Navigator, Points Analyzer, Refi
  Analyzer, 1031 Exchange Analyzer.
- Bilingual (中文 / English) throughout.

### Mortgage Estimator — highlights

- **Drag-to-reorder A/B/C scenarios** with per-scenario price, down %, rate,
  points.
- **Editable TILA-RESPA Loan Estimate** — every line item in Sections A–H is
  user-editable, with optional-item toggles (escrow, owner's title, inspection).
- **Per-scenario LE state** — changing B's title insurance doesn't affect A's.
- **True APR via Reg Z finance charges** — points + origination + application
  + credit + lender's title + MRT + prepaid interest → solve APR via
  bisection so `PMT(r, 360, amtFinanced) = PMT(noteRate, 360, loan)`.
- **Rate-sensitivity buy-down table** — scenario-aware, shows break-even
  months for −0.125 / −0.25 / −0.5 rate cuts.
- **Magazine-style analysis report** with kicker / headline / standfirst
  layout, donut breakdown, scenario comparison table, DTI insight footer.

### NYC / NY State tax logic

- Mortgage Recording Tax (1.8 / 1.925% tiers, $30 credit, co-op exemption).
- Mansion Tax (progressive NYC / flat 1% NY state).
- CEMA awareness for refinances.

### PMI

- FICO × LTV rate matrix (620–760+, 80% → 97% LTV).
- Auto-cancellation modeling at 78% LTV per HPA.

### UI

- Bloomberg × Monocle inspired palette (paper #F5F1E8, arm green, navy fixed,
  whisky warn, oxblood danger).
- Fraunces serif for headlines, Noto Sans SC for Chinese body, JetBrains Mono
  for numerics.
- Mobile-first layout with compact information density.
