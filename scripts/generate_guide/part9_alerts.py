# scripts/generate_guide/part9_alerts.py

def get_part9_html():
    return """
<div class="chapter-container page-break" id="part-9">
    <h1>Part 9: Alerts Evaluation & Notification Dispatch</h1>
    <p>
        PriceRadar implements an intelligent, stateful alert evaluation pipeline designed to prevent duplicate notification spam while supporting multi-channel delivery across Email and Telegram.
    </p>

    <h2>9.1 Alert Types & Mathematical Conditions</h2>
    <p>
        Users can configure two distinct types of price alerts:
    </p>

    <h3>1. Target-Price Alert (<code>type: 'target_price'</code>)</h3>
    <ul>
        <li><strong>User Intent:</strong> <em>"Notify me when this MacBook Air drops to ₹75,000 or below."</em></li>
        <li><strong>Mathematical Condition (in paise):</strong>
            <pre><code>conditionMet = currentPriceInPaise <= alert.targetPriceInPaise;</code></pre>
        </li>
        <li><strong>Evaluation Logic:</strong> Evaluated purely on the latest observed price. If current price is ₹74,990, the condition evaluates to true.</li>
    </ul>

    <h3>2. Fixed-Drop Alert (<code>type: 'fixed_drop'</code>)</h3>
    <ul>
        <li><strong>User Intent:</strong> <em>"Notify me if this camera drops by ₹3,000 from today's price."</em></li>
        <li><strong>Baseline Price Semantics:</strong> When a fixed-drop alert is created, the system records the current price as <code>baselinePriceInPaise</code>. If missing, it falls back to <code>previousPriceInPaise</code>.</li>
        <li><strong>Mathematical Condition (in paise):</strong>
            <pre><code>const referencePrice = alert.baselinePriceInPaise || previousPriceInPaise;
const priceDrop = referencePrice - currentPriceInPaise;
conditionMet = priceDrop >= alert.dropAmountInPaise;</code></pre>
        </li>
    </ul>

    <h2>9.2 The Stateful Alert Lifecycle Diagram</h2>
    <div class="diagram-box">
        <svg viewBox="0 0 880 200" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, sans-serif;">
            <defs>
                <marker id="alArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#0f766e"/>
                </marker>
                <marker id="alGreen" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#16a34a"/>
                </marker>
                <marker id="alRed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#dc2626"/>
                </marker>
            </defs>

            <!-- State 1 -->
            <rect x="20" y="40" width="140" height="90" rx="8" fill="#f0f9ff" stroke="#0284c7" stroke-width="2"/>
            <text x="90" y="70" font-size="11" font-weight="bold" fill="#0369a1" text-anchor="middle">1. Alert Created</text>
            <text x="90" y="92" font-size="8.5" fill="#475569" text-anchor="middle">status: 'active'</text>
            <text x="90" y="108" font-size="8.5" fill="#16a34a" text-anchor="middle">armed: true</text>

            <line x1="160" y1="85" x2="200" y2="85" stroke="#0f766e" stroke-width="2" marker-end="url(#alArrow)"/>

            <!-- State 2 -->
            <rect x="210" y="40" width="160" height="90" rx="8" fill="#f0fdfa" stroke="#0f766e" stroke-width="2"/>
            <text x="290" y="70" font-size="11" font-weight="bold" fill="#0f766e" text-anchor="middle">2. Price Monitor</text>
            <text x="290" y="92" font-size="8.5" fill="#475569" text-anchor="middle">Fetches Fresh Price</text>
            <text x="290" y="108" font-size="8.5" fill="#0f766e" text-anchor="middle">Calls evaluateAlert()</text>

            <!-- Condition Branches -->
            <line x1="370" y1="85" x2="420" y2="85" stroke="#0f766e" stroke-width="2" marker-end="url(#alArrow)"/>

            <!-- State 3 -->
            <rect x="430" y="40" width="180" height="90" rx="8" fill="#fefce8" stroke="#ca8a04" stroke-width="2"/>
            <text x="520" y="65" font-size="10.5" font-weight="bold" fill="#854d0e" text-anchor="middle">3. Condition Met?</text>
            <text x="520" y="85" font-size="8" fill="#475569" text-anchor="middle">target &lt;= price & armed?</text>
            <text x="520" y="102" font-size="8" fill="#16a34a" text-anchor="middle">YES: Dispatches Alert</text>
            <text x="520" y="118" font-size="8" fill="#dc2626" text-anchor="middle">NO: Remains Armed</text>

            <line x1="610" y1="85" x2="660" y2="85" stroke="#16a34a" stroke-width="2" marker-end="url(#alGreen)"/>

            <!-- State 4 -->
            <rect x="670" y="40" width="180" height="90" rx="8" fill="#fdf2f8" stroke="#db2777" stroke-width="2"/>
            <text x="760" y="65" font-size="10.5" font-weight="bold" fill="#9d174d" text-anchor="middle">4. Disarmed State</text>
            <text x="760" y="85" font-size="8" fill="#475569" text-anchor="middle">armed = false</text>
            <text x="760" y="102" font-size="8" fill="#0284c7" text-anchor="middle">No duplicate emails sent</text>
            <text x="760" y="118" font-size="8" fill="#64748b" text-anchor="middle">Re-arms when price rises</text>

            <!-- Re-arming loop back -->
            <path d="M 760 130 C 760 180, 290 180, 290 135" fill="none" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#alArrow)"/>
            <text x="525" y="175" font-size="8" fill="#0284c7" font-weight="bold" text-anchor="middle">Re-arming: Condition becomes FALSE → armed resets to true</text>
        </svg>
        <div class="diagram-caption">Figure 9.1: Stateful Alert Armed Transition Lifecycle</div>
    </div>

    <h2>9.3 Multi-Channel Notification Dispatchers</h2>

    <h3>A. Brevo Transactional Email Service (<code>services/notifications/email.js</code>)</h3>
    <ul>
        <li>Uses Brevo's REST API over HTTPS (<code>POST https://api.brevo.com/v3/smtp/email</code>).</li>
        <li>Generates a responsive HTML email containing the product image, drop amount, current price in INR, and a direct "Buy on Retailer" button.</li>
        <li>Bypasses cloud provider port-25 SMTP blocking.</li>
    </ul>

    <h3>B. Telegram Bot API (<code>services/notifications/telegram.js</code>)</h3>
    <ul>
        <li>Uses Telegram Bot HTTPS API (<code>POST https://api.telegram.org/bot&lt;token&gt;/sendMessage</code>).</li>
        <li>Sends rich Markdown messages directly to the user's mobile device via <code>telegramChatId</code>.</li>
        <li>Delivers instant notifications with near-zero latency and 0 SMS billing costs.</li>
    </ul>

    <h2>9.4 Independent Safety: Deduplication Keys (<code>dedupeKey</code>)</h2>
    <p>
        In addition to the in-memory <code>armed</code> flag, PriceRadar enforces an immutable database-level safety net inside <code>NotificationEvent</code>:
    </p>
    <pre><code>// server/src/models/NotificationEvent.js
notificationEventSchema.index({ dedupeKey: 1 }, { unique: true });</code></pre>
    <p>
        The deduplication key is constructed as:
    </p>
    <pre><code>const dedupeKey = `${alertId}:${currentPriceInPaise}`;</code></pre>
    <p>
        Even if an asynchronous race condition caused the notification dispatcher to fire twice for the same alert during the same cycle, MongoDB's unique index on <code>dedupeKey</code> causes the second insert to throw a duplicate key error (code 11000), physically preventing double-sending to the user.
    </p>

    <h2>9.5 Partial Delivery & Retry Semantics</h2>
    <p>
        If an alert is configured for both <strong>Email</strong> and <strong>Telegram</strong>, the dispatcher attempts both independently:
    </p>
    <ul>
        <li>If <strong>Email succeeds</strong> but <strong>Telegram fails</strong> (e.g. Telegram API timed out):
            <br>The system records Email as <code>status: 'sent'</code> and Telegram as <code>status: 'failed'</code> with the exact error message.
            <br>The email is <em>not</em> rolled back.
        </li>
        <li><strong>Retry Semantics:</strong> PriceRadar does <em>not</em> implement an unbounded automatic retry loop on notification delivery failures. Doing so could result in alert storms or getting IP-banned by Brevo or Telegram. Instead, the failure is logged in the <code>NotificationEvent</code> audit trail, and the alert remains eligible for evaluation during the next 4-hour cycle.</li>
    </ul>
</div>
"""
