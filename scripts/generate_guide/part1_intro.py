# scripts/generate_guide/part1_intro.py

def get_part1_html():
    return """
<div class="chapter-container" id="part-1">
    <h1>Part 1: Complete Project Introduction</h1>
    
    <h2>1.1 Project Overview</h2>
    <p>
        <strong>PriceRadar</strong> is a full-stack, automated multi-retailer e-commerce price tracking, comparison, and real-time alert system built on the <strong>MERN</strong> stack (MongoDB, Express.js, React 18, Node.js) paired with an isolated Python extraction worker and GitHub Actions workflow orchestration.
    </p>
    <p>
        PriceRadar continuously observes e-commerce product listings across multiple retail channels (Amazon, Flipkart, eBay, Meesho, and specialized testbeds). When a seller reduces a price, PriceRadar's evaluation engine detects the drop, checks user-configured price thresholds, and dispatches immediate notifications directly to the consumer's inbox (via Brevo transactional email) and mobile device (via Telegram Bot).
    </p>

    <div class="callout callout-arch">
        <div class="callout-title">The Four Elevator Pitches for Interviews</div>
        <p><strong>1. One-Sentence Pitch:</strong><br>
        <em>"PriceRadar is a full-stack MERN price intelligence platform that monitors e-commerce products across multiple retailers every four hours and automatically delivers instant email and Telegram alerts whenever prices drop below user targets."</em></p>
        
        <p><strong>2. 30-Second Pitch (Quick Technical Overview):</strong><br>
        <em>"I developed PriceRadar to solve the problem of manual price checking and deceptive e-commerce discounts. It features a React 18 frontend with an interactive price history chart, a secure Express backend with JWT and OTP authentication, MongoDB Atlas with integer-paise financial precision, and an automated price monitor triggered every four hours via GitHub Actions. It fetches prices once per cycle, evaluates user alerts against target drops, and dispatches alerts via Brevo and Telegram."</em></p>

        <p><strong>3. 1-Minute Pitch (Technical Architecture & Value):</strong><br>
        <em>"In modern e-commerce, dynamic algorithmic pricing changes multiple times a day, making it impossible for buyers to manually catch the best deals. PriceRadar automates this entirely. The frontend is built with React 18 and Vite, consuming a RESTful Express API. On the data tier, we use MongoDB with custom Mongoose schemas representing canonical Products, retailer Offers, and time-series PriceObservations. Our price monitoring engine runs every 4 hours triggered by GitHub Actions with an automated wakeup ping to prevent Render cold starts. It utilizes MongoDB-backed distributed mutex locking to prevent race conditions, deduplicates shared offer fetches, and evaluates both absolute target prices and fixed drops before dispatching multi-channel notifications."</em></p>

        <p><strong>4. 2-Minute Interview Pitch (Senior Engineering Depth):</strong><br>
        <em>"PriceRadar is an enterprise-grade price tracking platform designed around resilience, security, and financial accuracy. On the client side, React 18 uses context-driven state management, Axios request interceptors for JWT injection, and protected routes. The backend uses Express with layered architecture—separating routes, input validation middleware, controllers, business services, and database models. 
        <br><br>
        A core architectural highlight is our precision handling: all monetary values are stored as integers in paise rather than floating-point numbers, completely eliminating binary precision bugs in calculations. Our price ingestion layer utilizes a provider adapter pattern, unifying external sources like Apify cloud scrapers, eBay Browse OAuth 2.0 API, and an isolated Python FastAPI worker protected by strict SSRF domain allowlists.
        <br><br>
        For automation, we solved the serverless spin-down dilemma by combining GitHub Actions scheduled workflows with pre-flight health probes and asynchronous HTTP 202 background job processing. Multiple users tracking the same product share a single upstream price fetch, reducing retailer load by up to 80%. When price drops are confirmed, our alert evaluator ensures duplicate suppression through armed state transitions and dispatches alerts via Brevo email and Telegram bot with deduplication keys."</em></p>
    </div>

    <h2>1.2 Problem Statement: Why PriceRadar Was Built</h2>
    <p>
        Online shoppers face major challenges when trying to secure optimal prices across e-commerce platforms:
    </p>
    <ul>
        <li><strong>Fragmented Marketplaces:</strong> Products are listed across Amazon, Flipkart, Meesho, and eBay at differing price points, shipping terms, and seller discounts. Consumers must manually toggle between dozens of browser tabs.</li>
        <li><strong>Dynamic Algorithmic Pricing:</strong> Retailers frequently change prices during flash sales, late-night hours, or inventory clearances. Humans cannot refresh websites 24/7.</li>
        <li><strong>Deceptive Strike-Through Pricing:</strong> Retailers often artificially hike prices right before a festival sale and display an inflated "discount" percentage. Without historical price tracking, buyers cannot verify if a deal is genuine.</li>
        <li><strong>Manual Tracking Fatigue:</strong> Setting manual calendar reminders or bookmarking items leads to missed buying windows when limited-stock discounts expire.</li>
    </ul>

    <h3>Problem vs. Solution Matrix</h3>
    <table>
        <thead>
            <tr>
                <th style="width: 20%;">Consumer Problem</th>
                <th style="width: 35%;">Traditional / Manual Approach</th>
                <th style="width: 45%;">PriceRadar Engineering Solution</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Fragmented Price Comparison</strong></td>
                <td>Manually opening multiple retailer tabs and searching for product models one by one.</td>
                <td>Unified search engine aggregates multi-retailer offers into a single side-by-side comparison interface with normalized INR pricing.</td>
            </tr>
            <tr>
                <td><strong>Missing Transient Drops</strong></td>
                <td>Checking once every few days, frequently missing lightning deals and midnight price cuts.</td>
                <td>Automated price monitor executes every 4 hours via GitHub Actions cron, detecting drops and dispatching alerts within minutes.</td>
            </tr>
            <tr>
                <td><strong>Fake / Artificial Discounts</strong></td>
                <td>Relying on seller claims of "40% off" based on inflated Maximum Retail Price (MRP).</td>
                <td>Immutable <code>PriceObservation</code> time-series records preserve historical price points, visualized via an interactive price history chart.</td>
            </tr>
            <tr>
                <td><strong>Notification Clutter</strong></td>
                <td>Subscribing to general marketing newsletters filled with spam.</td>
                <td>Personalized, surgical alerts: notifications fire <em>only</em> when a specific product drops below the user's exact target price or drop threshold.</td>
            </tr>
            <tr>
                <td><strong>Alert Spam & Loops</strong></td>
                <td>Receiving repeated alerts every hour as long as a price stays below target.</td>
                <td>Stateful alert lifecycle with <code>armed</code> flag and unique <code>dedupeKey</code>; alerts disarm after triggering and only re-arm if the price rises and drops again.</td>
            </tr>
        </tbody>
    </table>

    <h2>1.3 Project Objectives & Engineering Boundaries</h2>
    <p>
        To ensure production quality, PriceRadar's scope was defined around strict architectural boundaries:
    </p>

    <h3>A. Main Functionality (Implemented Core)</h3>
    <ul>
        <li><strong>Catalog Aggregation:</strong> Unified Product and Offer data model separating canonical item identity from multi-seller retailer listings.</li>
        <li><strong>Multi-Retailer Search:</strong> Real-time product search with keyword filtering, categories, and retailer badges.</li>
        <li><strong>Watchlist Management:</strong> Personal user watchlists with compound indexing preventing duplicate saves.</li>
        <li><strong>Custom Price Alerts:</strong> Support for both <em>Target-Price Alerts</em> (e.g. "Notify when price ≤ ₹45,000") and <em>Fixed-Drop Alerts</em> (e.g. "Notify if price drops by ₹2,000 from current baseline").</li>
    </ul>

    <h3>B. Supporting & UX Functionality</h3>
    <ul>
        <li><strong>Responsive Forest Green UI:</strong> Mobile-first React 18 interface styled with modern CSS variables, responsive tables, and zero horizontal scroll across 390px, 768px, 1366px, and 1440px viewports.</li>
        <li><strong>Interactive Price History:</strong> Chronological SVG visualization of price fluctuations per offer.</li>
        <li><strong>In-App Notification Feed:</strong> User inbox tracking past alert dispatches with read/delete controls.</li>
    </ul>

    <h3>C. Security Functionality</h3>
    <ul>
        <li><strong>Authentication:</strong> Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256, 7-day expiration.</li>
        <li><strong>Password Protection:</strong> One-way cryptographic password hashing using <code>bcryptjs</code> with 10 salt rounds.</li>
        <li><strong>Mongoose Leak Protection:</strong> <code>select: false</code> configured on <code>User.passwordHash</code> to prevent accidental credential leakage in queries.</li>
        <li><strong>Four-Step Email OTP Flows:</strong> Cryptographically generated 6-digit OTPs hashed with SHA-256 and stored in MongoDB with native TTL auto-deletion indexes for both Registration and Password Reset.</li>
        <li><strong>SSRF Defense:</strong> Strict domain allowlisting and post-redirect URL validation in the Python worker.</li>
        <li><strong>Input Sanitization:</strong> Strict middleware validation with <code>express-validator</code>.</li>
    </ul>

    <h3>D. Automation & Monitoring Functionality</h3>
    <ul>
        <li><strong>4-Hour Cron Automation:</strong> GitHub Actions scheduled runner (<code>0 */4 * * *</code>) operating externally to wake and trigger the Render cloud backend.</li>
        <li><strong>Distributed Mutex Lock:</strong> Atomic MongoDB <code>findOneAndUpdate</code> lease (<code>MonitorLock</code>) preventing overlapping execution cycles.</li>
        <li><strong>Shared Offer Deduplication:</strong> Upstream price fetches consolidated by distinct <code>offerId</code> across all users.</li>
        <li><strong>Multi-Channel Alert Dispatch:</strong> Transactional emails powered by Brevo API and instant mobile messaging via Telegram Bot API.</li>
    </ul>

    <div class="callout callout-warning">
        <div class="callout-title">Important Scope Boundary for Interviews</div>
        <p>
            <strong>What PriceRadar Does NOT Do:</strong> PriceRadar is an <em>intelligence, comparison, and alerting engine</em>. It does <strong>not</strong> implement automated purchasing (it will never enter credit card details or buy items automatically on a user's behalf), nor does it use speculative AI machine learning models to "predict" future stock prices. Being completely honest about this scope in interviews demonstrates maturity and high engineering integrity.
        </p>
    </div>
</div>
"""
