# PriceRadar — Program Tracker & Development Ledger

**Project Name:** PriceRadar  
**Authoritative Reference:** `docs/01-MASTER-PROJECT-DEVELOPMENT-GUIDE.pdf` and member guides `02` through `05`  
**Target Repository:** `https://github.com/VamshiYamjala/PriceR.git`  
**Primary Branch:** `main`  
**Development Workspace:** `D:\priceR`  
**Last Updated:** 2026-10-14  

---

## 1. Project Overview & Requirements

PriceRadar is an intelligent web application designed for real-time product price comparison across multiple labeled sources and automated price-drop alerting.

### Core Objectives
1. **Search & Compare:** Search for products across e-commerce sources (Flipkart, Amazon) and display side-by-side pricing.
2. **Data Transparency:** Distinctly and prominently label sample/fixture data versus verified live data (`isSample: true`).
3. **User Authentication:** Secure JWT-based registration, login, and authorization isolating user data.
4. **Watchlist:** Personal watchlist allowing authenticated users to track products and offers.
5. **Intelligent Alerts:**
   - **Target Price Alert:** Triggers when price drops to or below a specified target (e.g., "Notify when price $\le$ ₹1,000").
   - **Fixed Drop Alert:** Triggers when price drops by a specific amount compared to initial baseline (e.g., "Notify when price drops by ₹200").
6. **Multi-Channel Notifications:** Transactional emails via Brevo and direct alerts via Telegram Bot API.
7. **Automated Scheduled Monitoring:** Server-side cron job executing hourly via GitHub Actions with duplicate notification suppression and automatic re-arming.
8. **Protected Manual Run:** Authenticated `POST /api/monitor/run` endpoint with shared secret header (`X-Monitor-Secret`) for manual testing and demonstrations.

---

## 2. Initial Workspace and Repository Status

- **Initial State:** The workspace `D:\priceR` contained only the `docs/` folder containing the 5 official PDF project guides and an initial `IMPLEMENTATION-AUDIT.md`.
- **Reference Scaffolding:** A sibling directory `D:\PriceRadar` existed containing starter scaffolding and manifests from initial setup.
- **Git Repository State:** `D:\priceR` was not yet initialized as a git repository (`fatal: not a git repository`).
- **Action Taken:**
  1. Synchronized the complete project structure (`.github`, `client`, `server`, `.gitignore`, `README.md`) from the scaffolding into `D:\priceR`.
  2. Initialized Git in `D:\priceR`, renamed default branch to `main`, and configured remote `origin` to `https://github.com/VamshiYamjala/PriceR.git`.
  3. Verified `node_modules` integrity, executed Jest health tests (2/2 passing), and validated Vite production build (107 modules compiled cleanly).

---

## 3. Existing Files and Their Purposes

### Repository Configuration
- `.gitignore`: Excludes `node_modules/`, `.env*`, `dist/`, `build/`, `coverage/`, and editor logs. Prevents committing secrets.
- `README.md`: High-level project documentation, architecture overview, and setup commands.
- `.github/workflows/ci.yml`: Automated CI pipeline running `npm test` on PRs and pushes to `main`.
- `.github/workflows/monitor.yml`: Scheduled GitHub Actions workflow invoking `POST /api/monitor/run` every hour.
- `docs/01-MASTER-PROJECT-DEVELOPMENT-GUIDE.pdf`: Single source of truth for architecture, schemas, and API contracts.
- `docs/02-FRONTEND-AND-API-INTEGRATION-GUIDE.pdf`: Frontend handbook for React, Vite, Bootstrap, and screens.
- `docs/03-BACKEND-DATABASE-AND-AUTHENTICATION-GUIDE.pdf`: Backend handbook for Express, MongoDB Mongoose, and Auth.
- `docs/04-RETAILER-DATA-SCHEDULER-AND-NOTIFICATIONS-GUIDE.pdf`: Handbook for providers, monitor scheduler, Brevo, and Telegram.
- `docs/05-TEAM-LEAD-GITHUB-INTEGRATION-AND-DEPLOYMENT-GUIDE.pdf`: Handbook for Git workflow, integration, and Render deployment.
- `docs/IMPLEMENTATION-AUDIT.md`: Scaffolding audit identifying gaps and action matrix.

### Frontend (`client/`)
- `client/package.json`: Frontend dependencies (React 18, Vite 5, React Router v6, Axios, Bootstrap 5).
- `client/vite.config.js`: Vite configuration with React plugin running on port 5173.
- `client/index.html`: Main HTML template importing Bootstrap CDN bundle.
- `client/.env.example`: Template for frontend environment variables (`VITE_API_URL`).
- `client/src/main.jsx`: Application bootstrap wrapping App with `BrowserRouter` and `AuthProvider`.
- `client/src/App.jsx`: Main routing table containing all 12 screen routes and protected route wrappers.
- `client/src/styles/theme.css`: Custom theme variables (`--pr-*` tokens) and styling overrides.
- `client/src/services/api.js`: Centralized Axios client handling authorization headers and API calls.
- `client/src/context/AuthContext.jsx`: React context managing user authentication state and localStorage tokens.
- `client/src/components/`: Reusable components (`Navbar.jsx`, `ProtectedRoute.jsx`, `ProductCard.jsx`, `OfferRow.jsx`).
- `client/src/pages/`: Page components for Search, Details, Auth, Dashboard, Watchlist, Alerts, and Notifications.

### Backend (`server/`)
- `server/package.json`: Backend dependencies (Express 4, Mongoose 8, bcryptjs, jsonwebtoken, express-validator, axios, dotenv, cors).
- `server/.env.example`: Environment variable template specifying all 13 backend configuration keys.
- `server/src/server.js`: Server entry point that connects to MongoDB and starts Express on port 5000.
- `server/src/app.js`: Express app instance setting up CORS, JSON parsing, routes, and centralized error handling.
- `server/src/config/db.js`: Mongoose connection manager with connection event logging.
- `server/src/middleware/`:
  - `auth.js`: JWT verification middleware extracting user ID to `req.user.id`.
  - `validate.js`: Validation middleware checking `express-validator` result sets.
  - `errorHandler.js`: Centralized error handler normalizing responses and obscuring stack traces in production.
- `server/src/utils/`:
  - `asyncHandler.js`: Wrapper catching promise rejections in route controllers.
  - `money.js`: Integer paise math helpers (`rupeesToPaise`, `paiseToRupees`, `formatRupees`).
- `server/src/models/`:
  - `User.js`: User schema with lowercase unique email, hashed password, and Telegram chat ID.
  - `Product.js`: Product schema with unique canonical key and metadata.
  - `Offer.js`: Retailer offer schema with compound unique index `(provider, externalProductId)` and paise pricing.
  - `PriceObservation.js`: Historical price records with index `(offerId, fetchedAt)`.
  - `WatchlistItem.js`: User watchlist items with compound unique index `(userId, offerId)`.
  - `Alert.js`: Alert definitions for target price and fixed drops with armed state tracking.
  - `NotificationEvent.js`: Audit log of sent notifications with compound unique index `(alertId, dedupeKey)`.
- `server/src/providers/`:
  - `fixtureData.json`: Seed dataset of 6 products and 12 retailer offers.
  - `fixture.js`: Sample data provider simulating network latency and failure testing.
  - `flipkart.js`: Candidate client for Flipkart Affiliate API.
  - `amazon.js`: Enforces mock-only policy for Amazon (live scraping strictly forbidden).
  - `index.js`: Provider dispatcher returning standardized offer results.
- `server/src/services/`:
  - `priceComparison.js`: Lowest price calculation and savings analyzer.
  - `alertEvaluator.js`: Condition evaluator for target price and fixed drop alerts.
  - `priceMonitor.js`: Core monitoring engine running observation batches and triggering alert checks.
  - `notifications/email.js`: Brevo transactional email sender.
  - `notifications/telegram.js`: Telegram Bot API message sender.
- `server/src/controllers/` & `server/src/routes/`: Express endpoints for Auth, Products, Offers, Watchlist, Alerts, Notifications, Telegram, and Monitor.
- `server/tests/health.test.js`: Smoke tests verifying `/api/health` and 404 handler.

---

## 4. Final Project Architecture and Folder Structure

```
PriceRadar/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # PR and Push CI testing
│       └── monitor.yml            # Scheduled hourly price monitor
├── .gitignore
├── README.md
├── PROGRAM_TRACKER.md             # Chronological development tracker
├── ERROR_LOG.md                   # Permanent error & troubleshooting log
├── docs/
│   ├── 01-MASTER-PROJECT-DEVELOPMENT-GUIDE.pdf
│   ├── 02-FRONTEND-AND-API-INTEGRATION-GUIDE.pdf
│   ├── 03-BACKEND-DATABASE-AND-AUTHENTICATION-GUIDE.pdf
│   ├── 04-RETAILER-DATA-SCHEDULER-AND-NOTIFICATIONS-GUIDE.pdf
│   ├── 05-TEAM-LEAD-GITHUB-INTEGRATION-AND-DEPLOYMENT-GUIDE.pdf
│   └── IMPLEMENTATION-AUDIT.md
├── client/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── styles/
└── server/
    ├── .env.example
    ├── package.json
    ├── src/
    │   ├── app.js
    │   ├── server.js
    │   ├── config/
    │   ├── controllers/
    │   ├── jobs/
    │   ├── middleware/
    │   ├── models/
    │   ├── providers/
    │   ├── routes/
    │   ├── services/
    │   └── utils/
    └── tests/
```

---

## 5. Technology Stack and Rationale

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Frontend Framework** | React | 18 | Declarative component model, ecosystem maturity, optimal pairing with modern Vite build tool. |
| **Bundler & Dev Server** | Vite | 5 | Fast HMR (Hot Module Replacement) and optimized production bundle output. |
| **Routing** | React Router | v6 | Declarative client-side routing with nested layout and route guard support. |
| **Styling** | Bootstrap 5 + CSS | 5.3.3 | Rapid responsive UI layout combined with custom CSS design tokens. |
| **HTTP Client** | Axios | ^1.7.0 | Promise-based client with centralized request interceptors for auth headers. |
| **Runtime Environment** | Node.js | v20 LTS / v22 | Native ES Module support, performant asynchronous event loop. |
| **Web Framework** | Express | 4 | Minimalist, unopinionated web framework for building clean RESTful APIs. |
| **Database** | MongoDB Atlas | Cloud M0 | Managed cloud NoSQL database providing flexible document modeling and zero local server overhead. |
| **ODM** | Mongoose | 8 | Strict schema modeling, data type validation, and index lifecycle enforcement. |
| **Authentication** | JWT & bcryptjs | 9 / 2.4 | Stateless cryptographic token auth and salted password hashing. |
| **Input Validation** | express-validator | ^7.2.0 | Middleware-based request sanitization and schema enforcement. |
| **Testing** | Jest & Supertest | ^29.7.0 | Automated testing framework with ES module support for unit and integration suites. |
| **Notifications** | Brevo & Telegram | API v3 / Bot API | Reliable transactional email delivery and real-time instant messaging alerts. |

---

## 6. Chronological Development History

### Task 1: Comprehensive Initial Workspace Audit & Project Initialization
- **Date & Time:** 2026-10-14 13:08 IST
- **Phase:** Phase 1 — Project Inspection & Repository Initialization
- **Files Created / Synchronized:**
  - `PROGRAM_TRACKER.md` (Created)
  - `ERROR_LOG.md` (Created)
  - Full project files synchronized from starter scaffold (`.github`, `client`, `server`, `.gitignore`, `README.md`)
- **What Changed:**
  - Initialized Git repository in `D:\priceR`.
  - Set default branch to `main`.
  - Configured remote `origin` to `https://github.com/VamshiYamjala/PriceR.git`.
  - Created permanent development ledger and error log.
- **Why Needed:** Establish a clean baseline, verify test suite functionality, prevent duplicate work, and adhere to beginner mentoring standards.
- **Commands Executed:**
  ```powershell
  robocopy "D:\PriceRadar" "d:\priceR" /E /XD ".git" "node_modules" "dist"
  git init
  git branch -M main
  git remote add origin https://github.com/VamshiYamjala/PriceR.git
  npm --prefix "d:\priceR\server" test
  npm --prefix "d:\priceR\client" run build
  ```
- **Tests Performed & Results:**
  - Jest `tests/health.test.js`: Passed 2/2 tests (GET `/api/health` 200 OK, GET `/api/nonexistent` 404).
  - Vite client build: Passed cleanly (107 modules transformed, output `dist/`).
- **Errors Encountered:**
  - ERR-001: UnicodeEncodeError in python script during PDF outline inspection (Fixed).
  - ERR-002: Remote repository host resolution failure (Fixed & Verified).
- **Git Commit Hash:** `69f9ec8` (pushed to `origin/main`).
- **Next Task:** Phase 2: Fix notification preferences routing, monitor controller HTTP status, fixture seeding job, and business logic tests.

---

### Task 2: Phase 2 Core API Corrections, Seeder, and Unit Test Suite
- **Date & Time:** 2026-10-14 13:25 IST
- **Phase:** Phase 2 — API Corrections, Seeder, and Pure Logic Unit Tests
- **Files Created / Modified:**
  - `server/src/routes/notificationPreferences.js` (Created)
  - `server/src/routes/notifications.js` (Updated)
  - `server/src/app.js` (Updated route mounts)
  - `server/src/services/priceMonitor.js` (Updated state tracking & error counting)
  - `server/src/controllers/monitorController.js` (Updated 202 status and added `getMonitorStatus`)
  - `server/src/routes/monitor.js` (Updated with `/status` route)
  - `server/src/jobs/seedFixtures.js` (Created idempotent database fixture seeder)
  - `server/package.json` (Added `seed:fixtures` script)
  - `server/src/services/alertEvaluator.js` (Added zero/negative price safety nets & re-arming logic)
  - `server/tests/notificationPreferences.test.js` (Created route & validation tests)
  - `server/tests/monitor.test.js` (Created monitoring trigger & status tests)
  - `server/tests/money.test.js` (Created currency integer math tests)
  - `server/tests/priceComparison.test.js` (Created lowest offer selection & savings tests)
  - `server/tests/alertEvaluator.test.js` (Created alert evaluation, edge cases, and lifecycle tests)
  - `ERROR_LOG.md` (Updated with ERR-002 verification and ERR-003 fix)
- **What Changed:**
  - **Task A (Routing):** Created a dedicated router for `/api/notification-preferences` matching Document 1 Section 6.5 contract (`GET /`, `PUT /`). Cleaned `/api/notifications` router to serve notification history. Added validation for email and 401 JWT auth guard.
  - **Task B (Monitoring):** Implemented Document 1 Section 6.6 contract: `POST /api/monitor/run` checks `X-Monitor-Secret` (returns 401 `AUTH_INVALID` on mismatch) and responds with HTTP 202 Accepted. Implemented `GET /api/monitor/status` returning `{ lastRunAt, lastRunOffersChecked, lastRunErrors }` protected by user authentication.
  - **Task C (Seeding):** Created `seedFixtures.js` that reads `fixtureData.json`, upserts products by `canonicalKey`, upserts offers by `(provider, externalProductId)`, guards against production without `--force-production`, and gracefully closes connections. Added `npm run seed:fixtures` script.
  - **Task D (Testing & Logic):** Hardened `alertEvaluator.js` against invalid or $\le 0$ prices (prevents provider failures from triggering false price-drop alerts). Built 45 automated unit tests across 6 Jest test suites covering money, price comparison, alert evaluation lifecycle, and monitoring.
- **Commands Executed:**
  ```powershell
  npm --prefix "d:\priceR\server" test
  npm --prefix "d:\priceR\client" run build
  npm --prefix "d:\priceR\server" run seed:fixtures
  ```
- **Tests Performed & Actual Results:**
  - Jest Test Suites: 6/6 passed, 45/45 tests green:
    - `tests/health.test.js`: 2 passed
    - `tests/notificationPreferences.test.js`: 5 passed
    - `tests/monitor.test.js`: 5 passed
    - `tests/money.test.js`: 8 passed
    - `tests/priceComparison.test.js`: 9 passed
    - `tests/alertEvaluator.test.js`: 16 passed
  - Vite client build: 107 modules compiled with 0 errors.
  - Seeder CLI test: Correctly exited with error and instructional message when `MONGODB_URI` was unconfigured.
- **Errors Encountered:**
  - ERR-003: `ReferenceError` in `tests/priceComparison.test.js` line 39 (Fixed & Verified).
- **Git Commit Hash:** `a5265ff` (pushed to `origin/main`).
- **Next Task:** Phase 4: Database setup checkpoint (MongoDB Atlas cluster creation, connection, and seeding).

---

### Task 3: MongoDB Atlas Connection, Fixture Seeding, Idempotency & Search Tests
- **Date & Time:** 2026-10-14 14:55 IST
- **Phase:** Phase 4 — Database Setup, Live Connection & Seeding Verification
- **Files Created / Modified:**
  - `server/src/jobs/verifyDbConnection.js` (Created safe connection and ping verifier)
  - `server/src/config/db.js` (Updated to auto-load server/.env when needed)
  - `server/src/server.js` (Updated to explicitly resolve server/.env path)
  - `server/package.json` (Added `db:verify` script)
  - `server/tests/products.test.js` (Created search and detail integration tests against seeded database)
- **What Changed:**
  - User configured `server/.env` with MongoDB Atlas cluster credentials (excluded from git by `.gitignore`).
  - Executed safe verification script `npm run db:verify`, confirming TLS connection and admin database ping to cluster `cluster0.9bgvpx9.mongodb.net`.
  - Executed `npm run seed:fixtures`, upserting 6 products and 12 offers from `fixtureData.json` into MongoDB Atlas database `priceradar`.
  - Re-ran `seedFixtures` and verified collection count idempotency: `Product.countDocuments() === 6`, `Offer.countDocuments() === 12` with 0 duplicate records created.
  - Implemented and verified integration tests in `tests/products.test.js`:
    - `GET /api/products/search` (empty query $\rightarrow$ empty array `[]`)
    - `GET /api/products/search?q=Samsung` (returns matched products with offers containing provider, price in paise, and `isSample: true`)
    - `GET /api/products/:productId` (returns `{ product, offers }` matching Master Guide Section 6.2)
    - `GET /api/products/:productId` with non-existent ID (returns 404 `NOT_FOUND`)
- **Commands Executed:**
  ```powershell
  npm --prefix "d:\priceR\server" run db:verify
  npm --prefix "d:\priceR\server" run seed:fixtures
  npm --prefix "d:\priceR\server" test
  npm --prefix "d:\priceR\client" run build
  ```
- **Tests Performed & Actual Results:**
  - `db:verify`: Mongoose connected successfully and admin ping passed.
  - Database Seeder: Upserted 6 products, 12 offers. Second run confirmed exact same count (no duplicates).
  - Jest Test Suites: 7/7 passed, 49/49 tests green:
    - `tests/products.test.js`: 4 passed
    - `tests/health.test.js`: 2 passed
    - `tests/monitor.test.js`: 5 passed
    - `tests/notificationPreferences.test.js`: 5 passed
    - `tests/money.test.js`: 8 passed
    - `tests/priceComparison.test.js`: 9 passed
    - `tests/alertEvaluator.test.js`: 16 passed
  - Vite client build: 107 modules compiled with 0 errors.
- **Errors Encountered:** None.
- **Git Commit Hash:** `5cb7db8` (pushed to `origin/main`).
- **Next Task:** Phase 5: Authentication, User Registration & Login, and Authorization Tests.


