# wp-next-test

**Bema Integrated Services Ltd — Software Developer Skills Test**

A headless WordPress + Next.js application demonstrating GraphQL data fetching, REST API integration, scalable frontend architecture, and automation concepts.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup & Run Instructions](#setup--run-instructions)
- [Project Structure](#project-structure)
- [Architecture & Reasoning](#architecture--reasoning)
- [Notes & Assumptions](#notes--assumptions)
- [AI Usage Disclosure](#ai-usage-disclosure)

---

## Prerequisites

Before running the app, ensure the following are in place:

| Requirement | Version | Purpose |
|---|---|---|
| Node.js | >= 18 | Run Next.js dev server |
| Local by Flywheel | Latest | Host WordPress locally |
| WordPress | 6.9.4 | Headless CMS |
| WPGraphQL plugin | Active | Exposes `/graphql` endpoint |
| Easy Digital Downloads | Active | Provides store settings |

---

## Setup & Run Instructions

### 1. Start WordPress

1. Open **Local by Flywheel**
2. Select **wp-headless-test** and click **Start Site**
3. Click **WP Admin** to confirm WordPress is running
4. Verify these endpoints are reachable in your browser before starting Next.js:

```
http://wp-headless-test.local/graphql
http://wp-headless-test.local/wp-json/custom/v1/edd-currency
http://wp-headless-test.local/wp-json/custom/v1/get-name
```

### 2. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

`.env.local` contents:

```env
NEXT_PUBLIC_WP_GRAPHQL_URL=http://wp-headless-test.local/graphql
NEXT_PUBLIC_WP_REST_URL=http://wp-headless-test.local/wp-json
```

> If your Local site uses a different domain, update these values to match.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the page will display:
- **Part 1** — 3 most recent WordPress blog posts with a toggle to show all
- **Part 2** — Live NGN to USD exchange rate
- **Part 3** — EDD store currency setting
- **Part 4** — Name submission form with server-side reversal

### 5. Run the Standalone Exchange Rate Script (Part 2)

```bash
node exchange-rate.js
```

Expected terminal output:

```
Fetching NGN to USD exchange rate...

Exchange rate fetched successfully
────────────────────────────────────
   Base currency : NGN (Nigerian Naira)
   Target        : USD (US Dollar)
   Rate          : 1 NGN = 0.00073600 USD
   Inverse       : 1 USD = 1358.70 NGN
   Rate date     : 2026-03-20
────────────────────────────────────
```

### 6. WordPress Custom REST Endpoints (functions.php)

The following code must exist in the active theme's `functions.php` file. For this project the active theme is **Twenty Twenty-Five**, located at:

```
C:\Users\{YOU}\Local Sites\wp-headless-test\app\public\wp-content\themes\twentytwentyfive\functions.php
```

Add this at the bottom of the file:

```php
add_action( 'rest_api_init', function () {

    // Part 3: EDD currency — EDD v3 native REST requires auth, so we expose
    // the setting via a custom public endpoint for local development
    register_rest_route( 'custom/v1', '/edd-currency', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => function () {
            $edd = get_option( 'edd_settings', array() );
            return array(
                'currency'      => isset( $edd['currency'] )      ? $edd['currency']      : 'USD',
                'currency_sign' => isset( $edd['currency_sign'] ) ? $edd['currency_sign'] : '$',
                'source'        => 'edd_settings_option',
            );
        },
    ] );

    // Part 4: Submit name — WordPress reverses it server-side and stores it
    register_rest_route( 'custom/v1', '/submit-name', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function ( $request ) {
            $name     = sanitize_text_field( $request->get_param( 'name' ) );
            $reversed = strrev( $name );
            update_option( 'custom_name_submission', $reversed );
            return array( 'message' => 'Saved', 'reversed' => $reversed );
        },
    ] );

    // Part 4: Retrieve the last stored reversed name
    register_rest_route( 'custom/v1', '/get-name', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => function () {
            return array( 'reversed_name' => get_option( 'custom_name_submission', '' ) );
        },
    ] );

} );
```

---

## Project Structure

```
wp-next-test/
│
├── lib/
│   ├── api/
│   │   ├── client.js          # graphql-request singleton — single configured WPGraphQL client
│   │   ├── posts.js           # Part 1: fetchAllPosts(), fetchSiteSettings()
│   │   ├── exchange.js        # Part 2: fetchExchangeRate() for Next.js UI
│   │   ├── edd.js             # Part 3: fetchEddSettings() via custom REST endpoint
│   │   └── names.js           # Part 4: submitName(), getReversedName()
│   └── types/
│       └── index.js           # JSDoc type definitions: Post, SiteSettings, ApiResult<T>
│
├── components/
│   ├── SiteHeader.jsx          # WordPress site title and tagline
│   ├── PostList.jsx            # Post list — handles loading, error, empty, and data states
│   ├── ToggleButton.jsx        # Show 3 recent / show all toggle control
│   ├── ExchangeRate.jsx        # NGN to USD rate widget
│   ├── EddSettings.jsx         # EDD store currency widget
│   └── NameForm.jsx            # Controlled form: POST name, display reversed result
│
├── pages/
│   ├── _app.js                 # Global CSS entry point (Pages Router requirement)
│   └── index.js                # Composition layer — state management + component wiring
│
├── styles/
│   └── globals.css             # CSS design tokens + all component styles
│
├── exchange-rate.js            # Part 2: Standalone Node.js script
├── .env.local                  # Local config — NOT committed to git
├── .env.local.example          # Safe template — committed to git
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

---

## Architecture & Reasoning

### 1. Folder Structure — Why Organised This Way

Each folder maps to exactly one concern:

- **`lib/api/`** — Every network call lives here. Components and pages never call `fetch` or `graphql-request` directly. If the WordPress endpoint changes or the project migrates to SWR, only this folder changes. Each file owns one domain: `posts.js` for GraphQL content, `exchange.js` for the external rate API, `edd.js` for store settings, `names.js` for the custom form endpoints.

- **`lib/types/`** — JSDoc type definitions shared across the app. Provides IDE autocomplete and self-documenting API contracts without TypeScript compilation overhead — appropriate for a time-constrained assessment context.

- **`components/`** — Pure presentational components. They receive data as props and never fetch. Independently testable: pass mock props, assert rendered output. No component imports `fetch`, `GraphQLClient`, or any API module directly.

- **`pages/`** — Composition only. `index.js` decides what data is needed, manages async state, and wires components together. It contains no GraphQL strings, no raw fetch calls, and no markup beyond layout wrappers.

This is the **Container / Presentational** pattern — the standard architecture for scalable React applications.

---

### 2. State Management — Where It Lives and Why

All state is local to `pages/index.js` using `useState`:

| Variable | Purpose |
|---|---|
| `allPosts` | Full dataset — fetched once, never re-fetched on toggle |
| `settings` | WordPress site title and tagline |
| `isLoading / error` | Async lifecycle flags, one set per data section |
| `showAll` | Toggle state — derives `visiblePosts` without a second fetch |
| `rateData / eddData` | Widget data for Parts 2 and 3 |

**Why local, not global (Context / Redux / Zustand)?**
No sibling component needs to share this data. Global state management at this scale is over-engineering. The principle applied: start local, escalate to global only when two or more unrelated components need the same data.

**The core toggle mechanic:**
`visiblePosts` is derived as `showAll ? allPosts : allPosts.slice(0, 3)`. It is never stored separately. This is how the "show all without refetching" requirement is satisfied — `allPosts` is fetched once on mount, stored as the single source of truth, and sliced in memory on toggle.

**Why `Promise.all`:**
Posts, settings, exchange rate, and EDD settings are independent. `Promise.all` fires all four simultaneously. Sequential fetching would waste the roundtrip time of whichever request finishes first. Each result is handled separately so one failure never blocks another section from rendering.

---

### 3. Scaling to 10+ API Calls — What Breaks and How to Fix It

**What breaks without changes:**
- `Promise.all` with 10+ entries becomes unmanageable and error handling grows inconsistent
- No request deduplication — data that rarely changes (site settings, EDD currency) is re-fetched on every page visit
- No per-request loading states — one slow endpoint blocks perceived load of the entire page
- No caching layer — every visit to the page triggers a full GraphQL round-trip to WordPress

**Mitigations:**

1. **Adopt SWR or React Query** — provides deduplication, background revalidation, per-request loading/error states, and an in-memory cache. Replaces ~60 lines of manual `useEffect` + state management per fetch with a single `useSWR` call.

2. **Maintain modular `lib/api/` split** — one file per domain, consistent `ApiResult<T>` return shape everywhere. This is already in place: `posts.js`, `exchange.js`, `edd.js`, `names.js`.

3. **Use `getStaticProps` with ISR** — `revalidate: 60` for blog post content. Blog posts rarely change in real time. Serving a cached HTML page eliminates the GraphQL round-trip for the majority of visits and improves SEO.

4. **Add response validation and type guards** — validates the shape of every API response before it reaches the render layer, preventing silent failures from malformed data.

---

### 4. If WordPress Goes Down — Graceful Degradation

Every function in `lib/api/` wraps its call in `try/catch` and returns `{ data: null, error: string }` rather than throwing. This means:

- `fetchAllPosts` fails → `PostList` renders an error message and a **Retry** button. The page never white-screens.
- `fetchSiteSettings` fails → `settings` stays `null` → `SiteHeader` renders `null`. Posts, exchange rate, and EDD still display.
- `fetchEddSettings` fails → `EddSettings` widget shows the error inline. Exchange rate and posts are unaffected.
- `fetchExchangeRate` fails → `ExchangeRate` widget shows the error inline. Everything else continues working.

**No section blocks any other section.** Each widget and the posts list fail and recover independently. The Retry button re-triggers `loadData` which re-fires all four fetches simultaneously.

**Additional production hardening I would add:**
- React `ErrorBoundary` around each major section to catch unexpected render-time throws
- `pages/500.js` custom error page for server-level failures
- Monitoring (Sentry) to alert on elevated API error rates before users notice

---

### 5. n8n Automation

**New post published → Slack notification:**

In `functions.php`, a `transition_post_status` hook fires when a post moves to `publish` status. It calls `wp_remote_post` to an n8n Webhook URL with the post title, URL, author, and timestamp. The check `if ($new_status === 'publish' && $old_status !== 'publish')` fires only on the initial publish, not every subsequent save.

In n8n: **Webhook trigger** → **IF node** (filter `post_type === 'post'`, excludes pages and custom types) → **Set node** (format message: "New post published: {title} — {url}") → **Slack node** (send to `#content-updates` channel). An **Error Trigger** node catches any workflow failure and alerts `#dev-alerts`.

**Other automation candidates:**
- **New EDD sale** — EDD fires `edd_complete_purchase` webhook. n8n fans out to SMTP (custom receipt), HubSpot (new contact), Google Sheets (sales log). All three branches run in parallel.
- **Weekly content audit** — n8n cron trigger every Monday queries WPGraphQL for posts older than 12 months and creates Asana tasks for each one needing review. Zero custom PHP required.

**Why n8n over custom webhooks?**
n8n provides visual workflow editing, built-in retry logic, error handling, and 400+ integrations with no additional infrastructure. The WordPress side only needs a single `wp_remote_post` call per event.

---

## Notes & Assumptions

### Issues Encountered and Resolved

**WordPress login after Local setup**
The password set during Local's "Set up WordPress" step was not saved correctly. Resolved using Local's **One-click admin** toggle in the site overview panel, which bypasses password authentication for local development.

**EDD v3 REST API requires authentication**
The endpoint `/wp-json/edd/v1/settings` specified in the test spec returns HTTP 401 in EDD v3 — it is no longer publicly accessible by default. Resolved by registering a custom public endpoint `/wp-json/custom/v1/edd-currency` in `functions.php` that reads directly from the `edd_settings` WordPress database option. This approach is appropriate for local development. In production this endpoint would be protected with application passwords or JWT authentication.

**`exchangerate.host` API no longer free**
The endpoint specified in the test (`https://api.exchangerate.host/latest`) now requires a paid subscription and returns an invalid/unexpected response for unauthenticated requests. Replaced with `https://open.er-api.com/v6/latest/NGN` — a genuinely free, no-key-required alternative with a stable documented response shape. All error handling was updated to match the new response structure (`result: "success"` instead of `success: true`).

**WordPress Theme File Editor blocked saves**
The WordPress admin UI Theme File Editor returned a save error when attempting to edit `functions.php` through the browser. Resolved by editing the file directly in VS Code using the full Windows filesystem path to the Local site directory.

**Windows CMD does not support bash heredocs**
The Local by Flywheel Site Shell on Windows opens CMD, not Bash. Bash heredoc syntax (`<< 'EOF'`) is not supported. All file edits were performed directly in VS Code rather than via shell commands.

### Assumptions

- `NEXT_PUBLIC_` prefix on env variables is intentional — these are public endpoint URLs. No secrets are exposed in the client bundle.
- `first: 100` in the WPGraphQL posts query is a practical ceiling for a blog. Sites with hundreds of posts should implement cursor-based pagination using WPGraphQL's `after` / `before` cursor fields.
- The Pages Router (`pages/`) is used as specified in the test. The newer App Router (`app/`) was intentionally not used.
- WordPress must be running in Local before starting `npm run dev`. The app degrades gracefully if WordPress is offline — each section displays its own independent error state.
- EDD was configured with USD as the store currency. The custom endpoint reads whatever currency is currently saved in EDD settings and returns it correctly regardless of the configured value.

---

## AI Usage Disclosure

AI assistance (Claude) was used during this project. All usage is documented below per the assessment requirement.

| Area | What AI generated | How I validated and modified |
|---|---|---|
| GraphQL queries (`posts.js`) | Initial `GET_ALL_POSTS` query with `where: { orderby: { field: DATE, order: DESC } }` and field selection | Ran in WPGraphQL IDE at `/graphql`; confirmed response shape matched JSDoc typedef; verified ordering was newest-first |
| `Promise.all` pattern (`index.js`) | Suggested parallel fetch structure for four independent requests | Verified destructuring order matched function order; confirmed simultaneous requests firing in browser Network tab; confirmed one failure does not block others |
| CSS skeleton animation (`globals.css`) | Generated `@keyframes shimmer` with gradient `background-position` animation technique | Visually verified across all three loading states (posts, exchange rate, EDD) in Chrome DevTools; confirmed no layout shift or flickering |
| JSDoc type definitions (`lib/types/index.js`) | Generated initial `Post`, `SiteSettings`, and `ApiResult<T>` typedef structure | Cross-referenced every field against actual WPGraphQL JSON response in browser DevTools; added missing fields (`excerpt`) |
| `exchange-rate.js` error handling | Generated three-layer error structure (network failure, HTTP status, JSON shape validation) | Tested with network disconnected (confirmed network error caught); tested with wrong URL (confirmed HTTP error caught); confirmed clean success output format |
| `functions.php` REST route registration | Generated `register_rest_route` structure for all three custom endpoints | Tested each endpoint in browser; confirmed correct JSON responses; confirmed `submit-name` persists data correctly across page refreshes via `get-name` |
| README structure | Suggested section organisation | All written content, reasoning, trade-off analysis, and architecture decisions are my own |

**What was not AI-generated:**
- Architecture decisions (folder structure, state placement, `ApiResult<T>` error contract)
- The single-fetch-slice-in-state toggle mechanic for Part 1
- The decision to use `Promise.all` for parallel independent fetches
- The EDD authentication workaround approach
- The API endpoint switch from `exchangerate.host` to `open.er-api.com` and the reason for it
- All debugging and issue resolution

---

*Built for the Bema Integrated Services Ltd Software Developer Skills Test.*
*Stack: Next.js 14 · React 18 · WPGraphQL · graphql-request · WordPress 6.9.4 · Easy Digital Downloads · Local by Flywheel*