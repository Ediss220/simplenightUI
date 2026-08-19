# Simplenight UI Automation

Playwright + TypeScript test-automation framework for the Simplenight booking
flow, built against the public staging environment
(`https://wl.stg.simplenight.com`).

The covered journey mirrors the Lead QA assignment:

1. Open the staging homepage.
2. Select the **Hotels** category from the navbar.
3. Search **Miami**, **Aug 1–3** (next bookable August), **1 Adult + 1 Child (age 8)**.
4. Switch the results to **Map view**.
5. Apply left-panel filters: **Price Range** min **100** (max is the open-ended
   **1000+** cap) and **Guest Score “Very Good”**.
6. **Zoom in** on the map until a single hotel pin remains and select it.
7. Validate the selected hotel's card: **total price** and **guest score** sit
   within the filtered parameters.

The framework is category-ready: navbar selection is data-driven and the search
widget is a reusable page object, so automating another category means adding a
page object plus data — not new orchestration logic.

## Repository layout

```
├── playwright.config.ts        # runners, browsers, timeouts, artifacts
├── .env.example                # environment variable template
├── src/
│   ├── config/
│   │   ├── env.ts              # execution params (env presets, base URL)
│   │   ├── locale.ts           # pinned locale shared by config and pages
│   │   └── timing.ts           # per-wait timeout overrides (single source)
│   ├── data/
│   │   └── booking.data.ts     # all business inputs: location, dates, guests, filters
│   ├── fixtures/
│   │   └── pages.fixture.ts    # page objects injected into every test
│   ├── pages/
│   │   ├── BasePage.ts         # shared dialog/open behaviour
│   │   ├── HomePage.ts         # landing page, data-driven category nav
│   │   ├── HotelsHomePage.ts   # search widget: destination/dates/guests
│   │   ├── SearchResultsPage.ts# filters, view switcher, hotel card
│   │   └── components/
│   │       ├── DatePickerDialog.ts    # range calendar (year hops, range re-anchoring)
│   │       ├── GuestSelectorDialog.ts # room occupancy + child-age comboboxes
│   │       ├── MapView.ts             # dual-mode map pins, zoom-to-single, select
│   │       └── HotelCard.ts           # the popup card a selected pin opens
│   └── utils/
│       └── dates.ts            # "next bookable August 1-3", nights math
└── tests/
    ├── homepage.spec.ts        # navbar exposes every booking category
    └── hotel-booking.spec.ts   # the end-to-end journey above (steps 1–7)
```
On failure Playwright keeps a trace, video and screenshots per test under
`test-results/`; inspect one with `npx playwright show-trace <trace.zip>`. Both
artifact folders are removed by `npm run clean`.

## Prerequisites

| Requirement              | Check              | Notes                                          |
| ------------------------ | ------------------ | ---------------------------------------------- |
| **Node.js ≥ 20** (LTS)   | `node --version`   | npm is bundled with Node                        |
| Playwright browser cache | `npx playwright install` | chromium + firefox + webkit, one-time download |

Node.js must be installed **system-wide** before npm will work. Pick whichever
matches your platform:

```bash
# Windows (PowerShell)
winget install OpenJS.NodeJS.LTS

# macOS (Homebrew)
brew install node@22

# Debian/Ubuntu
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs
```

Or use the LTS installer from <https://nodejs.org/en/download>.

## Install

```bash
npm install                    # project dependencies (package-lock pinned)
npx playwright install          # browser binaries (chromium, firefox, webkit)
```

`npx playwright install` downloads all three engine binaries (chromium,
firefox, webkit) into the local Playwright cache (not the repo). On Linux,
CI, or headless servers also run `npx playwright install-deps` for OS
libraries. No accounts or logins are required — the staging site is public
for search.

## Troubleshooting setup

- **`npm: command not found` / `npm : CommandNotFoundException`** — Node.js is
  not installed (or not on `PATH`). Install it (see Prerequisites), then open a
  **new** terminal: running shells do not pick up `PATH` changes.
- **`node`/`npm` installed but still not recognized** — the terminal was opened
  before installation; restart it (or VS Code) so the refreshed `PATH` loads.
- **`Executable doesn't exist ... <browser>`** — browser binaries missing for
  this machine's user; re-run `npx playwright install`.
- **Windows: `npx playwright install-deps` is not needed** — Windows ships the
  required system libraries; the step applies to Linux only.

## Configure

Execution parameters live in `src/config/env.ts` and are read from the
environment (Playwright loads a `.env` file automatically):

| Variable      | Default   | Meaning                                   |
| ------------- | --------- | ----------------------------------------- |
| `SN_ENV`      | `staging` | Named preset from `src/config/env.ts`     |
| `SN_BASE_URL` | —         | Direct URL; overrides `SN_ENV` when set   |

```bash
cp .env.example .env   # then edit if you need another environment
```

Business test data (location, stay dates, guest ages, filter choices) is
separated from the scripts in `src/data/booking.data.ts`; edit it to run the
same flow for another city, date range, or party.

Stay dates are expressed as *month/day intent*: the suite resolves
“August 1–3” to the next August the calendar still accepts (see
`src/utils/dates.ts`), so it keeps running year-round without edits.

## Run

```bash
npm test            # all tests, headless (list + HTML reporter)
npm run test:headed # watch the browser
npm run test:ui     # Playwright UI mode (time-travel debugging)
npm run test:debug  # step-through debugger
npm run report      # open the HTML report from the last run
npm run typecheck   # tsc --noEmit over src, tests and config
npm run clean      # delete run artifacts: test-results/ and playwright-report/
```

Useful narrower invocations:

```bash
npx playwright test tests/hotel-booking.spec.ts        # only the e2e journey
npx playwright test --grep @e2e                        # by tag
npx playwright test --project=chromium --workers=1     # one browser only
npx playwright test --project=firefox                  # or firefox / webkit
```

On failure Playwright keeps a trace, video and screenshots per test under
`test-results/`; inspect one with `npx playwright show-trace <trace.zip>`.

## CI

`.github/workflows/ci.yml` runs the whole suite on every push and pull request
(Ubuntu, chromium + firefox + webkit, `npm ci`, typecheck first, HTML report uploaded on failure).

## Design notes

- **POM with fixtures** — pages and their locators live in `src/pages`; a
  custom fixture (`src/fixtures/pages.fixture.ts`) hands ready-built objects to
  every test, so specs stay orchestration-only.
- **Web-first, no hard-coded sleeps** — every DOM interaction asserts through
  `expect(...)`/auto-waiting locators. The one deliberate exception is the
  Google Map: its pins expose no readable state, so `MapView` polls two
  consecutive identical DOM reads (`expect.poll`) — the map equivalent of a
  web-first wait — and paces wheel input with short fixed gaps (input pacing,
  not synchronization).
- **Single-source constants** — per-wait timeouts live in
  `src/config/timing.ts` and the pinned locale in `src/config/locale.ts`;
  page objects import them instead of inlining magic values.
- **Dual-mode map pins** — the results map renders hotels either as native
  canvas markers or as accessible overlay buttons (aria-labelled with the
  property name). `MapView` collects both, zooms with the mouse wheel anchored
  on a pin (clamped to the canvas), and prefers clicking the accessible button
  when one is present.
- **Price bucket honesty** — the platform snaps the price slider to the nearest
  available price bucket (e.g. a `$100` slider floor applies as `$96`).
  `applyPriceRange` therefore asserts the *slider* reached the requested value
  and returns the *effective* floor, which the test uses for the card check.
- **Deterministic calendar** — Mantine's range picker resolves clicks relative
  to the pre-filled default range; `DatePickerDialog` clicks the check-in twice
  to re-anchor, then the check-out, which collapses any starting state.
