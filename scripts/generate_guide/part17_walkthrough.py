# scripts/generate_guide/part17_walkthrough.py

def get_part17_html():
    return """
<div class="chapter-container page-break" id="part-17">
    <h1>Part 17: End-to-End Walkthrough of a Real User Scenario</h1>
    <p>
        To demonstrate how all pieces connect in production, here is the complete 25-step journey of a user saving ₹5,000 on an iPhone 15 using PriceRadar.
    </p>

    <h2>17.1 Complete End-to-End Visual Sequence Diagram</h2>
    <div class="diagram-box">
        <svg viewBox="0 0 900 680" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, sans-serif;">
            <!-- Actors Header -->
            <rect x="20" y="20" width="120" height="35" rx="6" fill="#0284c7"/>
            <text x="80" y="42" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">User (Browser)</text>
            <line x1="80" y1="55" x2="80" y2="660" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4,4"/>

            <rect x="180" y="20" width="140" height="35" rx="6" fill="#0f766e"/>
            <text x="250" y="42" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">React (Client)</text>
            <line x1="250" y1="55" x2="250" y2="660" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4,4"/>

            <rect x="360" y="20" width="140" height="35" rx="6" fill="#134e4a"/>
            <text x="430" y="42" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">Express (Backend)</text>
            <line x1="430" y1="55" x2="430" y2="660" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4,4"/>

            <rect x="540" y="20" width="140" height="35" rx="6" fill="#166534"/>
            <text x="610" y="42" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">MongoDB Atlas</text>
            <line x1="610" y1="55" x2="610" y2="660" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4,4"/>

            <rect x="720" y="20" width="160" height="35" rx="6" fill="#475569"/>
            <text x="800" y="42" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">GitHub / External</text>
            <line x1="800" y1="55" x2="800" y2="660" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4,4"/>

            <!-- Steps -->
            <!-- Step 1-3: Registration -->
            <rect x="50" y="70" width="800" height="50" rx="4" fill="#f0f9ff" stroke="#bae6fd"/>
            <text x="60" y="90" font-size="9" font-weight="bold" fill="#0369a1">Phase 1: Registration & OTP Verification</text>
            <text x="60" y="108" font-size="8" fill="#334155">1. User fills register form → 2. Express generates 6-digit OTP & bcrypt hash → 3. Brevo sends OTP email → 4. User verifies OTP → 5. User created in MongoDB & JWT issued.</text>

            <!-- Step 4-6: Search -->
            <rect x="50" y="140" width="800" height="50" rx="4" fill="#f0fdf4" stroke="#bbf7d0"/>
            <text x="60" y="160" font-size="9" font-weight="bold" fill="#15803d">Phase 2: Product Search & Side-by-Side Comparison</text>
            <text x="60" y="178" font-size="8" fill="#334155">6. User searches "iPhone 15" → 7. Express regex searches Product & Offer collections → 8. React displays comparison table: Amazon (₹48,999) vs Flipkart (₹46,999).</text>

            <!-- Step 7-9: Watchlist & Alert -->
            <rect x="50" y="210" width="800" height="50" rx="4" fill="#fefce8" stroke="#fef08a"/>
            <text x="60" y="230" font-size="9" font-weight="bold" fill="#854d0e">Phase 3: Watchlist Addition & Target Alert Creation</text>
            <text x="60" y="248" font-size="8" fill="#334155">9. User clicks "Watch" (WatchlistItem created) → 10. User creates Target Alert: "Notify when price ≤ ₹45,000" (targetPriceInPaise: 4500000, armed: true).</text>

            <!-- Step 10-14: Cron & Monitor -->
            <rect x="50" y="280" width="800" height="90" rx="4" fill="#f5f3ff" stroke="#ddd6fe"/>
            <text x="60" y="300" font-size="9" font-weight="bold" fill="#6d28d9">Phase 4: 4-Hour Cron Execution & Price Ingestion</text>
            <text x="60" y="318" font-size="8" fill="#334155">11. GitHub Actions cron fires (00:00 UTC / 05:30 IST) → 12. Pings GET /api/health to wake sleeping Render instance.</text>
            <text x="60" y="334" font-size="8" fill="#334155">13. Calls POST /api/monitor/run with X-Monitor-Secret → 14. Express acquires MonitorLock distributed lease & returns HTTP 202.</text>
            <text x="60" y="350" font-size="8" fill="#334155">15. Dispatcher queries Apify Cloud Actor for Flipkart listing → 16. New Price detected: ₹44,499 (4449900 paise) → 17. Saves PriceObservation.</text>

            <!-- Step 15-18: Evaluation & Notification -->
            <rect x="50" y="390" width="800" height="85" rx="4" fill="#fdf2f8" stroke="#fbcfe8"/>
            <text x="60" y="410" font-size="9" font-weight="bold" fill="#9d174d">Phase 5: Alert Evaluation & Multi-Channel Dispatch</text>
            <text x="60" y="428" font-size="8" fill="#334155">18. evaluateAlert() checks: 4449900 &lt;= 4500000? YES! → 19. Checks armed flag? TRUE!</text>
            <text x="60" y="444" font-size="8" fill="#334155">20. Alert triggers: Brevo sends email with buy button → 21. Telegram Bot pushes instant alert to mobile device.</text>
            <text x="60" y="460" font-size="8" fill="#334155">22. Saves NotificationEvent with dedupeKey → 23. Disarms alert (armed = false) to suppress future duplicates.</text>

            <!-- Step 19-20: User Inbox -->
            <rect x="50" y="495" width="800" height="50" rx="4" fill="#f1f5f9" stroke="#cbd5e1"/>
            <text x="60" y="515" font-size="9" font-weight="bold" fill="#0f172a">Phase 6: User Engagement & Resolution</text>
            <text x="60" y="533" font-size="8" fill="#334155">24. User opens email / Telegram on phone, clicks direct retailer link, and buys iPhone 15 at discount.</text>
            <text x="60" y="555" font-size="8" fill="#334155">25. User views past alert in PriceRadar Notification Feed (/notifications); marked as read/dismissed.</text>
        </svg>
        <div class="diagram-caption">Figure 17.1: Comprehensive End-to-End Workflow Diagram</div>
    </div>

    <h2>17.2 The 25 Sequential Steps of the Real Scenario</h2>
    <ol>
        <li>User navigates to <code>https://priceradar-web.onrender.com/register</code>.</li>
        <li>User fills in Name (<em>"Ananya Sharma"</em>), Email (<em>"ananya@gmail.com"</em>), and Password.</li>
        <li>Backend receives <code>POST /api/auth/register/initiate</code>, generates 6-digit OTP <code>829143</code>, hashes password with bcrypt, and stores in <code>OtpChallenge</code>.</li>
        <li>Brevo dispatches verification email to Ananya's inbox.</li>
        <li>Ananya inputs <code>829143</code> on Step 2. Backend validates OTP, inserts User record in MongoDB, issues a 7-day JWT token, and redirects to Dashboard.</li>
        <li>Ananya types <em>"Apple iPhone 15"</em> into the Search bar.</li>
        <li>Axios calls <code>GET /api/products/search?q=Apple%20iPhone%2015</code>.</li>
        <li>Backend performs case-insensitive regex search in <code>products</code> collection and queries linked <code>offers</code>.</li>
        <li>React renders the search grid showing the lowest price: <em>"From ₹46,999 on Flipkart"</em>.</li>
        <li>Ananya clicks the product card, opening <code>/products/66a01...</code>.</li>
        <li>React loads product details and renders the side-by-side comparison table:
            <ul>
                <li>Amazon: ₹48,999 (In Stock)</li>
                <li>Flipkart: ₹46,999 (In Stock)</li>
            </ul>
        </li>
        <li>Ananya clicks "Watch" on the Flipkart listing. Axios posts to <code>/api/watchlist</code>, persisting the bookmark.</li>
        <li>Ananya clicks "Create Price Alert", chooses <strong>Target Price</strong>, inputs ₹45,000, checks Email and Telegram checkboxes, and clicks "Save Alert".</li>
        <li>Frontend converts ₹45,000 to integer paise (<code>4500000</code>) and posts to <code>/api/alerts</code>. Mongoose persists the active, armed alert document.</li>
        <li>At 04:00 UTC (09:30 AM IST), GitHub Actions scheduled runner executes <code>monitor.yml</code>.</li>
        <li>GitHub Actions pings <code>GET /api/health</code>. The sleeping Render container wakes up and responds HTTP 200 within 12 seconds.</li>
        <li>GitHub Actions sends <code>POST /api/monitor/run</code> with the <code>X-Monitor-Secret</code> header.</li>
        <li>Express acquires the distributed <code>MonitorLock</code> in MongoDB and returns HTTP 202 Accepted with <code>runId: "66run..."</code>.</li>
        <li>Price monitor retrieves all active alerts, identifies the unique Flipkart iPhone 15 offer ID, and dispatches the fetch to Apify Cloud Actor.</li>
        <li>Apify scrapes Flipkart: Flipkart has launched a flash deal dropping the price to <strong>₹44,499</strong> (<code>4449900</code> paise).</li>
        <li>Express creates a new <code>PriceObservation</code> document and updates the <code>Offer</code> record.</li>
        <li>The alert evaluator evaluates Ananya's alert: <code>4449900 &lt;= 4500000</code> is <strong>TRUE</strong>. Since <code>alert.armed === true</code>, the alert triggers!</li>
        <li>The alert dispatcher calls Brevo API (sending an email with direct Flipkart link) and Telegram Bot API (delivering mobile push notification).</li>
        <li>Express records a <code>NotificationEvent</code> document with <code>dedupeKey: "66a99:4449900"</code> and disarms the alert (<code>armed = false</code>).</li>
        <li>Ananya receives the Telegram ping on her smartphone, clicks the link, and purchases the iPhone 15 at ₹44,499—saving ₹5,500!</li>
    </ol>
</div>
"""
