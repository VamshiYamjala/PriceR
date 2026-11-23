# scripts/generate_guide/part21_mock_interview.py

def get_part21_html():
    return """
<div class="chapter-container page-break" id="part-21">
    <h1>Part 21: Final Mock Interview & Last-Minute Revision</h1>
    <p>
        This final chapter simulates a comprehensive multi-round technical interview. Questions are presented first so you can test your knowledge, followed by an exhaustive Answer Key, elevator pitches, and a high-yield revision cheat sheet.
    </p>

    <h2>21.1 The 9-Round Mock Interview Question Sheet</h2>

    <h3>Round 1: Project Introduction & Value Proposition</h3>
    <ol>
        <li>What is PriceRadar, who uses it, and what exact problem does it solve?</li>
        <li>Why did you build PriceRadar instead of just bookmarking e-commerce websites?</li>
        <li>What makes PriceRadar different from a simple web scraper script?</li>
    </ol>

    <h3>Round 2: Architecture & Engineering Strategy</h3>
    <ol start="4">
        <li>Can you walk me through the high-level architecture of your project?</li>
        <li>Why did you choose the MERN stack rather than Next.js or Python Django?</li>
        <li>What is the difference between a Controller and a Service in your backend?</li>
        <li>How does your React frontend communicate with your Express backend?</li>
    </ol>

    <h3>Round 3: Frontend & React 18</h3>
    <ol start="8">
        <li>How does React start up in your project and how is client routing configured?</li>
        <li>Explain how you implemented route guarding with <code>&lt;ProtectedRoute&gt;</code>.</li>
        <li>Which React hooks did you use and why did you use <code>useMemo</code> and <code>useRef</code>?</li>
        <li>How does your application prevent prop drilling when sharing user authentication state?</li>
    </ol>

    <h3>Round 4: Backend & REST APIs</h3>
    <ol start="12">
        <li>Explain the life of a request when a user creates a new price alert.</li>
        <li>What is the difference between <code>req.body</code>, <code>req.params</code>, and <code>req.query</code>?</li>
        <li>Why does your monitoring route return HTTP 202 Accepted instead of HTTP 200 OK?</li>
        <li>How do you handle asynchronous errors in Express without crashing the server?</li>
    </ol>

    <h3>Round 5: Database & Mongoose Modeling</h3>
    <ol start="16">
        <li>What is the relationship between the Product model and the Offer model?</li>
        <li>Why do you store all prices as integers in paise instead of floating-point rupees?</li>
        <li>What is a compound unique index and where is it used in PriceRadar?</li>
        <li>How does MongoDB's TTL index work and how is it used in your OTP system?</li>
    </ol>

    <h3>Round 6: Authentication & Security</h3>
    <ol start="20">
        <li>How is user password security handled in PriceRadar?</li>
        <li>Can you explain how JSON Web Tokens work and what their limitations are?</li>
        <li>How does your 4-step password reset flow prevent token reuse or replay attacks?</li>
        <li>What is Server-Side Request Forgery (SSRF) and how does your Python worker prevent it?</li>
    </ol>

    <h3>Round 7: GitHub Actions & Automation</h3>
    <ol start="24">
        <li>How does your project automatically refresh prices every four hours?</li>
        <li>Why did you use GitHub Actions instead of an internal <code>setInterval</code> timer?</li>
        <li>What happens if the cloud backend is sleeping when GitHub Actions fires?</li>
    </ol>

    <h3>Round 8: Monitoring, Locking & Notifications</h3>
    <ol start="27">
        <li>Why do you fetch each unique offer only once even if 500 users have alerts on it?</li>
        <li>How do you prevent two monitoring cycles from running at the exact same time?</li>
        <li>How does PriceRadar ensure users do not receive duplicate emails every 4 hours?</li>
    </ol>

    <h3>Round 9: Difficult Scenarios & Concurrency</h3>
    <ol start="30">
        <li>What happens if the backend server crashes or restarts in the middle of a monitoring cycle?</li>
    </ol>

    <h2>21.2 Comprehensive Mock Interview Answer Key</h2>
    <div class="callout callout-arch">
        <div class="callout-title">Mock Interview Model Answers</div>
        <p><strong>A1:</strong> PriceRadar is an automated multi-retailer e-commerce price monitoring platform. Consumers use it to track product pricing across Amazon, Flipkart, and eBay. It solves manual checking fatigue, missed flash discounts, and artificial strike-through pricing.</p>
        <p><strong>A2:</strong> Manual bookmarks require constant human checking and provide no historical pricing. PriceRadar runs 24/7 background monitors every 4 hours, detects discounts while users are offline, and delivers instant push alerts.</p>
        <p><strong>A3:</strong> A basic script just scrapes text. PriceRadar is an enterprise web application with normalized databases, user authentication, distributed mutex locks, multi-channel transactional messaging, and time-series price graphs.</p>
        <p><strong>A4:</strong> Multi-tier architecture: React 18 SPA (Render Static Site) → Express REST API (Render Web Service) → MongoDB Atlas cloud database. Supplemented by an isolated Python FastAPI worker on <code>127.0.0.1:8000</code> and an external GitHub Actions cron orchestrator.</p>
        <p><strong>A5:</strong> MERN provides a unified JavaScript/JSON data contract from client to database. React's Virtual DOM ensures instant reactive UI updates, Node's non-blocking event loop handles external I/O efficiently, and MongoDB provides schema flexibility for varying retailer attributes.</p>
        <p><strong>A6:</strong> A Controller manages HTTP transport (unpacking <code>req.body</code>, returning status codes and JSON envelopes). A Service houses pure business logic (price monitoring, distributed locks, alert evaluation) independent of HTTP.</p>
        <p><strong>A7:</strong> Via an Axios HTTP singleton in <code>client/src/services/api.js</code> with request interceptors that automatically attach <code>Authorization: Bearer &lt;token&gt;</code> headers.</p>
        <p><strong>A8:</strong> <code>main.jsx</code> mounts the React DOM root inside <code>&lt;BrowserRouter&gt;</code> and <code>&lt;AuthProvider&gt;</code>. <code>App.jsx</code> defines URL route mappings using React Router <code>&lt;Routes&gt;</code> and <code>&lt;Route&gt;</code>.</p>
        <p><strong>A9:</strong> <code>&lt;ProtectedRoute&gt;</code> checks <code>useAuth()</code>. If loading, it displays a spinner. If unauthenticated, it redirects to <code>/login</code> while preserving destination path in <code>location.state</code>.</p>
        <p><strong>A10:</strong> <code>useState</code> (form state), <code>useEffect</code> (data fetching on mount), <code>useContext</code> (AuthContext), <code>useRef</code> (debounce timer), <code>useMemo</code> (lowest price calculation), <code>useCallback</code> (memoized event handlers).</p>
        <p><strong>A11:</strong> Using React's Context API (<code>AuthContext.jsx</code>). The provider wraps the root component, exposing <code>user</code>, <code>token</code>, <code>login</code>, and <code>logout</code> globally via the <code>useAuth()</code> custom hook.</p>
        <p><strong>A12:</strong> Form submits → Axios attaches JWT → Express route matches → <code>requireAuth</code> verifies token → <code>validate</code> checks input schema → <code>alertsController</code> verifies offer exists → <code>Alert.create()</code> persists integer paise in MongoDB Atlas → HTTP 201 Created sent to client.</p>
        <p><strong>A13:</strong> <code>req.body</code> is parsed JSON from POST/PATCH requests; <code>req.params</code> is dynamic path placeholders (<code>:id</code>); <code>req.query</code> is URL query string parameters (<code>?q=phone</code>).</p>
        <p><strong>A14:</strong> Monitoring takes 30 to 90 seconds. Holding an HTTP connection open that long causes 504 gateway timeouts. Returning HTTP 202 Accepted immediately decouples triggering from asynchronous background execution.</p>
        <p><strong>A15:</strong> By wrapping all async route controllers in <code>asyncHandler</code>, which catches rejected Promises and forwards them to <code>next(err)</code>, handled by <code>errorHandler.js</code>.</p>
        <p><strong>A16:</strong> One-to-Many. One canonical <code>Product</code> (iPhone 15) links to multiple retailer <code>Offer</code> listings (Amazon, Flipkart, eBay).</p>
        <p><strong>A17:</strong> To eliminate IEEE 754 binary floating-point precision errors (<code>0.1 + 0.2 !== 0.3</code>) in financial comparisons.</p>
        <p><strong>A18:</strong> An index spanning multiple fields enforcing distinct pairs. Used on <code>WatchlistItem</code>: <code>{ userId: 1, offerId: 1 }</code> preventing duplicate saves, and <code>Offer</code>: <code>{ provider: 1, externalProductId: 1 }</code>.</p>
        <p><strong>A19:</strong> A Time-To-Live index on a Date field. In <code>OtpChallenge</code>, <code>expiresAt</code> has <code>{ expires: 0 }</code>; MongoDB automatically deletes expired OTPs after 10 minutes.</p>
        <p><strong>A20:</strong> Passwords are hashed using <code>bcryptjs</code> with 10 salt rounds before database insertion. The field specifies <code>select: false</code> in Mongoose to prevent accidental query leakage.</p>
        <p><strong>A21:</strong> JWT consists of Header, Payload, and Signature. The server verifies identity statelessly by checking the HMAC-SHA256 signature against <code>JWT_SECRET</code>. Limitation: Payload is Base64Url encoded (NOT encrypted) and readable by anyone.</p>
        <p><strong>A22:</strong> Validating the reset OTP returns a cryptographically random, one-time <code>resetToken</code>. When the password is updated, the server deletes the challenge document, preventing token reuse.</p>
        <p><strong>A23:</strong> Server-Side Request Forgery is an attack where a server is tricked into requesting internal or loopback resources. Our worker enforces a strict domain allowlist and validates final URLs after HTTP redirects.</p>
        <p><strong>A24:</strong> GitHub Actions runs a cron workflow (<code>0 */4 * * *</code>) every 4 hours on an Ubuntu runner, waking Render and triggering <code>POST /api/monitor/run</code>.</p>
        <p><strong>A25:</strong> Free-tier cloud containers (Render) spin down after 15 minutes of inactivity, freezing internal timers. GitHub Actions provides an external chronometer that runs reliably 24/7.</p>
        <p><strong>A26:</strong> GitHub Actions sends a pre-flight probe to <code>GET /api/health</code> with 6 bounded retries (5s delay), waking the sleeping container before the monitor trigger departs.</p>
        <p><strong>A27:</strong> The monitor queries distinct <code>offerId</code>s across active alerts, fetches the price from the retailer exactly once, and evaluates all 500 user alerts in memory using that single observation, reducing external network load by 99%.</p>
        <p><strong>A28:</strong> Using dual-layer locking: an in-memory boolean mutex for synchronous local checks, and an atomic MongoDB <code>MonitorLock</code> distributed lease with heartbeats across cluster instances.</p>
        <p><strong>A29:</strong> Alerts transition to <code>armed: false</code> upon firing and only re-arm if the price rises back above target. Furthermore, <code>NotificationEvent</code> enforces a unique compound index on <code>dedupeKey</code> (<code>${alertId}:${price}</code>).</p>
        <p><strong>A30:</strong> The next scheduled cycle checks <code>heartbeatAt</code> on <code>MonitorLock</code>. If older than 15 minutes, it breaks the stale lease, reconciles the crashed run as <code>interrupted</code>, and starts a fresh monitoring cycle cleanly.</p>
    </div>

    <h2>21.3 Quick Last-Minute Revision Sheet (Top 10 High-Yield Facts)</h2>
    <ol>
        <li><strong>Architecture:</strong> MERN (MongoDB, Express, React 18, Node.js) + Python FastAPI worker + GitHub Actions cron.</li>
        <li><strong>Financial Precision Policy:</strong> 100% integer paise math (₹5,000 = <code>500000</code> paise). Mongoose enforces <code>Number.isInteger</code>.</li>
        <li><strong>Monitoring Schedule:</strong> <code>0 */4 * * *</code> (every 4 hours: 00, 04, 08, 12, 16, 20 UTC → 05:30, 09:30, 13:30, 17:30, 21:30, 01:30 IST).</li>
        <li><strong>Cold Start Solution:</strong> GitHub Actions pre-flight probe to <code>GET /api/health</code> with 6 retries (5s delay) wakes Render before triggering.</li>
        <li><strong>Decoupled Asynchrony:</strong> <code>POST /api/monitor/run</code> returns HTTP 202 Accepted immediately; GitHub Actions polls <code>GET /api/monitor/status</code> every 10 seconds.</li>
        <li><strong>Distributed Mutex:</strong> Atomic MongoDB <code>MonitorLock</code> lease with 15-minute heartbeat prevents overlapping cycles and recovers stale crashed runs.</li>
        <li><strong>Deduplication Engine:</strong> Groups active alerts by distinct <code>offerId</code> (fetches once for many users); alerts disarm upon firing; <code>NotificationEvent.dedupeKey</code> prevents duplicate emails.</li>
        <li><strong>Security Architecture:</strong> bcrypt (10 rounds), stateless JWT (7-day exp), SHA-256 hashed OTPs with MongoDB TTL auto-cleanup indexes, Mongoose <code>select: false</code> on passwordHash.</li>
        <li><strong>SSRF Defense:</strong> Python worker enforces strict domain allowlist and post-redirect URL destination checks.</li>
        <li><strong>Notification Channels:</strong> Brevo REST API for transactional email; Telegram Bot HTTPS API for instant mobile push messaging.</li>
    </ol>

    <h2>21.4 Important Files to Memorize for Interviews</h2>
    <ul>
        <li><code>server/src/server.js</code>: Server startup and database connection.</li>
        <li><code>server/src/app.js</code>: Express assembly, CORS, health probes, fast-fail 503 middleware, and route mounting.</li>
        <li><code>server/src/services/priceMonitor.js</code>: 17-step monitoring engine, distinct offer deduplication, and distributed locking.</li>
        <li><code>server/src/services/alertEvaluator.js</code>: Pure evaluation logic (target price vs fixed drop, armed states, dedupeKey generation).</li>
        <li><code>server/src/providers/index.js</code>: Provider dispatcher routing offers to Apify, eBay, DummyJSON, Mockshop, Scrapling, or Fixture.</li>
        <li><code>server/src/utils/money.js</code>: Integer paise conversion utilities (<code>rupeesToPaise</code>, <code>paiseToRupees</code>, <code>formatRupees</code>).</li>
        <li><code>client/src/context/AuthContext.jsx</code>: Global authentication state, localStorage token synchronization, login/logout.</li>
        <li><code>client/src/services/api.js</code>: Central Axios singleton with request interceptor attaching JWT Bearer tokens.</li>
        <li><code>worker/extractor.py</code>: Python extraction service with SSRF domain allowlists and post-redirect validation.</li>
        <li><code>.github/workflows/monitor.yml</code>: 4-hour scheduled cron runner with pre-flight wakeup probes and status polling.</li>
    </ul>
</div>
"""
