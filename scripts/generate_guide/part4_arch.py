# scripts/generate_guide/part4_arch.py

def get_part4_html():
    return """
<div class="chapter-container page-break" id="part-4">
    <h1>Part 4: Complete System Architecture</h1>
    <p>
        PriceRadar operates as a decoupled, multi-tier system consisting of a client-side Single Page Application, a stateless Node.js REST API server, a MongoDB Atlas document datastore, an isolated Python extraction worker, and external workflow automation via GitHub Actions.
    </p>

    <h2>4.1 End-to-End System Architecture Diagram</h2>
    <p>
        The following architectural diagram illustrates the complete topology, communication protocols, and data movement across all system boundaries:
    </p>

    <div class="diagram-box">
        <svg viewBox="0 0 950 560" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, sans-serif;">
            <!-- Background & Gradients -->
            <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f8fafc"/>
                    <stop offset="100%" stop-color="#f1f5f9"/>
                </linearGradient>
                <linearGradient id="clientGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#0284c7"/>
                    <stop offset="100%" stop-color="#0369a1"/>
                </linearGradient>
                <linearGradient id="serverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#0f766e"/>
                    <stop offset="100%" stop-color="#115e59"/>
                </linearGradient>
                <linearGradient id="dbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#15803d"/>
                    <stop offset="100%" stop-color="#166534"/>
                </linearGradient>
                <linearGradient id="workerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#7c3aed"/>
                    <stop offset="100%" stop-color="#6d28d9"/>
                </linearGradient>
                <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#475569"/>
                    <stop offset="100%" stop-color="#334155"/>
                </linearGradient>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#0f766e"/>
                </marker>
                <marker id="arrowBlue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#0284c7"/>
                </marker>
                <marker id="arrowPurple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#7c3aed"/>
                </marker>
            </defs>

            <!-- Tiers Containers -->
            <!-- 1. Client Tier -->
            <rect x="20" y="20" width="220" height="520" rx="10" fill="#f0f9ff" stroke="#bae6fd" stroke-width="2"/>
            <text x="130" y="45" font-size="13" font-weight="bold" fill="#0369a1" text-anchor="middle">CLIENT TIER (React 18)</text>

            <rect x="35" y="65" width="190" height="75" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
            <text x="130" y="85" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">Pages & Components</text>
            <text x="130" y="103" font-size="8.5" fill="#64748b" text-anchor="middle">Search, Details, Dashboard</text>
            <text x="130" y="120" font-size="8.5" fill="#64748b" text-anchor="middle">Watchlist, Alerts, History</text>

            <rect x="35" y="155" width="190" height="50" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
            <text x="130" y="175" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">AuthContext.jsx</text>
            <text x="130" y="192" font-size="8.5" fill="#64748b" text-anchor="middle">JWT State & localStorage</text>

            <rect x="35" y="220" width="190" height="55" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
            <text x="130" y="240" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">Axios Client (api.js)</text>
            <text x="130" y="258" font-size="8.5" fill="#64748b" text-anchor="middle">Bearer Token Interceptor</text>

            <rect x="35" y="295" width="190" height="230" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
            <text x="130" y="315" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">User Actions</text>
            <text x="50" y="340" font-size="8.5" fill="#334155">• Search Products</text>
            <text x="50" y="365" font-size="8.5" fill="#334155">• Compare Store Offers</text>
            <text x="50" y="390" font-size="8.5" fill="#334155">• Save to Watchlist</text>
            <text x="50" y="415" font-size="8.5" fill="#334155">• Create Price Alert</text>
            <text x="50" y="440" font-size="8.5" fill="#334155">• Link Telegram Bot</text>
            <text x="50" y="465" font-size="8.5" fill="#334155">• View Price History</text>
            <text x="50" y="490" font-size="8.5" fill="#334155">• Reset Password via OTP</text>

            <!-- 2. Backend Tier -->
            <rect x="270" y="20" width="370" height="520" rx="10" fill="#f0fdfa" stroke="#99f6e4" stroke-width="2"/>
            <text x="455" y="45" font-size="13" font-weight="bold" fill="#0f766e" text-anchor="middle">SERVER TIER (Node.js & Express)</text>

            <!-- Middleware & Router -->
            <rect x="285" y="65" width="340" height="60" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
            <text x="455" y="85" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">Express Application (app.js)</text>
            <text x="455" y="102" font-size="8.5" fill="#64748b" text-anchor="middle">CORS, Fast-Fail DB Check, /api/health</text>
            <text x="455" y="116" font-size="8" fill="#0284c7" text-anchor="middle">Middleware: requireAuth, validate, rateLimiter</text>

            <!-- Controllers -->
            <rect x="285" y="140" width="340" height="70" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
            <text x="455" y="160" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">Controllers Layer</text>
            <text x="455" y="178" font-size="8.5" fill="#64748b" text-anchor="middle">authController, alertsController, productsController</text>
            <text x="455" y="196" font-size="8.5" fill="#64748b" text-anchor="middle">watchlistController, monitorController, notificationsController</text>

            <!-- Services Engine -->
            <rect x="285" y="225" width="340" height="155" rx="6" fill="#ccfbf1" stroke="#5eead4"/>
            <text x="455" y="245" font-size="11" font-weight="bold" fill="#115e59" text-anchor="middle">Core Services & Background Engines</text>
            
            <rect x="300" y="255" width="150" height="50" rx="4" fill="#ffffff" stroke="#99f6e4"/>
            <text x="375" y="273" font-size="8.5" font-weight="bold" fill="#0f766e" text-anchor="middle">Price Monitor Service</text>
            <text x="375" y="291" font-size="7.5" fill="#475569" text-anchor="middle">Distinct Offer Cycle</text>

            <rect x="460" y="255" width="150" height="50" rx="4" fill="#ffffff" stroke="#99f6e4"/>
            <text x="535" y="273" font-size="8.5" font-weight="bold" fill="#0f766e" text-anchor="middle">Distributed Mutex Lock</text>
            <text x="535" y="291" font-size="7.5" fill="#475569" text-anchor="middle">MonitorLock Lease</text>

            <rect x="300" y="315" width="150" height="50" rx="4" fill="#ffffff" stroke="#99f6e4"/>
            <text x="375" y="333" font-size="8.5" font-weight="bold" fill="#0f766e" text-anchor="middle">Alert Evaluator</text>
            <text x="375" y="351" font-size="7.5" fill="#475569" text-anchor="middle">Target vs Drop Checks</text>

            <rect x="460" y="315" width="150" height="50" rx="4" fill="#ffffff" stroke="#99f6e4"/>
            <text x="535" y="333" font-size="8.5" font-weight="bold" fill="#0f766e" text-anchor="middle">Alert Dispatcher</text>
            <text x="535" y="351" font-size="7.5" fill="#475569" text-anchor="middle">Brevo & Telegram Send</text>

            <!-- Providers Dispatcher -->
            <rect x="285" y="395" width="340" height="130" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
            <text x="455" y="415" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">Provider Dispatcher (providers/index.js)</text>
            <text x="455" y="432" font-size="8" fill="#64748b" text-anchor="middle">Routes Offer Fetch to Matching Ingestion Adapter</text>
            
            <rect x="295" y="445" width="70" height="30" rx="4" fill="#f1f5f9" stroke="#cbd5e1"/>
            <text x="330" y="464" font-size="8" font-weight="bold" fill="#334155" text-anchor="middle">eBay API</text>

            <rect x="375" y="445" width="70" height="30" rx="4" fill="#f1f5f9" stroke="#cbd5e1"/>
            <text x="410" y="464" font-size="8" font-weight="bold" fill="#334155" text-anchor="middle">Apify</text>

            <rect x="455" y="445" width="75" height="30" rx="4" fill="#f1f5f9" stroke="#cbd5e1"/>
            <text x="492" y="464" font-size="8" font-weight="bold" fill="#334155" text-anchor="middle">DummyJSON</text>

            <rect x="540" y="445" width="75" height="30" rx="4" fill="#f1f5f9" stroke="#cbd5e1"/>
            <text x="577" y="464" font-size="8" font-weight="bold" fill="#334155" text-anchor="middle">MockShop</text>

            <rect x="335" y="485" width="105" height="30" rx="4" fill="#f1f5f9" stroke="#cbd5e1"/>
            <text x="387" y="504" font-size="8" font-weight="bold" fill="#334155" text-anchor="middle">Fixture Provider</text>

            <rect x="455" y="485" width="115" height="30" rx="4" fill="#ede9fe" stroke="#c4b5fd"/>
            <text x="512" y="504" font-size="8" font-weight="bold" fill="#6d28d9" text-anchor="middle">Scrapling Adapter</text>

            <!-- 3. Database & External Services -->
            <rect x="670" y="20" width="260" height="520" rx="10" fill="#fcfcfc" stroke="#e2e8f0" stroke-width="2"/>
            <text x="800" y="45" font-size="13" font-weight="bold" fill="#334155" text-anchor="middle">DATA & EXTERNAL CLOUD</text>

            <!-- MongoDB Atlas -->
            <rect x="685" y="65" width="230" height="165" rx="6" fill="#f0fdf4" stroke="#86efac"/>
            <text x="800" y="85" font-size="10" font-weight="bold" fill="#166534" text-anchor="middle">MongoDB Atlas (Mongoose)</text>
            <text x="700" y="108" font-size="8" fill="#14532d">• User (passwordHash, select:false)</text>
            <text x="700" y="125" font-size="8" fill="#14532d">• Product & Offer (priceInPaise int)</text>
            <text x="700" y="142" font-size="8" fill="#14532d">• Alert (armed, target, drop)</text>
            <text x="700" y="159" font-size="8" fill="#14532d">• PriceObservation (time-series)</text>
            <text x="700" y="176" font-size="8" fill="#14532d">• NotificationEvent (dedupeKey index)</text>
            <text x="700" y="193" font-size="8" fill="#14532d">• MonitorRun & MonitorLock (lease)</text>
            <text x="700" y="210" font-size="8" fill="#14532d">• OtpChallenge (TTL auto-cleanup)</text>

            <!-- External Integrations -->
            <rect x="685" y="245" width="230" height="90" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
            <text x="800" y="265" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">Notifications & Automation</text>
            <text x="700" y="288" font-size="8.5" fill="#334155">⚡ GitHub Actions (0 */4 * * * cron)</text>
            <text x="700" y="308" font-size="8.5" fill="#334155">✉️ Brevo API (Transactional Email)</text>
            <text x="700" y="328" font-size="8.5" fill="#334155">📱 Telegram Bot API (Push Alerts)</text>

            <!-- Python Worker -->
            <rect x="685" y="350" width="230" height="95" rx="6" fill="#f5f3ff" stroke="#ddd6fe"/>
            <text x="800" y="370" font-size="10" font-weight="bold" fill="#6d28d9" text-anchor="middle">Python Worker (FastAPI:8000)</text>
            <text x="700" y="392" font-size="8" fill="#5b21b6">• /health & /extract endpoints</text>
            <text x="700" y="410" font-size="8" fill="#5b21b6">• Strict SSRF Domain Allowlist</text>
            <text x="700" y="428" font-size="8" fill="#5b21b6">• Post-Redirect URL Validation</text>

            <!-- Render Cloud -->
            <rect x="685" y="460" width="230" height="65" rx="6" fill="#f1f5f9" stroke="#94a3b8"/>
            <text x="800" y="480" font-size="9.5" font-weight="bold" fill="#0f172a" text-anchor="middle">Render Cloud Hosting</text>
            <text x="800" y="497" font-size="8" fill="#64748b" text-anchor="middle">Web Service (API) & Static Site (Web)</text>
            <text x="800" y="512" font-size="7.5" fill="#0f766e" text-anchor="middle">Auto Pre-Flight Wakeup Probes</text>

            <!-- Connecting Arrows -->
            <!-- Client to Server -->
            <line x1="225" y1="245" x2="280" y2="100" stroke="#0284c7" stroke-width="2" marker-end="url(#arrowBlue)"/>
            <text x="250" y="180" font-size="7.5" fill="#0284c7" font-weight="bold" transform="rotate(-30, 250, 180)">REST / JSON + JWT</text>

            <!-- Server to DB -->
            <line x1="625" y1="175" x2="680" y2="140" stroke="#166534" stroke-width="2" marker-end="url(#arrow)"/>
            <text x="650" y="150" font-size="7.5" fill="#166534" font-weight="bold">BSON</text>

            <!-- Server to Worker -->
            <line x1="570" y1="500" x2="680" y2="400" stroke="#7c3aed" stroke-width="2" marker-end="url(#arrowPurple)"/>
            <text x="615" y="460" font-size="7.5" fill="#7c3aed" font-weight="bold">HTTP:8000</text>

            <!-- GitHub Actions to Server -->
            <line x1="685" y1="285" x2="625" y2="105" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arrow)"/>
            <text x="660" y="215" font-size="7" fill="#475569" font-weight="bold">Cron POST</text>
        </svg>
        <div class="diagram-caption">Figure 4.1: High-Level Component & Communication Architecture</div>
    </div>

    <h2>4.2 The Complete Backend Request Lifecycle</h2>
    <p>
        To understand how data flows through the backend, consider a user creating a new price alert. The following sequence traces every layer from the moment the user clicks "Save Alert" until the record is committed to MongoDB Atlas:
    </p>

    <div class="callout callout-arch">
        <div class="callout-title">The 8-Stage Backend Execution Lifecycle</div>
        <p>
            <code>React Component → Axios Client → Express Route → Middleware Pipeline → Controller → Service Layer → Mongoose Model → MongoDB Atlas</code>
        </p>
    </div>

    <ol>
        <li>
            <strong>Stage 1: React Component Form Submission (<code>AlertFormPage.jsx</code>)</strong><br>
            The user inputs a target price of ₹45,000 for an iPhone 15 offer and clicks "Create Alert". The React component calls the utility <code>rupeesToPaise(45000)</code>, producing the integer <code>4500000</code>. It dispatches a call to <code>api.createAlert({ offerId, type: 'target_price', targetPriceInPaise: 4500000, channels: ['email'] })</code>.
        </li>
        <li>
            <strong>Stage 2: Axios HTTP Client & Interceptor (<code>client/src/services/api.js</code>)</strong><br>
            The Axios request interceptor reads <code>localStorage.getItem('priceradar_token')</code>. It attaches the header <code>Authorization: Bearer &lt;jwt_token&gt;</code> and issues an HTTP <code>POST https://priceradar-api-02ib.onrender.com/api/alerts</code> with the JSON payload.
        </li>
        <li>
            <strong>Stage 3: Express Router Matching (<code>server/src/routes/alerts.js</code>)</strong><br>
            The incoming HTTP POST matches the route definition:
            <pre><code>router.post('/', requireAuth, [body('offerId').isMongoId(), ...], validate, createAlert);</code></pre>
            Express registers this request and begins traversing the middleware pipeline.
        </li>
        <li>
            <strong>Stage 4: Middleware Pipeline Execution (<code>middleware/auth.js</code> & <code>validate.js</code>)</strong><br>
            First, <code>requireAuth</code> extracts the Bearer token, verifies its signature using <code>jwt.verify(token, JWT_SECRET)</code>, and attaches the decoded payload to <code>req.user = { id: 'usr_123', role: 'user' }</code>. Next, <code>express-validator</code> verifies that <code>offerId</code> is a valid MongoDB ObjectId, <code>type</code> is either <code>target_price</code> or <code>fixed_drop</code>, and <code>targetPriceInPaise</code> is a positive integer. If validation succeeds, <code>next()</code> passes control to the controller.
        </li>
        <li>
            <strong>Stage 5: Controller Unpacking (<code>controllers/alertsController.js</code>)</strong><br>
            The <code>createAlert</code> controller extracts sanitized fields:
            <pre><code>const { offerId, type, targetPriceInPaise, channels } = req.body;
const userId = req.user.id;</code></pre>
            The controller verifies that the target <code>Offer</code> exists in the database.
        </li>
        <li>
            <strong>Stage 6: Service / Business Logic Coordination</strong><br>
            The controller checks if an existing alert already exists for this <code>(userId, offerId)</code> pair to prevent redundant alert entries. If a fixed-drop alert were requested, the system would call <code>priceComparison.js</code> to look up the current baseline price before arming.
        </li>
        <li>
            <strong>Stage 7: Mongoose Model Validation (<code>models/Alert.js</code>)</strong><br>
            The controller instantiates a new document: <code>new Alert({ userId, offerId, type, targetPriceInPaise, channels, status: 'active', armed: true })</code>. Mongoose executes schema validators:
            <ul>
                <li>Ensures <code>targetPriceInPaise</code> is strictly an integer.</li>
                <li>Ensures <code>channels</code> contains at least one of <code>['email', 'telegram']</code>.</li>
            </ul>
        </li>
        <li>
            <strong>Stage 8: MongoDB Atlas Persistence & Response</strong><br>
            Mongoose executes an <code>INSERT</code> operation into the <code>alerts</code> collection in MongoDB Atlas. MongoDB generates an <code>_id</code> and records <code>createdAt</code> and <code>updatedAt</code> timestamps. The controller returns HTTP 201 Created with JSON:
            <pre><code>res.status(201).json({ success: true, data: newAlert });</code></pre>
            Back in the browser, Axios unwraps <code>response.data.data</code>, and React displays a confirmation toast: <em>"Alert successfully created!"</em>.
        </li>
    </ol>

    <h2>4.3 Frontend Application Architecture</h2>
    <p>
        The client-side architecture is organized around unidirectional data flow and strict route protection:
    </p>

    <ul>
        <li>
            <strong>Bootstrap Entrypoint (<code>main.jsx</code>):</strong> Uses <code>ReactDOM.createRoot()</code> to mount the application. Wraps the tree in <code>&lt;BrowserRouter&gt;</code> and <code>&lt;AuthProvider&gt;</code>, ensuring global routing and auth state are available to every nested component.
        </li>
        <li>
            <strong>Layout & Routing (<code>App.jsx</code>):</strong> Hosts the top-level <code>&lt;Navbar&gt;</code> and <code>&lt;Footer&gt;</code>. Wraps the interior page routing inside an <code>&lt;ErrorBoundary&gt;</code> so unexpected JavaScript rendering errors show a helpful fallback rather than a blank white screen.
        </li>
        <li>
            <strong>Route Protection (<code>ProtectedRoute.jsx</code>):</strong> Checks <code>const { user, loading } = useAuth()</code>. While auth is loading from localStorage, it displays a loading spinner. If loading finishes and <code>user</code> is null, it immediately redirects the browser to <code>/login</code> while preserving the attempted destination in <code>location.state</code>.
        </li>
        <li>
            <strong>Axios Response Unwrapping:</strong> Rather than forcing every page to write <code>res.data.data</code>, our API layer implements a centralized unwrapper helper:
            <pre><code>function unwrap(responsePromise) {
  return responsePromise.then((res) => res.data.data);
}</code></pre>
            This ensures React components receive raw, clean domain data objects directly.
        </li>
    </ul>
</div>
"""
