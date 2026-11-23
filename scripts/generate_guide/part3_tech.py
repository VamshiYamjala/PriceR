# scripts/generate_guide/part3_tech.py

def get_part3_html():
    return """
<div class="chapter-container page-break" id="part-3">
    <h1>Part 3: Technology Stack Deep Dive</h1>
    <p>
        Every technology in PriceRadar was chosen to satisfy specific engineering requirements: financial precision, resilience against cold starts, responsive rendering, and decoupled multi-retailer ingestion.
    </p>

    <h2>3.1 Client-Side Technologies</h2>

    <h3>1. React 18 (v18.3.1)</h3>
    <ul>
        <li><strong>What it is:</strong> A component-based JavaScript library for building dynamic, reactive user interfaces via a Virtual DOM.</li>
        <li><strong>Why we use it:</strong> Provides automatic, lightning-fast DOM updates whenever price data, search filters, or alert statuses change, without full browser reloads.</li>
        <li><strong>Where used & Files:</strong> The entire frontend client; <code>client/src/main.jsx</code>, <code>client/src/App.jsx</code>, and all components/pages.</li>
        <li><strong>Real-World Example:</strong> When a user clicks "Add to Watchlist", only that specific heart button changes state and color instantly, while the rest of the product catalog stays untouched.</li>
        <li><strong>What if omitted:</strong> We would have to manually manipulate the DOM using vanilla JavaScript (<code>document.getElementById</code>, <code>innerHTML</code>), leading to fragile, bug-ridden UI code.</li>
    </ul>

    <h3>2. React Router DOM (v6.24.1)</h3>
    <ul>
        <li><strong>What it is:</strong> Standard client-side routing library for React single-page applications.</li>
        <li><strong>Why we use it:</strong> Enables seamless multi-page navigation (e.g. from <code>/search</code> to <code>/dashboard</code>) without triggering round-trip HTML requests to the web server.</li>
        <li><strong>Where used & Files:</strong> <code>client/src/App.jsx</code>, <code>client/src/components/ProtectedRoute.jsx</code>, and <code>client/src/components/Navbar.jsx</code>.</li>
        <li><strong>Real-World Example:</strong> Navigating between Search, Watchlist, and Alerts feels instantaneous because only the interior page view swaps out while the Navbar and audio/visual states persist.</li>
        <li><strong>What if omitted:</strong> The browser would refresh the whole window on every link click, destroying client-side state and producing noticeable screen flicker.</li>
    </ul>

    <h3>3. Bootstrap 5 (v5.3.3 CDN)</h3>
    <ul>
        <li><strong>What it is:</strong> A popular, mobile-first CSS framework providing responsive grid systems, flexbox utilities, and standard UI primitives.</li>
        <li><strong>Why we use it:</strong> Gives us an instant, battle-tested responsive grid (12-column system, <code>col-md-6</code>, <code>d-flex</code>) that ensures proper rendering across phones, tablets, and desktop displays.</li>
        <li><strong>Where used & Files:</strong> Imported in <code>client/index.html</code>; utilized across all JSX components alongside custom CSS variables.</li>
        <li><strong>Real-World Example:</strong> Product cards automatically arrange in 1 column on mobile phones (390px), 2 columns on tablets (768px), and 3 or 4 columns on desktop monitors.</li>
        <li><strong>What if omitted:</strong> We would need to write hundreds of lines of custom CSS media queries from scratch, risking layout breakage across different screen sizes.</li>
    </ul>

    <h3>4. Axios (Frontend: v1.7.2)</h3>
    <ul>
        <li><strong>What it is:</strong> A promise-based HTTP client for the browser and Node.js.</li>
        <li><strong>Why we use it:</strong> Provides built-in request/response interceptors, automatic JSON serialization/deserialization, and cleaner error handling compared to the native browser <code>fetch()</code> API.</li>
        <li><strong>Where used & Files:</strong> <code>client/src/services/api.js</code>.</li>
        <li><strong>Real-World Example:</strong> An Axios request interceptor intercepts every outgoing call, checks <code>localStorage</code> for <code>priceradar_token</code>, and automatically appends <code>Authorization: Bearer &lt;token&gt;</code> without requiring manual header assembly in individual pages.</li>
        <li><strong>What if omitted:</strong> Every single API call would need manual <code>fetch()</code> setup, manual <code>JSON.stringify()</code>, manual <code>res.json()</code> parsing, and repetitive header assembly.</li>
    </ul>

    <h3>5. Vite (v5.3.4)</h3>
    <ul>
        <li><strong>What it is:</strong> Next-generation frontend tooling and build server powered by native ES modules and Rollup.</li>
        <li><strong>Why we use it:</strong> Provides sub-second Hot Module Replacement (HMR) during local development and generates heavily optimized, minified production assets for Render.</li>
        <li><strong>Where used & Files:</strong> <code>client/vite.config.js</code>, <code>client/package.json</code>.</li>
        <li><strong>Real-World Example:</strong> When editing a component in VS Code, Vite updates the live browser view in under 50 milliseconds without reloading the page or losing current form state.</li>
        <li><strong>What if omitted:</strong> Legacy bundlers like Webpack would take 10 to 30 seconds to restart on every code change, significantly slowing down development.</li>
    </ul>

    <h2>3.2 Server-Side Technologies</h2>

    <h3>6. Node.js (v18+ / v22 LTS)</h3>
    <ul>
        <li><strong>What it is:</strong> A cross-platform JavaScript runtime built on Chrome's V8 engine that executes JavaScript outside the browser.</li>
        <li><strong>Why we use it:</strong> Single-threaded, non-blocking asynchronous event loop makes Node.js exceptionally efficient for I/O-intensive workloads like calling retailer APIs, querying databases, and dispatching alerts.</li>
        <li><strong>Where used & Files:</strong> Runs the entire backend service; <code>server/package.json</code> specifies <code>"engines": { "node": "&gt;=18.0.0" }</code>.</li>
        <li><strong>Real-World Example:</strong> While Node.js waits 500ms for eBay's API to return product pricing over the network, it does not freeze; it continues serving HTTP requests to other users simultaneously.</li>
        <li><strong>What if omitted:</strong> We could not run JavaScript on the server and would need a completely different backend runtime (such as Python, Java, or Go).</li>
    </ul>

    <h3>7. Express.js (v4.19.2)</h3>
    <ul>
        <li><strong>What it is:</strong> A fast, unopinionated, minimalist web application framework for Node.js.</li>
        <li><strong>Why we use it:</strong> Simplifies HTTP routing, middleware pipeline chaining, request parsing, and JSON response handling.</li>
        <li><strong>Where used & Files:</strong> <code>server/src/app.js</code>, <code>server/src/server.js</code>, and all route definitions in <code>server/src/routes/</code>.</li>
        <li><strong>Real-World Example:</strong> Chaining <code>app.use('/api/alerts', requireAuth, validate, alertsController)</code> ensures that every request to create or modify an alert is verified and sanitized before reaching business logic.</li>
        <li><strong>What if omitted:</strong> We would have to parse raw Node.js <code>http.createServer</code> request streams, manually regex-match URL strings, and parse chunked HTTP body buffers manually.</li>
    </ul>

    <h3>8. REST APIs</h3>
    <ul>
        <li><strong>What it is:</strong> Representational State Transfer—an architectural style using standard HTTP verbs (GET, POST, PUT, PATCH, DELETE) to manipulate stateless resources via JSON.</li>
        <li><strong>Why we use it:</strong> Provides a clean, universal contract that allows our React frontend, GitHub Actions cron runner, and external test tools to talk to Express using identical conventions.</li>
        <li><strong>Where used:</strong> Every <code>/api/*</code> endpoint in PriceRadar.</li>
        <li><strong>Real-World Example:</strong> <code>GET /api/alerts</code> fetches existing alerts, <code>POST /api/alerts</code> creates a new alert, <code>PATCH /api/alerts/:id</code> modifies an alert, and <code>DELETE /api/alerts/:id</code> removes an alert.</li>
        <li><strong>What if omitted:</strong> We would have to invent proprietary communication protocols or build complex GraphQL schemas when simple REST endpoints fully satisfy our requirements.</li>
    </ul>

    <h2>3.3 Database Tier</h2>

    <h3>9. MongoDB & MongoDB Atlas</h3>
    <ul>
        <li><strong>What it is:</strong> A document-oriented NoSQL database that stores data in flexible, JSON-like BSON (Binary JSON) documents. MongoDB Atlas is its fully-managed cloud database service.</li>
        <li><strong>Why we use it:</strong> High schema flexibility allows products from different retailers to carry varying attributes (e.g. storage size, warranty, seller ratings) while maintaining fast indexing on compound query keys.</li>
        <li><strong>Where used & Files:</strong> Configured in <code>server/src/config/db.js</code> via <code>MONGODB_URI</code>.</li>
        <li><strong>Real-World Example:</strong> Storing historical price observations across months without needing rigid relational table alterations or complex SQL migrations.</li>
        <li><strong>What if omitted:</strong> In a relational SQL database, modifying product listing attributes or handling dynamic retailer schemas would require writing and executing complex schema migration scripts.</li>
    </ul>

    <h3>10. Mongoose (v8.5.0)</h3>
    <ul>
        <li><strong>What it is:</strong> An Object Data Modeling (ODM) library for MongoDB and Node.js.</li>
        <li><strong>Why we use it:</strong> Brings strict schema definitions, data type casting, business logic validation, compound indexing, and lifecycle middleware to schemaless MongoDB.</li>
        <li><strong>Where used & Files:</strong> All files in <code>server/src/models/</code>.</li>
        <li><strong>Real-World Example:</strong> Mongoose enforces that <code>priceInPaise</code> must strictly be an integer:
        <code>validate: { validator: Number.isInteger, message: 'priceInPaise must be an integer' }</code>. If someone attempts to save a float like <code>499.99</code>, Mongoose rejects the write before it reaches MongoDB.</li>
        <li><strong>What if omitted:</strong> Corrupted or malformed documents could be inserted into MongoDB collections without any schema guardrails.</li>
    </ul>

    <h2>3.4 Security & Utility Libraries</h2>

    <h3>11. JSON Web Tokens (jsonwebtoken v9.0.2)</h3>
    <ul>
        <li><strong>What it is:</strong> An open standard (RFC 7519) for securely transmitting information between parties as a compact, digitally signed JSON object.</li>
        <li><strong>Why we use it:</strong> Enables stateless authentication. The server does not need to store active user sessions in memory or database; it verifies user identity purely by cryptographically validating the token signature.</li>
        <li><strong>Where used & Files:</strong> Issued in <code>server/src/controllers/authController.js</code>; verified in <code>server/src/middleware/auth.js</code>.</li>
        <li><strong>Real-World Example:</strong> When a user logs in, the server signs <code>{ id: user._id, role: user.role }</code> with a secret key and returns the token. When the user later creates an alert, the server validates the token signature in under 1 millisecond without a database session lookup.</li>
        <li><strong>What if omitted:</strong> We would have to store stateful session IDs in a central Redis cache or database table, increasing infrastructure costs and latency.</li>
    </ul>

    <h3>12. bcryptjs (v2.4.3)</h3>
    <ul>
        <li><strong>What it is:</strong> A pure JavaScript implementation of the bcrypt password-hashing algorithm based on the Blowfish cipher.</li>
        <li><strong>Why we use it:</strong> Employs a one-way mathematical hashing function incorporating an automatically generated salt and adjustable cost factor (10 rounds in PriceRadar), making it impervious to rainbow table attacks.</li>
        <li><strong>Where used & Files:</strong> <code>server/src/controllers/authController.js</code>.</li>
        <li><strong>Real-World Example:</strong> Plaintext password <code>Secret123!</code> becomes <code>$2a$10$N9qo8uLOickgx2ZMRZoMye...</code>. Even if an attacker dumps the entire database, they cannot reverse the hash back into the plaintext password.</li>
        <li><strong>What if omitted:</strong> Storing plaintext passwords or using outdated hashes like MD5/SHA1 would expose all user accounts to instant compromise during a database leak.</li>
    </ul>

    <h3>13. express-validator (v7.1.0)</h3>
    <ul>
        <li><strong>What it is:</strong> A set of Express middleware that wraps <code>validator.js</code> for server-side input sanitization and schema validation.</li>
        <li><strong>Why we use it:</strong> Rejects malformed emails, short passwords, negative prices, and invalid ObjectIds before they reach controller logic.</li>
        <li><strong>Where used & Files:</strong> <code>server/src/routes/auth.js</code>, <code>server/src/routes/alerts.js</code>, and <code>server/src/middleware/validate.js</code>.</li>
        <li><strong>Real-World Example:</strong> If an API caller submits an alert with <code>targetPriceInPaise: -500</code>, express-validator halts the request with HTTP 400 Bad Request before database queries occur.</li>
        <li><strong>What if omitted:</strong> Controllers would be vulnerable to malformed inputs, NoSQL injection attempts, and unexpected application crashes.</li>
    </ul>

    <h2>3.5 Python Extraction Worker</h2>

    <h3>14. Python 3.12, FastAPI (v0.110+) & Uvicorn</h3>
    <ul>
        <li><strong>What it is:</strong> A modern, high-performance Python web framework for building APIs with standard Python type hints, served by the lightning-fast Uvicorn ASGI server.</li>
        <li><strong>Why we use it:</strong> Python is the industry-standard language for HTML parsing and web scraping. FastAPI provides automatic OpenAPI documentation, strict Pydantic validation, and clean microservice separation on port <code>8000</code>.</li>
        <li><strong>Where used & Files:</strong> <code>worker/main.py</code>, <code>worker/extractor.py</code>.</li>
        <li><strong>Real-World Example:</strong> Express delegates complex HTML extraction for authorized test catalogs to <code>http://127.0.0.1:8000/extract</code>, keeping heavy HTML DOM parsing out of Node's main thread.</li>
        <li><strong>What if omitted:</strong> Heavy DOM parsing of multi-megabyte HTML strings inside Node.js could block Express's single-threaded event loop, degrading API response times for all users.</li>
    </ul>

    <h2>3.6 Cloud Services & Orchestration</h2>

    <h3>15. GitHub Actions</h3>
    <ul>
        <li><strong>What it is:</strong> GitHub's native continuous integration and workflow automation platform.</li>
        <li><strong>Why we use it:</strong> Acts as an external cron runner that triggers price monitoring every four hours (<code>0 */4 * * *</code>), even if our cloud hosting instances have spun down due to inactivity. Also runs our 277 Jest tests on every commit.</li>
        <li><strong>Where used & Files:</strong> <code>.github/workflows/monitor.yml</code>, <code>.github/workflows/ci.yml</code>.</li>
        <li><strong>Real-World Example:</strong> At 00:00, 04:00, 08:00, 12:00, 16:00, and 20:00 UTC, a GitHub Ubuntu runner boots up, wakes our backend via <code>GET /api/health</code>, triggers the monitor via <code>POST /api/monitor/run</code>, and polls status until finished.</li>
        <li><strong>What if omitted:</strong> Free-tier cloud servers sleep after 15 minutes of inactivity; without an external trigger like GitHub Actions, price monitoring would halt entirely once the server sleeps.</li>
    </ul>

    <h3>16. Brevo API (Transactional Email)</h3>
    <ul>
        <li><strong>What it is:</strong> An enterprise email delivery service providing high-deliverability transactional email APIs.</li>
        <li><strong>Why we use it:</strong> Direct SMTP connections are blocked by many cloud providers (including Render) to prevent spam. Brevo's REST API over HTTPS bypasses SMTP blocks and guarantees inbox delivery.</li>
        <li><strong>Where used & Files:</strong> <code>server/src/services/notifications/email.js</code>.</li>
        <li><strong>Real-World Example:</strong> Sends both the 6-digit registration/password reset OTPs and price drop alerts with direct links back to the retailer.</li>
        <li><strong>What if omitted:</strong> Traditional Node.js <code>nodemailer</code> SMTP attempts on cloud platforms time out or land directly in spam folders.</li>
    </ul>

    <h3>17. Telegram Bot API</h3>
    <ul>
        <li><strong>What it is:</strong> HTTPS API provided by Telegram allowing automated bots to send instant mobile push messages to users.</li>
        <li><strong>Why we use it:</strong> Delivers instant mobile alerts with 0 SMS costs and near-100% open rates. Users simply connect via a secure link code.</li>
        <li><strong>Where used & Files:</strong> <code>server/src/services/notifications/telegram.js</code>, <code>server/src/routes/telegram.js</code>.</li>
        <li><strong>Real-World Example:</strong> A user receives a direct Telegram message: <em>"🚨 PriceRadar Alert: Apple iPhone 15 dropped to ₹64,999 on Flipkart! [Buy Now]"</em> within 2 seconds of cycle completion.</li>
        <li><strong>What if omitted:</strong> Users would have to rely entirely on email, which is often checked less frequently than mobile instant messengers.</li>
    </ul>

    <h3>18. Jest (v29.7.0) & Supertest (v7.0.0)</h3>
    <ul>
        <li><strong>What it is:</strong> Jest is a JavaScript testing framework with built-in test runners and assertions; Supertest is an HTTP assertion library for testing Express endpoints without binding to a network port.</li>
        <li><strong>Why we use it:</strong> Powers our 26 test suites and 277 automated tests, verifying everything from integer paise math to distributed locking and JWT expiration.</li>
        <li><strong>Where used & Files:</strong> <code>server/package.json</code> (<code>npm test</code>).</li>
        <li><strong>Real-World Example:</strong> Catches regressions instantly if a developer accidentally alters a database field name or breaks the price comparison logic.</li>
        <li><strong>What if omitted:</strong> Every bug would have to be caught through tedious, error-prone manual clicking in the browser.</li>
    </ul>
</div>
"""
