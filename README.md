# PriceRadar

> Real-Time Product Price Comparison and Intelligent Price-Drop Alert System

PriceRadar allows users to search for e-commerce products, compare prices across multiple retailers side-by-side, save offers to a personal watchlist, set custom price-drop alerts ("notify me when this hits ₹X" or "notify me when this drops by ₹Y"), and receive notifications via Email (Brevo) and Telegram. Monitoring runs on the server on a reliable schedule — never in the user's browser.

---

## 1. Project Objectives and Scope

### In Scope (7-Day MVP)
- **Search & Price Comparison:** Search products and compare offers side-by-side across at least two labeled sources (Flipkart / Amazon).
- **User Authentication:** Registration, login, and JWT-based session management (`localStorage` with short expiry).
- **Personal Watchlist & Alerts:** Save favorite offers; configure target-price or fixed-amount drop alerts.
- **Intelligent Alert Engine:** Duplicate suppression, alert state tracking (`armed: true/false`), and automated re-arming logic.
- **Multi-Channel Notifications:** Email alerts via Brevo API and Telegram Bot API alerts, complete with notification event history.
- **Server-Side Scheduled Monitoring:** Automated hourly cycle via GitHub Actions workflow triggering a protected backend endpoint (`POST /api/monitor/run`).
- **Demo Capabilities:** On-demand monitoring execution and switchable fixture price simulation for testing and live evaluation.

### Out of Scope (7-Day MVP)
- Automatic product purchasing / checkout automation.
- AI or machine-learning price predictions.
- Microservices architecture or payment processing systems.
- Browser-based scraping workarounds or CAPTCHA bypasses.
- Unverified claims of live retailer API access.

### Core Non-Functional Requirements
- **Honesty:** The UI clearly distinguishes live data from sample data using an explicit `Sample data` badge (`isSample: true`).
- **Data Isolation:** Strict per-user authorization for watchlists, alerts, and notification history.
- **Resilience:** Retailer fetch failures are recorded safely and never result in a price of ₹0 or cause false alerts.
- **Zero Duplicate Spam:** Unchanged alert conditions do not trigger duplicate notifications.
- **Secrets Hygiene:** No credentials, API tokens, or `.env` files are ever committed.

---

## 2. Technology Stack

| Layer | Choice | Details |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast HMR, React Router v6, plain JavaScript |
| **Styling** | Bootstrap 5 (CDN) + Custom Theme | Bootstrap 5.3.3 via CDN, `client/src/styles/theme.css` for palette |
| **HTTP Client** | Axios | Shared Axios instance with request/response interceptors (`client/src/services/api.js`) |
| **Backend** | Node.js 20 LTS + Express 4 | Modular MVC architecture with ESM (`"type": "module"`) |
| **Database** | MongoDB Atlas + Mongoose 8 | Cloud-hosted M0 cluster with schemas, indexes, and paise-integer precision |
| **Authentication** | bcryptjs + jsonwebtoken | Pure-JS bcrypt hashing (cost factor 10) and signed JWT tokens |
| **Validation** | express-validator | Declarative request payload and query validation middleware |
| **Retailer Data** | Axios + Fixture Provider | Seeded Indian e-commerce fixture dataset + safe Flipkart/Amazon adapter shells |
| **Scheduler** | GitHub Actions | Hourly cron workflow triggering protected backend monitoring endpoint |
| **Email** | Brevo Transactional API | Verified sender notifications with delivery tracking |
| **Messaging** | Telegram Bot API | Direct HTTPS bot delivery linked to user chat IDs |
| **Testing** | Jest + Supertest | Unit and integration testing suites |
| **Hosting** | Render (Free Tier) | Independent Web Services for frontend and backend |

---

## 3. Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                   React + Vite (SPA)                   │
│        Bootstrap 5 UI + Axios Centralized Client       │
└───────────────────────────▲────────────────────────────┘
                            │ REST / JSON (JWT Auth)
┌───────────────────────────▼────────────────────────────┐
│                  Express.js API Server                 │
│  ├── Health Check: /api/health                         │
│  ├── Auth Routes: /api/auth                            │
│  ├── Product/Offer Routes: /api/products, /api/offers  │
│  ├── User Data: /api/watchlist, /api/alerts            │
│  ├── Notifications: /api/notifications                 │
│  └── Protected Monitor Trigger: /api/monitor/run       │
└──────▲────────────────────▲───────────────────▲────────┘
       │                    │                   │
┌──────▼──────┐      ┌──────▼──────┐     ┌──────▼──────┐
│   MongoDB   │      │  Retailer   │     │ Notification│
│    Atlas    │      │  Providers  │     │  Services   │
│ (Mongoose)  │      │(Fixture/API)│     │(Brevo/TgBot)│
└─────────────┘      └─────────────┘     └─────────────┘
                            ▲
                            │ Scheduled HTTP Trigger
             ┌──────────────┴──────────────┐
             │  GitHub Actions (Hourly)    │
             │     .github/workflows/      │
             │        monitor.yml          │
             └─────────────────────────────┘
```

---

## 4. Repository Structure

```
PriceRadar/
├── README.md
├── .gitignore
├── docs/
│   ├── 01-MASTER-PROJECT-DEVELOPMENT-GUIDE.pdf
│   ├── 02-FRONTEND-AND-API-INTEGRATION-GUIDE.pdf
│   ├── 03-BACKEND-DATABASE-AND-AUTHENTICATION-GUIDE.pdf
│   ├── 04-RETAILER-DATA-SCHEDULER-AND-NOTIFICATIONS-GUIDE.pdf
│   └── 05-TEAM-LEAD-GITHUB-INTEGRATION-AND-DEPLOYMENT-GUIDE.pdf
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable UI pieces (Navbar, ProtectedRoute, ProductCard, etc.)
│   │   ├── pages/             # Route screens (HomePage, SearchPage, ProductDetailPage, etc.)
│   │   ├── services/
│   │   │   └── api.js         # Single shared Axios client
│   │   ├── context/
│   │   │   └── AuthContext.jsx # React Context for JWT auth state
│   │   ├── styles/
│   │   │   └── theme.css      # Project color palette & style overrides
│   │   ├── App.jsx            # Application route table
│   │   └── main.jsx           # Frontend entry point
│   ├── index.html             # HTML entry point with Bootstrap 5 CDN
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # MongoDB Atlas connection
│   │   ├── models/            # Mongoose Schemas (User, Product, Offer, Alert, etc.)
│   │   ├── routes/            # Express routers
│   │   ├── controllers/       # Controller handlers
│   │   ├── middleware/        # auth.js, errorHandler.js, validate.js
│   │   ├── services/          # Business logic: priceComparison, priceMonitor, alertEvaluator
│   │   │   └── notifications/ # email.js, telegram.js
│   │   ├── providers/         # fixture.js, fixtureData.json, flipkart.js, amazon.js, index.js
│   │   ├── jobs/              # Local development cron runner
│   │   ├── utils/             # money.js, asyncHandler.js
│   │   ├── app.js             # Express app setup and middleware mounting
│   │   └── server.js          # HTTP server starter
│   ├── tests/                 # Jest + Supertest suites
│   ├── package.json
│   └── .env.example
└── .github/
    └── workflows/
        ├── monitor.yml        # Scheduled hourly monitoring workflow
        └── ci.yml             # Continuous integration test workflow
```

---

## 5. Team Roles and Responsibilities

- **Member 1 — Team Lead:** Repository architecture, GitHub integration, CI/CD, price comparison logic (`priceComparison.js`), price monitoring orchestrator (`priceMonitor.js`), alert evaluation engine (`alertEvaluator.js`), and Render deployment.
- **Member 2 — Frontend Developer:** React + Vite application, Bootstrap 5 UI screens, client-side routing, and integration with the backend API via `api.js`.
- **Member 3 — Backend Developer:** Express server setup, MongoDB Atlas integration, Mongoose data models, REST endpoints, authentication (JWT/bcrypt), and request validation.
- **Member 4 — Retailer Providers & Notifications:** Retailer ingestion (`fixture.js`, `flipkart.js`, `amazon.js`), provider dispatcher, notification services (`email.js`, `telegram.js`), and scheduled monitoring support.

---

## 6. Setup and Local Development Instructions

### Prerequisites
- **Node.js:** v20.x LTS or higher (`node -v`)
- **npm:** v10.x or higher (`npm -v`)
- **Git:** Installed and configured (`git --version`)
- **Terminal:** PowerShell on Windows 10/11

### Initial Setup

1. **Clone the repository:**
   ```powershell
   git clone https://github.com/VamshiYamjala/PriceRadar.git
   cd PriceRadar
   ```

2. **Backend Setup:**
   ```powershell
   cd server
   Copy-Item .env.example .env
   npm install
   ```
   *Edit `server/.env` to configure your MongoDB connection string and generate secrets:*
   ```powershell
   # Generate a 32-byte hex secret for JWT_SECRET and MONITOR_TRIGGER_SECRET:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Frontend Setup:**
   ```powershell
   cd ../client
   Copy-Item .env.example .env
   npm install
   ```

### Running the Application

- **Start Backend API (port 5000):**
  ```powershell
  cd server
  npm run dev
  ```
  Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

- **Start Frontend Dev Server (port 5173):**
  ```powershell
  cd client
  npm run dev
  ```
  App URL: [http://localhost:5173](http://localhost:5173)

---

## 7. Environment Variables Reference

### Backend (`server/.env`)
| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | Yes | HTTP port | `5000` |
| `NODE_ENV` | Yes | Environment mode | `development` |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/priceradar` |
| `JWT_SECRET` | Yes | Secret for signing JWT auth tokens | `random-32-byte-hex-string` |
| `JWT_EXPIRES_IN` | Yes | Token expiration duration | `7d` |
| `CLIENT_ORIGIN` | Yes | Allowed frontend origin for CORS | `http://localhost:5173` |
| `FLIPKART_AFFILIATE_ID` | No | Affiliate ID (blank until approved) | `your_affiliate_id` |
| `FLIPKART_AFFILIATE_TOKEN` | No | Affiliate Token (blank until approved) | `your_affiliate_token` |
| `BREVO_API_KEY` | Yes | Brevo Transactional Email API key | `xkeysib-...` |
| `EMAIL_FROM` | Yes | Verified sender email address | `alerts@yourdomain.example` |
| `TELEGRAM_BOT_TOKEN` | Yes | Telegram Bot Token from @BotFather | `123456789:ABCDefgh...` |
| `MONITOR_TRIGGER_SECRET` | Yes | Header secret for `POST /api/monitor/run` | `random-32-byte-hex-string` |
| `MONITORING_ENABLED` | Yes | Enable/disable monitoring cycles | `true` |

### Frontend (`client/.env`)
| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | Yes | Base URL for backend API calls | `http://localhost:5000` |

---

## 8. Retailer Data and Honest Fallback Policy

- **Fixture Fallback:** Reliable seeded dataset (`server/src/providers/fixtureData.json`) containing 6 products and 12 offers across Flipkart and Amazon.
- **Sample Labelling:** Every mock offer contains `isSample: true` and is clearly rendered with a "Sample data" badge in the UI.
- **Amazon Policy:** Amazon has no live affiliate API available for this tier; Amazon offers are strictly simulated sample data.
- **Flipkart Policy:** Flipkart affiliate integration is implemented in `server/src/providers/flipkart.js` but routed to fixture fallback until account approval and credentials are confirmed.
- **Fail-Safe Price Handling:** A failed fetch never outputs ₹0 and never triggers a false alert. Forced failure testing is supported via `forceFail: true` in `fixtureData.json`.

---

## 9. Git Workflow & Branch Strategy

- **`main` Branch:** Protected production branch. Direct commits to `main` are restricted.
- **Feature Branches:** Team members branch off `main`:
  - `feature/frontend` (Member 2)
  - `feature/backend-auth` (Member 3)
  - `feature/retailer-notifications` (Member 4)
  - `feature/price-engine-deployment` (Member 1)
- **Pull Requests:** Open a PR against `main`, ensure CI checks pass, obtain code review, and squash-merge.

---

## 10. Project Documentation

Comprehensive documentation guides are preserved in the [`docs/`](./docs) folder:
- [01 — Master Project Development Guide (PDF)](./docs/01-MASTER-PROJECT-DEVELOPMENT-GUIDE.pdf)
- [02 — Frontend and API Integration Guide (PDF)](./docs/02-FRONTEND-AND-API-INTEGRATION-GUIDE.pdf)
- [03 — Backend, Database and Authentication Guide (PDF)](./docs/03-BACKEND-DATABASE-AND-AUTHENTICATION-GUIDE.pdf)
- [04 — Retailer Data, Scheduler and Notifications Guide (PDF)](./docs/04-RETAILER-DATA-SCHEDULER-AND-NOTIFICATIONS-GUIDE.pdf)
- [05 — Team Lead, GitHub Integration and Deployment Guide (PDF)](./docs/05-TEAM-LEAD-GITHUB-INTEGRATION-AND-DEPLOYMENT-GUIDE.pdf)
