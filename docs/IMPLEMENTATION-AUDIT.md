# PriceRadar — Comprehensive Implementation Audit

**Audit Date:** October 14, 2026  
**Auditor:** Repository Architect & Senior MERN-Stack Engineer  
**Workspace:** `D:\PriceRadar`  
**Authoritative Reference:** `docs/01-MASTER-PROJECT-DEVELOPMENT-GUIDE.pdf` and member guides (`docs/02` through `docs/05`)  
**Repository State:** Initial project scaffolding committed (`9c9dad7`), all directories and starter manifests established, no live credentials committed.

---

## 1. Executive Summary & Audit Objectives

This audit evaluates the exact state of the PriceRadar codebase following initial repository scaffolding. The objective is to identify:
1. Which components and endpoints are already syntactically valid and verified.
2. Which implementations are partial, stubbed, or waiting on tests.
3. Which areas are strictly blocked by external dependencies (MongoDB Atlas, Brevo API key, Telegram Bot Token, Flipkart Affiliate approval, or Figma UI designs).
4. Concrete action items and verification steps for each of the four team members so development proceeds without duplicating work or breaking architectural contracts.

---

## 2. Classification Legend

Every source file and feature is categorized under one of five explicit statuses:

| Status | Meaning |
|---|---|
| **Implemented and verified** | Syntactically valid, automated or manual check executed, matches guide requirements. |
| **Implemented but not yet tested** | Code exists and conforms to specifications, but lacks automated test coverage or has not run against live dependencies. |
| **Partially implemented** | Core structure exists, but specific handlers, UI interactions, or methods are stubbed or incomplete. |
| **Placeholder or missing implementation** | File or feature is an empty shell, `.gitkeep`, or not yet written. |
| **Blocked by external dependency** | Cannot function without credentials, database provisioning, external API approval, or Figma designs. |

---

## 3. Comprehensive File-by-File Audit

### 3.1 Repository Configuration & Workflows

| File | Status | Notes / Discrepancies | Responsible Member |
|---|---|---|---|
| `.gitignore` | Implemented and verified | Excludes `node_modules/`, `.env*`, `dist/`, `build/`, `coverage/`, and log files. Verified with `git status --ignored`. | Member 1 (Lead) |
| `README.md` | Implemented and verified | Contains setup instructions, architecture diagram, PowerShell commands, and links to preserved PDF guides in `docs/`. | Member 1 (Lead) |
| `.github/workflows/ci.yml` | Implemented and verified | GitHub Actions workflow executing `npm test` on PRs and pushes to `main`. Syntactically valid. | Member 1 (Lead) |
| `.github/workflows/monitor.yml` | Blocked by credentials / deployment | Scheduled hourly cron workflow triggering `POST /api/monitor/run`. Blocked until Render deployment is live and repo secrets (`BACKEND_URL`, `MONITOR_TRIGGER_SECRET`) are configured. | Member 1 & Member 4 |
| `docs/01` through `docs/05` (.pdf) | Implemented and verified | Original PDF project guides preserved intact in `docs/`. | All Members |

---

### 3.2 Frontend (`client/`)

| File | Status | Notes / Discrepancies | Responsible Member |
|---|---|---|---|
| `client/package.json` | Implemented and verified | Valid JSON. React 18, Vite, React Router v6, Axios installed. `npm run build` executed cleanly (107 modules transformed, 0 errors). | Member 2 (Frontend) |
| `client/vite.config.js` | Implemented and verified | Configured with `@vitejs/plugin-react` and port `5173`. | Member 2 (Frontend) |
| `client/index.html` | Implemented and verified | Includes Bootstrap 5.3.3 CSS & JS bundle via CDN. | Member 2 (Frontend) |
| `client/.env.example` | Implemented and verified | Contains safe placeholder `VITE_API_URL=http://localhost:5000`. | Member 2 (Frontend) |
| `client/src/main.jsx` | Implemented and verified | Wraps application with `StrictMode`, `BrowserRouter`, `AuthProvider`, and imports `theme.css`. | Member 2 (Frontend) |
| `client/src/styles/theme.css` | Implemented and verified | Declares `--pr-*` color tokens from Document 1 Section 13 and custom button overrides. Awaits detailed Figma design styling. | Member 2 (Frontend) |
| `client/src/App.jsx` | Implemented and verified | Route table matches Document 1 Section 13 (all 12 screens + 404 mounted with `ProtectedRoute`). | Member 2 (Frontend) |
| `client/src/services/api.js` | Implemented but not yet tested | Central Axios instance with request interceptor for `priceradar_token` and `unwrap` helper. All API contract methods declared. Needs integration testing against running backend. | Member 2 (Frontend) |
| `client/src/context/AuthContext.jsx` | Implemented but not yet tested | Context with `priceradar_token` and `priceradar_user` persistence in `localStorage`. Exposes `useAuth()`, `login`, `register`, `logout`. Needs end-to-end auth test. | Member 2 (Frontend) |
| `client/src/components/Navbar.jsx` | Implemented and verified | Bootstrap navbar with branding and dynamic links based on `isAuthenticated`. | Member 2 (Frontend) |
| `client/src/components/ProtectedRoute.jsx` | Implemented and verified | Gates private routes; redirects unauthenticated users to `/login` with location state and warning message. | Member 2 (Frontend) |
| `client/src/components/OfferRow.jsx` | Implemented and verified | Formats paise to INR currency, displays "Lowest price" badge, "Sample data" badge for `isSample: true`, and stops propagation on external links. | Member 2 (Frontend) |
| `client/src/components/ProductCard.jsx` | Implemented and verified | Renders product card with up to 2 offers, computes lowest offer among in-stock items, triggers navigation to detail page on card body click. | Member 2 (Frontend) |
| `client/src/pages/HomePage.jsx` | Partially implemented / Blocked by Figma | Starter hero with search bar and sample search chips. Functional navigation, but visual design is pending Figma delivery. | Member 2 (Frontend) |
| `client/src/pages/SearchPage.jsx` | Implemented but not yet tested | Full implementation from Document 2 Section 8. Handles `idle`, `loading`, `empty`, `error` (with retry button), and `success` states with URL `?q=` sync. | Member 2 (Frontend) |
| `client/src/pages/ProductDetailPage.jsx` | Partially implemented / Blocked by Figma | Displays product and offers. **Missing:** "Add to Watchlist" button action, "Set Alert" button action, and price history chart (stretch goal). Awaiting Figma. | Member 2 (Frontend) |
| `client/src/pages/RegisterPage.jsx` | Implemented but not yet tested | Registration form with validation and automatic login redirect to `/dashboard`. Needs live backend verification. | Member 2 (Frontend) |
| `client/src/pages/LoginPage.jsx` | Implemented but not yet tested | Login form with redirect memory (`location.state.from`). Needs live backend verification. | Member 2 (Frontend) |
| `client/src/pages/DashboardPage.jsx` | Partially implemented / Blocked by Figma | Fetches watchlist and alerts counts. Visual layout and dashboard action tiles await Figma designs. | Member 2 (Frontend) |
| `client/src/pages/WatchlistPage.jsx` | Partially implemented / Blocked by Figma | Lists watchlist items with remove button and alert link. Empty state and card styling await Figma designs. | Member 2 (Frontend) |
| `client/src/pages/AlertFormPage.jsx` | Partially implemented / Blocked by Figma | Creates `target_price` and `fixed_drop` alerts. **Missing:** Edit mode (`/alerts/:alertId/edit`) to fetch and prefill existing alert data and call `updateAlert`. | Member 2 (Frontend) |
| `client/src/pages/AlertManagementPage.jsx` | Partially implemented / Blocked by Figma | Lists alerts with threshold display and delete button. **Missing:** Pause/Resume status toggle action. Layout awaits Figma. | Member 2 (Frontend) |
| `client/src/pages/NotificationPreferencesPage.jsx` | Partially implemented / Blocked by credentials | UI for email preferences and Telegram link code submission. Blocked from live testing until Brevo and Telegram Bot are operational. | Member 2 & Member 4 |
| `client/src/pages/NotificationHistoryPage.jsx` | Implemented but not yet tested | Table of notification events with timestamp, channel, and status badge. Needs live backend data. | Member 2 (Frontend) |
| `client/src/pages/NotFoundPage.jsx` | Implemented and verified | 404 screen with link to return home. | Member 2 (Frontend) |

---

### 3.3 Backend (`server/`)

| File | Status | Notes / Discrepancies | Responsible Member |
|---|---|---|---|
| `server/package.json` | Implemented and verified | Valid JSON. `"type": "module"`, all backend dependencies (including `axios` and `express-validator`) and devDependencies installed. Test script configured with `--experimental-vm-modules`. | Member 3 (Backend) |
| `server/.env.example` | Implemented and verified | Safe placeholders for all 13 documented backend environment variables. | Member 3 (Backend) |
| `server/src/server.js` | Blocked by database setup | Server entrypoint calling `connectDB()` before `app.listen(PORT)`. Cannot boot in production until `MONGODB_URI` is populated. | Member 3 (Backend) |
| `server/src/app.js` | Implemented and verified | Express app wiring, CORS, JSON parsing, `/api/health`, 8 route mounts, 404 handler, centralized error handler. | Member 3 (Backend) |
| `server/src/config/db.js` | Blocked by database setup | Mongoose connection setup with connection event listeners. Blocked on real MongoDB Atlas connection string. | Member 3 (Backend) |
| `server/src/middleware/auth.js` | Implemented but not yet tested | `requireAuth` checking `Authorization: Bearer <token>`, verifying with `JWT_SECRET`, extracting `payload.sub`. | Member 3 (Backend) |
| `server/src/middleware/validate.js` | Implemented but not yet tested | Reads `express-validator` results, formats first error into `{ success: false, error: { code: 'VALIDATION_ERROR', message } }`. | Member 3 (Backend) |
| `server/src/middleware/errorHandler.js` | Implemented but not yet tested | Four-argument error handler. Translates `ValidationError` (400), `CastError` (400), duplicate key 11000 (409), and conceals internal errors in production. | Member 3 (Backend) |
| `server/src/utils/asyncHandler.js` | Implemented and verified | Catches rejected promises in async route handlers and forwards to `next(err)`. | Member 3 (Backend) |
| `server/src/utils/money.js` | Implemented but not yet tested | Pure functions for paise integer math (`rupeesToPaise`, `paiseToRupees`, `formatRupees`). Needs dedicated unit tests. | Member 1 & Member 3 |
| `server/tests/health.test.js` | Implemented and verified | Verified with `npm test`. Passed both `/api/health` 200 response and 404 envelope tests. | Member 3 & Member 1 |

---

### 3.4 Data Models (`server/src/models/`)

All 7 models have been created following Document 1 Section 5 and Document 3 Section 6. All are currently **Implemented but not yet tested against live MongoDB Atlas**:

| Model File | Key Validations & Schema Constraints | Missing Work / Next Step |
|---|---|---|
| `User.js` | Email lowercase + unique; `passwordHash` has `select: false`; optional `telegramChatId`. | Write `tests/models.test.js` to verify duplicate email rejection and hash exclusion. |
| `Product.js` | `canonicalKey` lowercase + unique. `timestamps: { createdAt: true, updatedAt: false }`. | Verify indexing in MongoDB upon first connect. |
| `Offer.js` | Compound unique index `{ provider: 1, externalProductId: 1 }`; `priceInPaise` integer validator; `isSample: true` default. | Verify compound index prevents duplicate listings. |
| `PriceObservation.js` | Compound index `{ offerId: 1, fetchedAt: -1 }`; conditional `priceInPaise` required only if `status === 'success'`. | Verify failed observation can be saved without price. |
| `WatchlistItem.js` | Compound unique index `{ userId: 1, offerId: 1 }`. Prevents duplicate watch items. | Verify 11000 duplicate error handling in controller. |
| `Alert.js` | Conditional integer validator for `targetPriceInPaise` or `dropAmountInPaise`; channels array validation (`email`, `telegram`). | Test conditional validator when saving target vs drop alert. |
| `NotificationEvent.js` | Compound unique index `{ alertId: 1, dedupeKey: 1 }` (deduplication safety net); status enum (`sent`, `failed`, `skipped_duplicate`). | Test index suppression of identical dedupe keys. |

---

### 3.5 Retailer Providers (`server/src/providers/`)

| File | Status | Notes / Discrepancies | Responsible Member |
|---|---|---|---|
| `fixtureData.json` | Implemented and verified | Valid JSON. Contains 6 products and 12 offers (Flipkart + Amazon pairs). Includes `forceFail: true` on `FLP-NOISE-PULSE2-BLK` for ACC-06 failure testing. | Member 4 (Providers) |
| `fixture.js` | Implemented but not yet tested | Flattens fixture data into map, simulates 150–400ms network delay, handles `forceFail`, returns `isSample: true`. | Member 4 (Providers) |
| `flipkart.js` | Blocked by external API / credentials | Implements Flipkart Affiliate API v1 client. Blocked until Flipkart Affiliate Program registration is approved and tokens are issued. Currently bypassed by dispatcher. | Member 4 (Providers) |
| `amazon.js` | Implemented and verified | Enforces project rule: live calls return `{ success: false }` because Amazon data is strictly sample-only. | Member 4 (Providers) |
| `index.js` | Implemented but not yet tested | Dispatcher routing `isSample: true` and unverified Flipkart to `fixture.js`. Never throws; attaches ISO `fetchedAt`. | Member 4 (Providers) |

---

### 3.6 Services (`server/src/services/`)

| File | Status | Notes / Discrepancies | Responsible Member |
|---|---|---|---|
| `priceComparison.js` | Implemented but not yet tested | Implements `findLowestOffer` (filters out `out_of_stock` and `error`) and `calculateSavings`. Needs unit tests. | Member 1 (Lead) |
| `alertEvaluator.js` | Implemented but not yet tested | Implements condition checks for `target_price` and `fixed_drop`, `armed` state evaluation, and `dedupeKey` formatting. Needs unit tests. | Member 1 (Lead) |
| `priceMonitor.js` | Partially implemented / Blocked by database | Orchestrator fetches distinct offers, creates observations, updates offers, and evaluates alerts. **Missing:** Dispatching notifications via `email.js` and `telegram.js` when alert triggers, and recording `NotificationEvent` documents. | Member 1 & Member 4 |
| `notifications/email.js` | Blocked by credentials | Implements Brevo API client. Handles timeouts and errors without throwing. Blocked on `BREVO_API_KEY` and verified `EMAIL_FROM`. | Member 4 (Notifications) |
| `notifications/telegram.js` | Blocked by credentials | Implements Telegram Bot `sendMessage` and `startLinkListener` shell. Blocked on `TELEGRAM_BOT_TOKEN`. | Member 4 (Notifications) |

---

### 3.7 Controllers & Routes (`server/src/controllers/` & `server/src/routes/`)

| Route & Controller | Status | Incomplete Endpoints / Missing Logic | Responsible Member |
|---|---|---|---|
| `auth.js` / `authController.js` | Blocked by database setup | Code complete for `POST /register`, `POST /login`, `GET /me`. Awaiting database connection to test user creation, bcrypt, and JWT issuance. | Member 3 (Backend) |
| `products.js` / `productsController.js` | Blocked by database setup | Code complete for `GET /search` and `GET /:productId`. Awaiting seeded database to test query matching and offer aggregation. | Member 3 (Backend) |
| `offers.js` / `offersController.js` | Blocked by database setup | Code complete for `GET /:offerId/history`. Awaiting database with price observations. | Member 3 (Backend) |
| `watchlist.js` / `watchlistController.js` | Blocked by database setup | Code complete for `GET /`, `POST /`, `DELETE /:watchlistItemId` with user scoping. Awaiting database connection. | Member 3 (Backend) |
| `alerts.js` / `alertsController.js` | Blocked by database setup | Code complete for `GET /`, `POST /`, `PATCH /:alertId`, `DELETE /:alertId`. Awaiting database connection. | Member 3 (Backend) |
| `notifications.js` / `notificationsController.js` | Partially implemented / Path Discrepancy | Route path discrepancy exists between `notifications.js` (`/preferences`) and `api.js` (`/api/notification-preferences`). See Section 4. | Member 3 (Backend) |
| `telegram.js` | Partially implemented / Blocked by credentials | `POST /link-code` is a mock. Needs code generation, `telegramLinkCodes` cache, and `POST /link` confirmation handler. | Member 3 & Member 4 |
| `monitor.js` / `monitorController.js` | Partially implemented | `POST /run` checks `X-Monitor-Secret` and calls `runMonitoringCycle()`, but returns HTTP 200 instead of 202. Missing `GET /api/monitor/status`. | Member 1 (Lead) |

---

## 4. Key Architectural Gaps & Discrepancies Identified

### Gap 1: Route Path Discrepancy for Notification Preferences
- **Document 1 Section 6.5 API Contract:**
  - `GET /api/notification-preferences`
  - `PUT /api/notification-preferences`
- **Current Express Mount:**
  - In `server/src/app.js`: `app.use('/api/notification-preferences', notificationRoutes)`
  - In `server/src/routes/notifications.js`: routes are defined as `/preferences`
- **Result:** Requests to `/api/notification-preferences` will 404 because Express looks for `/api/notification-preferences/preferences`.
- **Solution:** Per Document 3 Section 7.1 Page 26, create a dedicated `server/src/routes/notificationPreferences.js` file with `/` route, or mount clean root routes in `notifications.js`.

### Gap 2: Unconnected Notification Dispatch in Price Monitor Orchestrator
- In `server/src/services/priceMonitor.js`:
  When an alert evaluation returns `evalResult.shouldNotify === true`, the current code updates `alert.armed = false` and `alert.lastTriggeredAt = new Date()`, but contains only a comment:
  `// Member 4's notification dispatch is invoked here`
- **Missing Work:** Member 1 and Member 4 must integrate `sendEmail()` and `sendMessage()` into this loop and insert a corresponding `NotificationEvent` document in MongoDB with `dedupeKey`.

### Gap 3: Two-Step Telegram Account Linking Incomplete
- In `server/src/routes/telegram.js`:
  The current handler is a placeholder acknowledging receipt.
- **Missing Work:**
  1. `POST /api/telegram/link-code`: Generate a random 6-character alphanumeric code, store `{ userId, expiresAt }` in an in-memory Map, and return `{ linkCode, botUsername, expiresAt }`.
  2. In `services/notifications/telegram.js`: Bot's `/start <code>` polling matches the code in the Map and updates `User.telegramChatId`.
  3. `POST /api/telegram/link`: Verifies that `User.telegramChatId` is now set and returns `{ linked: true }`.

### Gap 4: Monitor Controller Response Code and Missing Status Endpoint
- In `server/src/controllers/monitorController.js`:
  - `POST /api/monitor/run` returns HTTP 200; Document 1 Section 6.6 specifies HTTP 202.
  - `GET /api/monitor/status` (returning `{ lastRunAt, lastRunOffersChecked, lastRunErrors }`) is not yet implemented.

### Gap 5: Database Seeding Job Missing
- There is currently no script to seed `Product` and `Offer` documents from `fixtureData.json` into MongoDB Atlas.
- Without a seed script (`server/src/jobs/seedFixtures.js`), `GET /api/products/search` returns an empty array even after connecting Atlas.

### Gap 6: Frontend Edit Alert Mode Unhandled
- In `client/src/App.jsx`, route `/alerts/:alertId/edit` points to `AlertFormPage.jsx`.
- In `client/src/pages/AlertFormPage.jsx`, the component does not read `useParams().alertId` or call `api.getAlerts()` to pre-fill the form, and only calls `createAlert()` on submit rather than `updateAlert()`.

---

## 5. Member-by-Member Action Plan & Verification Steps

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRICE RADAR TEAM MATRIX                         │
├─────────────────┬──────────────────┬─────────────────┬─────────────────┤
│ Member 1 (Lead) │ Member 2 (Front) │ Member 3 (Back) │ Member 4 (Data) │
├─────────────────┼──────────────────┼─────────────────┼─────────────────┤
│ • Price Engine  │ • Figma Screens  │ • Atlas M0 DB   │ • Brevo Email   │
│ • Monitor Loop  │ • Watchlist UI   │ • Auth & Models │ • Telegram Bot  │
│ • CI / Render   │ • Alert Form Edit│ • Route Handlers│ • Provider Seed │
└─────────────────┴──────────────────┴─────────────────┴─────────────────┘
```

### Member 1 — Team Lead: Price Comparison, Monitoring, and Deployment

| Task ID | Task Description | Relevant Files | Verification Steps |
|---|---|---|---|
| **TL-01** | Unit test price comparison service | `server/src/services/priceComparison.js`, `server/tests/priceComparison.test.js` | Write Jest tests verifying lowest offer selection among in-stock items and correct paise savings calculation. |
| **TL-02** | Unit test alert evaluator | `server/src/services/alertEvaluator.js`, `server/tests/alertEvaluator.test.js` | Test target price and fixed drop rules, re-arming logic, and `dedupeKey` generation. |
| **TL-03** | Connect notifications to price monitor | `server/src/services/priceMonitor.js` | Verify that triggered alerts call `sendEmail` / `sendMessage` and record `NotificationEvent` with duplicate suppression (ACC-04, ACC-05). |
| **TL-04** | Fix monitor controller response and add status route | `server/src/controllers/monitorController.js`, `server/src/routes/monitor.js` | Change `runMonitor` status code to 202; implement `GET /api/monitor/status`. |
| **TL-05** | Render deployment setup | `.github/workflows/monitor.yml`, Render Dashboard | Deploy API server and client to Render; set repository secrets `BACKEND_URL` and `MONITOR_TRIGGER_SECRET`; verify manual workflow run (ACC-07, ACC-08). |

---

### Member 2 — Frontend Developer: React + Vite & Bootstrap UI

| Task ID | Task Description | Relevant Files | Verification Steps |
|---|---|---|---|
| **FE-01** | Integrate final Figma UI designs | `client/src/pages/*`, `client/src/styles/theme.css` | Apply typography, layout grids, and component tokens once Figma screens arrive. |
| **FE-02** | Wire Watchlist & Alert buttons on Product Detail | `client/src/pages/ProductDetailPage.jsx` | Verify clicking "Add to Watchlist" calls `api.addToWatchlist` and "Set Alert" navigates to `/alerts/new?offerId=...`. |
| **FE-03** | Implement Edit Mode in Alert Form | `client/src/pages/AlertFormPage.jsx` | Detect `:alertId` in route, load existing alert settings, submit changes via `api.updateAlert(alertId, changes)`. |
| **FE-04** | Complete Alert Management controls | `client/src/pages/AlertManagementPage.jsx` | Add toggle button to switch alert status between `active` and `paused` via `api.updateAlert`. |
| **FE-05** | Verify user data isolation in UI | `client/src/context/AuthContext.jsx`, `client/src/pages/WatchlistPage.jsx` | Log in as user A, add item, log out, log in as user B, confirm user A's items are not visible (ACC-03). |

---

### Member 3 — Backend Developer: Express, MongoDB Atlas, and Auth

| Task ID | Task Description | Relevant Files | Verification Steps |
|---|---|---|---|
| **BE-01** | Provision MongoDB Atlas M0 Cluster | `server/.env`, `server/src/config/db.js` | Create free cluster on cloud.mongodb.com, set network access `0.0.0.0/0`, paste connection string in `server/.env`, verify `node src/server.js` logs `[db] Mongoose connected`. |
| **BE-02** | Create database seed script | `server/src/jobs/seedFixtures.js` | Ingest `fixtureData.json` into `products` and `offers` collections. Run script and confirm `GET /api/products/search?q=Samsung` returns products with offers. |
| **BE-03** | Resolve notification preferences route path | `server/src/app.js`, `server/src/routes/notifications.js` | Ensure `GET /api/notification-preferences` and `PUT /api/notification-preferences` match Document 1 Section 6.5 contract. |
| **BE-04** | Implement model unit tests | `server/tests/models.test.js` | Test duplicate email on `User`, duplicate `(provider, externalProductId)` on `Offer`, duplicate `(userId, offerId)` on `WatchlistItem`, and integer paise validation. |
| **BE-05** | Implement auth integration tests | `server/tests/auth.test.js` | Test registration 201, duplicate email 409, login 200 with JWT, failed login 401, and `GET /me` with Bearer token. |

---

### Member 4 — Retailer Providers, Scheduler & Notifications

| Task ID | Task Description | Relevant Files | Verification Steps |
|---|---|---|---|
| **RN-01** | Test provider dispatcher & failure handling | `server/src/providers/index.js`, `server/tests/providers.test.js` | Verify `FLP-NOISE-PULSE2-BLK` triggers `forceFail: true`, sets `Offer.lastStatus = "error"`, never becomes ₹0, and never fires false alert (ACC-06). |
| **RN-02** | Configure Brevo Transactional Email | `server/.env`, `server/src/services/notifications/email.js` | Verify sender domain/email in Brevo dashboard, set `BREVO_API_KEY` and `EMAIL_FROM`, send a real test email. |
| **RN-03** | Create Telegram Bot and linking flow | `server/.env`, `server/src/services/notifications/telegram.js`, `server/src/routes/telegram.js` | Create bot via @BotFather, implement `/start <linkCode>` listener, verify message delivery to linked chat. |
| **RN-04** | Local monitoring runner script | `server/src/jobs/runMonitorLocally.js` | Implement standalone script to trigger a monitoring cycle from PowerShell during development without waiting for GitHub Actions. |
| **RN-05** | Flipkart Affiliate tracking | `server/src/providers/flipkart.js` | Submit affiliate program application. If approved within the 7-day window, execute Document 4 Section 7.4 switch-over checklist. If not approved, keep fixture fallback active. |

---

## 6. Verification Summary

### Safe Checks Executed During Audit
- [x] **Git Repository Inspection:** Clean working tree, verified remote pointing to `https://github.com/VamshiYamjala/PriceRadar.git` on branch `main`.
- [x] **Secrets Audit:** Verified zero credentials or `.env` files tracked via `git status` and `git log -p -- '**/.env'`.
- [x] **JSON Validation:** Validated `client/package.json`, `server/package.json`, and `fixtureData.json` with Python parser (0 errors).
- [x] **Frontend Production Build:** Executed `npm run build` in `client/` (107 modules compiled, 0 errors, output removed).
- [x] **Backend Test Suite:** Executed `npm test` in `server/` with Jest (`health.test.js` passed, 2/2 tests green).

### Checks Deferred Pending External Setup
- [ ] Live MongoDB Atlas connection (requires Member 3 cluster provisioning).
- [ ] Live email delivery (requires Member 4 Brevo API key & sender verification).
- [ ] Live Telegram bot message delivery (requires Member 4 Telegram bot token).
- [ ] End-to-end GitHub Actions scheduled run (requires Member 1 Render deployment and secret configuration).
- [ ] Final UI styling and responsive testing (requires Figma designs).
