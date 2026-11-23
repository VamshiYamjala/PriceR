# scripts/generate_guide/part14_node_qa.py

def get_part14_html():
    return """
<div class="chapter-container page-break" id="part-14">
    <h1>Part 14: Node.js & Express Interview Preparation (25 Topics)</h1>
    <p>
        The backend interview questions below focus on server architecture, middleware chains, HTTP protocols, and resilience patterns implemented in PriceRadar.
    </p>

    <h3>1. What is Node.js and how does it execute JavaScript?</h3>
    <ul>
        <li><strong>Explanation:</strong> Node.js is an open-source, cross-platform runtime built on Google Chrome's V8 engine and libuv. It executes JavaScript outside the browser using a single-threaded, non-blocking event-driven architecture.</li>
    </ul>

    <h3>2. Why is Node.js ideal for PriceRadar?</h3>
    <ul>
        <li><strong>Explanation:</strong> PriceRadar's primary workload is I/O-bound: querying MongoDB, making HTTP requests to external retailer APIs (eBay, Apify), and dispatching emails. Node's non-blocking event loop handles hundreds of concurrent I/O calls without thread contention.</li>
    </ul>

    <h3>3. What is Express.js?</h3>
    <ul>
        <li><strong>Explanation:</strong> A minimalist web framework for Node.js that provides high-level routing, request parsing, and a middleware pipeline architecture.</li>
    </ul>

    <h3>4. What is Middleware in Express?</h3>
    <ul>
        <li><strong>Explanation:</strong> Functions that have access to <code>req</code>, <code>res</code>, and <code>next</code>. They execute sequentially in the pipeline to parse bodies, authenticate tokens, sanitize inputs, or handle errors before responses depart.</li>
    </ul>

    <h3>5. What is Routing?</h3>
    <ul>
        <li><strong>Explanation:</strong> The mechanism that binds incoming HTTP request methods and URL paths (e.g. <code>GET /api/products/search</code>) to specific handler functions.</li>
    </ul>

    <h3>6. What is a Controller?</h3>
    <ul>
        <li><strong>Explanation:</strong> An intermediary function responsible for HTTP transport: unpacking request payloads, invoking business services or database models, and returning an HTTP status code and JSON envelope.</li>
    </ul>

    <h3>7. What is a Service Layer?</h3>
    <ul>
        <li><strong>Explanation:</strong> The business brain of the application. Services (e.g. <code>priceMonitor.js</code>, <code>alertEvaluator.js</code>) contain pure business rules independent of HTTP transport, allowing them to be called by web controllers, cron jobs, or CLI tools alike.</li>
    </ul>

    <h3>8. What is a REST API?</h3>
    <ul>
        <li><strong>Explanation:</strong> Representational State Transfer—a stateless architectural style where clients interact with resources identified by standard URIs using standard HTTP methods and JSON payloads.</li>
    </ul>

    <h3>9. HTTP Methods Breakdown</h3>
    <ul>
        <li><strong>GET:</strong> Read resource (safe, idempotent).</li>
        <li><strong>POST:</strong> Create resource or trigger action (non-idempotent).</li>
        <li><strong>PUT:</strong> Replace resource completely (idempotent).</li>
        <li><strong>PATCH:</strong> Modify resource fields partially (idempotent).</li>
        <li><strong>DELETE:</strong> Remove resource (idempotent).</li>
    </ul>

    <h3>10. HTTP Status Codes Used in PriceRadar</h3>
    <ul>
        <li><strong>200 OK:</strong> Request succeeded (e.g. search results returned).</li>
        <li><strong>201 Created:</strong> New resource successfully persisted (e.g. alert created).</li>
        <li><strong>202 Accepted:</strong> Background task queued and accepted (e.g. <code>POST /api/monitor/run</code>).</li>
        <li><strong>400 Bad Request:</strong> Validation error (e.g. negative price or invalid email).</li>
        <li><strong>401 Unauthorized:</strong> Missing, invalid, or expired JWT token.</li>
        <li><strong>403 Forbidden:</strong> Authenticated, but user lacks permission.</li>
        <li><strong>404 Not Found:</strong> Route or database entity does not exist.</li>
        <li><strong>409 Conflict:</strong> Concurrent action conflict (e.g. monitor already running).</li>
        <li><strong>500 Internal Error:</strong> Uncaught server exception.</li>
        <li><strong>503 Service Unavailable:</strong> Database disconnected (fast-fail middleware).</li>
    </ul>

    <h3>11. Request (<code>req</code>) and Response (<code>res</code>) Objects</h3>
    <ul>
        <li><strong><code>req</code>:</strong> Incoming HTTP request holding headers, parameters, and parsed JSON body.</li>
        <li><strong><code>res</code>:</strong> Outgoing HTTP response object used to set status codes, headers, and send JSON data.</li>
    </ul>

    <h3>12. Route Parameters (<code>req.params</code>)</h3>
    <ul>
        <li><strong>Explanation:</strong> Dynamic segments in URL paths prefixed with a colon:
            <pre><code>router.get('/products/:productId', getProduct); // Accessed via req.params.productId</code></pre>
        </li>
    </ul>

    <h3>13. Query Parameters (<code>req.query</code>)</h3>
    <ul>
        <li><strong>Explanation:</strong> Key-value pairs following the <code>?</code> in the URL used for filtering, searching, and pagination:
            <pre><code>// URL: /api/products/search?q=laptop&limit=10 -> req.query.q === 'laptop'</code></pre>
        </li>
    </ul>

    <h3>14. Request Body & <code>express.json()</code></h3>
    <ul>
        <li><strong>Explanation:</strong> Node streams HTTP request bodies in chunks. <code>app.use(express.json())</code> is built-in middleware that buffers and parses incoming JSON streams into <code>req.body</code>.</li>
    </ul>

    <h3>15. Request Headers (<code>req.headers</code>)</h3>
    <ul>
        <li><strong>Explanation:</strong> Metadata sent with the HTTP request. PriceRadar uses headers for JWT auth (<code>Authorization: Bearer &lt;token&gt;</code>) and cron verification (<code>X-Monitor-Secret: &lt;secret&gt;</code>).</li>
    </ul>

    <h3>16. CORS (Cross-Origin Resource Sharing)</h3>
    <ul>
        <li><strong>Explanation:</strong> A browser security mechanism that blocks web pages on one origin (e.g. <code>https://priceradar-web.onrender.com</code>) from making HTTP calls to an API on a different origin (e.g. <code>https://priceradar-api-02ib.onrender.com</code>) unless the server returns authorized CORS headers.</li>
    </ul>

    <h3>17. Centralized Error-Handling Middleware</h3>
    <ul>
        <li><strong>Explanation:</strong> Express recognizes error middleware by its 4-parameter signature: <code>(err, req, res, next)</code>. Must be the very last <code>app.use()</code> call in <code>app.js</code>:
            <pre><code>export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: { code: err.code || 'SERVER_ERROR', message: err.message }
  });
}</code></pre>
        </li>
    </ul>

    <h3>18. The <code>asyncHandler</code> Pattern</h3>
    <ul>
        <li><strong>Explanation:</strong> A higher-order function that wraps asynchronous controllers, catching Promise rejections and automatically passing them to <code>next(err)</code>, preventing unhandled promise rejections from crashing Node:
            <pre><code>export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};</code></pre>
        </li>
    </ul>

    <h3>19. Environment Variables (<code>dotenv</code> & <code>process.env</code>)</h3>
    <ul>
        <li><strong>Explanation:</strong> Configuration variables kept outside the codebase. <code>server/src/config/env.js</code> loads <code>.env</code> on boot, verifying required variables (<code>MONGODB_URI</code>, <code>JWT_SECRET</code>, <code>MONITOR_TRIGGER_SECRET</code>).</li>
    </ul>

    <h3>20. Authentication Guard Middleware (<code>requireAuth</code>)</h3>
    <ul>
        <li><strong>Explanation:</strong> Inspects the <code>Authorization: Bearer &lt;token&gt;</code> header. If missing or invalid, halts execution with HTTP 401. If valid, attaches decoded claims to <code>req.user</code> and invokes <code>next()</code>.</li>
    </ul>

    <h3>21. In-Memory Rate Limiting (<code>rateLimiter.js</code>)</h3>
    <ul>
        <li><strong>Explanation:</strong> Tracks IP request frequencies within sliding time windows to prevent brute-force attacks on login and OTP verification routes.</li>
    </ul>

    <h3>22. Pagination Patterns (Skip & Limit)</h3>
    <ul>
        <li><strong>Explanation:</strong> Splitting large datasets across multiple pages using Mongoose:
            <pre><code>const items = await Product.find().skip((page - 1) * limit).limit(limit);</code></pre>
        </li>
    </ul>

    <h3>23. Input Validation via <code>express-validator</code></h3>
    <ul>
        <li><strong>Explanation:</strong> Declarative array of validation rules attached to routes. Halts requests with detailed HTTP 400 field error arrays if input syntax is invalid.</li>
    </ul>

    <h3>24. MVC Architecture in PriceRadar</h3>
    <ul>
        <li><strong>Model:</strong> Mongoose schemas in <code>models/</code>.</li>
        <li><strong>View:</strong> React SPA frontend components in <code>client/</code>.</li>
        <li><strong>Controller:</strong> Request handlers in <code>server/src/controllers/</code>.</li>
    </ul>

    <h3>25. The Fast-Fail 503 Middleware Pattern</h3>
    <ul>
        <li><strong>Explanation:</strong> A custom middleware in <code>server/src/app.js</code> that checks <code>mongoose.connection.readyState !== 1</code>. If the cloud database is disconnected, it immediately returns HTTP 503 with an actionable error message rather than forcing the user to wait for a 30-second socket timeout.</li>
    </ul>
</div>
"""
