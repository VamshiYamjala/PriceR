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
    (Allowlist: 0.0.0.0/0)              (Runs every 4 hours)
```

---

## 2. Prerequisites

Before creating services on Render, ensure you have:
1. A [Render account](https://render.com/).
2. A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster with Network Access configured (see Section 3).
3. Access to your third-party API accounts:
   - Apify API Token ([apify.com](https://apify.com))
   - Brevo API Key ([brevo.com](https://brevo.com))
   - Telegram Bot Token ([t.me/BotFather](https://t.me/BotFather))
   - eBay Developer App credentials ([developer.ebay.com](https://developer.ebay.com))

---

## 3. MongoDB Atlas Configuration (Crucial)

Render Web Services (especially Free tier) use dynamically assigned outbound IP addresses that change across deployments and container restarts.

1. Log into your **MongoDB Atlas Console**.
2. Under **Security**, click **Network Access**.
3. Click **+ Add IP Address**.
4. Click **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Confirm and save the change.

> **Security Note:** Your database remains secured by your strong database user credentials and TLS encryption. Ensure your database password does not contain unescaped special characters (use standard URI encoding if needed).

---

## 4. Deploying the Backend Web Service

### Step 1: Create the Web Service in Render
1. In the Render Dashboard, click **New +** and select **Web Service**.
2. Connect your GitHub repository: `https://github.com/VamshiYamjala/PriceR.git`.
3. Choose the branch: `main`.
4. Configure the service settings:
   - **Name:** `priceradar-backend` (or a name of your choice)
   - **Region:** Choose the region closest to your users or database (e.g., Singapore or Oregon)
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Expand **Advanced**:
   - **Health Check Path:** `/api/health`
   - **Auto-Deploy:** `Yes`

### Step 2: Configure Backend Environment Variables
In the **Environment** tab of your backend service, add the following variables:

| Variable Name | Value / Instructions |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` *(Render sets this automatically, but you can declare it explicitly)* |
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/priceradar?retryWrites=true&w=majority` |
| `CLIENT_ORIGIN` | `https://priceradar-frontend.onrender.com` *(Replace with your actual frontend Render URL after creating the static site)* |
| `JWT_SECRET` | 32+ character random hex or base64 string *(Generate via: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)* |
| `JWT_EXPIRES_IN` | `7d` |
| `BREVO_API_KEY` | Your Brevo transactional email key (format: `xkeysib-...`) |
| `EMAIL_FROM` | Verified sender email in your Brevo account |
| `EMAIL_FROM_NAME` | `PriceRadar` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token obtained from `@BotFather` |
| `TELEGRAM_BOT_USERNAME` | Telegram bot handle (without `@`) |
| `MONITOR_TRIGGER_SECRET` | Strong random secret string used by GitHub Actions to trigger the price monitor |
| `ADMIN_DIAGNOSTIC_SECRET` | Optional/recommended strong secret string to unlock `/api/diagnostics` in production |
| `MONITORING_ENABLED` | `false` *(Recommended on Render free tier to prevent idle container crashes; GitHub Actions triggers the monitor externally)* |
| `APIFY_API_TOKEN` | Apify Personal API Token (format: `apify_api_...`) |
| `APIFY_ACTOR_AMAZON` | `junglee/free-amazon-product-scraper` |
| `APIFY_ACTOR_FLIPKART` | `shahidirfan/Flipkart-Product-Scraper` |
| `APIFY_ACTOR_MEESHO` | `scrapeai/meesho-product-scraper` |
| `APIFY_MAX_ITEMS` | `5` |
| `APIFY_TIMEOUT_SECS` | `60` |
| `EBAY_CLIENT_ID` | eBay Developer Client ID |
| `EBAY_CLIENT_SECRET` | eBay Developer Client Secret |
| `EBAY_ENV` | `SANDBOX` *(or `PRODUCTION`)* |
| `EBAY_MARKETPLACE_ID` | `EBAY_IN` *(or `EBAY_US`)* |

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
