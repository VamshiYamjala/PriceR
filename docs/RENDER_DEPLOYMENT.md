# PriceRadar — Render Deployment Guide

This guide walks you through deploying the PriceRadar backend and frontend to Render using the official GitHub repository (`https://github.com/VamshiYamjala/PriceR.git`, branch `main`).

---

## 1. Architecture & Deployment Strategy

PriceRadar uses a decoupled architecture deployed as two separate services on Render:
1. **Backend Web Service:** Node.js Express API running from the `server` root directory.
2. **Frontend Static Site:** React + Vite single-page application built and served from the `client` root directory.

```
┌─────────────────────────────────────────────────────────────────┐
│               Render Static Site (client)                      │
│        https://<your-frontend-subdomain>.onrender.com           │
└───────────────────────────────┬─────────────────────────────────┘
                                │ API Requests (CORS Allowed)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│               Render Web Service (server)                       │
│        https://<your-backend-subdomain>.onrender.com            │
│                 Health Check: /api/health                       │
└──────────────┬───────────────────────────────┬──────────────────┘
               │                               │
               ▼                               ▼
       MongoDB Atlas Cluster            GitHub Actions Cron
    (Allowlist: Render Outbound IPs)    (Runs every 4 hours)
```

---

## 2. Prerequisites

Before creating services on Render, ensure you have:
1. A [Render account](https://render.com/).
2. A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster with Network Access configured (see Section 3).
3. Access to your third-party API accounts (optional, required only for specific features):
   - Apify API Token ([apify.com](https://apify.com)) — for live Amazon/Flipkart/Meesho scraping
   - Brevo API Key ([brevo.com](https://brevo.com)) — for transactional email alerts & OTP
   - Telegram Bot Token ([t.me/BotFather](https://t.me/BotFather)) — for instant Telegram alerts
   - eBay Developer App credentials ([developer.ebay.com](https://developer.ebay.com)) — for eBay Browse API

---

## 3. MongoDB Atlas Network Access Configuration

To allow your Render backend to connect to MongoDB Atlas securely:

### Recommended Approach: Authorize Render's Regional Outbound IPs
Render publishes outbound IP addresses for each deployment region (e.g. Oregon, Frankfurt, Singapore, Ohio).

1. Identify the **Region** where you create your Render Web Service (e.g. `Oregon, USA` or `Singapore`).
2. Consult Render's official Outbound IP list for your region in [Render Outbound IP Documentation](https://render.com/docs/ip-addresses) or under your Web Service's **Settings** > **Outbound IP Addresses**.
3. Log into your **MongoDB Atlas Console**.
4. Under **Security**, click **Network Access**.
5. Click **+ Add IP Address**.
6. Add the outbound CIDR blocks for your selected Render region with a descriptive comment (e.g. `Render Oregon Outbound 1`).
7. Confirm and save the changes.

### Honest Limitations & Troubleshooting Notes
- **Shared Regional Pools:** On Render Free and Starter tiers, outgoing traffic routes through shared regional outbound IP pools. Render provides the list of CIDR blocks, and all blocks for that region should be added to Atlas.
- **Atlas M0 Entry Limit:** MongoDB Atlas Free Tier (M0) allows a maximum of 50 IP whitelist entries. Render's regional list typically requires only a few CIDR entries, which fits comfortably within this quota.
- **Temporary Troubleshooting Fallback:** If Render migrates your container to a host outside the standard list, or if regional routing causes intermittent drops during initial setup, you may temporarily use `0.0.0.0/0` strictly to verify database connectivity. Once connectivity is established, restrict access back to the specific Render outbound ranges.

---

## 4. Deploying the Backend Web Service

### Step 1: Create the Web Service in Render
1. In the Render Dashboard, click **New +** and select **Web Service**.
2. Connect your GitHub repository: `https://github.com/VamshiYamjala/PriceR.git`.
3. Choose the branch: `main`.
4. Configure the service settings:
   - **Name:** `priceradar-backend` (or a name of your choice)
   - **Region:** Choose the region closest to your users or database (e.g., Oregon or Singapore)
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Expand **Advanced**:
   - **Health Check Path:** `/api/health`
   - **Auto-Deploy:** `Yes`
   - **Port Configuration:** Render automatically injects `process.env.PORT` (typically `10000`). The server binds dynamically (`process.env.PORT || 5000`). You do **not** need to hardcode a port.

### Step 2: Configure Backend Environment Variables

Environment variables are divided into **Core Startup Variables** (strictly required for server operation) and **Optional Feature Credentials** (needed only when enabling that specific integration).

#### A. Core Startup Variables (Required for Application Startup)

| Variable Name | Required | Purpose / Value |
|---|---|---|
| `NODE_ENV` | **Yes** | Set to `production`. Activates production security guards and suppresses internal stack traces in errors. |
| `MONGODB_URI` | **Yes** | Your MongoDB Atlas connection URI (`mongodb+srv://<user>:<pwd>@cluster.mongodb.net/priceradar`). Required for database connection. |
| `CLIENT_ORIGIN` | **Yes** | Full URL of the frontend Static Site (e.g. `https://priceradar-frontend.onrender.com`). Required for browser CORS validation. |
| `JWT_SECRET` | **Yes** | 32+ character random hex string. Required for signing and verifying user authentication tokens. |

#### B. Optional Feature Credentials (Feature-Specific)

| Variable Name | Required | Default Behavior When Omitted | Purpose |
|---|---|---|---|
| `MONITOR_TRIGGER_SECRET` | For Monitoring | `POST /api/monitor/run` returns 401 | Shared secret used by GitHub Actions to trigger scheduled price checks. *(Cannot be used to access diagnostics).* |
| `MONITORING_ENABLED` | Recommended | Defaults to `true` | Set to `false` on Render free tier to prevent idle container CPU waste. GitHub Actions triggers checks externally. |
| `ADMIN_DIAGNOSTIC_SECRET` | No | `/api/diagnostics` returns 403 in production | Dedicated admin secret string. If omitted, diagnostics are 100% disabled in production. |
| `BREVO_API_KEY` | For Email | Console warning; email alerts skipped | Brevo API key (`xkeysib-...`) for price drop emails and registration OTP delivery. |
| `EMAIL_FROM` | For Email | Undefined | Verified sender email address configured in your Brevo account. |
| `EMAIL_FROM_NAME` | No | `PriceRadar` | Display sender name on outgoing alert emails. |
| `TELEGRAM_BOT_TOKEN` | For Telegram | Telegram listener skipped cleanly | Telegram bot token from `@BotFather` for instant alerts and account linking. |
| `TELEGRAM_BOT_USERNAME` | No | Undefined | Bot handle used to generate deep-linking URLs in the frontend. |
| `APIFY_API_TOKEN` | For Apify | Searches use DB/fixtures fallback | Apify Personal API token for live Amazon, Flipkart, and Meesho scrapers. |
| `APIFY_ACTOR_AMAZON` | No | `junglee/free-amazon-product-scraper` | Amazon India scraper actor ID. |
| `APIFY_ACTOR_FLIPKART` | No | `shahidirfan/Flipkart-Product-Scraper` | Flipkart scraper actor ID. |
| `APIFY_ACTOR_MEESHO` | No | `scrapeai/meesho-product-scraper` | Meesho scraper actor ID. |
| `APIFY_MAX_ITEMS` | No | `5` | Maximum search items to fetch per retailer query. |
| `APIFY_TIMEOUT_SECS` | No | `60` | Apify Actor execution timeout in seconds. |
| `EBAY_CLIENT_ID` | For eBay | eBay provider disabled; logged in status | eBay Developer App Client ID. |
| `EBAY_CLIENT_SECRET` | For eBay | eBay provider disabled; logged in status | eBay Developer App Client Secret. |
| `EBAY_ENV` | No | `sandbox` | Set to `sandbox` for testing or `production` for approved keys. Defaults safely to `sandbox`. |
| `EBAY_MARKETPLACE_ID` | No | `EBAY_IN` (or `EBAY_US`) | Target marketplace identifier. |

6. Click **Create Web Service** (or **Save Changes**).

---

## 5. Deploying the Frontend Static Site

### Step 1: Create Static Site in Render
1. In the Render Dashboard, click **New +** and select **Static Site**.
2. Connect the same repository: `https://github.com/VamshiYamjala/PriceR.git`.
3. Choose the branch: `main`.
4. Configure the static site settings:
   - **Name:** `priceradar-frontend` (or a name of your choice)
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
   - **Auto-Deploy:** `Yes`

### Step 2: Add SPA Routing Rewrite Rule
Because PriceRadar is a Single Page Application (SPA) using React Router, direct URL access or page refreshes on paths like `/login`, `/watchlist`, or `/search` will result in HTTP 404 errors without a redirect rule.

1. In your Static Site settings, navigate to **Redirects/Rewrites**.
2. Click **Add Rule**:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
3. Save the rule.

### Step 3: Configure Frontend Environment Variables
In the **Environment** tab of your static site service, add:

| Variable Name | Value |
|---|---|
| `VITE_API_URL` | Your Render backend URL (e.g. `https://priceradar-backend.onrender.com`) |

> **Note on Vite environment variables:** Vite embeds environment variables into the static bundle at **build time**. Whenever you update `VITE_API_URL`, you must trigger a manual deploy (`Deploy latest commit`) on the static site for the changes to take effect.

### Step 4: Link CORS
Once your frontend URL is generated (e.g. `https://priceradar-frontend.onrender.com`), go back to your **Backend Web Service** environment variables and verify that `CLIENT_ORIGIN` matches this URL exactly (no trailing slash).

---

## 6. GitHub Actions External Scheduler Setup

On Render Free Tier, backend web services spin down after 15 minutes of inactivity. Internal background schedulers (`setInterval`) stop executing when the instance sleeps.

To ensure price checks run reliably every 4 hours regardless of instance sleep, GitHub Actions triggers the protected `/api/monitor/run` endpoint externally.

### Step 1: Configure GitHub Repository Secrets
1. Go to your GitHub repository: `https://github.com/VamshiYamjala/PriceR`.
2. Navigate to **Settings** > **Secrets and variables** > **Actions**.
3. Under **Repository secrets**, add:
   - `BACKEND_URL`: `https://<your-backend-subdomain>.onrender.com`
   - `MONITOR_TRIGGER_SECRET`: Same value configured in your backend environment variables.

### Step 2: Verify Workflow Configuration
The workflow `.github/workflows/monitor.yml` is already committed with:
- **Schedule:** `0 */4 * * *` (Runs every 4 hours at minute 0).
- **Manual Trigger:** `workflow_dispatch` enabled for on-demand testing.
- **Spin-up Resilience:** Uses `--retry 3 --retry-delay 5 --retry-connrefused --max-time 60` to allow Render's cold-start delay (typically 30–50s) to complete before timing out.
- **Forced Execution:** Automatically passes the force header so that monitoring executes even when `MONITORING_ENABLED=false` is set on Render.

---

## 7. Production Verification Checklist

After deployment completes:

1. **Backend Health Check:**
   Visit `https://<your-backend>.onrender.com/api/health` in your browser.
   - Response: `{"status":"ok","database":"connected","time":"..."}` with HTTP 200.
2. **Production Diagnostics Protection:**
   Visit `https://<your-frontend>.onrender.com/diagnostics`.
   - The UI should display the "🔒 Production Diagnostics Protected" security banner.
   - Public inspection without `X-Diagnostic-Secret` should return HTTP 403 `DIAGNOSTICS_DISABLED`.
3. **Authentication & Session:**
   - Sign up a new user or log in at `/login`.
   - Verify JWT issuance and session storage.
4. **Product Search & Live Fallback:**
   - Search for a product (e.g. "iphone", "samsung", "shoes").
   - Verify Apify / eBay offers load and sample offers display the "Sample data" badge.
5. **Watchlist & Alerts:**
   - Add a product to the watchlist.
   - Set a price drop alert.
6. **Trigger External Monitoring:**
   - In GitHub, go to **Actions** > **Hourly Price Monitor** > **Run workflow**.
   - Verify the run succeeds and check your backend logs for `[monitor] Cycle finished successfully`.

---

## 8. Free-Tier Operational Notes

- **Cold Starts:** When inactive for >15 minutes, the first incoming HTTP request takes 30–50 seconds while Render spins up the container.
- **Cron Wake-up:** The GitHub Actions workflow serves as a periodic wake-up call that triggers the monitoring cycle and keeps the database fresh.
- **Logs:** Real-time logs are accessible directly in the Render dashboard under the **Logs** tab of each service.
