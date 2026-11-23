# scripts/generate_guide/part20_limitations.py

def get_part20_html():
    return """
<div class="chapter-container page-break" id="part-20">
    <h1>Part 20: Project Limitations & Future Engineering Roadmap</h1>
    <p>
        Being completely transparent about system boundaries and having a concrete roadmap for v2 demonstrates senior engineering maturity in technical interviews.
    </p>

    <h2>20.1 Summary of Implemented Core Capabilities</h2>
    <ul>
        <li><strong>Full-Stack MERN Architecture:</strong> Complete separation between React SPA, Express REST API, and MongoDB Atlas datastore.</li>
        <li><strong>Financial Precision Policy:</strong> 100% integer-paise calculations across database models and price drop logic.</li>
        <li><strong>Multi-Channel Notifications:</strong> Real-time Brevo transactional email and Telegram Bot API messaging.</li>
        <li><strong>4-Hour Automated Cron:</strong> External GitHub Actions orchestration waking sleeping Render cloud containers.</li>
        <li><strong>Concurrency Protection:</strong> Dual-layer locking (in-memory mutex + MongoDB atomic distributed lease) with stale run reconciliation.</li>
        <li><strong>Four-Step OTP Flows:</strong> SHA-256 hashed 6-digit codes with native MongoDB TTL auto-cleanup indexes.</li>
        <li><strong>Multi-Retailer Ingestion:</strong> Decoupled provider dispatcher integrating Apify, eBay Browse API, DummyJSON, Mockshop, and local Python extraction.</li>
        <li><strong>Automated Quality Guardrails:</strong> 26 test suites and 277 unit/integration tests passing in CI.</li>
    </ul>

    <h2>20.2 Current Technical Limitations (Honest Interview Disclosures)</h2>
    <ol>
        <li>
            <strong>In-Process Background Execution Durability:</strong><br>
            <em>Limitation:</em> When <code>POST /api/monitor/run</code> returns HTTP 202 Accepted, the monitoring loop executes in-process within the running Node.js container. If the cloud platform restarts the container mid-execution, active promises are terminated immediately.<br>
            <em>Mitigation:</em> The persistent <code>MonitorLock</code> lease timeout (15 min) reconciles the crashed run during the next scheduled cycle, but price checks for that cycle are skipped rather than resumed.
        </li>
        <li>
            <strong>Cloud Cold Starts on Free Tiers:</strong><br>
            <em>Limitation:</em> Render free-tier containers spin down after 15 minutes of inactivity, requiring 30 to 45 seconds to wake up on the first request.<br>
            <em>Mitigation:</em> Our GitHub Actions workflow executes an automated pre-flight curl probe with 6 bounded retries before dispatching the monitor trigger.
        </li>
        <li>
            <strong>Anti-Bot Evasion on Direct Scrapers:</strong><br>
            <em>Limitation:</em> Modern e-commerce sites (Amazon, Flipkart) deploy sophisticated bot detection (Cloudflare, Akamai) that block raw HTTP scrapers.<br>
            <em>Mitigation:</em> PriceRadar relies on Apify Cloud Actors (which manage browser fingerprinting and proxy rotation) rather than fragile local scrapers.
        </li>
        <li>
            <strong>Keyword-Based Product Matching:</strong><br>
            <em>Limitation:</em> Canonical product linking relies on title keywords and <code>canonicalKey</code> rather than universal barcodes (GTIN/UPC), occasionally requiring manual curation for obscure product variants.
        </li>
    </ol>

    <h2>20.3 Future Engineering Roadmap (PriceRadar v2)</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 25%;">Improvement Proposal</th>
                <th style="width: 35%;">Proposed Architecture</th>
                <th style="width: 40%;">Engineering Benefit</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Durable Message Queue (BullMQ + Redis)</strong></td>
                <td>Replace in-process promises with Redis-backed BullMQ job queues. Separate worker nodes consume jobs from the queue.</td>
                <td>Provides crash-resilient job persistence, automatic exponential retry backoffs, and horizontal worker auto-scaling.</td>
            </tr>
            <tr>
                <td><strong>Real-Time WebSockets (Socket.io)</strong></td>
                <td>Establish persistent bi-directional WebSocket connections between React frontend and Express server.</td>
                <td>Live price updates flash directly on open search pages without requiring user manual refreshes.</td>
            </tr>
            <tr>
                <td><strong>Official Affiliate API Integration</strong></td>
                <td>Integrate Amazon Product Advertising API (PA-API 5.0) and Flipkart Affiliate API credentials.</td>
                <td>Zero anti-bot blocking, guaranteed uptime, and affiliate revenue generation for operating costs.</td>
            </tr>
            <tr>
                <td><strong>Universal Barcode Catalog (UPC / EAN)</strong></td>
                <td>Add unique <code>gtin</code> / <code>upc</code> fields to <code>Product</code> schema with compound lookup indexes.</td>
                <td>100% deterministic, automated cross-store catalog matching without title keyword ambiguity.</td>
            </tr>
            <tr>
                <td><strong>Cross-Platform Mobile App (React Native)</strong></td>
                <td>Port existing React component logic into React Native for iOS and Android.</td>
                <td>Native push notifications via Firebase Cloud Messaging (FCM) and Apple Push Notification service (APNs).</td>
            </tr>
            <tr>
                <td><strong>Multi-Factor Authentication (TOTP)</strong></td>
                <td>Add Time-based One-Time Password support (Google Authenticator / Authy) using <code>speakeasy</code>.</td>
                <td>Enterprise-grade account security protecting user notification settings and saved watchlists.</td>
            </tr>
        </tbody>
    </table>
</div>
"""
