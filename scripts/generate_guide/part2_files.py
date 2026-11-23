# scripts/generate_guide/part2_files.py

def get_part2_html():
    return """
<div class="chapter-container page-break" id="part-2">
    <h1>Part 2: Complete File and Folder Structure</h1>
    <p>
        The PriceRadar codebase is architected following the <strong>Separation of Concerns (SoC)</strong> principle. The client, backend server, and background extraction worker are strictly decoupled, enabling independent scaling, testing, and deployment.
    </p>

    <h2>2.1 The Complete Annotated Project Tree</h2>
    <p>
        Below is the exhaustive file structure of PriceRadar. Every meaningful folder and file is annotated with its exact runtime responsibility:
    </p>

    <div class="file-header">PriceRadar / Complete Project Directory Structure</div>
    <pre><code>PriceRadar/
│
├── .github/                                  → GitHub configuration directory
│   └── workflows/                            → Automated CI/CD & orchestration pipelines
│       ├── ci.yml                            → Continuous Integration: runs linter & 277 Jest unit/integration tests
│       └── monitor.yml                       → 4-Hour Cron Workflow: triggers backend price refresh & polls outcome
│
├── client/                                   → React 18 + Vite frontend Single Page Application (SPA)
│   ├── index.html                            → Root HTML template hosting the DOM root and Bootstrap CDN links
│   ├── package.json                          → Frontend dependencies (React, React Router, Axios, Vite)
│   ├── vite.config.js                        → Vite build configuration, port mappings, and React plugins
│   │
│   └── src/                                  → Primary client-side application source code
│       ├── main.jsx                          → Frontend entrypoint: mounts React DOM root inside BrowserRouter
│       ├── App.jsx                           → Root routing layout: defines public & ProtectedRoute URL mappings
│       │
│       ├── components/                       → Modular, reusable UI components used across multiple pages
│       │   ├── Navbar.jsx                    → Global top navigation bar with brand logo, links & auth state
│       │   ├── Footer.jsx                    → Global footer with copyright, links, and system status indicators
│       │   ├── ProductCard.jsx               → Grid card showing product thumbnail, brand, title, and lowest price
│       │   ├── OfferRow.jsx                  → Individual retailer listing row showing price, store badge, & alert button
│       │   ├── ProtectedRoute.jsx            → Route guard component that redirects unauthenticated users to /login
│       │   ├── ErrorBoundary.jsx             → React class component that catches rendering errors gracefully
│       │   ├── RadarLogo.jsx                 → Vector SVG radar icon representing PriceRadar branding
│       │   └── InternalSidebar.jsx           → Collapsible navigation sidebar for authenticated account pages
│       │
│       ├── context/                          → React Context providers for global shared application state
│       │   └── AuthContext.jsx               → Manages user authentication state, JWT storage, login & logout actions
│       │
│       ├── pages/                            → Full-screen page components mapped directly to URL routes
│       │   ├── HomePage.jsx                  → Landing page: hero banner, popular searches, and platform highlights
│       │   ├── SearchPage.jsx                → Product search catalog with live search input, filters & grid view
│       │   ├── ProductDetailPage.jsx         → Detailed product view with multi-retailer offers & price history chart
│       │   ├── RegisterPage.jsx              → Two-step user registration with email OTP verification
│       │   ├── LoginPage.jsx                 → User authentication form with email and password inputs
│       │   ├── ForgotPasswordPage.jsx        → Four-step secure password reset wizard with email OTP verification
│       │   ├── DashboardPage.jsx             → Authenticated user overview: quick stats, active alerts, and watchlist
│       │   ├── WatchlistPage.jsx             → User's saved offers list with quick links to live store pages
│       │   ├── AlertFormPage.jsx             → Alert configuration form: set target price, fixed drop & channels
│       │   ├── AlertManagementPage.jsx       → List of active user alerts with edit, pause, and delete controls
│       │   ├── NotificationHistoryPage.jsx   → Chronological feed of dispatched price drop notification events
│       │   ├── NotificationPreferencesPage.jsx→ Notification channel settings (Email address & Telegram Bot link)
│       │   ├── DiagnosticsPage.jsx           → Developer system health dashboard (available only in DEV mode)
│       │   └── NotFoundPage.jsx              → 404 error page displayed when a user visits an invalid URL route
│       │
│       ├── services/                         → Client-side HTTP communication services
│       │   └── api.js                        → Central Axios singleton with JWT interceptor & unwrapped API functions
│       │
│       └── styles/                           → Global custom styling
│           └── theme.css                     → CSS variables defining Forest Green palette, typography & layout utilities
│
├── server/                                   → Node.js + Express backend REST API server
│   ├── package.json                          → Backend dependencies (Express, Mongoose, bcryptjs, jsonwebtoken, etc.)
│   │
│   └── src/                                  → Primary backend source code
│       ├── server.js                         → Application startup entrypoint: connects DB & starts HTTP listener
│       ├── app.js                            → Express app assembly: mounts CORS, health checks, routes & error handler
│       │
│       ├── config/                           → Runtime environment and database configuration
│       │   ├── env.js                        → Loads and validates required environment variables from .env
│       │   └── db.js                         → Mongoose connection manager with retry logic and disconnect handlers
│       │
│       ├── controllers/                      → Request-response handlers: unpacks input, calls services, sends JSON
│       │   ├── authController.js             → Handles registration OTP, login, JWT issuance, and password resets
│       │   ├── productsController.js         → Handles product search queries, category listing, and autocomplete
│       │   ├── offersController.js           → Fetches specific retailer offer details and historical price points
│       │   ├── watchlistController.js        → Handles adding, viewing, and removing user watchlist items
│       │   ├── alertsController.js           → Manages creation, retrieval, updating, and deletion of user alerts
│       │   ├── notificationsController.js    → Fetches dispatched notification events history and handles dismissals
│       │   ├── monitorController.js          → Handles manual/cron price monitor triggers and returns cycle status
│       │   └── diagnosticsController.js      → Returns provider health status and database connectivity metrics
│       │
│       ├── middleware/                       → Intermediary request filters, validators, and guards
│       │   ├── auth.js                       → Validates JWT in Authorization header and populates req.user
│       │   ├── validate.js                   → Evaluates express-validator schemas and aborts on validation errors
│       │   ├── rateLimiter.js                → In-memory IP rate limiter protecting auth & monitor endpoints
│       │   └── errorHandler.js               → Global error catching middleware converting exceptions to clean JSON
│       │
│       ├── models/                           → Mongoose ODM schemas defining MongoDB collections and indexes
│       │   ├── User.js                       → User profile collection with unique email and hidden passwordHash
│       │   ├── Product.js                    → Canonical product master schema (title, brand, model, canonicalKey)
│       │   ├── Offer.js                      → Retailer-specific product listing (store, priceInPaise, externalProductId)
│       │   ├── Alert.js                      → User price alert subscription (targetPrice, dropAmount, armed state)
│       │   ├── WatchlistItem.js              → Join schema mapping users to tracked offers with unique compound index
│       │   ├── PriceObservation.js           → Time-series record of price observations fetched during monitor runs
│       │   ├── NotificationEvent.js          → Audit log of sent notifications with dedupeKey preventing duplicates
│       │   ├── MonitorRun.js                 → Record of past price refresh cycles (status, duration, offers checked)
│       │   ├── MonitorLock.js                → Distributed lease document ensuring single-instance cycle execution
│       │   └── OtpChallenge.js               → Hashed 6-digit OTP codes with MongoDB TTL auto-cleanup indexes
│       │
│       ├── providers/                        → Data ingestion adapters for external retailers and testbed APIs
│       │   ├── index.js                      → Provider Dispatcher: routes offers to correct adapter based on provider name
│       │   ├── apify.js                      → Cloud actor integration for scraping Amazon, Flipkart, and Meesho
│       │   ├── ebay.js                       → eBay Browse REST API integration using OAuth 2.0 client credentials
│       │   ├── dummyjson.js                  → Live public test catalog provider fetching real-time JSON products
│       │   ├── mockshop.js                   → GraphQL mock store adapter for synthetic catalog testing
│       │   ├── scrapling.js                  → HTTP adapter calling local Python FastAPI Scrapling worker
│       │   ├── fixture.js                    → Offline deterministic test provider backed by local JSON fixtures
│       │   ├── fixtureData.json              → Seed JSON dataset containing sample electronics, phones & laptops
│       │   ├── amazon.js                     → Amazon adapter (routes to sample fixture or Apify; no illegal scrapers)
│       │   └── flipkart.js                   → Flipkart adapter (routes to sample fixture or affiliate API)
│       │
│       ├── routes/                           → Express route definitions binding URLs and HTTP methods to controllers
│       │   ├── auth.js                       → Routes for /api/auth (register, login, verify-otp, forgot-password)
│       │   ├── products.js                   → Routes for /api/products (search, autocomplete, categories)
│       │   ├── offers.js                     → Routes for /api/offers (offer details and price history)
│       │   ├── watchlist.js                  → Routes for /api/watchlist (CRUD operations for user watchlists)
│       │   ├── alerts.js                     → Routes for /api/alerts (create, edit, delete price alerts)
│       │   ├── notifications.js              → Routes for /api/notifications (view and delete alert history)
│       │   ├── notificationPreferences.js    → Routes for /api/notification-preferences (email and Telegram settings)
│       │   ├── telegram.js                   → Routes for /api/telegram (link-code generation and bot webhooks)
│       │   ├── monitor.js                    → Routes for /api/monitor (trigger monitoring cycle and check status)
│       │   └── diagnostics.js                → Routes for /api/diagnostics (health and adapter connectivity)
│       │
│       ├── services/                         → Core business logic, monitoring orchestration & notifications
│       │   ├── priceMonitor.js               → Orchestrates 4-hour cycle: acquires locks, updates offers, checks alerts
│       │   ├── alertEvaluator.js             → Compares current vs previous prices, checks target/drop, manages armed state
│       │   ├── alertDispatcher.js            → Resolves user channels and triggers email/Telegram notification dispatches
│       │   ├── priceComparison.js            → Finds best deals, computes percentage discounts, identifies lowest offers
│       │   ├── scheduler.js                  → In-process setInterval scheduler fallback running inside Node.js
│       │   └── notifications/                → Outbound notification adapters
│       │       ├── email.js                  → Brevo transactional email dispatch service via REST API
│       │       └── telegram.js               → Telegram Bot API dispatch service via HTTPS webhooks
│       │
│       ├── utils/                            → Shared helper utilities
│       │   ├── asyncHandler.js               → Higher-order wrapper catching async Promise rejections in controllers
│       │   └── money.js                      → Integer paise conversion utilities (rupeesToPaise, paiseToRupees)
│       │
│       └── jobs/                             → CLI maintenance and diagnostic scripts
│           ├── seedFixtures.js               → Seeds local database with test products, offers, and observations
│           ├── runMonitorLocally.js          → Runs a full monitoring pass immediately from the command line
│           ├── verifyDbConnection.js         → Validates MongoDB Atlas connectivity and credentials
│           ├── verifyEmailConfig.js          → Tests outbound email delivery via Brevo
│           ├── verifyTelegramConfig.js       → Tests bot connectivity with the Telegram Bot API
│           ├── verifyApifyConfig.js          → Validates Apify API token and actor accessibility
│           └── migrateDataStatus.js          → Database migration utility upgrading legacy schemas
│
├── worker/                                   → Python FastAPI background extraction service
│   ├── main.py                               → FastAPI HTTP service exposing /health and /extract endpoints
│   ├── extractor.py                          → Scrapling parser with SSRF validation and domain allowlists
│   ├── requirements.txt                      → Python dependencies (fastapi, uvicorn, scrapling, pydantic)
│   └── test_extractor.py                     → Pytest test suite validating URL sanitization and price extraction
│
├── docs/                                     → Project documentation, deployment audits & architectural guides
│   ├── IMPLEMENTATION-AUDIT.md               → Codebase verification audit log
│   ├── RENDER_DEPLOYMENT.md                  → Step-by-step Render cloud hosting instructions
│   └── RENDER_DEPLOYMENT_AUDIT.md            → Deployment configuration and health check validation
│
├── .gitignore                                → Specifies files ignored by Git (.env, node_modules, build outputs)
└── README.md                                 → Comprehensive repository documentation and getting-started guide
</code></pre>

    <h2>2.2 Purpose of Each Main Folder & Layer</h2>
    <p>
        PriceRadar strictly avoids the "spaghetti code" trap by enforcing clear folder responsibilities. When reviewing or answering interview questions, use this mental model:
    </p>

    <table>
        <thead>
            <tr>
                <th style="width: 18%;">Layer / Folder</th>
                <th style="width: 25%;">Primary Responsibility</th>
                <th style="width: 32%;">What it Does in PriceRadar</th>
                <th style="width: 25%;">What Happens if Omitted</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Routes</strong><br><code>server/src/routes/</code></td>
                <td>URL & HTTP Mapping</td>
                <td>Defines API URL endpoints (e.g., <code>POST /api/alerts</code>) and binds HTTP methods to middleware and controllers. Contains zero business logic.</td>
                <td>Controllers would have to be manually wired, cluttering <code>app.js</code> with hundreds of disorganized endpoints.</td>
            </tr>
            <tr>
                <td><strong>Middleware</strong><br><code>server/src/middleware/</code></td>
                <td>Request Interception & Guards</td>
                <td>Inspects incoming requests before they hit controllers. Verifies JWT tokens (<code>auth.js</code>), validates input formats (<code>validate.js</code>), and limits spam (<code>rateLimiter.js</code>).</td>
                <td>Controllers would be bloated with repetitive auth checks and validation logic, increasing security vulnerability risks.</td>
            </tr>
            <tr>
                <td><strong>Controllers</strong><br><code>server/src/controllers/</code></td>
                <td>HTTP Request/Response Handling</td>
                <td>Unpacks <code>req.body</code>, <code>req.params</code>, and <code>req.user</code>, calls underlying business services or models, and formats the final HTTP JSON response.</td>
                <td>Routes would have to contain database queries directly, violating Separation of Concerns and making testing difficult.</td>
            </tr>
            <tr>
                <td><strong>Services</strong><br><code>server/src/services/</code></td>
                <td>Core Business Logic</td>
                <td>Houses system intelligence: orchestrating price monitoring cycles, calculating alert conditions, managing distributed locks, and dispatching emails.</td>
                <td>Controllers would become massive "God objects", making it impossible to trigger price monitoring from both an API route and a cron job.</td>
            </tr>
            <tr>
                <td><strong>Models</strong><br><code>server/src/models/</code></td>
                <td>Data Structure & Validation</td>
                <td>Defines Mongoose schemas, data types, validation rules (like integer paise checks), default values, and compound database indexes.</td>
                <td>MongoDB would receive dirty, unvalidated data, leading to floating-point corruption and duplicate records.</td>
            </tr>
            <tr>
                <td><strong>Providers</strong><br><code>server/src/providers/</code></td>
                <td>External Ingestion Adapters</td>
                <td>Abstracts external retailers (eBay, Apify, DummyJSON, local worker). Translates different retailer formats into one normalized PriceRadar object.</td>
                <td>The monitoring service would require messy, retailer-specific <code>if/else</code> statements for every single store.</td>
            </tr>
            <tr>
                <td><strong>Components</strong><br><code>client/src/components/</code></td>
                <td>Reusable UI Elements</td>
                <td>Stateless or semi-stateful UI bricks (Navbar, ProductCard, OfferRow, ErrorBoundary) that render visual elements repeatedly across various screens.</td>
                <td>Developers would copy-paste hundreds of lines of identical HTML and Bootstrap classes across multiple page files.</td>
            </tr>
            <tr>
                <td><strong>Pages</strong><br><code>client/src/pages/</code></td>
                <td>Screen-Level Views</td>
                <td>Top-level components mounted to specific routes (e.g. <code>/search</code>, <code>/dashboard</code>). Fetches data via API services and composes components.</td>
                <td>The UI would lack structured screen hierarchy, making route management in React Router chaotic.</td>
            </tr>
            <tr>
                <td><strong>Context</strong><br><code>client/src/context/</code></td>
                <td>Global Shared State</td>
                <td>Stores application-wide state (such as the currently logged-in user profile and JWT token) and broadcasts it to any component without prop-drilling.</td>
                <td>Every single parent component would have to pass user and token props down through 5 to 10 layers of child components.</td>
            </tr>
            <tr>
                <td><strong>Frontend API</strong><br><code>client/src/services/api.js</code></td>
                <td>HTTP Client Abstraction</td>
                <td>Centralizes all Axios HTTP calls into reusable JavaScript functions. Interceptors automatically inject the JWT <code>Bearer</code> token into headers.</td>
                <td>React pages would contain raw <code>fetch()</code> calls with duplicated URLs, headers, and inconsistent error handling.</td>
            </tr>
        </tbody>
    </table>
</div>
"""
