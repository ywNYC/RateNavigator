# Rate Navigator · 利率导航

A self-contained, single-file React application for navigating U.S. residential
mortgages — with a strong bias toward the NY/NJ/PA/CT market. Originally built
as a field tool for an MLO (Mortgage Loan Officer), now shared for anyone
evaluating a home purchase, refinance, or investment property.

No backend. No build step for users — just open `dist/index.html`.

---

## What's in it

Five calculators packaged as a single app:

| Tool | 中文名 | What it does |
|---|---|---|
| **Mortgage Estimator** | 月供估算 | A/B/C scenario comparison · editable TILA-RESPA Loan Estimate line items · true APR with Reg Z finance charges · rate-sensitivity buy-down table · magazine-style analysis report |
| **ARM Navigator** | 可调利率导航 | 5/1, 7/1, 10/1 ARM payment paths · cap structure (initial/periodic/lifetime) · break-even vs fixed · worst-case scenario modeling |
| **Points Analyzer** | 买点分析 | Discount-point break-even · APR delta · total cost comparison across hold periods |
| **Refi Analyzer** | 再融资分析 | Cash-out refi modeling · NY CEMA savings (avoids paying MRT on existing balance) · break-even with closing costs rolled in |
| **1031 Exchange** | 1031 交换 | §1031 like-kind exchange analyzer · §121 primary-residence exclusion stacking · boot detection · §1250 depreciation recapture |

Plus state-specific tax logic that most generic calculators skip:

- **NYC Mortgage Recording Tax** (1.8% under $500K loan / 1.925% over) — with the $30 credit
- **NY State Mansion Tax** (progressive 1% → 3.9% on purchase ≥ $1M in NYC, flat 1% elsewhere)
- **Co-op exemptions** (no MRT because a co-op isn't real property)
- **CA documentary transfer tax** placeholder
- **PMI auto-cancellation** at 78% LTV per HPA (Homeowners Protection Act)
- **Credit-score × LTV PMI rate matrix** (620–760+, 80% to 97% LTV)
- **FICO-indexed PMI rates** (not a flat 0.5% like most web calculators show)

---

## Quick start

**Option A — just open it.** `dist/index.html` is a self-contained, 353 KB
HTML file. Double-click it in a file browser and the app runs. No server,
no npm, no git required.

**Option B — rebuild from source.**

```bash
bash scripts/build.sh         # produces dist/index.html
open dist/index.html          # or any static server pointing at dist/
```

The built file includes React + Recharts + Babel from CDN, and runs offline
after first load (browser caches the CDN assets).

If you want a local server instead of `file://`:

```bash
npm run serve                 # serves dist/ at http://localhost:8080
```

### Deploy to GitHub

No editing required. Three clicks:

1. Create a new empty repo at <https://github.com/new> — name it whatever
   you like (e.g. `ratenavigator`). **Do not** initialize it with a README.
2. On the new repo page, click **"uploading an existing file"** (or
   **Add file → Upload files**).
3. Drag this entire folder onto the page. Commit.

The included `.github/workflows/` will run automatically on every push:

- **ci.yml** — syntax-checks, builds, runs smoke tests.
- **deploy.yml** — deploys `dist/index.html` to GitHub Pages.

To enable the live site: in your repo, go to **Settings → Pages → Source:
GitHub Actions**. Your site will be at
`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/` within a minute of the
next push.

---

## Development

The entire app lives in one file: [`src/rate-navigator.jsx`](src/rate-navigator.jsx)
(~4,500 lines). Everything — palette, fonts, glossary data, PMI rate matrix,
per-state tax logic, all five tool components — is inline.

### Why single-file?

Because the deliverable is a single HTML file that a mortgage broker can email
to a client. No hosting, no build pipeline for the end user, no framework
updates to worry about. The trade-off is a long file; the benefit is a stable,
portable artifact that works in 2026 and will still work in 2036.

### Install dev dependencies

```bash
npm install                   # installs @babel/standalone, jsdom, react, react-dom
```

Only needed for the syntax check and smoke test. The build itself uses `bash`
+ `sed` and has zero Node dependencies.

### Make a change

```bash
# 1. Edit src/rate-navigator.jsx
# 2. Syntax-check (fast — ~1 sec)
npm run check
# 3. Build
npm run build
# 4. Smoke-test (renders each tool via jsdom + react-dom/server)
npm run smoke-test
# or do all three at once:
npm test
```

### Repository layout

```
ratenavigator/
├── src/
│   └── rate-navigator.jsx        ← the entire app (~4,500 lines)
├── dist/
│   └── index.html                ← built artifact (checked in for convenience)
├── scripts/
│   ├── build.sh                  ← JSX → single-file HTML (bash + sed)
│   ├── check.js                  ← Babel-based syntax check
│   ├── smoke-test.js             ← renders every tool via jsdom
│   └── serve.sh                  ← local dev server
├── .github/
│   └── workflows/
│       └── ci.yml                ← GitHub Actions: check + build + smoke
├── package.json
├── LICENSE                       ← MIT
└── README.md
```

### Design system

Magazine-style, Bloomberg × Monocle inspired.

| Color | Hex | Used for |
|---|---|---|
| `paper` | `#F5F1E8` | Page background |
| `ink` | `#2A2522` | Primary text |
| `arm` | `#2F5D3C` | ARM / scenario A (deep green) |
| `fixed` | `#2F4A5C` | Fixed-rate / scenario B (navy) |
| `warn` | `#9B7A3A` | Scenario C / warnings (whisky gold) |
| `danger` | `#8B3A2B` | Negative deltas (oxblood) |
| `purple` | `#5C4775` | Income / secondary highlights |

Fonts: [Fraunces](https://fonts.google.com/specimen/Fraunces) for serifs,
[Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC) for
Chinese body text, [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
for all numeric columns.

---

## Architecture notes

### State flow in `MortgageEstimator`

The mortgage tool is the most complex. A few anchors if you're diving in:

- **`scenarios`** — array of 0–2 entries; combined with the implicit "scenario A"
  from the top-level state to form A/B/C. Drag-reorder swaps entries.
- **`closingOverridesMap`** — `{ 0: {...}, 1: {...}, 2: {...} }` — each scenario
  gets its own set of per-line LE overrides. Changing B's title insurance does
  not affect A's.
- **`makeClosingItemsRaw(price, loan, points, rate, insMonthly, taxMonthly, ltv)`** —
  pure function that produces a fresh LE for any scenario. Used both for A
  (top-level state) and B/C (via `calcScenarioAligned(..., idx)`).
- **`heroView`** — integer 0/1/2 controlling which scenario the big number
  shows. Shared between the main screen and the report, so selecting B on the
  main screen means the report opens with B highlighted.
- **`closingModalIdx`** — `null` when closed, else `0/1/2` indicating which
  scenario's LE the modal is editing.

### True APR (Reg Z)

APR is computed by taking the 7 TILA finance charges (points, origination,
application, credit report, lender's title, MRT, prepaid interest — everything
paid to get the loan, excluding third-party costs the borrower would pay
anyway), subtracting them from loan principal to get "amount financed", and
solving via bisection for the rate `r` such that
`PMT(r, 360, amountFinanced) = PMT(noteRate, 360, loan)`.

The math matches what a lender's TILA disclosure would show within rounding.

---

## Contributing

This is a personal tool shared publicly, not an active OSS project. Bug
reports and PRs for math errors (especially state-specific tax formulas)
are very welcome. Feature requests: probably declined — the scope is
deliberately fixed.

If you're building something similar, feel free to fork.

---

## Disclaimer

**For informational purposes only. Not financial, legal, or tax advice.**

This tool's outputs are estimates. Actual mortgage offers, closing costs, and
tax liabilities vary by lender, jurisdiction, and personal circumstances.
Always consult a licensed MLO, attorney, and CPA before making decisions
involving six-figure commitments.

Particular caveats:

- PMI rates vary significantly between MI providers; the matrix here is a
  reasonable industry average.
- Property tax effective rates differ by municipality within a state —
  Westchester ≠ Nassau ≠ Albany even though all are "NY State".
- §1031 exchange rules are tight (45-day identification, 180-day close, boot
  treatment, related-party rules). Use this as a first-pass sanity check, not
  as authorization to proceed.

---

## License

MIT — see [LICENSE](LICENSE).

Built by JMJ.
