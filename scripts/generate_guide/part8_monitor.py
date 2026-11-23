# scripts/generate_guide/part8_monitor.py

def get_part8_html():
    return """
<div class="chapter-container page-break" id="part-8">
    <h1>Part 8: Automated Price Monitoring Engine</h1>
    <p>
        The four-hour automated price monitoring architecture is the core engineering highlight of PriceRadar. It solves cloud cold starts, distributed race conditions, multi-tenant duplicate fetching, and transient network errors.
    </p>

    <h2>8.1 What Starts the Monitoring Process (GitHub Actions Cron)</h2>
    <p>
        Free-tier cloud hosting platforms (such as Render) spin down container instances after 15 minutes of inactivity. An internal timer running inside a sleeping server stops ticking. Therefore, PriceRadar utilizes <strong>GitHub Actions</strong> as an external, highly reliable orchestration chronometer.
    </p>

    <div class="callout callout-arch">
        <div class="callout-title">The Cron Schedule Expression: <code>0 */4 * * *</code></div>
        <pre><code>┌───────────── Minute (0: at the top of the hour)
│ ┌─────────── Hour (*/4: every 4 hours: 00, 04, 08, 12, 16, 20)
│ │ ┌───────── Day of month (*: every day)
│ │ │ ┌─────── Month (*: every month)
│ │ │ │ ┌───── Day of week (*: every day of the week)
│ │ │ │ │
0 */4 * * *</code></pre>
    </div>

    <h3>UTC to India Standard Time (IST = UTC + 5:30) Conversion</h3>
    <table>
        <thead>
            <tr>
                <th style="width: 25%;">Execution Run</th>
                <th style="width: 35%;">Coordinated Universal Time (UTC)</th>
                <th style="width: 40%;">India Standard Time (IST)</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Run 1 (Early Morning)</td><td>00:00 UTC</td><td>05:30 AM IST</td></tr>
            <tr><td>Run 2 (Morning Work)</td><td>04:00 UTC</td><td>09:30 AM IST</td></tr>
            <tr><td>Run 3 (Afternoon Lunch)</td><td>08:00 UTC</td><td>01:30 PM IST</td></tr>
            <tr><td>Run 4 (Evening Prime)</td><td>12:00 UTC</td><td>05:30 PM IST</td></tr>
            <tr><td>Run 5 (Night Peak)</td><td>16:00 UTC</td><td>09:30 PM IST</td></tr>
            <tr><td>Run 6 (Late Night)</td><td>20:00 UTC</td><td>01:30 AM IST</td></tr>
        </tbody>
    </table>

    <p>
        <strong>Manual Execution via <code>workflow_dispatch</code>:</strong> The workflow file also includes <code>workflow_dispatch:</code>, allowing developers and evaluators to trigger a live price refresh at any time directly from the GitHub Actions web dashboard.
    </p>

    <h2>8.2 Connecting GitHub Actions to the Cloud Backend</h2>
    <p>
        The workflow executes on an ephemeral <code>ubuntu-latest</code> runner. It connects to the Render backend using repository secrets without hardcoding URLs or tokens:
    </p>

    <div class="diagram-box">
        <svg viewBox="0 0 880 180" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, sans-serif;">
            <defs>
                <marker id="mArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#0f766e"/>
                </marker>
            </defs>

            <!-- Step 1 -->
            <rect x="20" y="30" width="180" height="110" rx="6" fill="#f8fafc" stroke="#64748b" stroke-width="1.5"/>
            <text x="110" y="55" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">1. GitHub Actions</text>
            <text x="110" y="75" font-size="8" fill="#475569" text-anchor="middle">Cron: 0 */4 * * *</text>
            <text x="110" y="93" font-size="8" fill="#475569" text-anchor="middle">Reads Secrets:</text>
            <text x="110" y="110" font-size="7.5" fill="#0284c7" text-anchor="middle">BACKEND_URL & SECRET</text>

            <line x1="200" y1="85" x2="235" y2="85" stroke="#0f766e" stroke-width="2" marker-end="url(#mArrow)"/>

            <!-- Step 2 -->
            <rect x="245" y="30" width="180" height="110" rx="6" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.5"/>
            <text x="335" y="55" font-size="10" font-weight="bold" fill="#0369a1" text-anchor="middle">2. Pre-Flight Wakeup</text>
            <text x="335" y="75" font-size="8" fill="#0369a1" text-anchor="middle">GET /api/health</text>
            <text x="335" y="93" font-size="8" fill="#475569" text-anchor="middle">Wakes Sleeping Render</text>
            <text x="335" y="110" font-size="7.5" fill="#16a34a" text-anchor="middle">Retries: 6 (Delay: 5s)</text>

            <line x1="425" y1="85" x2="460" y2="85" stroke="#0f766e" stroke-width="2" marker-end="url(#mArrow)"/>

            <!-- Step 3 -->
            <rect x="470" y="30" width="180" height="110" rx="6" fill="#f0fdfa" stroke="#0f766e" stroke-width="1.5"/>
            <text x="560" y="55" font-size="10" font-weight="bold" fill="#0f766e" text-anchor="middle">3. Trigger Monitor</text>
            <text x="560" y="75" font-size="8" fill="#0f766e" text-anchor="middle">POST /api/monitor/run</text>
            <text x="560" y="93" font-size="8" fill="#475569" text-anchor="middle">X-Monitor-Secret Header</text>
            <text x="560" y="110" font-size="7.5" fill="#0284c7" text-anchor="middle">Returns HTTP 202 Accepted</text>

            <line x1="650" y1="85" x2="685" y2="85" stroke="#0f766e" stroke-width="2" marker-end="url(#mArrow)"/>

            <!-- Step 4 -->
            <rect x="695" y="30" width="170" height="110" rx="6" fill="#fdf2f8" stroke="#db2777" stroke-width="1.5"/>
            <text x="780" y="55" font-size="10" font-weight="bold" fill="#831843" text-anchor="middle">4. Status Polling</text>
            <text x="780" y="75" font-size="8" fill="#831843" text-anchor="middle">GET /api/monitor/status</text>
            <text x="780" y="93" font-size="8" fill="#475569" text-anchor="middle">Polls Every 10 Seconds</text>
            <text x="780" y="110" font-size="7.5" fill="#16a34a" text-anchor="middle">Exits on Completed/Failed</text>
        </svg>
        <div class="diagram-caption">Figure 8.1: GitHub Actions Orchestration Sequence</div>
    </div>

    <h2>8.3 Asynchronous Execution & HTTP 202 Accepted Pattern</h2>
    <p>
        Fetching prices from 10 different retail providers over external networks takes between 15 and 90 seconds. If Express held the initial HTTP connection open for that entire duration:
    </p>
    <ul>
        <li>Network proxies, firewalls, and cloud load balancers could terminate the connection with an HTTP 504 Gateway Timeout.</li>
        <li>GitHub Actions would remain blocked on a single synchronous socket.</li>
    </ul>

    <p>
        <strong>The Solution (Asynchronous Decoupling):</strong><br>
        When Express receives <code>POST /api/monitor/run</code>, it validates the secret, creates a <code>MonitorRun</code> record with <code>status: 'running'</code>, spawns the monitoring logic asynchronously in the background, and <strong>immediately returns HTTP 202 Accepted</strong>:
    </p>
    <pre><code>res.status(202).json({
  success: true,
  message: 'Price monitoring cycle accepted and started in background.',
  data: { runId: newRun._id, status: 'running', startedAt: newRun.startedAt }
});</code></pre>

    <p>
        GitHub Actions receives the <code>runId</code> and enters a non-blocking polling loop: it calls <code>GET /api/monitor/status</code> every 10 seconds. When the backend marks the run <code>completed</code> or <code>failed</code>, GitHub prints the metrics summary and exits with code 0 (success) or code 1 (failure).
    </p>

    <h2>8.4 The 17-Step Monitoring Lifecycle</h2>
    <p>
        The complete monitoring execution inside <code>server/src/services/priceMonitor.js</code> follows 17 deterministic steps:
    </p>

    <ol>
        <li><strong>Trigger Ingestion:</strong> Route <code>POST /api/monitor/run</code> receives trigger with <code>X-Monitor-Secret</code> header.</li>
        <li><strong>Secret Authentication:</strong> <code>monitorController.js</code> compares header with <code>process.env.MONITOR_TRIGGER_SECRET</code>. Rejects unauthorized calls with HTTP 401.</li>
        <li><strong>Local In-Memory Mutex Check:</strong> Inspects <code>monitorState.isRunning</code>. If true, immediately rejects with HTTP 409 Conflict (cycle already running).</li>
        <li><strong>Distributed Mutex Lock Acquisition:</strong> Executes atomic MongoDB <code>findOneAndUpdate</code> on <code>MonitorLock</code> (singleton ID <code>'monitoring_cycle_lock'</code>). Ensures only one server instance worldwide runs the cycle.</li>
        <li><strong>Stale Run Reconciliation:</strong> If a prior run crashed during server restart and left the lock held, the system checks <code>heartbeatAt</code>. If older than 15 minutes, it breaks the stale lock and marks the dead run <code>interrupted</code>.</li>
        <li><strong>MonitorRun Initialization:</strong> Creates an audit record in <code>MonitorRun</code> collection with <code>status: 'running'</code>.</li>
        <li><strong>Active Alerts Retrieval:</strong> Queries <code>Alert.find({ status: 'active' }).select('offerId')</code>.</li>
        <li><strong>Distinct Offer ID Deduplication:</strong> Extracts unique offer IDs: <code>const distinctOfferIds = [...new Set(activeAlerts.map(a => a.offerId.toString()))]</code>.</li>
        <li><strong>Sequential Offer Traversal:</strong> Iterates through unique offers to fetch prices.</li>
        <li><strong>Provider Dispatcher Invocation:</strong> Calls <code>providerDispatcher.fetchOffer(offer)</code> in <code>server/src/providers/index.js</code>.</li>
        <li><strong>PriceObservation Persistence:</strong> Saves a new <code>PriceObservation</code> document with the fresh price and status.</li>
        <li><strong>Offer Record Update:</strong> Updates <code>Offer</code> document with <code>priceInPaise</code>, <code>lastFetchedAt: now</code>, and <code>lastStatus: 'ok'</code>.</li>
        <li><strong>Dependent Alert Evaluation:</strong> For each alert listening to this updated offer, calls <code>evaluateAlert(alert, currentPriceInPaise, previousPriceInPaise)</code> in <code>alertEvaluator.js</code>.</li>
        <li><strong>Multi-Channel Notification Dispatch:</strong> If <code>shouldNotify === true</code>, calls <code>dispatchAlertNotifications()</code> to send Brevo emails and Telegram push messages.</li>
        <li><strong>Alert State Transition:</strong> Sets <code>alert.armed = false</code> to suppress duplicate notifications during subsequent cycles.</li>
        <li><strong>Finalizing Run Metrics:</strong> Updates <code>MonitorRun</code> with <code>status: 'completed'</code>, <code>offersSuccessful</code>, <code>offersFailed</code>, and <code>durationMs</code>.</li>
        <li><strong>Lock Release in Finally Block:</strong> The <code>finally</code> block resets <code>monitorState.isRunning = false</code> and sets <code>MonitorLock.isLocked = false</code>, unlocking the engine for the next 4-hour cycle.</li>
    </ol>

    <h2>8.5 Multi-Retailer Provider Dispatcher Architecture</h2>
    <p>
        The dispatcher in <code>server/src/providers/index.js</code> acts as a polymorphic router:
    </p>

    <table>
        <thead>
            <tr>
                <th style="width: 15%;">Provider</th>
                <th style="width: 25%;">Adapter File</th>
                <th style="width: 35%;">Mechanism & Credentials</th>
                <th style="width: 25%;">Classification</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Apify</strong></td>
                <td><code>providers/apify.js</code></td>
                <td>Calls Apify Cloud Actor REST API using <code>APIFY_API_TOKEN</code> to extract live Amazon, Flipkart & Meesho prices.</td>
                <td><span class="badge badge-live">Live Cloud</span></td>
            </tr>
            <tr>
                <td><strong>eBay</strong></td>
                <td><code>providers/ebay.js</code></td>
                <td>Queries official eBay Browse REST API via OAuth 2.0 client credentials (<code>EBAY_APP_ID</code>, <code>EBAY_CERT_ID</code>).</td>
                <td><span class="badge badge-live">Live REST API</span></td>
            </tr>
            <tr>
                <td><strong>Scrapling</strong></td>
                <td><code>providers/scrapling.js</code></td>
                <td>Issues local HTTP request to Python FastAPI worker (<code>http://127.0.0.1:8000/extract</code>) with SSRF checks.</td>
                <td><span class="badge badge-live">Live Microservice</span></td>
            </tr>
            <tr>
                <td><strong>DummyJSON</strong></td>
                <td><code>providers/dummyjson.js</code></td>
                <td>Fetches real-time JSON catalog from public public testing API (<code>https://dummyjson.com/products</code>).</td>
                <td><span class="badge badge-live">Live Test Catalog</span></td>
            </tr>
            <tr>
                <td><strong>MockShop</strong></td>
                <td><code>providers/mockshop.js</code></td>
                <td>Queries GraphQL endpoint (<code>https://mock.shop/api</code>) for synthetic product listings.</td>
                <td><span class="badge badge-live">Live GraphQL</span></td>
            </tr>
            <tr>
                <td><strong>Fixture</strong></td>
                <td><code>providers/fixture.js</code></td>
                <td>Offline JSON fixture dataset (<code>fixtureData.json</code>) used for deterministic unit testing.</td>
                <td><span class="badge badge-sample">Sample Fixture</span></td>
            </tr>
            <tr>
                <td><strong>Amazon Direct</strong></td>
                <td><code>providers/amazon.js</code></td>
                <td>Refuses direct web scraping to comply with Terms of Service; routes sample offers to fixture and live offers to Apify.</td>
                <td><span class="badge badge-sample">Ethical Fallback</span></td>
            </tr>
            <tr>
                <td><strong>Flipkart Direct</strong></td>
                <td><code>providers/flipkart.js</code></td>
                <td>Direct affiliate scraper unconfigured; routes sample listings to fixture and live listings to Apify.</td>
                <td><span class="badge badge-sample">Ethical Fallback</span></td>
            </tr>
        </tbody>
    </table>

    <h2>8.6 Practical Scenario: Price Tracking & Alert Re-Arming</h2>
    <p>
        Consider this step-by-step example across 4 monitoring cycles for an iPhone 15:
    </p>
    <ul>
        <li><strong>Initial State:</strong> Product Price = ₹50,000 (<code>5000000</code> paise). User sets Target Price = ₹45,000 (<code>4500000</code> paise). <code>alert.armed = true</code>.</li>
        <li><strong>Cycle 1 (4 hours later):</strong> Fetched Price = ₹48,000.
            <br><em>Evaluation:</em> <code>4800000 &lt;= 4500000</code> is <strong>FALSE</strong>. No notification is sent. Alert remains <code>armed: true</code>.</li>
        <li><strong>Cycle 2 (8 hours later):</strong> Price drops to ₹44,000.
            <br><em>Evaluation:</em> <code>4400000 &lt;= 4500000</code> is <strong>TRUE</strong>. Since <code>armed === true</code>, <strong>Alert Triggers!</strong>
            <br><em>Notification:</em> Email & Telegram alerts dispatched.
            <br><em>State Transition:</em> System sets <code>alert.armed = false</code>.</li>
        <li><strong>Cycle 3 (12 hours later):</strong> Price stays at ₹44,000.
            <br><em>Evaluation:</em> Condition is still TRUE, but <code>armed === false</code>! <strong>Duplicate notification suppressed!</strong> The user is not spammed.</li>
        <li><strong>Cycle 4 (16 hours later):</strong> Deal ends; price rises to ₹47,000.
            <br><em>Evaluation:</em> <code>4700000 &lt;= 4500000</code> is FALSE. Since condition is no longer met and alert was disarmed:
            <br><strong>The Alert Automatically Re-Arms (<code>armed = true</code>)!</strong> When the price drops again in the future, the user will receive a new alert.</li>
    </ul>

    <h2>8.7 Distinct Offer ID Logic (Consolidated Fetching)</h2>
    <p>
        Suppose 500 different users have alerts for the exact same Apple iPhone 15 listing on Flipkart.
    </p>
    <div class="callout callout-tip">
        <div class="callout-title">The Distinct Offer Deduplication Optimization</div>
        <p>
            A naive system would fetch Flipkart's web page 500 times. PriceRadar groups alerts by distinct <code>offerId</code>:
        </p>
        <pre><code>const distinctOfferIds = [...new Set(activeAlerts.map(a => a.offerId.toString()))];</code></pre>
        <p>
            PriceRadar fetches the price from Flipkart <strong>exactly ONCE</strong>. It saves the price observation and evaluates all 500 user alerts in memory using that single observation. This reduces external network bandwidth and API consumption by over 99%!
        </p>
    </div>

    <h2>8.8 Distributed Mutex Locking (MongoDB MonitorLock)</h2>
    <p>
        To prevent two monitoring cycles from executing simultaneously (which could cause race conditions, duplicate emails, and double database writes), PriceRadar uses a <strong>dual-locking mechanism</strong>:
    </p>
    <ol>
        <li><strong>Local In-Memory Mutex:</strong> Fast synchronous boolean (<code>monitorState.isRunning</code>) that blocks concurrent triggers inside the same Node.js process.</li>
        <li><strong>Distributed MongoDB Lease (<code>MonitorLock</code>):</strong> An atomic document in MongoDB:
            <pre><code>let lock = await MonitorLock.findOneAndUpdate(
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
);</code></pre>
            If another server instance is already running, <code>lock</code> returns null, and the incoming cycle safely aborts.
        </li>
    </ol>

    <h2>8.9 Both Scheduling Mechanisms (External Cron vs Internal Timer)</h2>
    <p>
        PriceRadar implements <strong>two independent schedulers</strong>:
    </p>
    <ul>
        <li><strong>1. GitHub Actions Workflow (<code>monitor.yml</code>):</strong> Primary orchestrator. Operates externally and wakes sleeping cloud containers.</li>
        <li><strong>2. Backend In-Process Scheduler (<code>services/scheduler.js</code>):</strong> Secondary fallback. Uses Node's native <code>setInterval</code> (every 4 hours) when running on dedicated always-on servers (or local development).</li>
    </ul>
    <p>
        <strong>How they coexist safely:</strong> Because both schedulers pass through the atomic <code>MonitorLock</code> distributed lease, they can never run concurrently. If GitHub Actions fires at 04:00 UTC and the internal timer triggers at 04:00 UTC, only one will acquire the lease; the other will log a warning and safely skip execution.
    </p>

    <h2>8.10 Monitoring Failure Handling Matrix</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 25%;">Failure Scenario</th>
                <th style="width: 35%;">System Reaction</th>
                <th style="width: 40%;">Resolution & Safeguard</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Render Server Sleeping</strong></td>
                <td>Initial curl request takes 45 seconds to wake container.</td>
                <td>GitHub Actions sends pre-flight ping to <code>/api/health</code> with 6 retries and 5s delay before triggering monitor.</td>
            </tr>
            <tr>
                <td><strong>Database Disconnected</strong></td>
                <td>Fast-fail middleware catches disconnected state.</td>
                <td>Returns HTTP 503 Service Unavailable immediately instead of hanging on 30-second timeouts.</td>
            </tr>
            <tr>
                <td><strong>External Retailer API Down</strong></td>
                <td>Provider returns HTTP 500 or timeout.</td>
                <td>Cycle records failure in <code>PriceObservation</code>, skips that single offer, and proceeds to the next offer without crashing.</td>
            </tr>
            <tr>
                <td><strong>Server Crashes Mid-Cycle</strong></td>
                <td>Node.js process terminates abruptly; lock left active.</td>
                <td>Next cycle detects <code>heartbeatAt</code> older than 15 minutes, breaks the stale lease, marks old run <code>interrupted</code>, and starts cleanly.</td>
            </tr>
            <tr>
                <td><strong>Telegram API Times Out</strong></td>
                <td>Telegram network call fails after email sent.</td>
                <td>System records email as <code>sent</code> and Telegram as <code>failed</code> in <code>NotificationEvent</code>; partial delivery audit is preserved.</td>
            </tr>
        </tbody>
    </table>
</div>
"""
