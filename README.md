# Simplenight UI Automation

Playwright + TypeScript test-automation framework for the Simplenight booking
flows, built against the public staging environment
(`https://wl.stg.simplenight.com`).

Three levels of coverage:

- **Per-category booking searches** (`tests/<category>-booking.spec.ts`) — one
  spec file per navbar category (Things To Do, EV Charging, Hotels, Flights,
  Car Rental, Transportation, Shows & Events, Dining, Parking), each running
  homepage → category → widget search → `/search/<category>` results through
  the shared journey runner.
- **Site** (`tests/site.spec.ts`) — cross-page behaviour of the header
  and footer:
  - **Currency** — switch to EUR through the header selector; verified by the
    persisted `ui-currency` store and the header button adopting the `€`
    symbol.
  - **Language** — switch to Español; no DOM state exposes it, so the
    translated navbar ("Hoteles") is the assertion.
  - **Links** — every footer link renders with its exact href (mailto, tel,
    legal, socials); the legal links open in `target="_blank"` popups that
    must land on `/terms`, `/privacy` and `/ada-disclosure`; header links
    redirect to `/login`, `/register` and `/cart`.
  - **Utility dialogs** — Order Lookup and Support open their overlays with
    the expected content.
- **The Hotels deep journey** (`tests/hotel-booking.spec.ts`) 
  
  Main assignment flow:

1. Open the staging homepage.
2. Select the **Hotels** category from the navbar.
3. Search **Miami**, **Aug 1–3** (next bookable August), **1 Adult + 1 Child (age 8)**.
4. Switch the results to **Map view**.
5. Apply left-panel filters: **Price Range** min **100** (max is the open-ended
   **1000+** cap) and **Guest Score “Very Good”**.
6. **Zoom in** on the map until a single hotel pin remains and select it.
7. Validate the selected hotel's card: **total price** and **guest score** sit
   within the filtered parameters.


## Repository layout
```
├── playwright.config.ts          # runners, browsers, workers/retries, timeouts, artifacts
├── .env.example                  # environment variable template
├── src/
│   ├── config/
│   │   ├── env.ts                # execution params (env presets, base URL)
│   │   ├── locale.ts             # pinned locale shared by config and pages
│   │   └── timing.ts             # per-wait timeout overrides (single source)
│   ├── data/
│   │   └── booking.data.ts       # all business inputs: per-category locations, dates, guests, filters + site-chrome data
│   ├── flows/
│   │   ├── booking-flow.ts       # BookingFlow type + the generic journey runner
│   │   └── booking.flows.ts      # one named flow per category, dates resolved here
│   ├── pages/
│   │   ├── BasePage.ts           # shared dialog/open behaviour
│   │   ├── SearchWidgetPage.ts   # shared widget behaviour: autocomplete, dates, submit (slug-driven)
│   │   ├── contracts.ts          # CategorySearchPage — the contract every category implements
│   │   ├── HomePage.ts           # landing page, data-driven category nav, brand heading
│   │   ├── SiteChrome.ts         # header/footer: currency+language selector, links, utility dialogs
│   │   ├── HotelsHomePage.ts     # Hotels widget (reference CategorySearchPage)
│   │   ├── ThingsToDoHomePage.ts / EvChargingHomePage.ts / FlightsHomePage.ts
│   │   ├── CarRentalHomePage.ts / TransportationHomePage.ts
│   │   ├── ShowsEventsHomePage.ts / DiningHomePage.ts / ParkingHomePage.ts
│   │   ├── CategoryResultsPage.ts      # generic /search/<slug> results assertions
│   │   ├── ThingsToDoResultsPage.ts    # Activities results: Free Cancellation, List view, item open
│   │   ├── EvChargingResultsPage.ts    # Chargers results: map zoom (scale/marker-verified per engine), List view, detail open
│   │   ├── SearchResultsPage.ts        # Hotels results: filters, view switcher, hotel card
│   │   └── components/
│   │       ├── DatePickerDialog.ts     # range + single-day calendar (year hops, re-anchoring)
│   │       ├── GuestSelectorDialog.ts  # room occupancy + child-age comboboxes
│   │       ├── MapView.ts              # dual-mode map pins, zoom-to-single, select
│   │       └── HotelCard.ts            # the popup card a selected pin opens
│   └── utils/
│       ├── dates.ts              # "next bookable August 1-3", nights math
│       └── slug.ts               # category name → route slug (single source)
└── tests/
    ├── homepage.spec.ts          # smoke (brand heading) + navbar exposes every booking category
    ├── site.spec.ts              # site chrome: currency, language, link exposure and redirects
    ├── things-to-do-booking.spec.ts / ev-charging-booking.spec.ts
    ├── flights-booking.spec.ts / car-rental-booking.spec.ts
    ├── transportation-booking.spec.ts / shows-events-booking.spec.ts
    ├── dining-booking.spec.ts / parking-booking.spec.ts
    └── hotel-booking.spec.ts     # the Hotels deep journey above (steps 1–7)
```
On failure Playwright keeps a trace, video and screenshots per test under
`test-results/`; inspect one with `npx playwright show-trace <trace.zip>`. Both
artifact folders are removed by `npm run clean`.


## Prerequisites
| Requirement              | Check                    | Notes                                          |
| ------------------------ | ------------------       | ---------------------------------------------- |
| **Node.js ≥ 20** (LTS)   | `node --version`         | npm is bundled with Node                        |
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
npm test              # all tests, serial (1 worker — polite to staging)
npm run test:headless # all tests, serial, headless (CI=true flips the launch mode)
npm run test:parallel # all tests in parallel (half the CPU cores as workers)
npm run test:ui       # Playwright UI mode (time-travel debugging)
npm run test:debug    # step-through debugger
npm run report        # open the HTML report from the last run
npm run typecheck     # tsc --noEmit over src, tests and config
npm run clean         # delete run artifacts: test-results/ and playwright-report/
```

Parallelism is opt-in because staging is shared: the default run uses one
worker, `npm run test:parallel` uses half the CPU cores, and any exact count
can be forced per run:

```bash
npx playwright test --workers=4     # explicit worker count
TEST_WORKERS=8 npx playwright test  # via environment variable
```

`npm run test:headed` still exists but is redundant while the WAF forces
headed launches locally.

Useful narrower invocations:

```bash
npx playwright test tests/dining-booking.spec.ts       # one category's booking search
npx playwright test tests/site.spec.ts                 # site chrome (currency, language, links)
npx playwright test tests/hotel-booking.spec.ts        # only the Hotels deep journey
npx playwright test --grep @e2e                        # by tag
npx playwright test --project=chromium                 # Chromium only
npx playwright test --project=firefox                  # Firefox only
npx playwright test --project=webkit                   # WebKit (Safari) only
npx playwright test --project=chromium --project=firefox --project=webkit   # all three, explicit
```

Every invocation above accepts the usual flags, e.g. `--grep "category: Dining"`.

On failure Playwright keeps a trace, video and screenshots per test under
`test-results/`; inspect one with `npx playwright show-trace <trace.zip>`.

## Adding a category

The nine navbar categories are wired through one contract. To onboard a new
one (or re-enable a changed widget):

1. **Data** — add an entry in `src/data/booking.data.ts` (destination queries,
   date intents). Field quirks discovered on staging are documented there,
   e.g. Transportation needs distinct Pick-Up/Drop-Off and an explicitly
   picked date; Parking needs an arrival → departure range.
2. **Page object** — a thin `src/pages/<Category>HomePage.ts` extending
   `SearchWidgetPage`, implementing `CategorySearchPage`: map the widget's
   accessible field names to `chooseLocation` / `pickDateRange` /
   `pickSingleDate`, and `submit()` to its `/search/<slug>` route.
3. **Flow + spec** — one `defineFlow({...})` in `src/flows/booking.flows.ts`
   (resolve date intents with `nextUpcoming`) and a thin spec file
   `tests/<category>-booking.spec.ts` calling
   `runBookingJourney(page, yourFlow)` — copy any existing one.


## CI
`.github/workflows/ci.yml` runs the whole suite on every push and pull request
(Ubuntu, chromium + firefox + webkit, `npm ci`, typecheck first, HTML report uploaded on failure).

## Design notes

- **Contract-first categories** — every category page implements
  `CategorySearchPage` (`src/pages/contracts.ts`): `expectLoaded` →
  `fillCriteria` → `submit`. The generic runner (`src/flows/booking-flow.ts`)
  drives any of them; `booking.flows.ts` wires data, page object and results
  expectation per category.
- **POM with shared widget behaviour** — pages and their locators live in
  `src/pages`; the Mantine autocomplete/date/dialog interactions exist once
  in `SearchWidgetPage`, so category pages stay thin field mappings. Specs
  stay orchestration-only.
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

## AI tools in the workflow
Claude (via the omp coding agent) was used throughout: staging recon scripts
to discover widget anatomy before writing page objects, refactoring
(`contracts`/`flows` extraction, the hardcode cleanup), and diagnosing flakes
from Playwright traces. 
Quality control: nothing merged on the agent's word alone — every change was verified by real suite runs,
failures were reproduced from traces/snapshots before fixing, and all
platform quirks the agent discovered are documented in code comments and this README.

## Recommended next steps

### 1. CI-integrated AI agent for test maintenance
The framework's contract layer makes the test surface machine-readable: a
category is exactly a `CategorySearchPage` implementation plus a data entry
and a named flow. An AI agent can therefore watch that surface instead of
raw DOM:

1. **Detect** — on every push, diff `src/pages/**` (new/changed public
   methods, locators, slugs) and `src/data/**`; anything changed but not
   exercised by a spec is a coverage gap.
2. **Generate** — the agent drafts page-object updates and specs for the gap,
   reusing `SearchWidgetPage` behaviours and the existing spec template.
3. **Validate** — automated gates before any human looks at it:
   `tsc --noEmit`, `playwright test --list`, and a dry run of the affected
   spec against staging.
4. **Approve** — drafts land as a pull request (or PR comment) for review —
   never auto-merged. Approval is a human decision; the agent only prepares.

If access to the frontend source repository ever becomes available, the
detection step upgrades from "diff the page objects" (the proxy) to "diff the
application itself" (routes, components, `data-testid`), which makes coverage
gaps exact and enables suggesting locators before the first browser run.

### 2. API-level tests

The UI suite is slow by nature (real browser, shared staging). A backend
layer would catch regressions faster and cheaper. Staging already exposes a
stable REST surface observed during recon, e.g.:

- `GET /api/v1/locations/search?...` — autocomplete
- `POST /api/v1/products/things-to-do/search` (+ `/search/poll/<id>`) —
  category search with async polling
- `GET /api/v1/carts/<id>` — cart state

Recommended shape: `tests/api/` specs using Playwright's `request` fixture —
assert status codes, response schemas and business invariants (result counts
match the `Showing X out of Y` summaries the UI tests rely on). The same
`src/data` inputs drive both layers, so a UI test and its API counterpart
stay in sync by construction.
