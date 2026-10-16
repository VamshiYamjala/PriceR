# PriceRadar — Permanent Error & Troubleshooting Log

**Project Name:** PriceRadar  
**Authoritative Reference:** `docs/01-MASTER-PROJECT-DEVELOPMENT-GUIDE.pdf`  
**Target Repository:** `https://github.com/VamshiYamjala/PriceR.git`  
**Development Workspace:** `D:\priceR`  
**Last Updated:** 2026-10-14  

---

## Error Handling Protocol

Whenever an error occurs during development:
1. Consult this log first to verify whether the error has been encountered previously.
2. Formulate a hypothesis and identify the root cause before modifying code.
3. Apply the minimal necessary fix without introducing unintended side effects.
4. Run verification tests to confirm the fix works.
5. Record the error, root cause, attempted solution, and verification evidence in this log.

### Status Definitions
- **OPEN:** Error identified, diagnosis in progress.
- **INVESTIGATING:** Hypothesis formulated, fix being developed.
- **FIXED:** Fix implemented, awaiting test verification.
- **VERIFIED:** Solution tested and confirmed passing with evidence.
- **REOPENED:** Error recurred after being marked resolved.

---

## Recorded Errors & Solutions

### ERR-001: Python PDF Text Extraction Unicode Encoding Error
- **Date & Time:** 2026-10-14 13:03 IST
- **Phase / Feature:** Phase 1 — Project Inspection & Guide Extraction
- **Status:** VERIFIED
- **Exact Error Message:**
  ```text
  UnicodeEncodeError: 'charmap' codec can't encode character '\ufb01' in position 38: character maps to <undefined>
  ```
- **Relevant Command / File:** `python -c "import pypdf..."` on `docs/01-MASTER-PROJECT-DEVELOPMENT-GUIDE.pdf`
- **Root Cause:**
  Windows default PowerShell console encoding is `cp1252` (Windows ANSI). The PDF text extracted by `pypdf` contains typographic ligatures such as `\ufb01` ("fi" ligature), which cannot be mapped into the `cp1252` character set when printed to standard output without explicit UTF-8 reconfiguration.
- **Diagnostic Steps Performed:**
  Inspected the exception traceback. The failure occurred inside `encodings\cp1252.py` on line 19 during standard library stdout encoding.
- **Solution Attempted:**
  Reconfigured standard output encoding to UTF-8 at the script entrypoint:
  ```python
  import sys
  sys.stdout.reconfigure(encoding='utf-8')
  ```
- **Whether Solution Worked:** Yes.
- **Verification Evidence:**
  The subsequent execution extracted headings across all 5 PDF documents cleanly with zero encoding errors.
- **Files Changed:** Scratch inline python inspection scripts.
- **Prevention Steps:**
  Always specify `sys.stdout.reconfigure(encoding='utf-8')` or run scripts under Python with `PYTHONIOENCODING=utf-8` on Windows systems.
- **Related Errors:** None.

---

### ERR-002: Remote Repository Host Resolution Failure
- **Date & Time:** 2026-10-14 13:01 IST
- **Phase / Feature:** Phase 1 — Git & GitHub Remote Inspection
- **Status:** VERIFIED
- **Exact Error Message:**
  ```text
  fatal: unable to access 'https://github.com/VamshiYamjala/PriceR.git/': Could not resolve host: github.com
  ```
- **Relevant Command / File:** `git ls-remote https://github.com/VamshiYamjala/PriceR.git`
- **Root Cause:**
  Temporary transient local DNS resolution failure in the environment.
- **Diagnostic Steps Performed:**
  1. Ran `git ls-remote` (failed with host resolution).
  2. Ran `Test-Connection -ComputerName github.com -Quiet` (returned `True`).
  3. Formatted repository and attempted authenticated push via Git Credential Manager.
- **Solution Attempted:**
  Initial commit created, branch tracking configured, and pushed directly via `git push -u origin main`.
- **Whether Solution Worked:** Yes.
- **Verification Evidence:**
  `git push -u origin main` succeeded with `branch 'main' set up to track 'origin/main'` and remote SHA `69f9ec8`.
- **Files Changed:** None.
- **Prevention Steps:** Use Git Credential Manager for HTTPS communication with GitHub.
- **Related Errors:** None.

---

### ERR-003: TDZ ReferenceError in priceComparison.test.js
- **Date & Time:** 2026-10-14 13:24 IST
- **Phase / Feature:** Phase 2 Task D — Price Comparison Unit Testing
- **Status:** VERIFIED
- **Exact Error Message:**
  ```text
  ReferenceError: Cannot access 'lowest' before initialization
  at Object.lowest (tests/priceComparison.test.js:39:38)
  ```
- **Relevant Command / File:** `npm test -- tests/priceComparison.test.js`
- **Root Cause:**
  In `server/tests/priceComparison.test.js`, line 39 accidentally referenced `lowest` inside its own initializer (`const lowest = findLowestOffer(lowest ? offers : offers)`), hitting the JavaScript Temporal Dead Zone (TDZ).
- **Diagnostic Steps Performed:**
  Inspected test failure stack trace at line 39.
- **Solution Attempted:**
  Corrected line 39 to pass `offers` directly: `const lowest = findLowestOffer(offers)`.
- **Whether Solution Worked:** Yes.
- **Verification Evidence:**
  Re-ran full Jest test suite. 6/6 test suites passed with all 45 unit tests green.
- **Files Changed:** `server/tests/priceComparison.test.js`.
- **Prevention Steps:** Carefully review test argument expressions before execution.
- **Related Errors:** None.

---

### ERR-004: Apify Amazon Actor Input Schema Validation Failure
- **Date & Time:** 2026-10-15 09:41 IST
- **Phase / Feature:** Apify Integration — Live Search Smoke Testing
- **Status:** VERIFIED
- **Exact Error Message:**
  ```text
  Status: 400
  Response data: {
    "error": {
      "type": "invalid-input",
      "message": "Input is not valid: Field input.categoryUrls is required"
    }
  }
  ```
- **Relevant Command / File:** `server/src/providers/apify.js` (`buildActorInput`)
- **Root Cause:**
  `junglee/free-amazon-product-scraper` requires the property name `categoryUrls` rather than `categoryOrProductUrls`.
- **Diagnostic Steps Performed:**
  Queried the Apify Actor metadata API (`https://api.apify.com/v2/actors/junglee~free-amazon-product-scraper`) and inspected its latest tagged build's `inputSchema.properties`.
- **Solution Attempted:**
  Updated `buildActorInput('amazon', query)` to produce `{ categoryUrls: [{ url }], maxItemsPerStartUrl, scrapeProductDetails }`.
- **Whether Solution Worked:** Yes.
- **Verification Evidence:**
  The subsequent execution of `npm --prefix server run apify:test -- --test-search="wireless earbuds"` succeeded with HTTP 201, returning 5 genuine products with verified titles, prices in paise, and Amazon product URLs.
- **Files Changed:** `server/src/providers/apify.js`, `server/tests/apifyProvider.test.js`.
- **Prevention Steps:**
  Always query the Actor's live `inputSchema` via Apify API v2 instead of relying on community forum snippets.
- **Related Errors:** None.

---

### ERR-005: Apify Meesho Actor Permission Approval Requirement
- **Date & Time:** 2026-10-15 09:43 IST
- **Phase / Feature:** Apify Integration — Multi-Retailer Verification
- **Status:** INVESTIGATING
- **Exact Error Message:**
  ```text
  Status: 403
  Response data: {
    "type": "full-permission-actor-not-approved",
    "message": "This Actor requires full access to your account. You must approve its permissions before running it: https://console.apify.com/actors/ieBlkzFwOEsOIlWQ0?approvePermissions=true"
  }
  ```
- **Relevant Command / File:** `server/src/providers/apify.js` (Meesho Actor execution)
- **Root Cause:**
  The Actor `scrapeai/meesho-product-scraper` requests full account permissions. Under Apify's security policy, third-party Actors requesting full account access cannot be executed programmatically via API token until the user explicitly approves permissions in their Apify Console UI.
- **Diagnostic Steps Performed:**
  Inspected the 403 error body and identified the approval URL.
- **Solution Attempted:**
  Documented the exact one-click approval URL for the user (`https://console.apify.com/actors/ieBlkzFwOEsOIlWQ0?approvePermissions=true`), while keeping Amazon India and Flipkart as fully verified live sources.
- **Whether Solution Worked:** Awaiting user one-click approval in Apify Console.
- **Files Changed:** `server/src/providers/apify.js`, `README.md`.
- **Prevention Steps:**
  Inspect third-party Actor permission requirements before integration.
- **Related Errors:** None.

---

### ERR-006: Price Alert Non-Notification & Brevo Credential Format Mismatch
- **Date & Time:** 2026-10-15 10:45 IST
- **Phase / Feature:** Price Alert Evaluation & Notification Dispatch Verification
- **Status:** VERIFIED
- **Exact Error Message:**
  ```text
  Brevo API error 401: Key not found
  ```
- **Relevant Command / File:** `server/src/controllers/alertsController.js`, `server/src/services/notifications/email.js`, `server/src/services/priceMonitor.js`
- **Root Cause:**
  1. **Immediate Evaluation Gap:** `createAlert` in `alertsController.js` only persisted alerts with `status: 'active'`, `armed: true` to MongoDB without evaluating conditions at creation time. Since background monitoring operates on a 4-hour cycle, immediate user notifications did not occur.
  2. **Brevo Key Format Mismatch:** `BREVO_API_KEY` was populated with a Brevo SMTP password (`xsmtpsib-...`) rather than a Transactional Email REST API key (`xkeysib-...`). Calling `https://api.brevo.com/v3/smtp/email` with an SMTP key returns HTTP 401: `Key not found`.
  3. **Telegram Link State:** The user account had not completed Telegram linking (`telegramChatId: null`), causing Telegram notifications to be skipped.
- **Diagnostic Steps Performed:**
  1. Inspected created alerts and `NotificationEvent` audit collection in MongoDB Atlas (`NotificationEvent` count was 0).
  2. Tested Brevo delivery using `sendEmail` which returned HTTP 401: `Key not found`.
  3. Inspected the prefix of `BREVO_API_KEY` without exposing secrets and confirmed `xsmtpsib` key format.
  4. Confirmed Telegram Bot `@PriceRadar_Alerts_Bot` (ID: 8618074027) is online and active.
- **Solution Attempted:**
  1. Extracted centralized `alertDispatcher.js` implementing multi-channel delivery and audit logging in `NotificationEvent` with unique `dedupeKey` protection.
  2. Enhanced `createAlert` in `alertsController.js` to evaluate `target_price` alerts immediately upon creation against the latest valid offer price (`currentPrice <= targetPrice`). If satisfied, it disarms the alert, dispatches notifications across configured channels, and responds with `triggeredImmediately: true`.
  3. Ensured `fixed_drop` alerts baseline against creation price and do not trigger on creation.
  4. Added `getOfferById` (`GET /api/offers/:offerId`) and populated offer details on alerts so users see product titles and current prices.
  5. Added on-demand "Refresh & Check Prices Now" triggers in `monitorController.js` (`POST /api/monitor/trigger`), DashboardPage, and AlertManagementPage.
  6. Enhanced `verifyEmailConfig.js` to detect `xsmtpsib-` vs `xkeysib-` keys and output actionable remediation instructions.
  7. Updated `verifyTelegramConfig.js` with automatic DB lookup for linked users when `--chat-id` is omitted.
  8. Enhanced `AlertFormPage.jsx` with an immediate evaluation notice when entered target price is >= current price.
- **Whether Solution Worked:** Yes.
- **Verification Evidence:**
  - Running `npm run monitor:run` processed 2 distinct live offers, evaluated dependent alerts, and successfully triggered 3 alerts in MongoDB Atlas with `NotificationEvent` audit records.
  - All 19 backend test suites (193 tests) passed green.
  - Python worker tests (8/8) passed.
  - Vite frontend production build succeeded in 859ms.
- **Files Changed:**
  - `server/src/services/alertDispatcher.js`
  - `server/src/controllers/alertsController.js`
  - `server/src/controllers/monitorController.js`
  - `server/src/controllers/offersController.js`
  - `server/src/routes/monitor.js`
  - `server/src/routes/offers.js`
  - `server/src/services/priceMonitor.js`
  - `server/src/services/notifications/email.js`
  - `server/src/jobs/verifyEmailConfig.js`
  - `server/src/jobs/verifyTelegramConfig.js`
  - `server/src/jobs/runMonitorLocally.js`
  - `client/src/services/api.js`
  - `client/src/pages/AlertFormPage.jsx`
  - `client/src/pages/AlertManagementPage.jsx`
  - `client/src/pages/DashboardPage.jsx`
  - `server/tests/watchlistAndAlerts.test.js`
  - `server/tests/monitor.test.js`
- **Prevention Steps:**
  - Always validate conditions immediately when user thresholds are already satisfied at configuration time.
  - Distinguish SMTP passwords from REST API keys in environment configuration diagnostics.
- **Related Errors:** None.

---

### ERR-008: Price-Alert Email Delivery Failure Due to In-Memory Stale Credentials & Missing Audit Metadata
- **Date & Time:** 2026-10-15 12:15 IST
- **Phase / Feature:** Phase 4 & 5 — Live Brevo Notification Delivery
- **Status:** VERIFIED
- **Exact Error Message:**
  ```text
  Brevo API error 401: Key not found. Note: The configured BREVO_API_KEY starts with 'xsmtpsib-' which is an SMTP password. Brevo REST API requires an API key starting with 'xkeysib-' from Brevo Console -> SMTP & API -> API Keys tab.
  ```
- **Relevant Command / File:** `server/src/services/alertDispatcher.js`, `server/src/services/notifications/email.js`, `server/src/controllers/notificationsController.js`
- **Root Cause:**
  1. The background server process (`node server/src/server.js`) had been started prior to the user updating `server/.env` with the valid `xkeysib-` Brevo REST API key. Node.js caches `process.env` at startup, so subsequent alert evaluations in the running process continued using the stale `xsmtpsib-` SMTP password in memory, causing Brevo to return 401 Unauthorized for alert dispatches.
  2. While the CLI test runner (`npm run email:test`) loaded the updated file directly, it defaulted to `EMAIL_FROM` (`vamshiyamjala20@gmail.com`) rather than the active user account (`srinivasvamshi28@gmail.com`), creating the appearance that email worked generally while user alerts failed.
  3. The `NotificationEvent` schema did not persist `recipient` or Brevo's returned `providerMessageId`, and the UI did not expose detailed failure reasons or distinguish provider acceptance from confirmed inbox arrival.
- **Diagnostic Steps Performed:**
  1. Inspected `NotificationEvent` collection in MongoDB Atlas; identified all email dispatches failed with 401 Unauthorized error details.
  2. Verified recipient resolution in `alertDispatcher.js` correctly resolved the user's registered account email (`srinivasvamshi28@gmail.com`).
  3. Tested Brevo REST API authentication with `GET https://api.brevo.com/v3/account` using the updated key; confirmed HTTP 200 OK with active send credits.
- **Solution Attempted:**
  1. Updated `server/src/config/env.js` with `reloadEnv()` to reload variables dynamically without requiring full server restarts.
  2. Enhanced `email.js` with recipient email validation, dynamic env loading guard, and metadata return (`providerMessageId`, `recipient`).
  3. Extended `NotificationEvent.js` model and `alertDispatcher.js` to persist `recipient` and `providerMessageId`, masking emails in logs for security.
  4. Updated `notificationsController.js` and `NotificationHistoryPage.jsx` to render clear delivery statuses (Accepted by Brevo with Message ID, Delivered to Telegram, or Dispatch Failed with reason).
  5. Restarted backend server process on port 5000 with the active `xkeysib-` REST API key.
  6. Triggered one controlled verification alert dispatch through `dispatchAlertNotifications` to `srinivasvamshi28@gmail.com`; Brevo accepted the message with Provider Message ID `<202610150646.30592578245@smtp-relay.mailin.fr>`.
- **Whether Solution Worked:** Yes.
- **Verification Evidence:**
  - Controlled alert dispatch returned `success: true` with Brevo Message ID `<202610150646.30592578245@smtp-relay.mailin.fr>`.
  - MongoDB Atlas `NotificationEvent` recorded `status: 'sent'`, `recipient: 'srinivasvamshi28@gmail.com'`, `providerMessageId`.
  - Full server test suite: 19 test suites, 195 tests passed green.
  - Client production build: Vite build passed cleanly in 897ms.
- **Files Changed:**
  - `server/src/config/env.js`
  - `server/src/services/notifications/email.js`
  - `server/src/services/alertDispatcher.js`
  - `server/src/models/NotificationEvent.js`
  - `server/src/controllers/notificationsController.js`
  - `server/src/jobs/verifyEmailConfig.js`
  - `client/src/pages/NotificationHistoryPage.jsx`
  - `server/tests/emailService.test.js`
  - `server/tests/notificationFlow.test.js`
- **Related Errors:** ERR-007.

---

### ERR-010: Completely Blank Search Page Caused by Temporal Dead Zone ReferenceError in ProductCard
- **Date & Time:** 2026-10-16 22:00 IST
- **Phase / Feature:** Phase 2 — Blank Search Page Diagnosis & Product Card Rendering
- **Status:** VERIFIED
- **Exact Error Message:**
  ```text
  ReferenceError: Cannot access 'lowestOffer' before initialization in ProductCard.jsx
  ```
- **Relevant Command / File:** `client/src/components/ProductCard.jsx`, `client/src/pages/SearchPage.jsx`, `client/src/App.jsx`
- **Root Cause:**
  In `client/src/components/ProductCard.jsx`, line 15 evaluated `const retailerName = lowestOffer?.retailer ...` prior to `lowestOffer` being declared on line 21. Because `lowestOffer` was declared with `const`, JavaScript placed it in the Temporal Dead Zone (TDZ). When `SearchPage.jsx` received product search results (e.g. for query `samsung`) and rendered `<ProductCard>`, the component threw an uncaught `ReferenceError`. Because the React router had no top-level `<ErrorBoundary>`, the uncaught exception unmounted the entire React component tree, rendering the screen completely blank white and hiding the navigation, search input, and results.
- **Diagnostic Steps Performed:**
  1. Inspected `client/src/components/ProductCard.jsx` code path and variable declaration order.
  2. Identified that `lowestOffer` was declared after being read by `retailerName`.
  3. Verified that backend `/api/products/search?q=samsung` was functioning correctly and returning genuine live products from MongoDB/Apify, confirming the failure was purely in frontend component rendering.
- **Solution Attempted:**
  1. Reordered variable declarations in `ProductCard.jsx` so `validOffers` and `lowestOffer` are computed first before `retailerName` and `displayPrice` are evaluated.
  2. Added defensive destructuring for `product` properties with defaults (`offers = []`, `title = ''`, etc.).
  3. Created `client/src/components/ErrorBoundary.jsx` and wrapped `<Routes>` in `App.jsx` to ensure that any component-level rendering glitch will never collapse the navigation or render a completely blank application.
  4. Verified new Apify API token from `nagavamshi2012@gmail.com` (`verdant_observatory`) with $5.00 available credit, and ran a controlled live search for `samsung` confirming live products from Amazon India and Flipkart are retrieved and persisted to MongoDB Atlas without errors.
- **Whether Solution Worked:** Yes.
- **Verification Evidence:**
  - `npm --prefix client run build` completed cleanly in 970ms with zero errors.
  - `npm --prefix server test` passed all 20 test suites and 203 tests green.
  - Controlled `/api/products/search?q=samsung` returned genuine live products with integer paise pricing, valid URLs, and active retailer store badges.
  - Tested `/search?q=samsung` HTML rendering and verified layout structure.
- **Files Changed:**
  - `client/src/components/ProductCard.jsx`
  - `client/src/components/ErrorBoundary.jsx`
  - `client/src/App.jsx`
  - `client/src/pages/SearchPage.jsx`
- **Prevention Steps:**
  - Always enforce ErrorBoundary boundaries around critical application views.
  - Ensure computed state variables are declared before dependent derived properties.
- **Related Errors:** ERR-008.
