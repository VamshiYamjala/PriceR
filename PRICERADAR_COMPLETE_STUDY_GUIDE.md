# PriceRadar — Complete Project Understanding & MERN Stack Interview Preparation Guide

> **Repository:** https://github.com/VamshiYamjala/PriceR  
> **Production Frontend:** https://priceradar-web.onrender.com  
> **Production Backend:** https://priceradar-api-02ib.onrender.com  
> **Frameworks:** React 18, Vite, Bootstrap 5, Node.js, Express.js, MongoDB Atlas, Mongoose, Python FastAPI, GitHub Actions  
> **Target Audience:** College Review Panels, Viva Voce Evaluators, Technical Project Managers, and Senior Developers  

---

Engineering Master Guide & Interview Handbook
        
# Price<span>Radar</span>

        
            Complete Project Architecture, File Connections, Financial Precision Policy, 4-Hour Automated Cron Engine & MERN Stack Technical Interview Guide
        
        
        
            
                Core Architecture
                MERN (MongoDB, Express, React 18, Node.js)
            
            
                Automation & Scheduling
                GitHub Actions (0 */4 * * *) + Render Health Probes
            
            
                Financial Precision
                Integer-Paise Currency Policy (Mongoose Validated)
            
            
                Notification Channels
                Brevo Transactional Email + Telegram Bot API
            
            
                Multi-Retailer Ingestion
                Apify Cloud Actors, eBay Browse API, Python Worker
            
            
                Automated Quality Assurance
                26 Test Suites / 277 Unit & Integration Tests
            
        
    

    
        
            **Repository:** https://github.com/VamshiYamjala/PriceR<br>
            **Target:** College Viva Voce, Technical Project Reviews & Senior MERN Interviews
        
        
            **Framework:** Production v1.0.0 (Node 22 / React 18 / Mongo 8)<br>
            **Generated:** November 2026
        
    

    Table of Contents
    
        
            <a href="#part-1">Part 1: Complete Project Introduction</a><span class="toc-dots"></span><span class="toc-page">Ch. 1</span>
            <a href="#part-2">Part 2: Complete File and Folder Structure</a><span class="toc-dots"></span><span class="toc-page">Ch. 2</span>
            <a href="#part-3">Part 3: Technology Stack Deep Dive</a><span class="toc-dots"></span><span class="toc-page">Ch. 3</span>
            <a href="#part-4">Part 4: Complete System Architecture</a><span class="toc-dots"></span><span class="toc-page">Ch. 4</span>
            <a href="#part-5">Part 5: Complete File Connections & Code Flow</a><span class="toc-dots"></span><span class="toc-page">Ch. 5</span>
            <a href="#part-6">Part 6: Complete REST API Endpoint Reference</a><span class="toc-dots"></span><span class="toc-page">Ch. 6</span>
            <a href="#part-7">Part 7: Complete Database Architecture & Models</a><span class="toc-dots"></span><span class="toc-page">Ch. 7</span>
            <a href="#part-8">Part 8: Automated Price Monitoring Engine</a><span class="toc-dots"></span><span class="toc-page">Ch. 8</span>
            <a href="#part-9">Part 9: Alerts Evaluation & Notification Dispatch</a><span class="toc-dots"></span><span class="toc-page">Ch. 9</span>
            <a href="#part-10">Part 10: Authentication, Authorization & Security</a><span class="toc-dots"></span><span class="toc-page">Ch. 10</span>
            <a href="#part-11">Part 11: Python Extraction Worker Microservice</a><span class="toc-dots"></span><span class="toc-page">Ch. 11</span>
        
        
            <a href="#part-12">Part 12: Complete React 18 Architecture & Hooks</a><span class="toc-dots"></span><span class="toc-page">Ch. 12</span>
            <a href="#part-13">Part 13: Core JavaScript Interview Preparation (30 Qs)</a><span class="toc-dots"></span><span class="toc-page">Ch. 13</span>
            <a href="#part-14">Part 14: Node.js & Express Interview Preparation (25 Qs)</a><span class="toc-dots"></span><span class="toc-page">Ch. 14</span>
            <a href="#part-15">Part 15: MongoDB & Mongoose Interview Prep (30 Qs)</a><span class="toc-dots"></span><span class="toc-page">Ch. 15</span>
            <a href="#part-16">Part 16: Git, GitHub Actions & Cloud Deployment</a><span class="toc-dots"></span><span class="toc-page">Ch. 16</span>
            <a href="#part-17">Part 17: End-to-End Walkthrough of a Real Scenario</a><span class="toc-dots"></span><span class="toc-page">Ch. 17</span>
            <a href="#part-18">Part 18: Complete Technical Interview Q&A (86 Qs)</a><span class="toc-dots"></span><span class="toc-page">Ch. 18</span>
            <a href="#part-19">Part 19: Core Architectural Comparison Tables (20)</a><span class="toc-dots"></span><span class="toc-page">Ch. 19</span>
            <a href="#part-20">Part 20: Project Limitations & Future Roadmap</a><span class="toc-dots"></span><span class="toc-page">Ch. 20</span>
            <a href="#part-21">Part 21: Final Mock Interview & Last-Minute Sheet</a><span class="toc-dots"></span><span class="toc-page">Ch. 21</span>
        
    

    
# Part 1: Complete Project Introduction

    
    
## 1.1 Project Overview

    

        **PriceRadar** is a full-stack, automated multi-retailer e-commerce price tracking, comparison, and real-time alert system built on the **MERN** stack (MongoDB, Express.js, React 18, Node.js) paired with an isolated Python extraction worker and GitHub Actions workflow orchestration.
    

    

        PriceRadar continuously observes e-commerce product listings across multiple retail channels (Amazon, Flipkart, eBay, Meesho, and specialized testbeds). When a seller reduces a price, PriceRadar's evaluation engine detects the drop, checks user-configured price thresholds, and dispatches immediate notifications directly to the consumer's inbox (via Brevo transactional email) and mobile device (via Telegram Bot).
    

    
> ### The Four Elevator Pitches for Interviews
> 
**1. One-Sentence Pitch:**<br>
>         *"PriceRadar is a full-stack MERN price intelligence platform that monitors e-commerce products across multiple retailers every four hours and automatically delivers instant email and Telegram alerts whenever prices drop below user targets."*

>         
>         
**2. 30-Second Pitch (Quick Technical Overview):**<br>
>         *"I developed PriceRadar to solve the problem of manual price checking and deceptive e-commerce discounts. It features a React 18 frontend with an interactive price history chart, a secure Express backend with JWT and OTP authentication, MongoDB Atlas with integer-paise financial precision, and an automated price monitor triggered every four hours via GitHub Actions. It fetches prices once per cycle, evaluates user alerts against target drops, and dispatches alerts via Brevo and Telegram."*

> 
>         
**3. 1-Minute Pitch (Technical Architecture & Value):**<br>
>         *"In modern e-commerce, dynamic algorithmic pricing changes multiple times a day, making it impossible for buyers to manually catch the best deals. PriceRadar automates this entirely. The frontend is built with React 18 and Vite, consuming a RESTful Express API. On the data tier, we use MongoDB with custom Mongoose schemas representing canonical Products, retailer Offers, and time-series PriceObservations. Our price monitoring engine runs every 4 hours triggered by GitHub Actions with an automated wakeup ping to prevent Render cold starts. It utilizes MongoDB-backed distributed mutex locking to prevent race conditions, deduplicates shared offer fetches, and evaluates both absolute target prices and fixed drops before dispatching multi-channel notifications."*

> 
>         
**4. 2-Minute Interview Pitch (Senior Engineering Depth):**<br>
>         <em>"PriceRadar is an enterprise-grade price tracking platform designed around resilience, security, and financial accuracy. On the client side, React 18 uses context-driven state management, Axios request interceptors for JWT injection, and protected routes. The backend uses Express with layered architecture—separating routes, input validation middleware, controllers, business services, and database models. 
>         <br><br>
>         A core architectural highlight is our precision handling: all monetary values are stored as integers in paise rather than floating-point numbers, completely eliminating binary precision bugs in calculations. Our price ingestion layer utilizes a provider adapter pattern, unifying external sources like Apify cloud scrapers, eBay Browse OAuth 2.0 API, and an isolated Python FastAPI worker protected by strict SSRF domain allowlists.
>         <br><br>
>         For automation, we solved the serverless spin-down dilemma by combining GitHub Actions scheduled workflows with pre-flight health probes and asynchronous HTTP 202 background job processing. Multiple users tracking the same product share a single upstream price fetch, reducing retailer load by up to 80%. When price drops are confirmed, our alert evaluator ensures duplicate suppression through armed state transitions and dispatches alerts via Brevo email and Telegram bot with deduplication keys."</em>

    
## 1.2 Problem Statement: Why PriceRadar Was Built

    

        Online shoppers face major challenges when trying to secure optimal prices across e-commerce platforms:
    

    

        - **Fragmented Marketplaces:** Products are listed across Amazon, Flipkart, Meesho, and eBay at differing price points, shipping terms, and seller discounts. Consumers must manually toggle between dozens of browser tabs.

        - **Dynamic Algorithmic Pricing:** Retailers frequently change prices during flash sales, late-night hours, or inventory clearances. Humans cannot refresh websites 24/7.

        - **Deceptive Strike-Through Pricing:** Retailers often artificially hike prices right before a festival sale and display an inflated "discount" percentage. Without historical price tracking, buyers cannot verify if a deal is genuine.

        - **Manual Tracking Fatigue:** Setting manual calendar reminders or bookmarking items leads to missed buying windows when limited-stock discounts expire.

    

    
### Problem vs. Solution Matrix

    
| Consumer Problem | Traditional / Manual Approach | PriceRadar Engineering Solution |
| --- | --- | --- |
| Fragmented Price Comparison | Manually opening multiple retailer tabs and searching for product models one by one. | Unified search engine aggregates multi-retailer offers into a single side-by-side comparison interface with normalized INR pricing. |
| Missing Transient Drops | Checking once every few days, frequently missing lightning deals and midnight price cuts. | Automated price monitor executes every 4 hours via GitHub Actions cron, detecting drops and dispatching alerts within minutes. |
| Fake / Artificial Discounts | Relying on seller claims of "40% off" based on inflated Maximum Retail Price (MRP). | Immutable `PriceObservation` time-series records preserve historical price points, visualized via an interactive price history chart. |
| Notification Clutter | Subscribing to general marketing newsletters filled with spam. | Personalized, surgical alerts: notifications fire only when a specific product drops below the user's exact target price or drop threshold. |
| Alert Spam & Loops | Receiving repeated alerts every hour as long as a price stays below target. | Stateful alert lifecycle with `armed` flag and unique `dedupeKey`; alerts disarm after triggering and only re-arm if the price rises and drops again. |

    
## 1.3 Project Objectives & Engineering Boundaries

    

        To ensure production quality, PriceRadar's scope was defined around strict architectural boundaries:
    

    
### A. Main Functionality (Implemented Core)

    

        - **Catalog Aggregation:** Unified Product and Offer data model separating canonical item identity from multi-seller retailer listings.

        - **Multi-Retailer Search:** Real-time product search with keyword filtering, categories, and retailer badges.

        - **Watchlist Management:** Personal user watchlists with compound indexing preventing duplicate saves.

        - **Custom Price Alerts:** Support for both *Target-Price Alerts* (e.g. "Notify when price ≤ ₹45,000") and *Fixed-Drop Alerts* (e.g. "Notify if price drops by ₹2,000 from current baseline").

    

    
### B. Supporting & UX Functionality

    

        - **Responsive Forest Green UI:** Mobile-first React 18 interface styled with modern CSS variables, responsive tables, and zero horizontal scroll across 390px, 768px, 1366px, and 1440px viewports.

        - **Interactive Price History:** Chronological SVG visualization of price fluctuations per offer.

        - **In-App Notification Feed:** User inbox tracking past alert dispatches with read/delete controls.

    

    
### C. Security Functionality

    

        - **Authentication:** Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256, 7-day expiration.

        - **Password Protection:** One-way cryptographic password hashing using `bcryptjs` with 10 salt rounds.

        - **Mongoose Leak Protection:** `select: false` configured on `User.passwordHash` to prevent accidental credential leakage in queries.

        - **Four-Step Email OTP Flows:** Cryptographically generated 6-digit OTPs hashed with SHA-256 and stored in MongoDB with native TTL auto-deletion indexes for both Registration and Password Reset.

        - **SSRF Defense:** Strict domain allowlisting and post-redirect URL validation in the Python worker.

        - **Input Sanitization:** Strict middleware validation with `express-validator`.

    

    
### D. Automation & Monitoring Functionality

    

        - **4-Hour Cron Automation:** GitHub Actions scheduled runner (`0 */4 * * *`) operating externally to wake and trigger the Render cloud backend.

        - **Distributed Mutex Lock:** Atomic MongoDB `findOneAndUpdate` lease (`MonitorLock`) preventing overlapping execution cycles.

        - **Shared Offer Deduplication:** Upstream price fetches consolidated by distinct `offerId` across all users.

        - **Multi-Channel Alert Dispatch:** Transactional emails powered by Brevo API and instant mobile messaging via Telegram Bot API.

    

    
> ### Important Scope Boundary for Interviews
> 

>             **What PriceRadar Does NOT Do:** PriceRadar is an *intelligence, comparison, and alerting engine*. It does **not** implement automated purchasing (it will never enter credit card details or buy items automatically on a user's behalf), nor does it use speculative AI machine learning models to "predict" future stock prices. Being completely honest about this scope in interviews demonstrates maturity and high engineering integrity.
>         

    
# Part 2: Complete File and Folder Structure

    

        The PriceRadar codebase is architected following the **Separation of Concerns (SoC)** principle. The client, backend server, and background extraction worker are strictly decoupled, enabling independent scaling, testing, and deployment.
    

    
## 2.1 The Complete Annotated Project Tree

    

        Below is the exhaustive file structure of PriceRadar. Every meaningful folder and file is annotated with its exact runtime responsibility:
    

    > **File:** `PriceRadar / Complete Project Directory Structure`

    
```javascript
PriceRadar/
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
```

    
## 2.2 Purpose of Each Main Folder & Layer

    

        PriceRadar strictly avoids the "spaghetti code" trap by enforcing clear folder responsibilities. When reviewing or answering interview questions, use this mental model:
    

    
| Layer / Folder | Primary Responsibility | What it Does in PriceRadar | What Happens if Omitted |
| --- | --- | --- | --- |
| Routes`server/src/routes/` | URL & HTTP Mapping | Defines API URL endpoints (e.g., `POST /api/alerts`) and binds HTTP methods to middleware and controllers. Contains zero business logic. | Controllers would have to be manually wired, cluttering `app.js` with hundreds of disorganized endpoints. |
| Middleware`server/src/middleware/` | Request Interception & Guards | Inspects incoming requests before they hit controllers. Verifies JWT tokens (`auth.js`), validates input formats (`validate.js`), and limits spam (`rateLimiter.js`). | Controllers would be bloated with repetitive auth checks and validation logic, increasing security vulnerability risks. |
| Controllers`server/src/controllers/` | HTTP Request/Response Handling | Unpacks `req.body`, `req.params`, and `req.user`, calls underlying business services or models, and formats the final HTTP JSON response. | Routes would have to contain database queries directly, violating Separation of Concerns and making testing difficult. |
| Services`server/src/services/` | Core Business Logic | Houses system intelligence: orchestrating price monitoring cycles, calculating alert conditions, managing distributed locks, and dispatching emails. | Controllers would become massive "God objects", making it impossible to trigger price monitoring from both an API route and a cron job. |
| Models`server/src/models/` | Data Structure & Validation | Defines Mongoose schemas, data types, validation rules (like integer paise checks), default values, and compound database indexes. | MongoDB would receive dirty, unvalidated data, leading to floating-point corruption and duplicate records. |
| Providers`server/src/providers/` | External Ingestion Adapters | Abstracts external retailers (eBay, Apify, DummyJSON, local worker). Translates different retailer formats into one normalized PriceRadar object. | The monitoring service would require messy, retailer-specific `if/else` statements for every single store. |
| Components`client/src/components/` | Reusable UI Elements | Stateless or semi-stateful UI bricks (Navbar, ProductCard, OfferRow, ErrorBoundary) that render visual elements repeatedly across various screens. | Developers would copy-paste hundreds of lines of identical HTML and Bootstrap classes across multiple page files. |
| Pages`client/src/pages/` | Screen-Level Views | Top-level components mounted to specific routes (e.g. `/search`, `/dashboard`). Fetches data via API services and composes components. | The UI would lack structured screen hierarchy, making route management in React Router chaotic. |
| Context`client/src/context/` | Global Shared State | Stores application-wide state (such as the currently logged-in user profile and JWT token) and broadcasts it to any component without prop-drilling. | Every single parent component would have to pass user and token props down through 5 to 10 layers of child components. |
| Frontend API`client/src/services/api.js` | HTTP Client Abstraction | Centralizes all Axios HTTP calls into reusable JavaScript functions. Interceptors automatically inject the JWT `Bearer` token into headers. | React pages would contain raw `fetch()` calls with duplicated URLs, headers, and inconsistent error handling. |

    
# Part 3: Technology Stack Deep Dive

    

        Every technology in PriceRadar was chosen to satisfy specific engineering requirements: financial precision, resilience against cold starts, responsive rendering, and decoupled multi-retailer ingestion.
    

    
## 3.1 Client-Side Technologies

    
### 1. React 18 (v18.3.1)

    

        - **What it is:** A component-based JavaScript library for building dynamic, reactive user interfaces via a Virtual DOM.

        - **Why we use it:** Provides automatic, lightning-fast DOM updates whenever price data, search filters, or alert statuses change, without full browser reloads.

        - **Where used & Files:** The entire frontend client; `client/src/main.jsx`, `client/src/App.jsx`, and all components/pages.

        - **Real-World Example:** When a user clicks "Add to Watchlist", only that specific heart button changes state and color instantly, while the rest of the product catalog stays untouched.

        - **What if omitted:** We would have to manually manipulate the DOM using vanilla JavaScript (`document.getElementById`, `innerHTML`), leading to fragile, bug-ridden UI code.

    

    
### 2. React Router DOM (v6.24.1)

    

        - **What it is:** Standard client-side routing library for React single-page applications.

        - **Why we use it:** Enables seamless multi-page navigation (e.g. from `/search` to `/dashboard`) without triggering round-trip HTML requests to the web server.

        - **Where used & Files:** `client/src/App.jsx`, `client/src/components/ProtectedRoute.jsx`, and `client/src/components/Navbar.jsx`.

        - **Real-World Example:** Navigating between Search, Watchlist, and Alerts feels instantaneous because only the interior page view swaps out while the Navbar and audio/visual states persist.

        - **What if omitted:** The browser would refresh the whole window on every link click, destroying client-side state and producing noticeable screen flicker.

    

    
### 3. Bootstrap 5 (v5.3.3 CDN)

    

        - **What it is:** A popular, mobile-first CSS framework providing responsive grid systems, flexbox utilities, and standard UI primitives.

        - **Why we use it:** Gives us an instant, battle-tested responsive grid (12-column system, `col-md-6`, `d-flex`) that ensures proper rendering across phones, tablets, and desktop displays.

        - **Where used & Files:** Imported in `client/index.html`; utilized across all JSX components alongside custom CSS variables.

        - **Real-World Example:** Product cards automatically arrange in 1 column on mobile phones (390px), 2 columns on tablets (768px), and 3 or 4 columns on desktop monitors.

        - **What if omitted:** We would need to write hundreds of lines of custom CSS media queries from scratch, risking layout breakage across different screen sizes.

    

    
### 4. Axios (Frontend: v1.7.2)

    

        - **What it is:** A promise-based HTTP client for the browser and Node.js.

        - **Why we use it:** Provides built-in request/response interceptors, automatic JSON serialization/deserialization, and cleaner error handling compared to the native browser `fetch()` API.

        - **Where used & Files:** `client/src/services/api.js`.

        - **Real-World Example:** An Axios request interceptor intercepts every outgoing call, checks `localStorage` for `priceradar_token`, and automatically appends `Authorization: Bearer <token>` without requiring manual header assembly in individual pages.

        - **What if omitted:** Every single API call would need manual `fetch()` setup, manual `JSON.stringify()`, manual `res.json()` parsing, and repetitive header assembly.

    

    
### 5. Vite (v5.3.4)

    

        - **What it is:** Next-generation frontend tooling and build server powered by native ES modules and Rollup.

        - **Why we use it:** Provides sub-second Hot Module Replacement (HMR) during local development and generates heavily optimized, minified production assets for Render.

        - **Where used & Files:** `client/vite.config.js`, `client/package.json`.

        - **Real-World Example:** When editing a component in VS Code, Vite updates the live browser view in under 50 milliseconds without reloading the page or losing current form state.

        - **What if omitted:** Legacy bundlers like Webpack would take 10 to 30 seconds to restart on every code change, significantly slowing down development.

    

    
## 3.2 Server-Side Technologies

    
### 6. Node.js (v18+ / v22 LTS)

    

        - **What it is:** A cross-platform JavaScript runtime built on Chrome's V8 engine that executes JavaScript outside the browser.

        - **Why we use it:** Single-threaded, non-blocking asynchronous event loop makes Node.js exceptionally efficient for I/O-intensive workloads like calling retailer APIs, querying databases, and dispatching alerts.

        - **Where used & Files:** Runs the entire backend service; `server/package.json` specifies `"engines": { "node": ">=18.0.0" }`.

        - **Real-World Example:** While Node.js waits 500ms for eBay's API to return product pricing over the network, it does not freeze; it continues serving HTTP requests to other users simultaneously.

        - **What if omitted:** We could not run JavaScript on the server and would need a completely different backend runtime (such as Python, Java, or Go).

    

    
### 7. Express.js (v4.19.2)

    

        - **What it is:** A fast, unopinionated, minimalist web application framework for Node.js.

        - **Why we use it:** Simplifies HTTP routing, middleware pipeline chaining, request parsing, and JSON response handling.

        - **Where used & Files:** `server/src/app.js`, `server/src/server.js`, and all route definitions in `server/src/routes/`.

        - **Real-World Example:** Chaining `app.use('/api/alerts', requireAuth, validate, alertsController)` ensures that every request to create or modify an alert is verified and sanitized before reaching business logic.

        - **What if omitted:** We would have to parse raw Node.js `http.createServer` request streams, manually regex-match URL strings, and parse chunked HTTP body buffers manually.

    

    
### 8. REST APIs

    

        - **What it is:** Representational State Transfer—an architectural style using standard HTTP verbs (GET, POST, PUT, PATCH, DELETE) to manipulate stateless resources via JSON.

        - **Why we use it:** Provides a clean, universal contract that allows our React frontend, GitHub Actions cron runner, and external test tools to talk to Express using identical conventions.

        - **Where used:** Every `/api/*` endpoint in PriceRadar.

        - **Real-World Example:** `GET /api/alerts` fetches existing alerts, `POST /api/alerts` creates a new alert, `PATCH /api/alerts/:id` modifies an alert, and `DELETE /api/alerts/:id` removes an alert.

        - **What if omitted:** We would have to invent proprietary communication protocols or build complex GraphQL schemas when simple REST endpoints fully satisfy our requirements.

    

    
## 3.3 Database Tier

    
### 9. MongoDB & MongoDB Atlas

    

        - **What it is:** A document-oriented NoSQL database that stores data in flexible, JSON-like BSON (Binary JSON) documents. MongoDB Atlas is its fully-managed cloud database service.

        - **Why we use it:** High schema flexibility allows products from different retailers to carry varying attributes (e.g. storage size, warranty, seller ratings) while maintaining fast indexing on compound query keys.

        - **Where used & Files:** Configured in `server/src/config/db.js` via `MONGODB_URI`.

        - **Real-World Example:** Storing historical price observations across months without needing rigid relational table alterations or complex SQL migrations.

        - **What if omitted:** In a relational SQL database, modifying product listing attributes or handling dynamic retailer schemas would require writing and executing complex schema migration scripts.

    

    
### 10. Mongoose (v8.5.0)

    

        - **What it is:** An Object Data Modeling (ODM) library for MongoDB and Node.js.

        - **Why we use it:** Brings strict schema definitions, data type casting, business logic validation, compound indexing, and lifecycle middleware to schemaless MongoDB.

        - **Where used & Files:** All files in `server/src/models/`.

        - **Real-World Example:** Mongoose enforces that `priceInPaise` must strictly be an integer:
        `validate: { validator: Number.isInteger, message: 'priceInPaise must be an integer' }`. If someone attempts to save a float like `499.99`, Mongoose rejects the write before it reaches MongoDB.

        - **What if omitted:** Corrupted or malformed documents could be inserted into MongoDB collections without any schema guardrails.

    

    
## 3.4 Security & Utility Libraries

    
### 11. JSON Web Tokens (jsonwebtoken v9.0.2)

    

        - **What it is:** An open standard (RFC 7519) for securely transmitting information between parties as a compact, digitally signed JSON object.

        - **Why we use it:** Enables stateless authentication. The server does not need to store active user sessions in memory or database; it verifies user identity purely by cryptographically validating the token signature.

        - **Where used & Files:** Issued in `server/src/controllers/authController.js`; verified in `server/src/middleware/auth.js`.

        - **Real-World Example:** When a user logs in, the server signs `{ id: user._id, role: user.role }` with a secret key and returns the token. When the user later creates an alert, the server validates the token signature in under 1 millisecond without a database session lookup.

        - **What if omitted:** We would have to store stateful session IDs in a central Redis cache or database table, increasing infrastructure costs and latency.

    

    
### 12. bcryptjs (v2.4.3)

    

        - **What it is:** A pure JavaScript implementation of the bcrypt password-hashing algorithm based on the Blowfish cipher.

        - **Why we use it:** Employs a one-way mathematical hashing function incorporating an automatically generated salt and adjustable cost factor (10 rounds in PriceRadar), making it impervious to rainbow table attacks.

        - **Where used & Files:** `server/src/controllers/authController.js`.

        - **Real-World Example:** Plaintext password `Secret123!` becomes `$2a$10$N9qo8uLOickgx2ZMRZoMye...`. Even if an attacker dumps the entire database, they cannot reverse the hash back into the plaintext password.

        - **What if omitted:** Storing plaintext passwords or using outdated hashes like MD5/SHA1 would expose all user accounts to instant compromise during a database leak.

    

    
### 13. express-validator (v7.1.0)

    

        - **What it is:** A set of Express middleware that wraps `validator.js` for server-side input sanitization and schema validation.

        - **Why we use it:** Rejects malformed emails, short passwords, negative prices, and invalid ObjectIds before they reach controller logic.

        - **Where used & Files:** `server/src/routes/auth.js`, `server/src/routes/alerts.js`, and `server/src/middleware/validate.js`.

        - **Real-World Example:** If an API caller submits an alert with `targetPriceInPaise: -500`, express-validator halts the request with HTTP 400 Bad Request before database queries occur.

        - **What if omitted:** Controllers would be vulnerable to malformed inputs, NoSQL injection attempts, and unexpected application crashes.

    

    
## 3.5 Python Extraction Worker

    
### 14. Python 3.12, FastAPI (v0.110+) & Uvicorn

    

        - **What it is:** A modern, high-performance Python web framework for building APIs with standard Python type hints, served by the lightning-fast Uvicorn ASGI server.

        - **Why we use it:** Python is the industry-standard language for HTML parsing and web scraping. FastAPI provides automatic OpenAPI documentation, strict Pydantic validation, and clean microservice separation on port `8000`.

        - **Where used & Files:** `worker/main.py`, `worker/extractor.py`.

        - **Real-World Example:** Express delegates complex HTML extraction for authorized test catalogs to `http://127.0.0.1:8000/extract`, keeping heavy HTML DOM parsing out of Node's main thread.

        - **What if omitted:** Heavy DOM parsing of multi-megabyte HTML strings inside Node.js could block Express's single-threaded event loop, degrading API response times for all users.

    

    
## 3.6 Cloud Services & Orchestration

    
### 15. GitHub Actions

    

        - **What it is:** GitHub's native continuous integration and workflow automation platform.

        - **Why we use it:** Acts as an external cron runner that triggers price monitoring every four hours (`0 */4 * * *`), even if our cloud hosting instances have spun down due to inactivity. Also runs our 277 Jest tests on every commit.

        - **Where used & Files:** `.github/workflows/monitor.yml`, `.github/workflows/ci.yml`.

        - **Real-World Example:** At 00:00, 04:00, 08:00, 12:00, 16:00, and 20:00 UTC, a GitHub Ubuntu runner boots up, wakes our backend via `GET /api/health`, triggers the monitor via `POST /api/monitor/run`, and polls status until finished.

        - **What if omitted:** Free-tier cloud servers sleep after 15 minutes of inactivity; without an external trigger like GitHub Actions, price monitoring would halt entirely once the server sleeps.

    

    
### 16. Brevo API (Transactional Email)

    

        - **What it is:** An enterprise email delivery service providing high-deliverability transactional email APIs.

        - **Why we use it:** Direct SMTP connections are blocked by many cloud providers (including Render) to prevent spam. Brevo's REST API over HTTPS bypasses SMTP blocks and guarantees inbox delivery.

        - **Where used & Files:** `server/src/services/notifications/email.js`.

        - **Real-World Example:** Sends both the 6-digit registration/password reset OTPs and price drop alerts with direct links back to the retailer.

        - **What if omitted:** Traditional Node.js `nodemailer` SMTP attempts on cloud platforms time out or land directly in spam folders.

    

    
### 17. Telegram Bot API

    

        - **What it is:** HTTPS API provided by Telegram allowing automated bots to send instant mobile push messages to users.

        - **Why we use it:** Delivers instant mobile alerts with 0 SMS costs and near-100% open rates. Users simply connect via a secure link code.

        - **Where used & Files:** `server/src/services/notifications/telegram.js`, `server/src/routes/telegram.js`.

        - **Real-World Example:** A user receives a direct Telegram message: *"🚨 PriceRadar Alert: Apple iPhone 15 dropped to ₹64,999 on Flipkart! [Buy Now]"* within 2 seconds of cycle completion.

        - **What if omitted:** Users would have to rely entirely on email, which is often checked less frequently than mobile instant messengers.

    

    
### 18. Jest (v29.7.0) & Supertest (v7.0.0)

    

        - **What it is:** Jest is a JavaScript testing framework with built-in test runners and assertions; Supertest is an HTTP assertion library for testing Express endpoints without binding to a network port.

        - **Why we use it:** Powers our 26 test suites and 277 automated tests, verifying everything from integer paise math to distributed locking and JWT expiration.

        - **Where used & Files:** `server/package.json` (`npm test`).

        - **Real-World Example:** Catches regressions instantly if a developer accidentally alters a database field name or breaks the price comparison logic.

        - **What if omitted:** Every bug would have to be caught through tedious, error-prone manual clicking in the browser.

    

    
# Part 4: Complete System Architecture

    

        PriceRadar operates as a decoupled, multi-tier system consisting of a client-side Single Page Application, a stateless Node.js REST API server, a MongoDB Atlas document datastore, an isolated Python extraction worker, and external workflow automation via GitHub Actions.
    

    
## 4.1 End-to-End System Architecture Diagram

    

        The following architectural diagram illustrates the complete topology, communication protocols, and data movement across all system boundaries:
    

    
> **[Diagram: Figure 4.1: High-Level Component & Communication Architecture]** *(See compiled PDF or HTML version for full vector illustration)*

    
## 4.2 The Complete Backend Request Lifecycle

    <p>
        To understand how data flows through the backend, consider a user creating a new price alert. The following sequence traces every layer from the moment the user clicks "Save Alert" until the record is committed to MongoDB Atlas:
    

    
> ### The 8-Stage Backend Execution Lifecycle
> 

>             `React Component → Axios Client → Express Route → Middleware Pipeline → Controller → Service Layer → Mongoose Model → MongoDB Atlas`
>         

    

        <li>
            **Stage 1: React Component Form Submission (`AlertFormPage.jsx`)**<br>
            The user inputs a target price of ₹45,000 for an iPhone 15 offer and clicks "Create Alert". The React component calls the utility `rupeesToPaise(45000)`, producing the integer `4500000`. It dispatches a call to `api.createAlert({ offerId, type: 'target_price', targetPriceInPaise: 4500000, channels: ['email'] })`.

        - **Stage 2: Axios HTTP Client & Interceptor (`client/src/services/api.js`)**<br>
            The Axios request interceptor reads `localStorage.getItem('priceradar_token')`. It attaches the header `Authorization: Bearer <jwt_token>` and issues an HTTP `POST https://priceradar-api-02ib.onrender.com/api/alerts` with the JSON payload.

        - **Stage 3: Express Router Matching (`server/src/routes/alerts.js`)**<br>
            The incoming HTTP POST matches the route definition:
            
```javascript
router.post('/', requireAuth, [body('offerId').isMongoId(), ...], validate, createAlert);
```

            Express registers this request and begins traversing the middleware pipeline.

        - **Stage 4: Middleware Pipeline Execution (`middleware/auth.js` & `validate.js`)**<br>
            First, `requireAuth` extracts the Bearer token, verifies its signature using `jwt.verify(token, JWT_SECRET)`, and attaches the decoded payload to `req.user = { id: 'usr_123', role: 'user' }`. Next, `express-validator` verifies that `offerId` is a valid MongoDB ObjectId, `type` is either `target_price` or `fixed_drop`, and `targetPriceInPaise` is a positive integer. If validation succeeds, `next()` passes control to the controller.

        - **Stage 5: Controller Unpacking (`controllers/alertsController.js`)**<br>
            The `createAlert` controller extracts sanitized fields:
            
```javascript
const { offerId, type, targetPriceInPaise, channels } = req.body;
const userId = req.user.id;
```

            The controller verifies that the target `Offer` exists in the database.

        - **Stage 6: Service / Business Logic Coordination**<br>
            The controller checks if an existing alert already exists for this `(userId, offerId)` pair to prevent redundant alert entries. If a fixed-drop alert were requested, the system would call `priceComparison.js` to look up the current baseline price before arming.

        - **Stage 7: Mongoose Model Validation (`models/Alert.js`)**<br>
            The controller instantiates a new document: `new Alert({ userId, offerId, type, targetPriceInPaise, channels, status: 'active', armed: true })`. Mongoose executes schema validators:
            

                <li>Ensures `targetPriceInPaise` is strictly an integer.

                - Ensures `channels` contains at least one of `['email', 'telegram']`.

            

        </li>
        - **Stage 8: MongoDB Atlas Persistence & Response**<br>
            Mongoose executes an `INSERT` operation into the `alerts` collection in MongoDB Atlas. MongoDB generates an `_id` and records `createdAt` and `updatedAt` timestamps. The controller returns HTTP 201 Created with JSON:
            
```javascript
res.status(201).json({ success: true, data: newAlert });
```

            Back in the browser, Axios unwraps `response.data.data`, and React displays a confirmation toast: *"Alert successfully created!"*.

    

    
## 4.3 Frontend Application Architecture

    

        The client-side architecture is organized around unidirectional data flow and strict route protection:
    

    

        - **Bootstrap Entrypoint (`main.jsx`):** Uses `ReactDOM.createRoot()` to mount the application. Wraps the tree in `<BrowserRouter>` and `<AuthProvider>`, ensuring global routing and auth state are available to every nested component.

        - **Layout & Routing (`App.jsx`):** Hosts the top-level `<Navbar>` and `<Footer>`. Wraps the interior page routing inside an `<ErrorBoundary>` so unexpected JavaScript rendering errors show a helpful fallback rather than a blank white screen.

        - **Route Protection (`ProtectedRoute.jsx`):** Checks `const { user, loading } = useAuth()`. While auth is loading from localStorage, it displays a loading spinner. If loading finishes and `user` is null, it immediately redirects the browser to `/login` while preserving the attempted destination in `location.state`.

        - **Axios Response Unwrapping:** Rather than forcing every page to write `res.data.data`, our API layer implements a centralized unwrapper helper:
            
```javascript
function unwrap(responsePromise) {
  return responsePromise.then((res) => res.data.data);
}
```

            This ensures React components receive raw, clean domain data objects directly.

    

    
# Part 5: Complete File Connection & Code Flows

    

        To master PriceRadar for technical interviews, you must understand exactly how files connect to execute business features. This section traces every major workflow step by step.
    

    <!-- FLOW A -->
    
## Flow A: User Registration with Email OTP Verification

    

        PriceRadar uses a secure two-step registration flow that guarantees email authenticity before creating the user in MongoDB:
    

    
> ### Registration Code Path Sequence
> 

>             `RegisterPage.jsx → api.initiateRegistration() → routes/auth.js → authController.initiateRegistration → OtpChallenge (MongoDB TTL) → Brevo Email API → RegisterPage (Step 2: Enter OTP) → api.verifyRegistration() → authController.verifyRegistration → User (MongoDB) → JWT Token → AuthContext`
>         

    

        - **User Fills Form (`RegisterPage.jsx`):** User enters Name, Email (e.g. `rahul@example.com`), and Password (minimum 8 characters).

        - **Frontend Validation & Dispatch:** Calls `initiateRegistration({ name, email, password })` in `client/src/services/api.js`.

        - **Route & Input Sanitization (`routes/auth.js`):** Express matches `POST /api/auth/register/initiate`. `express-validator` verifies valid email syntax and minimum 8-character password.

        - **Controller Logic (`controllers/authController.js`):**
            

                <li>Checks if user already exists: `await User.findOne({ email })`. If found, returns HTTP 400.

                - Generates a secure 6-digit numeric OTP: `Math.floor(100000 + Math.random() * 900000).toString()`.

                - Hashes the plaintext password with bcrypt: `const passwordHash = await bcrypt.hash(password, 10);`.

                - Hashes the 6-digit OTP with SHA-256 for secure temporary storage.

                - Saves an `OtpChallenge` document with `purpose: 'register'` and `expiresAt: new Date(Date.now() + 10 * 60 * 1000)` (10-minute expiration).

                - Calls `sendEmail({ to: email, subject: 'Your PriceRadar Verification Code', ... })` via Brevo.

            

        </li>
        - **User Enters OTP (`RegisterPage.jsx`):** The UI shifts to Step 2 ("Enter 6-digit code"). The user enters `492810` and clicks "Verify & Register".

        - **Verification Route:** Calls `POST /api/auth/register/verify` with `{ email, otp: '492810' }`.

        - **Verification & User Creation (`authController.js`):**
            

                <li>Finds challenge: `await OtpChallenge.findOne({ email, purpose: 'register' })`.

                - Computes SHA-256 of submitted OTP and verifies match with `otpHash`.

                - Creates permanent user: `const user = await User.create({ name: challenge.name, email, passwordHash: challenge.passwordHash })`.

                - Deletes challenge: `await OtpChallenge.deleteMany({ email })`.

                - Issues JWT: `const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })`.

            

        </li>
        - **Client State Update:** Frontend saves token in `localStorage`, `AuthContext` sets `user`, and redirects to `/dashboard`.

    

    <!-- FLOW B -->
    
## Flow B: User Login & JWT Issuance

    
> ### Login Code Path Sequence
> 

>             `LoginPage.jsx → api.login() → routes/auth.js → authController.login → User.findOne().select('+passwordHash') → bcrypt.compare() → jwt.sign() → localStorage.setItem() → AuthContext.setUser()`
>         

    

        - **User Submits Credentials (`LoginPage.jsx`):** Enters email and password.

        - **API Call:** Calls `api.login({ email, password })`.

        - **Controller Query with Explicit Password Selection:**
            
```javascript
// Notice .select('+passwordHash') because schema sets select: false!
const user = await User.findOne({ email }).select('+passwordHash');
if (!user) return res.status(401).json({ success: false, error: 'Invalid email or password.' });
```

        - **Cryptographic Verification:**
            
```javascript
const isMatch = await bcrypt.compare(password, user.passwordHash);
if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid email or password.' });
```

        - **Token Issuance:**
            
```javascript
const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
res.json({ success: true, data: { token, user: { id: user._id, name: user.name, email: user.email } } });
```

        - **Client Storage:** `AuthContext.jsx` receives token, executes `localStorage.setItem('priceradar_token', token)`, and sets user state. Subsequent Axios calls automatically include the token.

    

    <!-- FLOW C -->
    
## Flow C: Multi-Retailer Product Search

    
> ### Search Code Path Sequence
> 

>             `SearchPage.jsx → api.searchProducts(q) → routes/products.js → productsController.searchProducts → Product.find() & Offer.find() → priceComparison.js → ProductCard.jsx Grid`
>         

    

        - **User Searches Keyword:** Enters "iPhone 15" into search bar on `SearchPage.jsx`.

        - **API Call:** Calls `GET /api/products/search?q=iPhone%2015`.

        - **Controller Search Logic (`controllers/productsController.js`):**
            

                <li>Executes case-insensitive regex query against MongoDB: `Product.find({ title: { $regex: q, $options: 'i' } })`.

                - For each matched product, queries all associated retailer listings: `Offer.find({ productId: product._id })`.

                - Identifies the lowest price across retailers using `Math.min(...offers.map(o => o.priceInPaise))`.

            

        </li>
        - **Response Formatting:** Returns list of products with lowest price, offer count, and sample/live indicators.

        - **UI Rendering:** `SearchPage.jsx` renders responsive grid of `<ProductCard>` components.

    

    <!-- FLOW D -->
    
## Flow D: Product Details & Price Comparison

    
> ### Product Details Code Path Sequence
> 

>             `ProductDetailPage.jsx → api.getProduct(id) & api.getOfferHistory(offerId) → productsController & offersController → PriceObservation.find() → OfferRow.jsx & SVG Price Chart`
>         

    

        - **User Clicks Product:** Navigates to `/products/:productId`.

        - **Parallel API Requests:**
            

                <li>`api.getProduct(productId)`: Retrieves canonical Product and all linked retailer Offers (Amazon, Flipkart, eBay).

                - `api.getOfferHistory(offerId)`: Retrieves historical price observations sorted by date.

            

        </li>
        - **History Aggregation:** `offersController.getOfferHistory` queries `PriceObservation.find({ offerId, status: 'success' }).sort({ fetchedAt: 1 })`.

        - **UI Visualization:**
            

                <li>Displays `<OfferRow>` components showing side-by-side retailer prices, availability badges (In Stock / Out of Stock), and retailer badges.

                - Renders an interactive SVG price history line chart displaying price movement over time in Indian Rupees.

            

        </li>
    

    <!-- FLOW E -->
    
## Flow E: Watchlist Item Management

    

        - **User Saves Offer:** Clicks "Watch" on an offer row.

        - **API Call:** Sends `POST /api/watchlist` with `{ offerId: '66a1b2c3...' }`.

        - **Auth & Model Storage (`watchlistController.js`):**
            

                <li>Verifies user identity from `req.user.id`.

                - Attempts upsert or creation: `await WatchlistItem.create({ userId: req.user.id, offerId })`.

                - MongoDB unique compound index `{ userId: 1, offerId: 1 }` prevents duplicate records if clicked twice.

            

        </li>
        - **Retrieval:** On `/watchlist`, `WatchlistItem.find({ userId: req.user.id }).populate('offerId')` returns all saved listings.

    

    <!-- FLOW F -->
    
## Flow F: Price Alert Creation (Target-Price vs Fixed-Drop)

    

        - **User Configures Alert (`AlertFormPage.jsx`):**
            

                <li>Chooses Alert Type: **Target Price** (e.g. ₹45,000) OR **Fixed Drop** (e.g. ₹2,000 drop).

                - Selects Notification Channels: Email checkbox and/or Telegram checkbox.

            

        </li>
        - **Paise Conversion:** Frontend converts entered rupees to integer paise:
            
```javascript
targetPriceInPaise = rupeesToPaise(45000); // 4500000
```

        - **API Call:** Sends `POST /api/alerts` with payload.

        - **Validation & Storage (`alertsController.js`):**
            

                <li>If `type === 'fixed_drop'`, reads the current offer price and saves it as `baselinePriceInPaise`.

                - Saves `Alert` with `status: 'active'` and `armed: true`.

            

        </li>
        - **Result:** Alert enters the monitoring queue and will be evaluated during the next 4-hour cycle.

    

    <!-- FLOW H -->
    
## Flow H: Telegram Account Linking

    

        - **User Requests Link Code (`NotificationPreferencesPage.jsx`):** User clicks "Connect Telegram".

        - **API Call:** Calls `POST /api/telegram/link-code`.

        - **Backend Code Generation:** Generates a random alphanumeric 6-character linking code, hashes it, and saves it in a temporary store with a 15-minute expiration.

        - **Deep Link Display:** Returns `https://t.me/PriceRadarAlertBot?start=<linkCode>`. React displays a button: "Open in Telegram".

        - **Telegram Webhook Ingestion:** When the user clicks Start in Telegram, Telegram's servers POST a webhook payload to `/api/telegram/webhook` containing `chat.id` and the start code.

        - **User Profile Update:** The backend validates the code and updates the user's document:
            
```javascript
await User.findByIdAndUpdate(userId, { telegramChatId: chatId });
```

            The bot sends a confirmation message: *"✅ Your Telegram account is now linked to PriceRadar!"*.

    

    <!-- FLOW I -->
    
## Flow I: Four-Step Password Reset Flow

    

        - **Step 1: Request Reset (`ForgotPasswordPage.jsx`):** User enters registered email. Backend generates 6-digit OTP, saves SHA-256 hash in `OtpChallenge` with `purpose: 'reset_password'`, and dispatches an email via Brevo.

        - **Step 2: Verify OTP:** User submits OTP. Controller checks `OtpChallenge`. If valid, generates a cryptographically secure random `resetToken`, saves its hash in `OtpChallenge.resetTokenHash`, and returns the token to the frontend.

        - **Step 3: New Password Submission:** User enters a new 8+ character password. Frontend sends `{ email, resetToken, newPassword }` to `POST /api/auth/reset-password`.

        - **Step 4: Update & Invalidation:** Backend verifies `resetTokenHash` against the database, hashes the new password with bcrypt (10 rounds), updates `User.passwordHash`, and deletes the challenge to prevent token replay attacks.

    

    
# Part 6: Complete REST API Endpoint Reference

    

        The PriceRadar backend exposes a fully RESTful HTTP interface. Every JSON response strictly follows our standardized contract:
    

    
> ### Standardized API Response Envelopes
> 
**Success Response (HTTP 200 / 201):**<br>
>         `{ "success": true, "data": { ... } }`

>         
**Error Response (HTTP 400 / 401 / 404 / 500 / 503):**<br>
>         `{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }`

    
## 6.1 The Master API Endpoint Reference Table

    
| Method | Endpoint | Purpose | Auth | Request Data | Response / Result | Files |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/auth/register/initiate` | Starts registration; sends 6-digit email OTP | Public | Body: `{ name, email, password }` | `{ success: true, message }` | `routes/auth.js``authController.js` |
| POST | `/api/auth/register/verify` | Verifies OTP and creates user | Public | Body: `{ email, otp }` | `{ token, user }` | `routes/auth.js``authController.js` |
| POST | `/api/auth/register/resend` | Resends registration OTP | Public | Body: `{ email }` | `{ success: true }` | `routes/auth.js``authController.js` |
| POST | `/api/auth/register` | Direct registration fallback | Public | Body: `{ name, email, password }` | `{ token, user }` | `routes/auth.js``authController.js` |
| POST | `/api/auth/login` | Authenticates user & issues JWT | Public | Body: `{ email, password }` | `{ token, user }` | `routes/auth.js``authController.js` |
| GET | `/api/auth/me` | Returns current authenticated profile | Bearer JWT | None | `{ user }` | `routes/auth.js``authController.js` |
| POST | `/api/auth/forgot-password` | Sends password reset OTP | Public | Body: `{ email }` | `{ success: true }` | `routes/auth.js``authController.js` |
| POST | `/api/auth/verify-reset-otp` | Verifies reset OTP; returns resetToken | Public | Body: `{ email, otp }` | `{ resetToken }` | `routes/auth.js``authController.js` |
| POST | `/api/auth/resend-reset-otp` | Resends password reset OTP | Public | Body: `{ email }` | `{ success: true }` | `routes/auth.js``authController.js` |
| POST | `/api/auth/reset-password` | Sets new password with resetToken | Public | Body: `{ email, resetToken, newPassword }` | `{ success: true }` | `routes/auth.js``authController.js` |
| GET | `/api/products/search` | Searches catalog with lowest prices | Public | Query: `?q=phone&category=...` | `{ products: [...] }` | `routes/products.js``productsController.js` |
| GET | `/api/products/autocomplete` | Returns instant search suggestions | Public | Query: `?q=iph` | `{ suggestions: [...] }` | `routes/products.js``productsController.js` |
| GET | `/api/products/categories` | Lists distinct product categories | Public | None | `{ categories: [...] }` | `routes/products.js``productsController.js` |
| GET | `/api/products/providers/status` | Status of retailer adapters | Public | None | `{ providers: {...} }` | `routes/products.js``productsController.js` |
| GET | `/api/products/:productId` | Fetches product & all store offers | Public | Params: `:productId` | `{ product, offers }` | `routes/products.js``productsController.js` |
| GET | `/api/offers/:offerId` | Fetches single offer details | Public | Params: `:offerId` | `{ offer }` | `routes/offers.js``offersController.js` |
| GET | `/api/offers/:offerId/history` | Price history time-series data | Public | Params: `:offerId` | `{ history: [...] }` | `routes/offers.js``offersController.js` |
| GET | `/api/watchlist` | Gets logged-in user's watchlist | Bearer JWT | None | `{ items: [...] }` | `routes/watchlist.js``watchlistController.js` |
| POST | `/api/watchlist` | Adds offer to user's watchlist | Bearer JWT | Body: `{ offerId }` | `{ item }` | `routes/watchlist.js``watchlistController.js` |
| DELETE | `/api/watchlist/:id` | Removes offer from watchlist | Bearer JWT | Params: `:id` | `{ success: true }` | `routes/watchlist.js``watchlistController.js` |
| GET | `/api/alerts` | Lists user's active & paused alerts | Bearer JWT | None | `{ alerts: [...] }` | `routes/alerts.js``alertsController.js` |
| POST | `/api/alerts` | Creates new target/drop price alert | Bearer JWT | Body: `{ offerId, type, ... }` | `{ alert }` | `routes/alerts.js``alertsController.js` |
| PATCH | `/api/alerts/:id` | Updates alert thresholds or status | Bearer JWT | Params: `:id`, Body: `{ ... }` | `{ alert }` | `routes/alerts.js``alertsController.js` |
| DELETE | `/api/alerts/:id` | Deletes price alert | Bearer JWT | Params: `:id` | `{ success: true }` | `routes/alerts.js``alertsController.js` |
| GET | `/api/notifications` | User notification event history | Bearer JWT | None | `{ events: [...] }` | `routes/notifications.js``notificationsController.js` |
| DELETE | `/api/notifications/:id` | Dismisses notification event | Bearer JWT | Params: `:id` | `{ success: true }` | `routes/notifications.js``notificationsController.js` |
| GET | `/api/notification-preferences` | Gets user notification channels | Bearer JWT | None | `{ email, telegram }` | `routes/notificationPreferences.js` |
| PUT | `/api/notification-preferences` | Updates notification channel settings | Bearer JWT | Body: `{ email }` | `{ preferences }` | `routes/notificationPreferences.js` |
| POST | `/api/telegram/link-code` | Generates 15-min Telegram bot link | Bearer JWT | None | `{ linkCode, botUrl }` | `routes/telegram.js` |
| POST | `/api/telegram/link` | Links chatId with verification code | Public | Body: `{ linkCode, chatId }` | `{ success: true }` | `routes/telegram.js` |
| POST | `/api/telegram/disconnect` | Disconnects Telegram account | Bearer JWT | None | `{ success: true }` | `routes/telegram.js` |
| POST | `/api/monitor/run` | Asynchronous monitoring trigger | Secret / Cron | Header: `X-Monitor-Secret` | `HTTP 202 { runId }` | `routes/monitor.js``monitorController.js` |
| POST | `/api/monitor/trigger` | UI manual refresh trigger | Bearer JWT | None | `{ success: true, result }` | `routes/monitor.js``monitorController.js` |
| GET | `/api/monitor/status` | Polls execution state of monitor run | Public | None | `{ isRunning, lastRun }` | `routes/monitor.js``monitorController.js` |
| GET | `/api/health` | Public health check for Render & CI | Public | None | `{ status: 'ok', database }` | `server/src/app.js` |

    
## 6.2 Core HTTP Methods Explained with PriceRadar Examples

    

        - **GET (Safe & Idempotent):** Retrieves data without modifying server state. Example: `GET /api/products/search?q=laptop` queries MongoDB and returns matching products. It can be executed 100 times without side effects.

        - **POST (Non-Idempotent):** Creates new server resources or initiates stateful actions. Example: `POST /api/alerts` creates a brand new alert document in MongoDB with a unique `_id`. Sending it twice creates two separate records (or triggers duplicate validation).

        - **PATCH (Partial Update):** Modifies specific fields of an existing document without overwriting the entire document. Example: `PATCH /api/alerts/66a1...` with `{ "status": "paused" }` updates only the status field, leaving target prices and channels intact.

        - **PUT (Full Replacement):** Replaces the entire resource or ensures exact configuration state. Example: `PUT /api/notification-preferences` sets the complete channel preferences object.

        - **DELETE (Idempotent Deletion):** Removes a resource from the database. Example: `DELETE /api/watchlist/66a1...` deletes the join document. Calling it again returns HTTP 404 or success because the item is already gone.

    

    
## 6.3 Express Request and Response Primitives Explained

    

        In Express controllers, data arrives through specific properties on the request object (`req`) and departs through the response object (`res`):
    

    

        - `req.body`: Contains the parsed JSON payload sent by POST/PATCH requests (enabled by `app.use(express.json())`). Example: `const { offerId, targetPriceInPaise } = req.body;`.

        - `req.params`: Contains named route URL parameters extracted from path placeholders. Example: In route `/api/products/:productId`, a request to `/api/products/123` yields `req.params.productId === '123'`.

        - `req.query`: Contains URL query string parameters following the `?` symbol. Example: In `/api/products/search?q=phone&category=tech`, `req.query.q === 'phone'`.

        - `req.headers`: Contains HTTP request headers sent by the client. Example: `req.headers.authorization` or `req.headers['x-monitor-secret']`.

        - `req.user`: A custom object attached to the request by the `requireAuth` middleware after successfully verifying the JWT token. Contains authenticated user credentials: `req.user = { id: user._id, role: user.role }`.

        - `res.status(code)`: Sets the HTTP status code (200 OK, 201 Created, 202 Accepted, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Error, 503 Service Unavailable).

        - `res.json(payload)`: Serializes the JavaScript object into a JSON string, sets the `Content-Type: application/json` header, and sends the response.

    

    
## 6.4 How to Debug an API Endpoint from Frontend to Database

    

        If an endpoint fails or returns unexpected data, follow this structured 7-step debugging procedure:
    

    

        - **Step 1 (Browser Network Tab):** Open Chrome DevTools → Network tab. Inspect the failing request. Look at the Request URL, HTTP Method, Request Headers (is the Bearer token present?), and Request Payload.

        - **Step 2 (Axios Service):** Check `client/src/services/api.js`. Ensure the function maps to the correct endpoint path and uses `unwrap(api.post(...))`.

        - **Step 3 (Express App & Route):** Check `server/src/app.js` to verify route prefix mounting (e.g. `app.use('/api/alerts', alertRoutes)`) and `server/src/routes/alerts.js` to confirm parameter matching.

        - **Step 4 (Middleware & Validation):** Inspect console logs in the terminal. If `express-validator` failed, inspect `validate.js` to see which field caused the HTTP 400 Bad Request.

        - **Step 5 (Controller & req.user):** Add a breakpoint or log: `console.log('Controller received:', req.body, req.user);` inside the controller. Ensure `req.user.id` is populated.

        - **Step 6 (Service & Model Logic):** Check if the Mongoose query threw an error (e.g. invalid ObjectId format, missing required field, or failing `Number.isInteger` validation).

        - **Step 7 (Database State via Atlas):** Open MongoDB Atlas → Database → Browse Collections. Directly inspect the target document to verify that field names and types match schema expectations.

    

    
# Part 7: Complete Database Architecture & Models

    

        PriceRadar uses **MongoDB Atlas** with the **Mongoose ODM**. The data model is engineered around normalized relationships, compound performance indexing, financial integer precision, and automated TTL cleanup.
    

    
## 7.1 MongoDB Core Concepts in Simple English

    

        - **Database:** The top-level container holding all collections (in our project: `priceradar`).

        - **Collection:** A group of related documents, analogous to a SQL table (e.g. `users`, `products`, `offers`, `alerts`).

        - **Document:** An individual JSON-like BSON record inside a collection (e.g. one specific user profile or one retailer listing).

        - **Field:** A key-value pair within a document (e.g. `title: "Apple iPhone 15"`, `priceInPaise: 6499900`).

        - **ObjectId (`_id`):** A 12-byte unique identifier generated by MongoDB containing a 4-byte timestamp, 5-byte random value, and 3-byte incrementing counter.

        - **Schema:** A Mongoose blueprint defining allowed fields, data types, defaults, and validators for a collection.

        - **Model:** A compiled Mongoose constructor that wraps a schema and provides database query methods (e.g. `User.findOne()`, `Alert.create()`).

        - **Reference (`ref`):** A field storing another document's `ObjectId` to create relationships (e.g. `offerId: { type: ObjectId, ref: 'Offer' }`).

        - **Index:** A dedicated B-tree data structure that accelerates search queries from O(N) linear scans to O(log N) lookups.

        - **Compound Unique Index:** An index spanning multiple fields enforcing unique combinations (e.g. `{ userId: 1, offerId: 1 }` prevents a user from adding the same offer to their watchlist twice).

        - **TTL (Time To Live) Index:** A specialized index on a date field that automatically deletes documents when their expiration timestamp arrives.

        - **Timestamps:** Schema option `{ timestamps: true }` that automatically manages `createdAt` and `updatedAt` dates.

    

    
## 7.2 Master Models Reference Table

    
| Model | What it Stores | Key Fields & Indexes | Relationships & Cardinality |
| --- | --- | --- | --- |
| User`models/User.js` | User account credentials, roles, and Telegram link. | `name`, `email` (unique, lowercase), `passwordHash` (`select: false`), `telegramChatId`, `role` ('user'/'admin'). | One-to-Many with Alert and WatchlistItem. |
| Product`models/Product.js` | Canonical master product identity independent of retailer. | `title`, `brand`, `canonicalKey` (unique, lowercase), `imageUrl`, `category`, `dataStatus`. | One-to-Many with Offer (one phone has many retailer listings). |
| Offer`models/Offer.js` | Specific retailer listing with live price and stock status. | `productId` (ref), `provider`, `externalProductId`, `priceInPaise` (integer), `availability`.Index: `{ provider: 1, externalProductId: 1 }` (unique). | Many-to-One with Product; One-to-Many with Alert & PriceObservation. |
| Alert`models/Alert.js` | User price drop monitoring rule and armed state. | `userId` (ref), `offerId` (ref), `type` ('target_price'/'fixed_drop'), `targetPriceInPaise`, `dropAmountInPaise`, `channels`, `armed` (boolean), `status`. | Many-to-One with User; Many-to-One with Offer. |
| WatchlistItem`models/WatchlistItem.js` | User's bookmarked retailer offers. | `userId` (ref), `offerId` (ref).Index: `{ userId: 1, offerId: 1 }` (unique). | Many-to-One with User; Many-to-One with Offer. |
| PriceObservation`models/PriceObservation.js` | Immutable time-series record of price fetch attempts. | `offerId` (ref), `priceInPaise`, `status` ('success'/'failure'), `fetchedAt`.Index: `{ offerId: 1, fetchedAt: -1 }`. | Many-to-One with Offer (historical timeline). |
| NotificationEvent`models/NotificationEvent.js` | Audit log of sent price drop notifications. | `userId` (ref), `alertId` (ref), `channel` ('email'/'telegram'), `status`, `dedupeKey`.Index: `{ dedupeKey: 1 }` (unique). | Many-to-One with User and Alert. |
| MonitorRun`models/MonitorRun.js` | Historical audit of scheduled 4-hour monitor executions. | `status` ('running'/'completed'/'failed'), `triggeredBy`, `startedAt`, `durationMs`, `offersAttempted`, `triggeredAlerts`. | Referenced by MonitorLock during active cycle. |
| MonitorLock`models/MonitorLock.js` | Distributed mutex lease preventing overlapping cycles. | `_id: 'monitoring_cycle_lock'`, `isLocked` (boolean), `currentRunId`, `heartbeatAt`, `instanceId`. | Singleton document governing the entire monitoring engine. |
| OtpChallenge`models/OtpChallenge.js` | Hashed 6-digit OTP codes for registration & password reset. | `email`, `otpHash` (SHA-256), `purpose`, `attempts`, `expiresAt`.Index: `{ expiresAt: 1 }` (TTL index). | Temporary staging document (auto-deleted after 10 min). |

    
## 7.3 Entity Relationship Diagram (ERD)

    
> **[Diagram: Figure 7.1: Entity Relationship Diagram Showing References and Cardinality]** *(See compiled PDF or HTML version for full vector illustration)*

    
## 7.4 Why Prices are Stored as Integer Paise (Financial Accuracy)

    <p>
        One of the most impressive technical decisions to explain in interviews is PriceRadar's **Integer Paise Policy**.
    

    
> ### The JavaScript Binary Floating-Point Flaw (IEEE 754)
> 

>             In standard JavaScript and MongoDB, floating-point numbers are represented using the IEEE 754 standard (base-2 binary representation). Numbers like 0.1 and 0.2 cannot be stored exactly in binary, leading to notorious calculation errors:
>         

>         
> ```javascript
> console.log(0.1 + 0.2); // Output: 0.30000000000000004
> console.log(0.1 + 0.2 === 0.3); // Output: FALSE!
> ```
> 
>         

>             If PriceRadar stored prices as floating-point rupees (e.g. `499.99`), evaluating whether a price dropped by an exact threshold could fail or introduce fractional cent errors over time.
>         

    

        **The Engineering Solution (`server/src/utils/money.js`):**<br>
        PriceRadar stores every monetary value as an **integer number of paise** (1 Rupee = 100 Paise). Floating-point fractions are completely eradicated from the database tier:
    

    

        <li>₹5,000 becomes `500000` paise.

        - ₹45,999.50 becomes `4599950` paise.

        - ₹64,999 becomes `6499900` paise.

    

    
Our Mongoose schema enforces this strictly at write-time:

    
```javascript
priceInPaise: {
  type: Number,
  required: true,
  validate: {
    validator: Number.isInteger,
    message: 'priceInPaise must be an integer (rupees x 100, rounded)',
  },
}
```

    
Three pure conversion utilities in `server/src/utils/money.js` manage translations:

    

        - `rupeesToPaise(rupees)`: Converts user input to paise: `Math.round(rupees * 100)`.

        - `paiseToRupees(paise)`: Converts paise to decimal rupees for math: `paise / 100`.

        - `formatRupees(paise)`: Formats paise as an Indian currency string: `rupees.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })` (e.g. `₹64,999`).

    

    
## 7.5 End-to-End Data Storage Walkthrough

    

        Suppose a user searches for *"Apple iPhone 15"* and sets an alert when its price drops below ₹45,000. Here is exactly where data is written and how documents link:
    

    

        - **Product Document:** Stored in `products` collection. `canonicalKey: "apple-iphone-15-128gb"`, `title: "Apple iPhone 15 (Black, 128 GB)"`, `_id: ObjectId("66a01")`.

        - **Offer Documents:** Stored in `offers` collection. Contains multiple seller listings linked to `productId: ObjectId("66a01")`:
            

                <li>Amazon listing: `provider: "amazon"`, `priceInPaise: 4899900` (₹48,999), `_id: ObjectId("66b01")`.

                - Flipkart listing: `provider: "flipkart"`, `priceInPaise: 4699900` (₹46,999), `_id: ObjectId("66b02")`.

            

        </li>
        - **Alert Document:** Stored in `alerts` collection when user clicks "Create Alert" on the Flipkart offer:
            

                <li>`userId: ObjectId("66u01")`

                - `offerId: ObjectId("66b02")` (points directly to Flipkart listing)

                - `type: "target_price"`

                - `targetPriceInPaise: 4500000` (₹45,000)

                - `armed: true`

            

        </li>
        - **PriceObservation Document:** Created during each 4-hour monitoring cycle:
            

                <li>`offerId: ObjectId("66b02")`

                - `priceInPaise: 4449900` (New price: ₹44,499)

                - `status: "success"`

                - `fetchedAt: ISODate("2026-11-20T08:00:00Z")`

            

        </li>
        - **NotificationEvent Document:** Created when evaluator detects `4449900 <= 4500000`:
            

                <li>`userId: ObjectId("66u01")`

                - `alertId: ObjectId("66a99")`

                - `channel: "email"`

                - `dedupeKey: "66a99:4449900"` (prevents duplicate email on next run)

                - `status: "sent"`

            

        </li>
    

    
# Part 8: Automated Price Monitoring Engine

    

        The four-hour automated price monitoring architecture is the core engineering highlight of PriceRadar. It solves cloud cold starts, distributed race conditions, multi-tenant duplicate fetching, and transient network errors.
    

    
## 8.1 What Starts the Monitoring Process (GitHub Actions Cron)

    

        Free-tier cloud hosting platforms (such as Render) spin down container instances after 15 minutes of inactivity. An internal timer running inside a sleeping server stops ticking. Therefore, PriceRadar utilizes **GitHub Actions** as an external, highly reliable orchestration chronometer.
    

    
> ### The Cron Schedule Expression: `0 */4 * * *`
> ```javascript
> ┌───────────── Minute (0: at the top of the hour)
> │ ┌─────────── Hour (*/4: every 4 hours: 00, 04, 08, 12, 16, 20)
> │ │ ┌───────── Day of month (*: every day)
> │ │ │ ┌─────── Month (*: every month)
> │ │ │ │ ┌───── Day of week (*: every day of the week)
> │ │ │ │ │
> 0 */4 * * *
> ```

    
### UTC to India Standard Time (IST = UTC + 5:30) Conversion

    
| Execution Run | Coordinated Universal Time (UTC) | India Standard Time (IST) |
| --- | --- | --- |
| Run 1 (Early Morning) | 00:00 UTC | 05:30 AM IST |
| Run 2 (Morning Work) | 04:00 UTC | 09:30 AM IST |
| Run 3 (Afternoon Lunch) | 08:00 UTC | 01:30 PM IST |
| Run 4 (Evening Prime) | 12:00 UTC | 05:30 PM IST |
| Run 5 (Night Peak) | 16:00 UTC | 09:30 PM IST |
| Run 6 (Late Night) | 20:00 UTC | 01:30 AM IST |

    

        **Manual Execution via `workflow_dispatch`:** The workflow file also includes `workflow_dispatch:`, allowing developers and evaluators to trigger a live price refresh at any time directly from the GitHub Actions web dashboard.
    

    
## 8.2 Connecting GitHub Actions to the Cloud Backend

    

        The workflow executes on an ephemeral `ubuntu-latest` runner. It connects to the Render backend using repository secrets without hardcoding URLs or tokens:
    

    
> **[Diagram: Figure 8.1: GitHub Actions Orchestration Sequence]** *(See compiled PDF or HTML version for full vector illustration)*

    
## 8.3 Asynchronous Execution & HTTP 202 Accepted Pattern

    <p>
        Fetching prices from 10 different retail providers over external networks takes between 15 and 90 seconds. If Express held the initial HTTP connection open for that entire duration:
    

    

        <li>Network proxies, firewalls, and cloud load balancers could terminate the connection with an HTTP 504 Gateway Timeout.

        - GitHub Actions would remain blocked on a single synchronous socket.

    

    

        **The Solution (Asynchronous Decoupling):**<br>
        When Express receives `POST /api/monitor/run`, it validates the secret, creates a `MonitorRun` record with `status: 'running'`, spawns the monitoring logic asynchronously in the background, and **immediately returns HTTP 202 Accepted**:
    

    
```javascript
res.status(202).json({
  success: true,
  message: 'Price monitoring cycle accepted and started in background.',
  data: { runId: newRun._id, status: 'running', startedAt: newRun.startedAt }
});
```

    

        GitHub Actions receives the `runId` and enters a non-blocking polling loop: it calls `GET /api/monitor/status` every 10 seconds. When the backend marks the run `completed` or `failed`, GitHub prints the metrics summary and exits with code 0 (success) or code 1 (failure).
    

    
## 8.4 The 17-Step Monitoring Lifecycle

    

        The complete monitoring execution inside `server/src/services/priceMonitor.js` follows 17 deterministic steps:
    

    

        - **Trigger Ingestion:** Route `POST /api/monitor/run` receives trigger with `X-Monitor-Secret` header.

        - **Secret Authentication:** `monitorController.js` compares header with `process.env.MONITOR_TRIGGER_SECRET`. Rejects unauthorized calls with HTTP 401.

        - **Local In-Memory Mutex Check:** Inspects `monitorState.isRunning`. If true, immediately rejects with HTTP 409 Conflict (cycle already running).

        - **Distributed Mutex Lock Acquisition:** Executes atomic MongoDB `findOneAndUpdate` on `MonitorLock` (singleton ID `'monitoring_cycle_lock'`). Ensures only one server instance worldwide runs the cycle.

        - **Stale Run Reconciliation:** If a prior run crashed during server restart and left the lock held, the system checks `heartbeatAt`. If older than 15 minutes, it breaks the stale lock and marks the dead run `interrupted`.

        - **MonitorRun Initialization:** Creates an audit record in `MonitorRun` collection with `status: 'running'`.

        - **Active Alerts Retrieval:** Queries `Alert.find({ status: 'active' }).select('offerId')`.

        - **Distinct Offer ID Deduplication:** Extracts unique offer IDs: `const distinctOfferIds = [...new Set(activeAlerts.map(a => a.offerId.toString()))]`.

        - **Sequential Offer Traversal:** Iterates through unique offers to fetch prices.

        - **Provider Dispatcher Invocation:** Calls `providerDispatcher.fetchOffer(offer)` in `server/src/providers/index.js`.

        - **PriceObservation Persistence:** Saves a new `PriceObservation` document with the fresh price and status.

        - **Offer Record Update:** Updates `Offer` document with `priceInPaise`, `lastFetchedAt: now`, and `lastStatus: 'ok'`.

        - **Dependent Alert Evaluation:** For each alert listening to this updated offer, calls `evaluateAlert(alert, currentPriceInPaise, previousPriceInPaise)` in `alertEvaluator.js`.

        - **Multi-Channel Notification Dispatch:** If `shouldNotify === true`, calls `dispatchAlertNotifications()` to send Brevo emails and Telegram push messages.

        - **Alert State Transition:** Sets `alert.armed = false` to suppress duplicate notifications during subsequent cycles.

        - **Finalizing Run Metrics:** Updates `MonitorRun` with `status: 'completed'`, `offersSuccessful`, `offersFailed`, and `durationMs`.

        - **Lock Release in Finally Block:** The `finally` block resets `monitorState.isRunning = false` and sets `MonitorLock.isLocked = false`, unlocking the engine for the next 4-hour cycle.

    

    
## 8.5 Multi-Retailer Provider Dispatcher Architecture

    

        The dispatcher in `server/src/providers/index.js` acts as a polymorphic router:
    

    
| Provider | Adapter File | Mechanism & Credentials | Classification |
| --- | --- | --- | --- |
| Apify | `providers/apify.js` | Calls Apify Cloud Actor REST API using `APIFY_API_TOKEN` to extract live Amazon, Flipkart & Meesho prices. | Live Cloud |
| eBay | `providers/ebay.js` | Queries official eBay Browse REST API via OAuth 2.0 client credentials (`EBAY_APP_ID`, `EBAY_CERT_ID`). | Live REST API |
| Scrapling | `providers/scrapling.js` | Issues local HTTP request to Python FastAPI worker (`http://127.0.0.1:8000/extract`) with SSRF checks. | Live Microservice |
| DummyJSON | `providers/dummyjson.js` | Fetches real-time JSON catalog from public public testing API (`https://dummyjson.com/products`). | Live Test Catalog |
| MockShop | `providers/mockshop.js` | Queries GraphQL endpoint (`https://mock.shop/api`) for synthetic product listings. | Live GraphQL |
| Fixture | `providers/fixture.js` | Offline JSON fixture dataset (`fixtureData.json`) used for deterministic unit testing. | Sample Fixture |
| Amazon Direct | `providers/amazon.js` | Refuses direct web scraping to comply with Terms of Service; routes sample offers to fixture and live offers to Apify. | Ethical Fallback |
| Flipkart Direct | `providers/flipkart.js` | Direct affiliate scraper unconfigured; routes sample listings to fixture and live listings to Apify. | Ethical Fallback |

    
## 8.6 Practical Scenario: Price Tracking & Alert Re-Arming

    

        Consider this step-by-step example across 4 monitoring cycles for an iPhone 15:
    

    

        - **Initial State:** Product Price = ₹50,000 (`5000000` paise). User sets Target Price = ₹45,000 (`4500000` paise). `alert.armed = true`.

        - **Cycle 1 (4 hours later):** Fetched Price = ₹48,000.
            <br>*Evaluation:* `4800000 <= 4500000` is **FALSE**. No notification is sent. Alert remains `armed: true`.

        - **Cycle 2 (8 hours later):** Price drops to ₹44,000.
            <br>*Evaluation:* `4400000 <= 4500000` is **TRUE**. Since `armed === true`, **Alert Triggers!**
            <br>*Notification:* Email & Telegram alerts dispatched.
            <br>*State Transition:* System sets `alert.armed = false`.

        - **Cycle 3 (12 hours later):** Price stays at ₹44,000.
            <br>*Evaluation:* Condition is still TRUE, but `armed === false`! **Duplicate notification suppressed!** The user is not spammed.

        - **Cycle 4 (16 hours later):** Deal ends; price rises to ₹47,000.
            <br>*Evaluation:* `4700000 <= 4500000` is FALSE. Since condition is no longer met and alert was disarmed:
            <br>**The Alert Automatically Re-Arms (`armed = true`)!** When the price drops again in the future, the user will receive a new alert.

    

    
## 8.7 Distinct Offer ID Logic (Consolidated Fetching)

    

        Suppose 500 different users have alerts for the exact same Apple iPhone 15 listing on Flipkart.
    

    
> ### The Distinct Offer Deduplication Optimization
> 

>             A naive system would fetch Flipkart's web page 500 times. PriceRadar groups alerts by distinct `offerId`:
>         

>         
> ```javascript
> const distinctOfferIds = [...new Set(activeAlerts.map(a => a.offerId.toString()))];
> ```
> 
>         

>             PriceRadar fetches the price from Flipkart **exactly ONCE**. It saves the price observation and evaluates all 500 user alerts in memory using that single observation. This reduces external network bandwidth and API consumption by over 99%!
>         

    
## 8.8 Distributed Mutex Locking (MongoDB MonitorLock)

    

        To prevent two monitoring cycles from executing simultaneously (which could cause race conditions, duplicate emails, and double database writes), PriceRadar uses a **dual-locking mechanism**:
    

    

        - **Local In-Memory Mutex:** Fast synchronous boolean (`monitorState.isRunning`) that blocks concurrent triggers inside the same Node.js process.

        - **Distributed MongoDB Lease (`MonitorLock`):** An atomic document in MongoDB:
            
```javascript
let lock = await MonitorLock.findOneAndUpdate(
  {
    _id: 'monitoring_cycle_lock',
    $or: [
      { isLocked: false },
      { isLocked: null },
      { heartbeatAt: { $lt: staleCutoff } }, // Stale lease recovery
    ],
  },
  {
    $set: { isLocked: true, acquiredAt: now, heartbeatAt: now, instanceId }
  },
  { new: true, upsert: true }
);
```

            If another server instance is already running, `lock` returns null, and the incoming cycle safely aborts.

    

    
## 8.9 Both Scheduling Mechanisms (External Cron vs Internal Timer)

    

        PriceRadar implements **two independent schedulers**:
    

    

        - **1. GitHub Actions Workflow (`monitor.yml`):** Primary orchestrator. Operates externally and wakes sleeping cloud containers.

        - **2. Backend In-Process Scheduler (`services/scheduler.js`):** Secondary fallback. Uses Node's native `setInterval` (every 4 hours) when running on dedicated always-on servers (or local development).

    

    

        **How they coexist safely:** Because both schedulers pass through the atomic `MonitorLock` distributed lease, they can never run concurrently. If GitHub Actions fires at 04:00 UTC and the internal timer triggers at 04:00 UTC, only one will acquire the lease; the other will log a warning and safely skip execution.
    

    
## 8.10 Monitoring Failure Handling Matrix

    
| Failure Scenario | System Reaction | Resolution & Safeguard |
| --- | --- | --- |
| Render Server Sleeping | Initial curl request takes 45 seconds to wake container. | GitHub Actions sends pre-flight ping to `/api/health` with 6 retries and 5s delay before triggering monitor. |
| Database Disconnected | Fast-fail middleware catches disconnected state. | Returns HTTP 503 Service Unavailable immediately instead of hanging on 30-second timeouts. |
| External Retailer API Down | Provider returns HTTP 500 or timeout. | Cycle records failure in `PriceObservation`, skips that single offer, and proceeds to the next offer without crashing. |
| Server Crashes Mid-Cycle | Node.js process terminates abruptly; lock left active. | Next cycle detects `heartbeatAt` older than 15 minutes, breaks the stale lease, marks old run `interrupted`, and starts cleanly. |
| Telegram API Times Out | Telegram network call fails after email sent. | System records email as `sent` and Telegram as `failed` in `NotificationEvent`; partial delivery audit is preserved. |

    
# Part 9: Alerts Evaluation & Notification Dispatch

    

        PriceRadar implements an intelligent, stateful alert evaluation pipeline designed to prevent duplicate notification spam while supporting multi-channel delivery across Email and Telegram.
    

    
## 9.1 Alert Types & Mathematical Conditions

    

        Users can configure two distinct types of price alerts:
    

    
### 1. Target-Price Alert (`type: 'target_price'`)

    

        - **User Intent:** *"Notify me when this MacBook Air drops to ₹75,000 or below."*

        - **Mathematical Condition (in paise):**
            
```javascript
conditionMet = currentPriceInPaise <= alert.targetPriceInPaise;
```

        - **Evaluation Logic:** Evaluated purely on the latest observed price. If current price is ₹74,990, the condition evaluates to true.

    

    
### 2. Fixed-Drop Alert (`type: 'fixed_drop'`)

    

        - **User Intent:** *"Notify me if this camera drops by ₹3,000 from today's price."*

        - **Baseline Price Semantics:** When a fixed-drop alert is created, the system records the current price as `baselinePriceInPaise`. If missing, it falls back to `previousPriceInPaise`.

        - **Mathematical Condition (in paise):**
            
```javascript
const referencePrice = alert.baselinePriceInPaise || previousPriceInPaise;
const priceDrop = referencePrice - currentPriceInPaise;
conditionMet = priceDrop >= alert.dropAmountInPaise;
```

    

    
## 9.2 The Stateful Alert Lifecycle Diagram

    
> **[Diagram: Figure 9.1: Stateful Alert Armed Transition Lifecycle]** *(See compiled PDF or HTML version for full vector illustration)*

    
## 9.3 Multi-Channel Notification Dispatchers

    
### A. Brevo Transactional Email Service (`services/notifications/email.js`)

    

        <li>Uses Brevo's REST API over HTTPS (`POST https://api.brevo.com/v3/smtp/email`).

        - Generates a responsive HTML email containing the product image, drop amount, current price in INR, and a direct "Buy on Retailer" button.

        - Bypasses cloud provider port-25 SMTP blocking.

    

    
### B. Telegram Bot API (`services/notifications/telegram.js`)

    

        - Uses Telegram Bot HTTPS API (`POST https://api.telegram.org/bot<token>/sendMessage`).

        - Sends rich Markdown messages directly to the user's mobile device via `telegramChatId`.

        - Delivers instant notifications with near-zero latency and 0 SMS billing costs.

    

    
## 9.4 Independent Safety: Deduplication Keys (`dedupeKey`)

    <p>
        In addition to the in-memory `armed` flag, PriceRadar enforces an immutable database-level safety net inside `NotificationEvent`:
    

    
```javascript
// server/src/models/NotificationEvent.js
notificationEventSchema.index({ dedupeKey: 1 }, { unique: true });
```

    

        The deduplication key is constructed as:
    

    
```javascript
const dedupeKey = `${alertId}:${currentPriceInPaise}`;
```

    

        Even if an asynchronous race condition caused the notification dispatcher to fire twice for the same alert during the same cycle, MongoDB's unique index on `dedupeKey` causes the second insert to throw a duplicate key error (code 11000), physically preventing double-sending to the user.
    

    
## 9.5 Partial Delivery & Retry Semantics

    

        If an alert is configured for both **Email** and **Telegram**, the dispatcher attempts both independently:
    

    

        - If **Email succeeds** but **Telegram fails** (e.g. Telegram API timed out):
            <br>The system records Email as `status: 'sent'` and Telegram as `status: 'failed'` with the exact error message.
            <br>The email is *not* rolled back.

        - **Retry Semantics:** PriceRadar does *not* implement an unbounded automatic retry loop on notification delivery failures. Doing so could result in alert storms or getting IP-banned by Brevo or Telegram. Instead, the failure is logged in the `NotificationEvent` audit trail, and the alert remains eligible for evaluation during the next 4-hour cycle.

    

    
# Part 10: Authentication, Authorization & Security Architecture

    

        Security in PriceRadar is engineered defensively at every layer—from database schema projections to cryptographic hashing, stateless token verification, and Server-Side Request Forgery (SSRF) prevention.
    

    
## 10.1 Password Hashing with bcryptjs

    

        Storing plaintext passwords in a database is an immediate failure in any production software review. PriceRadar uses **bcryptjs** with 10 salt rounds.
    

    
> ### Hashing vs. Encryption (Crucial Interview Distinction)
> 

>             **Hashing (One-Way):** A mathematical trapdoor function. Data is transformed into a fixed-length string that *cannot* be decrypted or reversed back into the original input. It is used for passwords.
>         

>         

>             **Encryption (Two-Way):** A reversible cipher. Plaintext is scrambled using an encryption key and can be completely recovered using the matching decryption key. It is used for confidential data in transit (TLS) or storage.
>         

    
### How bcrypt Works Under the Hood

    

        - **Automatic Salt Generation:** bcrypt generates a 16-byte cryptographically secure random string called a *salt* (e.g. `$2a$10$N9qo8uLO...`). This guarantees that two users with the exact same password (e.g. `Password123!`) produce completely different hash strings, defeating precomputed rainbow table attacks.

        - **Adaptive Cost Factor (Work Factor = 10):** The salt rounds parameter ($2^{10} = 1024$ iterations of Blowfish key expansion) makes computing the hash deliberately CPU-intensive (~80ms). This stops automated brute-force attacks while remaining imperceptible to real users.

        - **Password Verification via `bcrypt.compare()`:** When logging in, the server extracts the salt from the stored hash, hashes the candidate password using that exact salt and work factor, and checks if the outputs match:
            
```javascript
// server/src/controllers/authController.js
const isMatch = await bcrypt.compare(password, user.passwordHash);
if (!isMatch) {
  return res.status(401).json({ success: false, error: 'Invalid email or password.' });
}
```

    

    
## 10.2 Stateless JWT (JSON Web Token) Authentication

    

        PriceRadar uses JSON Web Tokens (RFC 7519) to authenticate API requests without requiring server-side session memory.
    

    
> **[Diagram: Figure 10.1: Anatomy of a Signed JSON Web Token]** *(See compiled PDF or HTML version for full vector illustration)*

    
### Token Verification Middleware (`server/src/middleware/auth.js`)

    
```javascript
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Populates req.user.id and req.user.role
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}
```

    
> ### Critical JWT Interview Insight: JWTs are NOT Encrypted
> 

>             A signed JWT is **Base64Url encoded**, NOT encrypted. Anyone who intercepts the token can decode the payload string and view the user's ID and role. The signature only proves that the payload was not tampered with. For this reason, **passwords, secrets, or financial details must NEVER be placed inside a JWT payload**.
>         

    
## 10.3 Four-Step Email OTP Security Architecture

    

        PriceRadar uses short-lived One-Time Passwords (OTPs) for both Registration verification and Password Resets:
    

    

        - **SHA-256 Hashing at Rest:** OTPs are never saved as plaintext in MongoDB. The controller hashes the 6-digit code with SHA-256 before writing to `OtpChallenge.otpHash`.

        - **MongoDB Native TTL Index:** `expiresAt` is indexed with `{ expires: 0 }`. MongoDB's internal background thread automatically cleans up and deletes expired challenges.

        - **Brute-Force Rate Limiting:** Each challenge tracks `attempts: { type: Number, default: 0 }`. If an attacker submits more than 5 incorrect guesses, the challenge is invalidated immediately.

        - **60-Second Resend Cooldown:** `resendAvailableAt` enforces a 60-second delay between OTP emails, preventing inbox-bombing spam.

    

    
## 10.4 Defense-in-Depth Security Guardrails

    
| Security Guardrail | Implementation in PriceRadar | Vulnerability Mitigated |
| --- | --- | --- |
| Mongoose `select: false` | `passwordHash: { type: String, select: false }` in `User.js`. | Prevents accidental credential leakage if a developer executes `User.find()` or serializes users to JSON. |
| SSRF Domain Allowlist | `validate_url()` in Python worker checks domain against `ALLOWED_DOMAINS` and validates redirect destinations. | Stops Server-Side Request Forgery (SSRF) targeting internal AWS/Render metadata endpoints (e.g. `169.254.169.254`). |
| Fast-Fail 503 Guard | Middleware checks `mongoose.connection.readyState !== 1` before servicing routes. | Prevents request pile-ups and 30-second connection timeouts when MongoDB Atlas is unreachable. |
| CORS Allowlist | `cors({ origin: allowedOrigins, credentials: true })` in `app.js`. | Blocks cross-origin requests from unauthorized third-party websites in user browsers. |
| Input Sanitization | `express-validator` schemas on all POST/PATCH routes. | Blocks NoSQL injection payloads, negative prices, and XSS script tags. |
| Data Isolation | Queries strictly scope to `req.user.id` (e.g. `Alert.find({ userId: req.user.id })`). | Prevents Insecure Direct Object Reference (IDOR) attacks where one user views another user's alerts. |

    
# Part 11: Python Extraction Worker Microservice

    

        PriceRadar supplements its Node.js backend with an isolated Python microservice located in `worker/`. This decoupled architecture offloads heavy HTML parsing and enforces strict network sandboxing.
    

    
## 11.1 Why a Separate Python Worker Exists

    

        Node.js runs on a **single-threaded event loop**. While it excels at non-blocking I/O (handling thousands of lightweight API requests), parsing large, multi-megabyte HTML documents using CPU-heavy regular expressions or DOM trees can block the event loop for tens or hundreds of milliseconds.
    

    

        - **Event Loop Protection:** Offloading HTML scraping to a separate Python process keeps the Express main thread responsive to user requests.

        - **Ecosystem Strengths:** Python possesses the industry's most robust web extraction libraries (Scrapling, BeautifulSoup4, Requests, Pydantic).

        - **Network Sandboxing:** The Python worker is bound strictly to `127.0.0.1:8000` and cannot be accessed from the public internet.

    

    
## 11.2 Microservice Communication & Data Flow

    

        When Express encounters an offer configured with `provider: 'scrapling'`, it delegates the extraction over local HTTP:
    

    
> **[Diagram: Figure 11.1: Express to FastAPI Worker Microservice Communication]** *(See compiled PDF or HTML version for full vector illustration)*

    
## 11.3 FastAPI Service Endpoints & Pydantic Contracts

    <p>
        The service is implemented in `worker/main.py`:
    

    
### 1. Health Check Endpoint (`GET /health`)

    
```javascript
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PriceRadar Scrapling Worker",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "allowed_domains": ["books.toscrape.com", "quotes.toscrape.com", "scrapingclub.com"]
    }
```

    
### 2. Extraction Endpoint (`POST /extract`)

    
Receives `ExtractRequest` and returns normalized `ExtractResponse`:

    
```javascript
class ExtractRequest(BaseModel):
    url: str
    currency: Optional[str] = "GBP"

class ExtractResponse(BaseModel):
    success: bool
    url: str
    title: Optional[str] = None
    price_in_paise: Optional[int] = None
    original_price: Optional[float] = None
    availability: Optional[str] = "unknown"
    data_status: str = "sample"
    retrieved_at: str
    error: Optional[str] = None
```

    
## 11.4 Server-Side Request Forgery (SSRF) Defense

    

        Accepting arbitrary URLs from users and fetching them on a server introduces severe **SSRF vulnerabilities**, where an attacker could trick the server into probing local host ports (e.g. `http://localhost:27017`) or querying cloud metadata endpoints (e.g. `http://169.254.169.254/latest/meta-data/`).
    

    
> ### The Three-Layer SSRF Defense in `worker/extractor.py`
> 

>             <li>**Strict Domain Allowlisting:** Only pre-approved testbed catalogs are permitted:
>                 
> ```javascript
> ALLOWED_DOMAINS = ["books.toscrape.com", "quotes.toscrape.com", "scrapingclub.com"]
> ```
> 
>                 Any request targeting an unapproved host is rejected with HTTP 400.
>

>             - **Protocol Sanitization:** Only `http://` and `https://` URL schemes are allowed; dangerous protocols like `file://`, `gopher://`, or `ftp://` are rejected immediately.

>             - **Post-Redirect URL Validation:** Attackers often bypass domain checks by pointing an allowed domain to a server that issues an HTTP 302 redirect to an internal IP. The worker inspects the final landing URL after redirects:
>                 
> ```javascript
> resp = requests.get(target_url, headers=headers, timeout=10, allow_redirects=True)
> post_redirect_val = validate_url(resp.url)
> if not post_redirect_val["valid"]:
>     raise HTTPException(status_code=400, detail="Redirect SSRF rejected")
> ```
> 
>

>         

    
## 11.5 Real-World Limitations to Disclose in Interviews

    

        In an interview, do **not** claim that this Python worker is a universal scraper that can scrape live Amazon or Flipkart listings directly.
    

    

        - **Anti-Bot Challenges:** Modern retail platforms use Cloudflare Turnstile, Akamai Bot Manager, and perimeterX that block raw Python `requests` with CAPTCHAs and HTTP 403 Forbidden.

        - **Our Architectural Solution:** PriceRadar correctly uses **Apify Cloud Actors** (which manage proxy rotation, headless browsers, and fingerprinting) for heavy e-commerce stores, while reserving the Python worker for controlled sandbox testbeds.

    

    
# Part 12: Complete React 18 Architecture & Hooks Guide

    

        The PriceRadar frontend is built with **React 18** and **Vite**. It embraces component-driven architecture, declarative state management, custom context providers, and responsive styling.
    

    
## 12.1 Core React Principles Used in PriceRadar

    

        - **Component Hierarchy:** Reusable building blocks (e.g. `<ProductCard>`, `<OfferRow>`, `<Navbar>`) nested within top-level screen views (e.g. `<SearchPage>`, `<DashboardPage>`).

        - **Unidirectional Data Flow:** Data flows downwards from parent to child via `props`; state modifications flow upwards via callback functions.

        - **Declarative UI:** Components declare *what* the screen should look like based on current `state`, and React's Virtual DOM reconciler updates the browser DOM efficiently.

        - **Controlled Components:** Form inputs (such as email, password, and target price) have their values bound directly to React state:
            
```javascript
<input value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
```

            This ensures React remains the single source of truth for all user input.

        - **Virtual DOM Keys:** When rendering lists of offers or alerts, every item requires a stable unique key (e.g. `<OfferRow key={offer._id} offer={offer} />`). This allows React's diffing algorithm to identify exactly which items were added, removed, or changed without re-rendering the entire list.

    

    
## 12.2 Deep Dive into React Hooks Used in PriceRadar

    

        PriceRadar leverages both foundational and performance-tuning React hooks. Here is how each is used in the actual codebase:
    

    
### 1. `useState` (Local Component State)

    

        - **What it is:** A Hook that adds state variables to functional components. Calling the updater function schedules a re-render.

        - **Where used in PriceRadar:** Form fields, loading spinners, and error alerts across every page.

        - **Actual Code Example (`client/src/pages/AlertFormPage.jsx`):**
            
```javascript
const [targetPrice, setTargetPrice] = useState('');
const [channels, setChannels] = useState(['email']);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

        - **Explanation:** When `setLoading(true)` is called, React re-renders the component to display a disabled button with a spinning icon. When the API completes, `setLoading(false)` restores the button.

    

    
### 2. `useEffect` (Side Effects & Lifecycle Management)

    

        - **What it is:** Performs asynchronous data fetching, subscriptions, or DOM mutations after rendering.

        - **Where used in PriceRadar:** Fetching catalog items on page load and handling search query debouncing.

        - **Actual Code Example (`client/src/pages/ProductDetailPage.jsx`):**
            
```javascript
useEffect(() => {
  let isMounted = true;
  async function loadData() {
    setLoading(true);
    try {
      const data = await getProduct(productId);
      if (isMounted) setProduct(data.product);
    } catch (err) {
      if (isMounted) setError(err.message);
    } finally {
      if (isMounted) setLoading(false);
    }
  }
  loadData();
  return () => { isMounted = false; }; // Cleanup prevents memory leaks on unmount
}, [productId]); // Re-runs whenever the URL productId changes
```

    

    
### 3. `useContext` (Global State Subscription)

    

        - **What it is:** Subscribes to a React Context object, eliminating the need to pass props down through multiple layers of intermediate components ("prop drilling").

        - **Where used in PriceRadar:** `useAuth()` custom hook consuming `AuthContext`.

        - **Actual Code Example (`client/src/components/Navbar.jsx`):**
            
```javascript
export default function Navbar() {
  const { user, logout } = useAuth(); // Subscribes to global auth state

  return (
    <nav className="navbar">
      {user ? (
        <button onClick={logout}>Sign Out ({user.name})</button>
      ) : (
        <Link to="/login">Sign In</Link>
      )}
    </nav>
  );
}
```

    

    
### 4. `useRef` (Persistent Mutable References & DOM Access)

    

        - **What it is:** Returns a mutable object whose `.current` property persists across renders without triggering a re-render when mutated. Also used for direct DOM references.

        - **Where used in PriceRadar:** Managing debounce timers in search inputs and referencing chart SVG canvas containers.

        - **Actual Code Example (Debounce in `SearchPage.jsx`):**
            
```javascript
const debounceTimerRef = useRef(null);

function handleSearchChange(e) {
  const query = e.target.value;
  setSearchTerm(query);
  clearTimeout(debounceTimerRef.current);
  debounceTimerRef.current = setTimeout(() => {
    executeSearch(query);
  }, 400); // Waits 400ms after user stops typing before calling API
}
```

    

    
### 5. `useMemo` (Memoizing Expensive Computations)

    

        - **What it is:** Caches the calculated result of an expensive function between renders, recomputing only when specified dependencies change.

        - **Where used in PriceRadar:** Sorting offers to find the lowest price and calculating average discount percentages.

        - **Actual Code Example (`ProductDetailPage.jsx`):**
            
```javascript
const lowestOffer = useMemo(() => {
  if (!offers || offers.length === 0) return null;
  return offers.reduce((min, o) => (o.priceInPaise < min.priceInPaise ? o : min), offers[0]);
}, [offers]); // Only recalculates when the offers array changes
```

    

    
### 6. `useCallback` (Memoizing Function References)

    

        - **What it is:** Caches a callback function definition between renders to prevent unnecessary re-rendering of child components that rely on reference equality.

        - **Where used in PriceRadar:** Event handlers passed to child component rows (e.g. `handleToggleWatchlist` passed to `<OfferRow>`).

    

    
## 12.3 Global Auth State Management (`AuthContext.jsx`)

    

        The `AuthContext` acts as the single source of truth for user authentication across the client application:
    

    
```javascript
// client/src/context/AuthContext.jsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('priceradar_token'));
  const [loading, setLoading] = useState(true);

  // Re-hydrates user profile on initial application load
  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const profile = await getMe();
          setUser(profile.user);
        } catch {
          localStorage.removeItem('priceradar_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, [token]);

  function login(newToken, newUser) {
    localStorage.setItem('priceradar_token', newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem('priceradar_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

    
## 12.4 Route Guarding with `<ProtectedRoute>`

    

        Protected pages (Dashboard, Watchlist, Alerts) are wrapped in `<ProtectedRoute>`:
    

    
```javascript
// client/src/components/ProtectedRoute.jsx
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return ;
  }

  if (!user) {
    // Preserves original destination in location.state so login redirects back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
```

    
# Part 13: Core JavaScript Interview Preparation (30 Topics)

    

        Every topic below is explained with a clear definition, practical analogy, and direct connection to the PriceRadar codebase.
    

    
### 1. JavaScript vs. Node.js

    

        - **Explanation:** JavaScript is a high-level programming language. Node.js is an asynchronous runtime environment built on Chrome's V8 engine that allows JavaScript to execute outside the browser (on servers).

        - **PriceRadar Connection:** JavaScript runs in the user's browser rendering React components, while Node.js runs on our Render server executing Express endpoints and connecting to MongoDB.

    

    
### 2. `var` vs. `let` vs. `const`

    

        - **Explanation:** `var` is function-scoped and hoisted (can cause subtle bugs). `let` is block-scoped (mutable). `const` is block-scoped and immutable (cannot be reassigned).

        - **PriceRadar Connection:** PriceRadar uses 100% `const` by default and `let` only when variables change (e.g. `let lock = await ...`). `var` is completely forbidden.

    

    
### 3. Primitive vs. Reference Types

    

        - **Explanation:** Primitives (String, Number, Boolean, null, undefined, Symbol, BigInt) are stored directly on the stack by value. Reference types (Objects, Arrays, Functions) are stored in the heap, and variables hold a memory address pointer.

        - **PriceRadar Connection:** Passing an offer object to a function passes a reference. Mutating `offer.priceInPaise = 100` mutates the original object in memory.

    

    
### 4. Loose Equality (`==`) vs. Strict Equality (`===`)

    

        - **Explanation:** `==` performs type coercion before comparison (e.g. `"5" == 5` is true). `===` checks both value and data type without coercion (e.g. `"5" === 5` is false).

        - **PriceRadar Connection:** We always use `===`: `if (alert.type === 'target_price')` to prevent accidental truthy/falsy bugs.

    

    
### 5. Regular Functions vs. Arrow Functions

    

        - **Explanation:** Arrow functions (`() => {}`) do not have their own `this`, `arguments`, or `prototype`; they lexically bind `this` from the enclosing scope.

        - **PriceRadar Connection:** Used throughout React components and array transformations: `offers.map(o => o.priceInPaise)`.

    

    
### 6. Scope: Global, Function, and Block Scope

    

        - **Explanation:** Scope determines variable accessibility. Global variables are accessible everywhere. Function scope is accessible only inside that function. Block scope (`{}` with `let`/`const`) is restricted to that block (e.g. inside an `if` or `for` statement).

    

    
### 7. Hoisting & The Temporal Dead Zone (TDZ)

    

        - **Explanation:** JavaScript moves variable and function declarations to the top of their scope before execution. `var` initializes as `undefined`, while `let` and `const` enter the Temporal Dead Zone (TDZ) and throw a `ReferenceError` if accessed before declaration.

    

    
### 8. Closures (With Real PriceRadar Example)

    

        - **Explanation:** A closure is a function bundled together with references to its surrounding lexical environment. A closure gives an inner function access to an outer function's scope even after the outer function has returned.

        - **PriceRadar Example (`asyncHandler.js`):**
            
```javascript
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

            The inner function retains closure access to `fn`, catching rejected promises across any controller route.

    

    
### 9. Callbacks & Callback Hell

    

        - **Explanation:** A callback is a function passed as an argument to another function to be executed later. Deeply nested callbacks create unreadable "callback hell". Modern JavaScript replaces callbacks with Promises and `async/await`.

    

    
### 10. Promises (Pending, Fulfilled, Rejected)

    

        - **Explanation:** A Promise represents the eventual completion or failure of an asynchronous operation and its resulting value. It starts in `pending` state and settles into either `fulfilled` (resolved) or `rejected`.

    

    
### 11. `async` and `await`

    

        - **Explanation:** Syntactic sugar built on top of Promises that allows asynchronous code to be written and read synchronously, making control flow and error handling with `try/catch` far cleaner.

        - **PriceRadar Example:**
            
```javascript
const product = await Product.findById(productId);
const offers = await Offer.find({ productId });
```

    

    
### 12. The JavaScript Event Loop

    

        - **Explanation:** Coordinates code execution. Consists of:
            

                <li>**Call Stack:** Executes synchronous code.

                - **Web / Node APIs:** Handles background I/O, timers, and HTTP calls.

                - **Microtask Queue:** High-priority queue for Promise callbacks (`.then`, `await`).

                - **Macrotask Queue:** Queue for `setTimeout`, `setInterval`, and I/O callbacks.

            

            The Event Loop continually pushes microtasks to the Call Stack as soon as synchronous execution finishes.
        </li>
    

    
### 13. Synchronous vs. Asynchronous Execution

    

        - **Explanation:** Synchronous code executes sequentially line-by-line, blocking subsequent instructions until finished. Asynchronous code offloads long operations (like database queries) to background worker threads, allowing the main thread to continue processing other tasks.

    

    
### 14. Array `map`, `filter`, and `reduce`

    

        - **`map()`:** Transforms every element and returns a new array:
            
```javascript
const prices = offers.map(o => o.priceInPaise / 100);
```

        - **`filter()`:** Returns a new array with elements matching a boolean condition:
            
```javascript
const inStockOffers = offers.filter(o => o.availability === 'in_stock');
```

        - **`reduce()`:** Accumulates array items into a single final value:
            
```javascript
const minPrice = offers.reduce((min, o) => o.priceInPaise < min ? o.priceInPaise : min, offers[0].priceInPaise);
```

    

    
### 15. Destructuring Assignment (Object & Array)

    

        - **Explanation:** Unpacks values from arrays or properties from objects into distinct variables.

        - **PriceRadar Example:** `const { email, password } = req.body;` or `const [user, setUser] = useState(null);`.

    

    
### 16. Spread (`...`) and Rest (`...`) Operators

    

        - **Spread:** Expands an array or object into elements: `const updated = { ...alert, status: 'paused' };`.

        - **Rest:** Gathers remaining parameters into an array: `function logErrors(...errs) {}`.

    

    
### 17. Template Literals

    

        - **Explanation:** Strings delimited with backticks (```) supporting embedded expressions (`${expression}`) and multi-line formatting.

        - **PriceRadar Example:** ``https://t.me/PriceRadarAlertBot?start=${linkCode}``.

    

    
### 18. Optional Chaining (`?.`)

    

        - **Explanation:** Safely accesses deeply nested object properties without throwing a `TypeError` if a reference is null or undefined.

        - **PriceRadar Example:** `alert?._id?.toString()` prevents crashes if `alert` is null.

    

    
### 19. Nullish Coalescing (`??` vs. `||`)

    

        - **Explanation:** `||` returns the right-hand operand if the left-hand is *falsy* (including `0`, `""`, `false`). `??` returns the right-hand operand *only* if the left-hand is strictly `null` or `undefined`.

        - **PriceRadar Example:** `price ?? 0` preserves a valid price of `0`, whereas `price || 100` would incorrectly overwrite a `0` price!

    

    
### 20. ES Modules (`import`/`export`) vs. CommonJS (`require`)

    

        - **Explanation:** ES Modules (ESM) is the official ECMAScript standard: static, asynchronous, tree-shakeable. CommonJS is the legacy Node.js standard: dynamic and synchronous. PriceRadar specifies `"type": "module"` in `server/package.json` and uses pure ESM everywhere.

    

    
### 21. `try / catch / finally` Blocks

    

        - **Explanation:** `try` tests a block of code; `catch` captures any thrown errors; `finally` executes regardless of whether an error occurred.

        - **PriceRadar Example:** The distributed mutex in `priceMonitor.js` releases the lock inside `finally` so a crash during price fetching never leaves the database permanently locked.

    

    
### 22. JSON Serialization (`JSON.stringify` and `JSON.parse`)

    

        - **Explanation:** `JSON.stringify()` converts a JavaScript object into a JSON string for HTTP transmission; `JSON.parse()` deserializes a JSON string back into a JavaScript object.

    

    
### 23. Array Methods: `find`, `some`, `every`, `includes`

    

        - **`find()`:** Returns the first element that satisfies a test: `offers.find(o => o.provider === 'amazon')`.

        - **`some()`:** Returns true if at least one element passes: `channels.some(c => c === 'telegram')`.

        - **`every()`:** Returns true if all elements pass: `tests.every(t => t.passed)`.

    

    
### 24. Object Methods: `Object.keys()`, `Object.values()`, `Object.entries()`

    

        - **PriceRadar Example:** Iterating over provider status dictionaries to display system diagnostics: `Object.entries(providerStatus).map(([name, status]) => ...)`.

    

    
### 25. Higher-Order Functions (HOFs)

    

        - **Explanation:** A function that receives another function as an argument, returns a function, or both. Examples: `map()`, `filter()`, `asyncHandler()`.

    

    
### 26. Pure Functions & Immutability

    

        - **Explanation:** A pure function given the same inputs always returns the same output without observable side effects. PriceRadar's `evaluateAlert()` is a 100% pure function: it receives alert and price parameters and returns a deterministic result object.

    

    
### 27. Sets for Deduplication (`new Set()`)

    

        - **PriceRadar Example:** `const distinctOfferIds = [...new Set(activeAlerts.map(a => a.offerId.toString()))];` extracts unique offer IDs in O(N) time.

    

    
### 28. Debouncing vs. Throttling

    

        - **Debouncing:** Postpones execution until a specified quiet period has elapsed after the last event (e.g. waiting 400ms after user stops typing in the search box).

        - **Throttling:** Enforces a maximum frequency limit, executing at most once per time window.

    

    
### 29. Custom Error Objects in JavaScript

    

        - **Explanation:** Extending `Error` allows attaching custom HTTP status codes and error categories:
            
```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
```

    

    
### 30. Asynchronous Error Propagation in Express

    

        - **Explanation:** In Express, an unhandled rejected promise inside an asynchronous route function will bypass normal Express error handling and terminate the Node process. PriceRadar wraps all controller routes in `asyncHandler`, ensuring rejected promises are passed to `next(err)` and caught by `errorHandler.js`.

    

    
# Part 14: Node.js & Express Interview Preparation (25 Topics)

    

        The backend interview questions below focus on server architecture, middleware chains, HTTP protocols, and resilience patterns implemented in PriceRadar.
    

    
### 1. What is Node.js and how does it execute JavaScript?

    

        - **Explanation:** Node.js is an open-source, cross-platform runtime built on Google Chrome's V8 engine and libuv. It executes JavaScript outside the browser using a single-threaded, non-blocking event-driven architecture.

    

    
### 2. Why is Node.js ideal for PriceRadar?

    

        - **Explanation:** PriceRadar's primary workload is I/O-bound: querying MongoDB, making HTTP requests to external retailer APIs (eBay, Apify), and dispatching emails. Node's non-blocking event loop handles hundreds of concurrent I/O calls without thread contention.

    

    
### 3. What is Express.js?

    

        - **Explanation:** A minimalist web framework for Node.js that provides high-level routing, request parsing, and a middleware pipeline architecture.

    

    
### 4. What is Middleware in Express?

    

        - **Explanation:** Functions that have access to `req`, `res`, and `next`. They execute sequentially in the pipeline to parse bodies, authenticate tokens, sanitize inputs, or handle errors before responses depart.

    

    
### 5. What is Routing?

    

        - **Explanation:** The mechanism that binds incoming HTTP request methods and URL paths (e.g. `GET /api/products/search`) to specific handler functions.

    

    
### 6. What is a Controller?

    

        - **Explanation:** An intermediary function responsible for HTTP transport: unpacking request payloads, invoking business services or database models, and returning an HTTP status code and JSON envelope.

    

    
### 7. What is a Service Layer?

    

        - **Explanation:** The business brain of the application. Services (e.g. `priceMonitor.js`, `alertEvaluator.js`) contain pure business rules independent of HTTP transport, allowing them to be called by web controllers, cron jobs, or CLI tools alike.

    

    
### 8. What is a REST API?

    

        - **Explanation:** Representational State Transfer—a stateless architectural style where clients interact with resources identified by standard URIs using standard HTTP methods and JSON payloads.

    

    
### 9. HTTP Methods Breakdown

    

        - **GET:** Read resource (safe, idempotent).

        - **POST:** Create resource or trigger action (non-idempotent).

        - **PUT:** Replace resource completely (idempotent).

        - **PATCH:** Modify resource fields partially (idempotent).

        - **DELETE:** Remove resource (idempotent).

    

    
### 10. HTTP Status Codes Used in PriceRadar

    

        - **200 OK:** Request succeeded (e.g. search results returned).

        - **201 Created:** New resource successfully persisted (e.g. alert created).

        - **202 Accepted:** Background task queued and accepted (e.g. `POST /api/monitor/run`).

        - **400 Bad Request:** Validation error (e.g. negative price or invalid email).

        - **401 Unauthorized:** Missing, invalid, or expired JWT token.

        - **403 Forbidden:** Authenticated, but user lacks permission.

        - **404 Not Found:** Route or database entity does not exist.

        - **409 Conflict:** Concurrent action conflict (e.g. monitor already running).

        - **500 Internal Error:** Uncaught server exception.

        - **503 Service Unavailable:** Database disconnected (fast-fail middleware).

    

    
### 11. Request (`req`) and Response (`res`) Objects

    

        - **`req`:** Incoming HTTP request holding headers, parameters, and parsed JSON body.

        - **`res`:** Outgoing HTTP response object used to set status codes, headers, and send JSON data.

    

    
### 12. Route Parameters (`req.params`)

    

        - **Explanation:** Dynamic segments in URL paths prefixed with a colon:
            
```javascript
router.get('/products/:productId', getProduct); // Accessed via req.params.productId
```

    

    
### 13. Query Parameters (`req.query`)

    

        - **Explanation:** Key-value pairs following the `?` in the URL used for filtering, searching, and pagination:
            
```javascript
// URL: /api/products/search?q=laptop&limit=10 -> req.query.q === 'laptop'
```

    

    
### 14. Request Body & `express.json()`

    

        - **Explanation:** Node streams HTTP request bodies in chunks. `app.use(express.json())` is built-in middleware that buffers and parses incoming JSON streams into `req.body`.

    

    
### 15. Request Headers (`req.headers`)

    

        - **Explanation:** Metadata sent with the HTTP request. PriceRadar uses headers for JWT auth (`Authorization: Bearer <token>`) and cron verification (`X-Monitor-Secret: <secret>`).

    

    
### 16. CORS (Cross-Origin Resource Sharing)

    

        - **Explanation:** A browser security mechanism that blocks web pages on one origin (e.g. `https://priceradar-web.onrender.com`) from making HTTP calls to an API on a different origin (e.g. `https://priceradar-api-02ib.onrender.com`) unless the server returns authorized CORS headers.

    

    
### 17. Centralized Error-Handling Middleware

    

        - **Explanation:** Express recognizes error middleware by its 4-parameter signature: `(err, req, res, next)`. Must be the very last `app.use()` call in `app.js`:
            
```javascript
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: { code: err.code || 'SERVER_ERROR', message: err.message }
  });
}
```

    

    
### 18. The `asyncHandler` Pattern

    

        - **Explanation:** A higher-order function that wraps asynchronous controllers, catching Promise rejections and automatically passing them to `next(err)`, preventing unhandled promise rejections from crashing Node:
            
```javascript
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

    

    
### 19. Environment Variables (`dotenv` & `process.env`)

    

        - **Explanation:** Configuration variables kept outside the codebase. `server/src/config/env.js` loads `.env` on boot, verifying required variables (`MONGODB_URI`, `JWT_SECRET`, `MONITOR_TRIGGER_SECRET`).

    

    
### 20. Authentication Guard Middleware (`requireAuth`)

    

        - **Explanation:** Inspects the `Authorization: Bearer <token>` header. If missing or invalid, halts execution with HTTP 401. If valid, attaches decoded claims to `req.user` and invokes `next()`.

    

    
### 21. In-Memory Rate Limiting (`rateLimiter.js`)

    

        - **Explanation:** Tracks IP request frequencies within sliding time windows to prevent brute-force attacks on login and OTP verification routes.

    

    
### 22. Pagination Patterns (Skip & Limit)

    

        - **Explanation:** Splitting large datasets across multiple pages using Mongoose:
            
```javascript
const items = await Product.find().skip((page - 1) * limit).limit(limit);
```

    

    
### 23. Input Validation via `express-validator`

    

        - **Explanation:** Declarative array of validation rules attached to routes. Halts requests with detailed HTTP 400 field error arrays if input syntax is invalid.

    

    
### 24. MVC Architecture in PriceRadar

    

        - **Model:** Mongoose schemas in `models/`.

        - **View:** React SPA frontend components in `client/`.

        - **Controller:** Request handlers in `server/src/controllers/`.

    

    
### 25. The Fast-Fail 503 Middleware Pattern

    

        - **Explanation:** A custom middleware in `server/src/app.js` that checks `mongoose.connection.readyState !== 1`. If the cloud database is disconnected, it immediately returns HTTP 503 with an actionable error message rather than forcing the user to wait for a 30-second socket timeout.

    

    
# Part 15: MongoDB & Mongoose Interview Preparation (30 Topics)

    

        These 30 database topics explain the data modeling, query optimization, indexing, and atomicity guarantees powering PriceRadar.
    

    
### 1. SQL (Relational) vs. NoSQL (Document)

    

        - **SQL:** Rigid tables, pre-defined schemas, normalized relationships with foreign keys and ACID joins. Difficult to scale horizontally.

        - **NoSQL (MongoDB):** Flexible JSON-like documents, dynamic fields, horizontal scaling via sharding, optimized for fast hierarchical reads.

    

    
### 2. What is MongoDB?

    

        - **Explanation:** A leading open-source NoSQL document database that stores structured and semi-structured data in Binary JSON (BSON) format.

    

    
### 3. What is BSON?

    

        - **Explanation:** Binary JSON—a binary serialization format that extends JSON to support additional data types like `ObjectId`, `Date`, and binary data.

    

    
### 4. What is a Collection?

    

        - **Explanation:** A group of related MongoDB documents (analogous to a SQL table). In PriceRadar: `users`, `products`, `offers`, `alerts`.

    

    
### 5. What is an ObjectId?

    

        - **Explanation:** A 12-byte unique primary key generated automatically by MongoDB: 4 bytes of Unix timestamp, 5 bytes of random machine/process value, and 3 bytes of incrementing counter.

    

    
### 6. What is a Mongoose Schema?

    

        - **Explanation:** A document configuration defining allowed field names, data types, validation rules, default values, and virtual properties.

    

    
### 7. What is a Mongoose Model?

    

        - **Explanation:** A compiled constructor wrapper around a schema that provides high-level query methods (e.g. `User.findOne()`, `Alert.create()`).

    

    
### 8. Mongoose ODM vs. Native MongoDB Driver

    

        - **Explanation:** The native driver provides low-level raw access to MongoDB. Mongoose is an Object Data Modeling (ODM) layer providing schema validation, type casting, lifecycle hooks, and relationship population.

    

    
### 9. CRUD Operations Summary

    

        - **Create:** `Model.create(doc)` or `new Model(doc).save()`.

        - **Read:** `Model.find(query)`, `Model.findOne(query)`, `Model.findById(id)`.

        - **Update:** `Model.updateOne(query, update)`, `Model.findByIdAndUpdate(id, update)`.

        - **Delete:** `Model.deleteOne(query)`, `Model.findByIdAndDelete(id)`.

    

    
### 10. `find()` vs. `findOne()` vs. `findById()`

    

        - `find()`: Returns an array of all matching documents (or empty array).

        - `findOne()`: Returns the first matching document (or `null`).

        - `findById()`: Convenience method searching by `_id: id` (or `null`).

    

    
### 11. `create()` vs. `save()`

    

        - `create()`: Static model method that creates and persists one or more documents in a single call.

        - `save()`: Instance method called on a new or existing document instance, triggering Mongoose validation and saving changes.

    

    
### 12. `updateOne()` vs. `findByIdAndUpdate()`

    

        - `updateOne()`: Updates a document matching a filter and returns an acknowledgment object (`{ modifiedCount: 1 }`).

        - `findByIdAndUpdate()`: Updates a document by ID and returns the document itself (when `{ new: true }` is passed).

    

    
### 13. `populate()` (Simulating SQL Joins)

    

        - **Explanation:** Replaces an ObjectId reference with the actual populated document from another collection:
            
```javascript
// Replaces offerId with the complete Offer document
const watchlist = await WatchlistItem.find({ userId }).populate('offerId');
```

    

    
### 14. Normalization vs. Denormalization in PriceRadar

    

        - **Normalized:** Canonical products and retailer offers are separated (one Product has multiple Offers) to avoid storing redundant product descriptions across Amazon, Flipkart, and eBay.

        - **Denormalized:** An offer document stores `lastFetchedAt` and `lastStatus` directly to allow fast dashboard rendering without joining `PriceObservation` records.

    

    
### 15. Database Indexes (Single Field & Compound)

    

        - **Explanation:** Special data structures (B-trees) that store a small portion of the collection's data in an easy-to-traverse form. Without indexes, MongoDB must perform a collection scan (checking every document).

    

    
### 16. Compound Unique Indexes (Preventing Duplicates)

    

        - **Explanation:** An index spanning multiple fields enforcing distinct combinations:
            
```javascript
// Prevents duplicate watch items for the same user and offer
watchlistItemSchema.index({ userId: 1, offerId: 1 }, { unique: true });
```

            If violated, MongoDB throws Error code `11000`.

    

    
### 17. TTL (Time To Live) Indexes in PriceRadar

    

        - **Explanation:** In `models/OtpChallenge.js`, `expiresAt` has a TTL index:
            
```javascript
expiresAt: { type: Date, required: true, index: { expires: 0 } }
```

            MongoDB's background thread automatically removes documents once the current clock time passes `expiresAt`.

    

    
### 18. Schema Validation & `Number.isInteger` Policy

    

        - **PriceRadar Example:** Custom validator in `Offer.js`:
            
```javascript
priceInPaise: {
  type: Number,
  required: true,
  validate: { validator: Number.isInteger, message: 'Must be integer paise' }
}
```

    

    
### 19. Schema Timestamps (`{ timestamps: true }`)

    

        - **Explanation:** Instructs Mongoose to automatically create and manage `createdAt` and `updatedAt` Date fields on every save.

    

    
### 20. Sorting Query Results

    

        - **Explanation:** Sorting by date ascending (`1`) or descending (`-1`):
            
```javascript
PriceObservation.find({ offerId }).sort({ fetchedAt: -1 }).limit(30);
```

    

    
### 21. Comparison Query Operators

    

        - `$gt` (greater than), `$gte` (greater than or equal), `$lt` (less than), `$lte` (less than or equal), `$ne` (not equal), `$in` (in array).

    

    
### 22. Logical Query Operators (`$or`, `$and`)

    

        - **PriceRadar Example (Distributed Lock Acquisition):**
            
```javascript
MonitorLock.findOneAndUpdate({
  _id: 'monitoring_cycle_lock',
  $or: [{ isLocked: false }, { heartbeatAt: { $lt: staleCutoff } }]
}, ...);
```

    

    
### 23. Field Projection & `select: false`

    

        - **Explanation:** In `User.js`, `passwordHash: { type: String, select: false }` strips password hashes from standard queries, protecting credentials from accidental leakage.

    

    
### 24. Atomic Operations with `findOneAndUpdate()`

    

        - **Explanation:** Executes find, modify, and write as an atomic, indivisible operation at the database level. Prevents race conditions where two threads read the same state simultaneously.

    

    
### 25. Upsert Operations (`{ upsert: true }`)

    

        - **Explanation:** Instructs MongoDB to update the document if it exists, or insert a new document if no match is found.

    

    
### 26. Connection Pooling & `readyState`

    

        - **Explanation:** Mongoose maintains an internal pool of reusable database connections. `mongoose.connection.readyState` reflects status: `0 = disconnected`, `1 = connected`, `2 = connecting`, `3 = disconnecting`.

    

    
### 27. MongoDB Atlas Network Security

    

        - **Explanation:** Atlas enforces an IP Access List (firewall). Production hosting environments (Render) require outbound IP ranges or `0.0.0.0/0` with strong authentication to access the database.

    

    
### 28. Regular Expression Searches

    

        - **Explanation:** Case-insensitive title searching: `Product.find({ title: { $regex: q, $options: 'i' } })`.

    

    
### 29. Aggregation Pipelines

    

        - **Explanation:** Multi-stage data processing pipeline (`$match`, `$group`, `$project`, `$sort`). Used in PriceRadar's diagnostic utilities to compute cycle statistics.

    

    
### 30. Mongoose Schema Middleware (Hooks)

    

        - **Explanation:** Functions executed automatically before or after schema operations (e.g. `pre('save')`, `post('remove')`) used for automated validation or cascade deletions.

    

    
# Part 16: Git, GitHub Actions & Cloud Deployment Architecture

    

        PriceRadar is maintained in Git version control and hosted on Render with automated GitHub Actions CI/CD pipelines.
    

    
## 16.1 Git Fundamentals for Freshers

    

        - **Repository (Repo):** The central project workspace containing all code, commit history, and branches.

        - **Commit:** An immutable snapshot of changes recorded with a descriptive message and unique cryptographic SHA hash.

        - **Branch:** An independent line of development (e.g. `main` for production code, feature branches for experiments).

        - **Push / Pull:** `git push` uploads local commits to GitHub; `git pull` downloads and merges remote commits into your local branch.

        - **Pull Request (PR):** A proposed change submitted to a branch that triggers automated CI tests and code reviews before merging.

    

    
## 16.2 CI Pipeline vs. Scheduled Monitoring Workflow

    

        The repository maintains two distinct GitHub Actions workflows in `.github/workflows/`:
    

    
| Attribute | Continuous Integration (`ci.yml`) | Price Monitor (`monitor.yml`) |
| --- | --- | --- |
| Trigger Event | Pushes to `main` and Pull Requests. | Cron schedule (`0 */4 * * *`) & manual `workflow_dispatch`. |
| Purpose | Quality assurance: verifies code integrity before deployment. | Operational execution: drives the 4-hour background price refresh cycle. |
| Tasks Executed | Installs dependencies, runs linter, and executes 277 Jest test cases. | Wakes Render server, calls `POST /api/monitor/run`, polls until run finishes. |
| Target Environment | Ephemeral GitHub Ubuntu container. | Live production Render cloud backend. |
| Required Secrets | None (runs in isolated test environment). | `BACKEND_URL`, `MONITOR_TRIGGER_SECRET`. |

    
## 16.3 Production Deployment on Render

    

        PriceRadar is split into two separate cloud hosting services on Render:
    

    
### 1. Frontend: Render Static Site (`priceradar-web.onrender.com`)

    

        - **Root Directory:** `client`

        - **Build Command:** `npm install && npm run build`

        - **Publish Directory:** `dist`

        - **Environment Variable:** `VITE_API_URL=https://priceradar-api-02ib.onrender.com`

        - **Single Page Application Rewrite Rule:** Any route (`/*`) redirects to `/index.html` (HTTP 200) to allow client-side React Router navigation.

    

    
### 2. Backend: Render Web Service (`priceradar-api-02ib.onrender.com`)

    

        - **Root Directory:** `server`

        - **Runtime:** Node.js (v18+)

        - **Build Command:** `npm install`

        - **Start Command:** `npm start` (runs `node src/server.js`)

        - **Internal Port:** Defaults to `PORT=10000` or `PORT=5000`.

        - **Health Check Path:** `/api/health` (Render monitors this to verify healthy deploys).

    

    
## 16.4 Environment Variables Architecture

    

        Production secrets are configured strictly through Render's encrypted environment variables dashboard and are never committed to Git:
    

    

        - `NODE_ENV=production`

        - `PORT=10000`

        - `MONGODB_URI`: Secure connection string to MongoDB Atlas.

        - `JWT_SECRET`: 256-bit cryptographically random secret string.

        - `CLIENT_ORIGIN=https://priceradar-web.onrender.com`

        - `BREVO_API_KEY`: Enterprise transactional email token.

        - `TELEGRAM_BOT_TOKEN`: Telegram bot authorization key.

        - `MONITOR_TRIGGER_SECRET`: Shared secret authorizing cron execution.

    

    
# Part 17: End-to-End Walkthrough of a Real User Scenario

    

        To demonstrate how all pieces connect in production, here is the complete 25-step journey of a user saving ₹5,000 on an iPhone 15 using PriceRadar.
    

    
## 17.1 Complete End-to-End Visual Sequence Diagram

    
> **[Diagram: Figure 17.1: Comprehensive End-to-End Workflow Diagram]** *(See compiled PDF or HTML version for full vector illustration)*

    
## 17.2 The 25 Sequential Steps of the Real Scenario

    

        <li>User navigates to `https://priceradar-web.onrender.com/register`.

        - User fills in Name (*"Ananya Sharma"*), Email (*"ananya@gmail.com"*), and Password.

        - Backend receives `POST /api/auth/register/initiate`, generates 6-digit OTP `829143`, hashes password with bcrypt, and stores in `OtpChallenge`.

        - Brevo dispatches verification email to Ananya's inbox.

        - Ananya inputs `829143` on Step 2. Backend validates OTP, inserts User record in MongoDB, issues a 7-day JWT token, and redirects to Dashboard.

        - Ananya types *"Apple iPhone 15"* into the Search bar.

        - Axios calls `GET /api/products/search?q=Apple%20iPhone%2015`.

        - Backend performs case-insensitive regex search in `products` collection and queries linked `offers`.

        - React renders the search grid showing the lowest price: *"From ₹46,999 on Flipkart"*.

        - Ananya clicks the product card, opening `/products/66a01...`.

        - React loads product details and renders the side-by-side comparison table:
            

                <li>Amazon: ₹48,999 (In Stock)

                - Flipkart: ₹46,999 (In Stock)

            

        </li>
        - Ananya clicks "Watch" on the Flipkart listing. Axios posts to `/api/watchlist`, persisting the bookmark.

        - Ananya clicks "Create Price Alert", chooses **Target Price**, inputs ₹45,000, checks Email and Telegram checkboxes, and clicks "Save Alert".

        - Frontend converts ₹45,000 to integer paise (`4500000`) and posts to `/api/alerts`. Mongoose persists the active, armed alert document.

        - At 04:00 UTC (09:30 AM IST), GitHub Actions scheduled runner executes `monitor.yml`.

        - GitHub Actions pings `GET /api/health`. The sleeping Render container wakes up and responds HTTP 200 within 12 seconds.

        - GitHub Actions sends `POST /api/monitor/run` with the `X-Monitor-Secret` header.

        - Express acquires the distributed `MonitorLock` in MongoDB and returns HTTP 202 Accepted with `runId: "66run..."`.

        - Price monitor retrieves all active alerts, identifies the unique Flipkart iPhone 15 offer ID, and dispatches the fetch to Apify Cloud Actor.

        - Apify scrapes Flipkart: Flipkart has launched a flash deal dropping the price to **₹44,499** (`4449900` paise).

        - Express creates a new `PriceObservation` document and updates the `Offer` record.

        - The alert evaluator evaluates Ananya's alert: `4449900 <= 4500000` is **TRUE**. Since `alert.armed === true`, the alert triggers!

        - The alert dispatcher calls Brevo API (sending an email with direct Flipkart link) and Telegram Bot API (delivering mobile push notification).

        - Express records a `NotificationEvent` document with `dedupeKey: "66a99:4449900"` and disarms the alert (`armed = false`).

        - Ananya receives the Telegram ping on her smartphone, clicks the link, and purchases the iPhone 15 at ₹44,499—saving ₹5,500!

    

    
# Part 18: Complete Technical Interview Q&A (86 Questions)

    

        This section is divided into three comprehensive tiers: General MERN Stack Questions, Project-Specific Deep Dives, and Difficult Architectural Scenario Questions.
    

    
## Section 1: General MERN Stack Questions (20 Questions)

    
### Q1: Explain the complete MERN stack architecture.

    
**Short Interview Answer:** MERN is a JavaScript full-stack software architecture consisting of MongoDB (document database), Express.js (web application framework), React (frontend library), and Node.js (JavaScript runtime environment).

    
**Detailed Explanation:** React executes in the browser, rendering user interfaces and dispatching asynchronous HTTP requests. Node.js with Express acts as the backend server, processing API routes, executing business logic, and querying MongoDB via Mongoose. Data flows across all four layers as native JavaScript objects and JSON, eliminating data-format impedance mismatches.

    
### Q2: What is the difference between JavaScript and Node.js?

    
**Short Answer:** JavaScript is a programming language. Node.js is an external runtime environment that allows JavaScript to run on servers.

    
**Detailed Explanation:** In browsers, JavaScript has access to DOM APIs (`window`, `document`) but lacks filesystem or operating system access. Node.js bundles Chrome's V8 engine with the C++ libuv library, granting JavaScript access to server sockets, HTTP servers, filesystems, and operating system threads.

    
### Q3: What is the difference between `let`, `const`, and `var`?

    
**Short Answer:** `var` is function-scoped and hoisted. `let` and `const` are block-scoped; `let` allows variable reassignment, while `const` prevents reassignment.

    
### Q4: Explain closures with an example.

    
**Short Answer:** A closure is an inner function that retains access to variables in its outer lexical scope even after the outer function has finished executing.

    
**PriceRadar Example:** In `server/src/utils/asyncHandler.js`, the returned handler function retains closure access to the passed `fn` controller parameter, allowing it to catch thrown exceptions across routes.

    
### Q5: Explain Promises and `async/await`.

    
**Short Answer:** A Promise represents the eventual asynchronous completion or failure of an operation. `async/await` is modern syntactic sugar on top of Promises that allows asynchronous code to be read sequentially using standard `try/catch` blocks.

    
### Q6: What is the difference between `map`, `filter`, and `reduce`?

    
**Short Answer:** `map` transforms each element and returns a new array of the same length; `filter` selects elements that pass a test and returns a smaller array; `reduce` aggregates an array into a single accumulated value.

    
### Q7: Explain props and state in React.

    
**Short Answer:** `props` are immutable configuration inputs passed from parent to child components. `state` is mutable local memory managed within a component that triggers re-rendering when updated.

    
### Q8: What is the difference between `useState` and `useEffect`?

    
**Short Answer:** `useState` declares state variables to store data. `useEffect` executes side effects (such as data fetching or subscriptions) after the component renders.

    
### Q9: Explain controlled components.

    
**Short Answer:** A form input whose displayed value is bound directly to React state and whose updates are handled exclusively via state setters (e.g. `onChange`).

    
### Q10: How does React communicate with Express?

    
**Short Answer:** Over HTTP/HTTPS using JSON payloads via the Axios client library (or Fetch API), hitting RESTful endpoints exposed by Express.

    
### Q11: What is middleware in Express?

    
**Short Answer:** Functions in the request-response pipeline that have access to `req`, `res`, and `next` to parse bodies, authenticate tokens, validate inputs, or catch errors.

    
### Q12: Explain REST API methods.

    
**Short Answer:** Standard HTTP verbs: GET (read), POST (create/action), PUT (replace), PATCH (partial update), and DELETE (remove).

    
### Q13: What is JWT authentication?

    
**Short Answer:** JSON Web Token is a compact, URL-safe means of representing claims securely between two parties. The server digitally signs a payload with a secret key, enabling stateless authentication without database session lookups.

    
### Q14: What is bcrypt?

    
**Short Answer:** An adaptive password hashing function based on the Blowfish cipher incorporating automatic salts and cost factors to protect against rainbow table and brute-force attacks.

    
### Q15: What is Mongoose?

    
**Short Answer:** An Object Data Modeling (ODM) library for MongoDB and Node.js that provides schema validation, type casting, query building, and business logic hooks.

    
### Q16: Explain MongoDB aggregation.

    
**Short Answer:** A multi-stage processing pipeline (`$match`, `$group`, `$project`, `$sort`) used to transform and compute aggregate metrics over collections.

    
### Q17: How do you implement CRUD in MERN?

    
**Short Answer:** Define a Mongoose schema, create Express routes using HTTP verbs (POST, GET, PATCH, DELETE), execute Mongoose methods (`create`, `find`, `findByIdAndUpdate`, `deleteOne`), and call the endpoints from React using Axios.

    
### Q18: How do you implement pagination?

    
**Short Answer:** In Express/Mongoose, using `.skip((page - 1) * limit).limit(limit)`. The frontend passes `?page=2&limit=10` query parameters.

    
### Q19: How do you handle errors across the MERN stack?

    
**Short Answer:** In React: using `<ErrorBoundary>` and Axios `catch` blocks. In Express: using an `asyncHandler` wrapper and a centralized 4-parameter error middleware (`err, req, res, next`). In MongoDB: handling duplicate key (code 11000) and validation exceptions.

    
### Q20: Explain your project from frontend to database.

    
**Short Answer:** React 18 renders responsive UI screens. User actions trigger Axios requests with JWT headers. Express matches routes, validates inputs with `express-validator`, and authenticates tokens. Controllers call business services and Mongoose models, which query MongoDB Atlas using compound indexes and integer-paise precision.

    
## Section 2: Project-Specific Interview Questions (50 Questions)

    
### Q21: Explain your PriceRadar project.

    
**Answer:** PriceRadar is an automated multi-retailer price tracking and comparison platform. It continuously monitors product pricing across Amazon, Flipkart, eBay, and testbeds every four hours, evaluates user-defined target-price drops, and delivers instant notifications via Brevo Email and Telegram Bot.

    
### Q22: Why did you choose this project?

    
**Answer:** E-commerce platforms use dynamic algorithmic pricing that changes multiple times a day. Consumers suffer from manual checking fatigue and deceptive strike-through discounts. PriceRadar provides an automated, objective solution with historical price transparency.

    
### Q23: What problem does PriceRadar solve?

    
**Answer:** It solves fragmented store browsing, missed discounts, artificial price inflation, and alert notification spam.

    
### Q24: What is the complete system architecture?

    
**Answer:** Decoupled multi-tier architecture: React 18 frontend on Render Static Sites, Express REST backend on Render Web Services, MongoDB Atlas cloud database, Python FastAPI extraction worker, and GitHub Actions cron runner.

    
### Q25: Why did you choose the MERN stack for PriceRadar?

    
**Answer:** React enables instant UI updates for watchlists and search results. Node and Express handle high-concurrency non-blocking I/O across retailer APIs. MongoDB provides schema flexibility for varying retailer listing attributes.

    
### Q26: Explain your frontend structure.

    
**Answer:** Structured under `client/src/` into `components/` (reusable UI), `pages/` (route views), `context/` (AuthContext), `services/` (Axios API client), and `styles/` (Forest Green theme CSS).

    
### Q27: Explain your backend structure.

    
**Answer:** Layered architecture under `server/src/`: `routes/` (HTTP paths), `middleware/` (guards), `controllers/` (HTTP handlers), `services/` (business intelligence), `models/` (Mongoose schemas), and `providers/` (retailer adapters).

    
### Q28: Why did you separate routes, controllers, and services?

    
**Answer:** To enforce the Single Responsibility Principle. Routes handle URL mapping, controllers handle HTTP serialization, and services house core business logic (e.g. price monitoring), allowing services to be invoked by cron jobs and CLI scripts without mocking HTTP requests.

    
### Q29: How does a frontend API request reach MongoDB?

    
**Answer:** Component → Axios `api.js` → HTTP Request → Express Route → Middleware (auth/validation) → Controller → Service → Mongoose Model → MongoDB Atlas.

    
### Q30: What happens when a user registers?

    
**Answer:** The frontend initiates registration. Express hashes the password with bcrypt, generates a 6-digit OTP, saves it in `OtpChallenge` with a 10-minute TTL, and sends an email via Brevo. When the user enters the OTP, the server verifies it, inserts the User into MongoDB, and issues a 7-day JWT.

    
### Q31: How does OTP verification work?

    
**Answer:** The entered 6-digit OTP is hashed with SHA-256 and compared against `OtpChallenge.otpHash`. A counter limits attempts to 5, preventing brute-force attacks.

    
### Q32: How is the password stored securely?

    
**Answer:** Passwords are never stored in plaintext. They are hashed using `bcryptjs` with 10 salt rounds. Furthermore, `User.passwordHash` specifies `select: false` in Mongoose to prevent accidental query exposure.

    
### Q33: How does login work?

    
**Answer:** The user submits email and password. The backend queries `User.findOne({ email }).select('+passwordHash')`, verifies credentials via `bcrypt.compare()`, and signs a JWT containing the user ID and role.

    
### Q34: How is JWT generated?

    
**Answer:** Using `jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })`.

    
### Q35: How is JWT verified on protected routes?

    
**Answer:** The `requireAuth` middleware extracts the Bearer token from the `Authorization` header and runs `jwt.verify(token, secret)`, populating `req.user`.

    
### Q36: What happens when a token expires?

    
**Answer:** `jwt.verify()` throws a `TokenExpiredError`. Express returns HTTP 401. Axios captures this, and React clears `localStorage` and redirects the user to `/login`.

    
### Q37: How are protected routes implemented on the frontend?

    
**Answer:** Using `<ProtectedRoute>` in `client/src/components/ProtectedRoute.jsx`, which wraps protected pages and navigates unauthenticated visitors to `/login`.

    
### Q38: How do you store product information?

    
**Answer:** Split into two normalized models: `Product` stores canonical identity (brand, model, category, canonicalKey), while `Offer` stores retailer-specific listings (store, URL, price, stock status).

    
### Q39: What is the relationship between Product and Offer?

    
**Answer:** One-to-Many. One physical product (e.g. iPhone 15 128GB) links to multiple retailer offers (one on Amazon, one on Flipkart, one on eBay).

    
### Q40: How does product comparison work?

    
**Answer:** When viewing a product, the backend retrieves all linked `Offer` documents, sorts them by `priceInPaise` ascending, and highlights the lowest deal with store badges.

    
### Q41: What is the provider architecture?

    
**Answer:** A polymorphic adapter pattern in `server/src/providers/` that abstracts external scraping libraries and APIs behind a uniform interface: `fetchOffer(offer)`.

    
### Q42: Why create a separate provider dispatcher?

    
**Answer:** It decouples the core monitoring engine from external scraper implementations, allowing new stores to be added without touching the monitoring service.

    
### Q43: How do you handle provider failures?

    
**Answer:** The provider returns `{ success: false, errorMessage: "..." }`. The monitor logs a failed `PriceObservation`, skips that single listing, and continues processing remaining offers without crashing.

    
### Q44: How does the watchlist work?

    
**Answer:** Persisted in `WatchlistItem` mapping `userId` to `offerId` with a compound unique index preventing duplicate entries.

    
### Q45: How are alerts stored?

    
**Answer:** In the `Alert` collection, referencing `userId` and `offerId`, with `type`, `targetPriceInPaise`, `dropAmountInPaise`, `channels`, `armed`, and `status`.

    
### Q46: What is the difference between target-price and fixed-drop alerts?

    
**Answer:** Target-price alerts trigger when the absolute price drops to or below a fixed ceiling (e.g. ≤ ₹45,000). Fixed-drop alerts trigger when the price drops by a relative threshold from the creation baseline (e.g. drop ≥ ₹2,000).

    
### Q47: How does automatic price monitoring work?

    
**Answer:** GitHub Actions triggers the backend every 4 hours via cron. The backend acquires a distributed lock, fetches distinct offers once, records price observations, evaluates active alerts, and dispatches email/Telegram alerts.

    
### Q48: Why use GitHub Actions for monitoring?

    
**Answer:** Free-tier cloud containers (Render) spin down after 15 minutes of inactivity, terminating internal timers. GitHub Actions acts as an external chronometer that wakes and triggers the sleeping server.

    
### Q49: Explain your cron expression.

    
**Answer:** `0 */4 * * *`: runs at minute 0 of every 4th hour (00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC), corresponding to 05:30, 09:30, 13:30, 17:30, 21:30, and 01:30 IST.

    
### Q50: How does GitHub Actions communicate with the backend?

    
**Answer:** It sends a pre-flight wakeup ping to `GET /api/health`, then an authorized HTTP `POST /api/monitor/run` with the `X-Monitor-Secret` header, receiving HTTP 202.

    
### Q51: What is the purpose of MONITOR_TRIGGER_SECRET?

    
**Answer:** A shared cryptographic secret that prevents unauthorized third parties on the internet from abusing the price refresh endpoint and overloading external retailer APIs.

    
### Q52: What happens when the Render backend is sleeping?

    
**Answer:** The pre-flight probe in GitHub Actions uses curl with `--retry 6 --retry-delay 5` to wake the container over 30 to 45 seconds before the trigger request departs.

    
### Q53: How do you prevent two monitoring cycles from running simultaneously?

    
**Answer:** Using a dual-locking architecture: an in-memory boolean mutex for local fast-path, and an atomic MongoDB `MonitorLock` distributed lease with heartbeats for cluster-wide safety.

    
### Q54: What is a distributed lock?

    
**Answer:** A mutual exclusion synchronization mechanism across multiple distributed server instances backed by a shared datastore (MongoDB) ensuring only one instance accesses a critical section at a time.

    
### Q55: Why do you store MonitorRun?

    
**Answer:** To maintain an immutable audit trail of cycle metrics: start time, duration, offers checked, success/failure counts, and triggered alerts.

    
### Q56: What is a PriceObservation?

    
**Answer:** An immutable, time-stamped record of a price fetch attempt that forms historical price graphs and audit records.

    
### Q57: How do you compare previous and current prices?

    
**Answer:** By querying the most recent prior `PriceObservation` for an offer: `PriceObservation.find({ offerId }).sort({ fetchedAt: -1 })`.

    
### Q58: How do you prevent duplicate notifications?

    
**Answer:** Using the `armed` flag (alerts disarm after firing) and a unique compound index on `NotificationEvent.dedupeKey`.

    
### Q59: How does alert re-arming work?

    
**Answer:** If an alert is disarmed and the product price rises back above the target threshold, the evaluator automatically resets `armed = true`.

    
### Q60: How are email notifications sent?

    
**Answer:** Using the Brevo Transactional Email REST API over HTTPS, bypassing cloud port-25 SMTP blocks.

    
### Q61: How are Telegram notifications sent?

    
**Answer:** Using HTTPS POST to the official Telegram Bot API (`/sendMessage`) delivering instant mobile push alerts.

    
### Q62: What happens if notification delivery fails?

    
**Answer:** The error is logged in `NotificationEvent.status = 'failed'`. The alert remains active for the next monitoring pass.

    
### Q63: What happens if a provider cannot fetch the price?

    
**Answer:** The offer is marked `lastStatus = 'error'`, a failed `PriceObservation` is recorded, and the cycle proceeds without halting.

    
### Q64: Why store prices as integers in paise?

    
**Answer:** To eliminate IEEE 754 binary floating-point rounding errors (e.g. `0.1 + 0.2 !== 0.3`) in financial comparisons.

    
### Q65: What is the role of the Python worker?

    
**Answer:** An isolated microservice on `127.0.0.1:8000` that offloads heavy HTML parsing and enforces SSRF domain allowlists.

    
### Q66: How do you validate external URLs in the worker?

    
**Answer:** By verifying protocol (http/https), enforcing an authorized domain allowlist, and checking final landing URLs after HTTP redirects.

    
### Q67: How do you protect user data?

    
**Answer:** Through JWT authentication, bcrypt password hashing, `select: false` on password fields, and strict user-scoped database queries.

    
### Q68: How do you test your backend?

    
**Answer:** Using Jest and Supertest across 26 test suites comprising 277 automated unit and integration tests.

    
### Q69: What are the main limitations of the project?

    
**Answer:** In-process background tasks lack durable queue re-delivery across unexpected server crashes, and direct Amazon/Flipkart scraping relies on Apify cloud actors rather than direct API partnerships.

    
### Q70: What would you improve in the next version?

    
**Answer:** Replace in-process execution with a durable Redis/BullMQ job queue, introduce WebSockets for real-time dashboard updates, and add SMS notifications.

    
## Section 3: Difficult Architectural & Scenario Questions (16 Questions)

    
### Q71: Why not use `setInterval` in the React frontend for price monitoring?

    
**Answer:** A frontend timer only runs while a user has PriceRadar open in an active browser tab. If the user closes their laptop or goes to sleep, monitoring stops completely. Price monitoring must execute server-side 24/7 to catch midnight discounts.

    
### Q72: Why use GitHub Actions instead of a browser timer?

    
**Answer:** GitHub Actions provides an external, enterprise-grade cloud scheduler that runs independently of client devices and wakes sleeping serverless containers.

    
### Q73: Why store price observations instead of only updating the current price on Offer?

    
**Answer:** Simply overwriting the price destroys historical context. Storing immutable `PriceObservation` records enables historical price charts and allows users to distinguish genuine sales from artificial discounts.

    
### Q74: Why fetch a shared offer once for multiple alerts?

    
**Answer:** If 1,000 users track the same iPhone, fetching it 1,000 times wastes server bandwidth and risks IP bans. Grouping by distinct `offerId` reduces external traffic by 99.9%.

    
### Q75: What happens if a monitoring process crashes mid-execution?

    
**Answer:** The server terminates, leaving the lock in place. During the next cycle, the system inspects `heartbeatAt`. If older than 15 minutes, it breaks the stale lease, reconciles the crashed run as `interrupted`, and executes cleanly.

    
### Q76: Why use both an in-memory mutex and a MongoDB lock?

    
**Answer:** Defense-in-depth: the in-memory boolean provides zero-latency synchronous rejection within the same process, while the MongoDB lock coordinates across multiple distributed server instances.

    
### Q77: What happens if the backend restarts during a monitoring cycle?

    
**Answer:** In-process promises are aborted. Render spins up a fresh container. The next scheduled trigger reconciles the stale run and restarts price checks.

    
### Q78: Why use HTTP 202 Accepted instead of waiting for the full monitoring result?

    
**Answer:** Monitoring takes 30 to 90 seconds. Holding an HTTP socket open that long risks proxy timeouts (HTTP 504) and client blocking. Returning 202 Accepted immediately decouples triggering from execution.

    
### Q79: How does the system know which provider to use?

    
**Answer:** The `Offer.provider` enum field identifies the adapter (e.g. `'ebay'`, `'apify'`, `'scrapling'`). The provider dispatcher reads this field and invokes the matching module.

    
### Q80: How do you know whether a price is sample or live?

    
**Answer:** Every product and offer stores `dataStatus` ('sample', 'live', 'cached', 'unavailable') and `isSample: boolean`. The UI renders clear green "Live Deal" or yellow "Sample Catalog" badges accordingly.

    
### Q81: What happens if one notification channel succeeds and another fails?

    
**Answer:** The system logs individual statuses in `NotificationEvent`: Email as `sent` and Telegram as `failed`. Successful deliveries are never rolled back.

    
### Q82: What happens when the price goes below the target and later rises again?

    
**Answer:** When low, the alert notifies and disarms (`armed = false`). When it rises above target, the evaluator re-arms it (`armed = true`), ensuring the user is notified again if it drops in the future.

    
### Q83: How would you scale monitoring if there were 100,000 alerts?

    
**Answer:** Migrate from in-process background promises to a distributed queue like Redis with BullMQ, fanning out offer fetches across worker pools with rate-limiting queues per retailer.

    
### Q84: Would a message queue improve the system?

    
**Answer:** Yes. A message queue (BullMQ/RabbitMQ) would provide durable task persistence, automatic retry backoffs, and horizontal worker auto-scaling across process restarts.

    
### Q85: How would you improve security further in production?

    
**Answer:** Implement refresh token rotation in HttpOnly cookies, add multi-factor authentication (TOTP via Google Authenticator), and introduce Redis-backed distributed rate limiting.

    
### Q86: How would you make the monitoring system more reliable against anti-bot blocking?

    
**Answer:** Route scraper traffic through residential rotating proxy networks, integrate official affiliate APIs (Amazon PA-API, Flipkart Affiliate API), and implement headless browser fingerprint randomized rotation.

    
# Part 19: Core Architectural Comparison Tables (20 Tables)

    

        These 20 comparison tables distill essential software engineering concepts into clear, memorable distinctions for technical interviews.
    

    <!-- Table 1 -->
    
### 1. JavaScript vs. Node.js

    
| Attribute | JavaScript | Node.js |
| --- | --- | --- |
| Nature | High-level programming language conforming to ECMAScript. | Asynchronous runtime environment built on V8 and libuv. |
| Execution | Executes primarily in web browsers (Client). | Executes on servers and developer machines (Server/CLI). |
| APIs | DOM, Fetch, localStorage, Geolocation. | fs, http, path, crypto, child_process, os. |

    <!-- Table 2 -->
    
### 2. React vs. Express.js

    
| Attribute | React (Frontend) | Express.js (Backend) |
| --- | --- | --- |
| Role | Builds reactive user interfaces via Virtual DOM. | Builds REST API web servers and routing middleware. |
| Execution | Runs in client browser. | Runs on Node.js server. |
| Output | HTML DOM elements and interactive UI components. | HTTP status codes, headers, and JSON envelopes. |

    <!-- Table 3 -->
    
### 3. Frontend vs. Backend

    
| Attribute | Frontend (Client Tier) | Backend (Server & Data Tier) |
| --- | --- | --- |
| Focus | User experience, visual rendering, form state, input validation. | Business logic, data persistence, authentication, API security. |
| Exposure | Code is publicly visible in browser DevTools. | Source code and database credentials remain secret. |
| Tech | React, Vite, Bootstrap, HTML5, CSS3. | Node.js, Express, MongoDB, Mongoose, Python. |

    <!-- Table 4 -->
    
### 4. SQL vs. NoSQL

    
| Attribute | SQL (Relational Databases) | NoSQL (Document Databases) |
| --- | --- | --- |
| Schema | Rigid, tabular schemas pre-defined with DDL. | Flexible JSON-like BSON documents with dynamic fields. |
| Scaling | Vertical scaling (larger CPU/RAM servers). | Horizontal scaling (sharding across clusters). |
| Relations | Foreign keys and complex table joins. | Embedded subdocuments or lightweight document references. |

    <!-- Table 5 -->
    
### 5. MongoDB vs. Mongoose

    
| Attribute | MongoDB | Mongoose |
| --- | --- | --- |
| What it is | The underlying database engine. | Object Data Modeling (ODM) library for Node.js. |
| Validation | Schemaless by default. | Enforces strict schema models, types, and validators. |
| Hooks | Requires database triggers. | Provides built-in lifecycle middleware (pre/post save). |

    <!-- Table 6 -->
    
### 6. Authentication vs. Authorization

    
| Attribute | Authentication (AuthN) | Authorization (AuthZ) |
| --- | --- | --- |
| Definition | Verifying who a user is. | Verifying what a user is allowed to do. |
| Mechanism | Passwords, email OTPs, JWT signatures. | User roles (e.g. `role: 'admin'`), ownership checks. |
| PriceRadar | `requireAuth` verifies JWT token. | Checking that an alert belongs to `req.user.id` before editing. |

    <!-- Table 7 -->
    
### 7. Hashing vs. Encryption

    
| Attribute | Hashing | Encryption |
| --- | --- | --- |
| Reversibility | One-way mathematical function (irreversible). | Two-way cipher (reversible with secret key). |
| Purpose | Password security and data integrity verification. | Protecting confidential data in transit or at rest. |
| PriceRadar | `bcrypt.hash(password, 10)`. | HTTPS/TLS encrypts network traffic to Render. |

    <!-- Table 8 -->
    
### 8. JWT vs. Session-Based Authentication

    
| Attribute | JWT (Stateless) | Session Cookies (Stateful) |
| --- | --- | --- |
| Storage | Client stores token; server stores 0 state. | Server stores active session IDs in Redis/database. |
| Scalability | Instant horizontal scaling across microservices. | Requires shared session cache or sticky load balancers. |
| Revocation | Harder to revoke before expiration. | Instant revocation by deleting server session. |

    <!-- Table 9 -->
    
### 9. GET vs. POST

    
| Attribute | GET Method | POST Method |
| --- | --- | --- |
| Idempotency | Idempotent and safe (no server mutations). | Non-idempotent (creates resources or triggers actions). |
| Payload | Parameters passed in URL query string. | Payload passed in HTTP request body. |
| PriceRadar | `GET /api/products/search` | `POST /api/alerts` |

    <!-- Table 10 -->
    
### 10. PUT vs. PATCH

    
| Attribute | PUT Method | PATCH Method |
| --- | --- | --- |
| Scope | Replaces the entire resource document. | Applies partial updates to specific fields. |
| Payload | Must provide all mandatory resource fields. | Provides only the fields being modified. |
| PriceRadar | `PUT /api/notification-preferences` | `PATCH /api/alerts/:id` (e.g. toggle status) |

    <!-- Table 11 -->
    
### 11. Synchronous vs. Asynchronous Execution

    
| Attribute | Synchronous | Asynchronous |
| --- | --- | --- |
| Blocking | Blocks execution thread until instruction finishes. | Offloads long tasks; notifies via event loop callback. |
| Performance | Poor for I/O and network operations. | High throughput and concurrency on single thread. |

    <!-- Table 12 -->
    
### 12. Promise vs. `async/await`

    
| Attribute | Promise | async / await |
| --- | --- | --- |
| Syntax | Chained `.then()` and `.catch()` callbacks. | Sequential statements with standard `try/catch`. |
| Readability | Can lead to promise chaining clutter. | Clean, linear control flow identical to synchronous code. |

    <!-- Table 13 -->
    
### 13. Props vs. State in React

    
| Attribute | Props | State |
| --- | --- | --- |
| Ownership | Passed down from parent component (external). | Declared and managed inside the component (internal). |
| Mutability | Immutable read-only values. | Mutable via state setter functions (`setCount`). |

    <!-- Table 14 -->
    
### 14. `useState` vs. `useEffect`

    
| Attribute | useState | useEffect |
| --- | --- | --- |
| Purpose | Stores reactive data within component memory. | Executes side effects (API calls, timers) after render. |
| Trigger | Updating state triggers a re-render. | Executes on mount or when dependencies change. |

    <!-- Table 15 -->
    
### 15. Array `map` vs. `filter` vs. `reduce`

    
| Method | Input Array Length | Output Structure | PriceRadar Use Case |
| --- | --- | --- | --- |
| map | $N$ elements | New array of exactly $N$ items | Extracting prices from offers array. |
| filter | $N$ elements | New array of $\le N$ items | Filtering offers that are in stock. |
| reduce | $N$ elements | Single accumulated value | Finding lowest price across retailers. |

    <!-- Table 16 -->
    
### 16. Route vs. Controller

    
| Layer | Primary Responsibility | PriceRadar File |
| --- | --- | --- |
| Route | Binds HTTP verb & URL path to middleware. | `server/src/routes/alerts.js` |
| Controller | Unpacks HTTP inputs and sends JSON responses. | `server/src/controllers/alertsController.js` |

    <!-- Table 17 -->
    
### 17. Controller vs. Service

    
| Layer | Primary Responsibility | PriceRadar File |
| --- | --- | --- |
| Controller | HTTP transport, status codes, JSON serialization. | `controllers/monitorController.js` |
| Service | Pure business logic, price math, lock coordination. | `services/priceMonitor.js` |

    <!-- Table 18 -->
    
### 18. Service vs. Model

    
| Layer | Primary Responsibility | PriceRadar File |
| --- | --- | --- |
| Service | Business workflows spanning multiple collections. | `services/alertEvaluator.js` |
| Model | Collection schema, types, indexes, and validation. | `models/Alert.js` |

    <!-- Table 19 -->
    
### 19. Sample Data vs. Live Data in PriceRadar

    
| Dimension | Sample / Fixture Data | Live Data |
| --- | --- | --- |
| Origin | Local JSON fixtures (`fixtureData.json`). | Real-time external API (Apify, eBay). |
| UI Badge | Yellow `Sample Catalog` badge. | Green `Live Deal` badge. |
| Offline | Works 100% offline without internet. | Requires external credentials and connectivity. |

    <!-- Table 20 -->
    
### 20. In-Memory Mutex vs. Distributed Mutex Lock

    
| Dimension | In-Memory Mutex (Boolean) | Distributed Mutex (MongoDB) |
| --- | --- | --- |
| Scope | Single Node.js process only. | Cluster-wide across multiple cloud instances. |
| Latency | 0 milliseconds (instant synchronous check). | ~5 to 15 milliseconds (database roundtrip). |
| Crash Recovery | Resets on process restart. | Recovers stale locks via heartbeat leases. |

    
# Part 20: Project Limitations & Future Engineering Roadmap

    

        Being completely transparent about system boundaries and having a concrete roadmap for v2 demonstrates senior engineering maturity in technical interviews.
    

    
## 20.1 Summary of Implemented Core Capabilities

    

        - **Full-Stack MERN Architecture:** Complete separation between React SPA, Express REST API, and MongoDB Atlas datastore.

        - **Financial Precision Policy:** 100% integer-paise calculations across database models and price drop logic.

        - **Multi-Channel Notifications:** Real-time Brevo transactional email and Telegram Bot API messaging.

        - **4-Hour Automated Cron:** External GitHub Actions orchestration waking sleeping Render cloud containers.

        - **Concurrency Protection:** Dual-layer locking (in-memory mutex + MongoDB atomic distributed lease) with stale run reconciliation.

        - **Four-Step OTP Flows:** SHA-256 hashed 6-digit codes with native MongoDB TTL auto-cleanup indexes.

        - **Multi-Retailer Ingestion:** Decoupled provider dispatcher integrating Apify, eBay Browse API, DummyJSON, Mockshop, and local Python extraction.

        - **Automated Quality Guardrails:** 26 test suites and 277 unit/integration tests passing in CI.

    

    
## 20.2 Current Technical Limitations (Honest Interview Disclosures)

    

        - **In-Process Background Execution Durability:**<br>
            *Limitation:* When `POST /api/monitor/run` returns HTTP 202 Accepted, the monitoring loop executes in-process within the running Node.js container. If the cloud platform restarts the container mid-execution, active promises are terminated immediately.<br>
            *Mitigation:* The persistent `MonitorLock` lease timeout (15 min) reconciles the crashed run during the next scheduled cycle, but price checks for that cycle are skipped rather than resumed.

        - **Cloud Cold Starts on Free Tiers:**<br>
            *Limitation:* Render free-tier containers spin down after 15 minutes of inactivity, requiring 30 to 45 seconds to wake up on the first request.<br>
            *Mitigation:* Our GitHub Actions workflow executes an automated pre-flight curl probe with 6 bounded retries before dispatching the monitor trigger.

        - **Anti-Bot Evasion on Direct Scrapers:**<br>
            *Limitation:* Modern e-commerce sites (Amazon, Flipkart) deploy sophisticated bot detection (Cloudflare, Akamai) that block raw HTTP scrapers.<br>
            *Mitigation:* PriceRadar relies on Apify Cloud Actors (which manage browser fingerprinting and proxy rotation) rather than fragile local scrapers.

        - **Keyword-Based Product Matching:**<br>
            *Limitation:* Canonical product linking relies on title keywords and `canonicalKey` rather than universal barcodes (GTIN/UPC), occasionally requiring manual curation for obscure product variants.

    

    
## 20.3 Future Engineering Roadmap (PriceRadar v2)

    
| Improvement Proposal | Proposed Architecture | Engineering Benefit |
| --- | --- | --- |
| Durable Message Queue (BullMQ + Redis) | Replace in-process promises with Redis-backed BullMQ job queues. Separate worker nodes consume jobs from the queue. | Provides crash-resilient job persistence, automatic exponential retry backoffs, and horizontal worker auto-scaling. |
| Real-Time WebSockets (Socket.io) | Establish persistent bi-directional WebSocket connections between React frontend and Express server. | Live price updates flash directly on open search pages without requiring user manual refreshes. |
| Official Affiliate API Integration | Integrate Amazon Product Advertising API (PA-API 5.0) and Flipkart Affiliate API credentials. | Zero anti-bot blocking, guaranteed uptime, and affiliate revenue generation for operating costs. |
| Universal Barcode Catalog (UPC / EAN) | Add unique `gtin` / `upc` fields to `Product` schema with compound lookup indexes. | 100% deterministic, automated cross-store catalog matching without title keyword ambiguity. |
| Cross-Platform Mobile App (React Native) | Port existing React component logic into React Native for iOS and Android. | Native push notifications via Firebase Cloud Messaging (FCM) and Apple Push Notification service (APNs). |
| Multi-Factor Authentication (TOTP) | Add Time-based One-Time Password support (Google Authenticator / Authy) using `speakeasy`. | Enterprise-grade account security protecting user notification settings and saved watchlists. |

    
# Part 21: Final Mock Interview & Last-Minute Revision

    

        This final chapter simulates a comprehensive multi-round technical interview. Questions are presented first so you can test your knowledge, followed by an exhaustive Answer Key, elevator pitches, and a high-yield revision cheat sheet.
    

    
## 21.1 The 9-Round Mock Interview Question Sheet

    
### Round 1: Project Introduction & Value Proposition

    

        - What is PriceRadar, who uses it, and what exact problem does it solve?

        - Why did you build PriceRadar instead of just bookmarking e-commerce websites?

        - What makes PriceRadar different from a simple web scraper script?

    

    
### Round 2: Architecture & Engineering Strategy

    

        - Can you walk me through the high-level architecture of your project?

        - Why did you choose the MERN stack rather than Next.js or Python Django?

        - What is the difference between a Controller and a Service in your backend?

        - How does your React frontend communicate with your Express backend?

    

    
### Round 3: Frontend & React 18

    

        - How does React start up in your project and how is client routing configured?

        - Explain how you implemented route guarding with `<ProtectedRoute>`.

        - Which React hooks did you use and why did you use `useMemo` and `useRef`?

        - How does your application prevent prop drilling when sharing user authentication state?

    

    
### Round 4: Backend & REST APIs

    

        - Explain the life of a request when a user creates a new price alert.

        - What is the difference between `req.body`, `req.params`, and `req.query`?

        - Why does your monitoring route return HTTP 202 Accepted instead of HTTP 200 OK?

        - How do you handle asynchronous errors in Express without crashing the server?

    

    
### Round 5: Database & Mongoose Modeling

    

        - What is the relationship between the Product model and the Offer model?

        - Why do you store all prices as integers in paise instead of floating-point rupees?

        - What is a compound unique index and where is it used in PriceRadar?

        - How does MongoDB's TTL index work and how is it used in your OTP system?

    

    
### Round 6: Authentication & Security

    

        - How is user password security handled in PriceRadar?

        - Can you explain how JSON Web Tokens work and what their limitations are?

        - How does your 4-step password reset flow prevent token reuse or replay attacks?

        - What is Server-Side Request Forgery (SSRF) and how does your Python worker prevent it?

    

    
### Round 7: GitHub Actions & Automation

    

        - How does your project automatically refresh prices every four hours?

        - Why did you use GitHub Actions instead of an internal `setInterval` timer?

        - What happens if the cloud backend is sleeping when GitHub Actions fires?

    

    
### Round 8: Monitoring, Locking & Notifications

    

        - Why do you fetch each unique offer only once even if 500 users have alerts on it?

        - How do you prevent two monitoring cycles from running at the exact same time?

        - How does PriceRadar ensure users do not receive duplicate emails every 4 hours?

    

    
### Round 9: Difficult Scenarios & Concurrency

    

        - What happens if the backend server crashes or restarts in the middle of a monitoring cycle?

    

    
## 21.2 Comprehensive Mock Interview Answer Key

    
> ### Mock Interview Model Answers
> 
**A1:** PriceRadar is an automated multi-retailer e-commerce price monitoring platform. Consumers use it to track product pricing across Amazon, Flipkart, and eBay. It solves manual checking fatigue, missed flash discounts, and artificial strike-through pricing.

>         
**A2:** Manual bookmarks require constant human checking and provide no historical pricing. PriceRadar runs 24/7 background monitors every 4 hours, detects discounts while users are offline, and delivers instant push alerts.

>         
**A3:** A basic script just scrapes text. PriceRadar is an enterprise web application with normalized databases, user authentication, distributed mutex locks, multi-channel transactional messaging, and time-series price graphs.

>         
**A4:** Multi-tier architecture: React 18 SPA (Render Static Site) → Express REST API (Render Web Service) → MongoDB Atlas cloud database. Supplemented by an isolated Python FastAPI worker on `127.0.0.1:8000` and an external GitHub Actions cron orchestrator.

>         
**A5:** MERN provides a unified JavaScript/JSON data contract from client to database. React's Virtual DOM ensures instant reactive UI updates, Node's non-blocking event loop handles external I/O efficiently, and MongoDB provides schema flexibility for varying retailer attributes.

>         
**A6:** A Controller manages HTTP transport (unpacking `req.body`, returning status codes and JSON envelopes). A Service houses pure business logic (price monitoring, distributed locks, alert evaluation) independent of HTTP.

>         
**A7:** Via an Axios HTTP singleton in `client/src/services/api.js` with request interceptors that automatically attach `Authorization: Bearer <token>` headers.

>         
**A8:** `main.jsx` mounts the React DOM root inside `<BrowserRouter>` and `<AuthProvider>`. `App.jsx` defines URL route mappings using React Router `<Routes>` and `<Route>`.

>         
**A9:** `<ProtectedRoute>` checks `useAuth()`. If loading, it displays a spinner. If unauthenticated, it redirects to `/login` while preserving destination path in `location.state`.

>         
**A10:** `useState` (form state), `useEffect` (data fetching on mount), `useContext` (AuthContext), `useRef` (debounce timer), `useMemo` (lowest price calculation), `useCallback` (memoized event handlers).

>         
**A11:** Using React's Context API (`AuthContext.jsx`). The provider wraps the root component, exposing `user`, `token`, `login`, and `logout` globally via the `useAuth()` custom hook.

>         
**A12:** Form submits → Axios attaches JWT → Express route matches → `requireAuth` verifies token → `validate` checks input schema → `alertsController` verifies offer exists → `Alert.create()` persists integer paise in MongoDB Atlas → HTTP 201 Created sent to client.

>         
**A13:** `req.body` is parsed JSON from POST/PATCH requests; `req.params` is dynamic path placeholders (`:id`); `req.query` is URL query string parameters (`?q=phone`).

>         
**A14:** Monitoring takes 30 to 90 seconds. Holding an HTTP connection open that long causes 504 gateway timeouts. Returning HTTP 202 Accepted immediately decouples triggering from asynchronous background execution.

>         
**A15:** By wrapping all async route controllers in `asyncHandler`, which catches rejected Promises and forwards them to `next(err)`, handled by `errorHandler.js`.

>         
**A16:** One-to-Many. One canonical `Product` (iPhone 15) links to multiple retailer `Offer` listings (Amazon, Flipkart, eBay).

>         
**A17:** To eliminate IEEE 754 binary floating-point precision errors (`0.1 + 0.2 !== 0.3`) in financial comparisons.

>         
**A18:** An index spanning multiple fields enforcing distinct pairs. Used on `WatchlistItem`: `{ userId: 1, offerId: 1 }` preventing duplicate saves, and `Offer`: `{ provider: 1, externalProductId: 1 }`.

>         
**A19:** A Time-To-Live index on a Date field. In `OtpChallenge`, `expiresAt` has `{ expires: 0 }`; MongoDB automatically deletes expired OTPs after 10 minutes.

>         
**A20:** Passwords are hashed using `bcryptjs` with 10 salt rounds before database insertion. The field specifies `select: false` in Mongoose to prevent accidental query leakage.

>         
**A21:** JWT consists of Header, Payload, and Signature. The server verifies identity statelessly by checking the HMAC-SHA256 signature against `JWT_SECRET`. Limitation: Payload is Base64Url encoded (NOT encrypted) and readable by anyone.

>         
**A22:** Validating the reset OTP returns a cryptographically random, one-time `resetToken`. When the password is updated, the server deletes the challenge document, preventing token reuse.

>         
**A23:** Server-Side Request Forgery is an attack where a server is tricked into requesting internal or loopback resources. Our worker enforces a strict domain allowlist and validates final URLs after HTTP redirects.

>         
**A24:** GitHub Actions runs a cron workflow (`0 */4 * * *`) every 4 hours on an Ubuntu runner, waking Render and triggering `POST /api/monitor/run`.

>         
**A25:** Free-tier cloud containers (Render) spin down after 15 minutes of inactivity, freezing internal timers. GitHub Actions provides an external chronometer that runs reliably 24/7.

>         
**A26:** GitHub Actions sends a pre-flight probe to `GET /api/health` with 6 bounded retries (5s delay), waking the sleeping container before the monitor trigger departs.

>         
**A27:** The monitor queries distinct `offerId`s across active alerts, fetches the price from the retailer exactly once, and evaluates all 500 user alerts in memory using that single observation, reducing external network load by 99%.

>         
**A28:** Using dual-layer locking: an in-memory boolean mutex for synchronous local checks, and an atomic MongoDB `MonitorLock` distributed lease with heartbeats across cluster instances.

>         
**A29:** Alerts transition to `armed: false` upon firing and only re-arm if the price rises back above target. Furthermore, `NotificationEvent` enforces a unique compound index on `dedupeKey` (`${alertId}:${price}`).

>         
**A30:** The next scheduled cycle checks `heartbeatAt` on `MonitorLock`. If older than 15 minutes, it breaks the stale lease, reconciles the crashed run as `interrupted`, and starts a fresh monitoring cycle cleanly.

    
## 21.3 Quick Last-Minute Revision Sheet (Top 10 High-Yield Facts)

    

        - **Architecture:** MERN (MongoDB, Express, React 18, Node.js) + Python FastAPI worker + GitHub Actions cron.

        - **Financial Precision Policy:** 100% integer paise math (₹5,000 = `500000` paise). Mongoose enforces `Number.isInteger`.

        - **Monitoring Schedule:** `0 */4 * * *` (every 4 hours: 00, 04, 08, 12, 16, 20 UTC → 05:30, 09:30, 13:30, 17:30, 21:30, 01:30 IST).

        - **Cold Start Solution:** GitHub Actions pre-flight probe to `GET /api/health` with 6 retries (5s delay) wakes Render before triggering.

        - **Decoupled Asynchrony:** `POST /api/monitor/run` returns HTTP 202 Accepted immediately; GitHub Actions polls `GET /api/monitor/status` every 10 seconds.

        - **Distributed Mutex:** Atomic MongoDB `MonitorLock` lease with 15-minute heartbeat prevents overlapping cycles and recovers stale crashed runs.

        - **Deduplication Engine:** Groups active alerts by distinct `offerId` (fetches once for many users); alerts disarm upon firing; `NotificationEvent.dedupeKey` prevents duplicate emails.

        - **Security Architecture:** bcrypt (10 rounds), stateless JWT (7-day exp), SHA-256 hashed OTPs with MongoDB TTL auto-cleanup indexes, Mongoose `select: false` on passwordHash.

        - **SSRF Defense:** Python worker enforces strict domain allowlist and post-redirect URL destination checks.

        - **Notification Channels:** Brevo REST API for transactional email; Telegram Bot HTTPS API for instant mobile push messaging.

    

    
## 21.4 Important Files to Memorize for Interviews

    

        - `server/src/server.js`: Server startup and database connection.

        - `server/src/app.js`: Express assembly, CORS, health probes, fast-fail 503 middleware, and route mounting.

        - `server/src/services/priceMonitor.js`: 17-step monitoring engine, distinct offer deduplication, and distributed locking.

        - `server/src/services/alertEvaluator.js`: Pure evaluation logic (target price vs fixed drop, armed states, dedupeKey generation).

        - `server/src/providers/index.js`: Provider dispatcher routing offers to Apify, eBay, DummyJSON, Mockshop, Scrapling, or Fixture.

        - `server/src/utils/money.js`: Integer paise conversion utilities (`rupeesToPaise`, `paiseToRupees`, `formatRupees`).

        - `client/src/context/AuthContext.jsx`: Global authentication state, localStorage token synchronization, login/logout.

        - `client/src/services/api.js`: Central Axios singleton with request interceptor attaching JWT Bearer tokens.

        - `worker/extractor.py`: Python extraction service with SSRF domain allowlists and post-redirect validation.

        - `.github/workflows/monitor.yml`: 4-hour scheduled cron runner with pre-flight wakeup probes and status polling.
