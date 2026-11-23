# scripts/generate_guide/part19_comparisons.py

def get_part19_html():
    return """
<div class="chapter-container page-break" id="part-19">
    <h1>Part 19: Core Architectural Comparison Tables (20 Tables)</h1>
    <p>
        These 20 comparison tables distill essential software engineering concepts into clear, memorable distinctions for technical interviews.
    </p>

    <!-- Table 1 -->
    <h3>1. JavaScript vs. Node.js</h3>
    <table>
        <thead><tr><th>Attribute</th><th>JavaScript</th><th>Node.js</th></tr></thead>
        <tbody>
            <tr><td><strong>Nature</strong></td><td>High-level programming language conforming to ECMAScript.</td><td>Asynchronous runtime environment built on V8 and libuv.</td></tr>
            <tr><td><strong>Execution</strong></td><td>Executes primarily in web browsers (Client).</td><td>Executes on servers and developer machines (Server/CLI).</td></tr>
            <tr><td><strong>APIs</strong></td><td>DOM, Fetch, localStorage, Geolocation.</td><td>fs, http, path, crypto, child_process, os.</td></tr>
        </tbody>
    </table>

    <!-- Table 2 -->
    <h3>2. React vs. Express.js</h3>
    <table>
        <thead><tr><th>Attribute</th><th>React (Frontend)</th><th>Express.js (Backend)</th></tr></thead>
        <tbody>
            <tr><td><strong>Role</strong></td><td>Builds reactive user interfaces via Virtual DOM.</td><td>Builds REST API web servers and routing middleware.</td></tr>
            <tr><td><strong>Execution</strong></td><td>Runs in client browser.</td><td>Runs on Node.js server.</td></tr>
            <tr><td><strong>Output</strong></td><td>HTML DOM elements and interactive UI components.</td><td>HTTP status codes, headers, and JSON envelopes.</td></tr>
        </tbody>
    </table>

    <!-- Table 3 -->
    <h3>3. Frontend vs. Backend</h3>
    <table>
        <thead><tr><th>Attribute</th><th>Frontend (Client Tier)</th><th>Backend (Server & Data Tier)</th></tr></thead>
        <tbody>
            <tr><td><strong>Focus</strong></td><td>User experience, visual rendering, form state, input validation.</td><td>Business logic, data persistence, authentication, API security.</td></tr>
            <tr><td><strong>Exposure</strong></td><td>Code is publicly visible in browser DevTools.</td><td>Source code and database credentials remain secret.</td></tr>
            <tr><td><strong>Tech</strong></td><td>React, Vite, Bootstrap, HTML5, CSS3.</td><td>Node.js, Express, MongoDB, Mongoose, Python.</td></tr>
        </tbody>
    </table>

    <!-- Table 4 -->
    <h3>4. SQL vs. NoSQL</h3>
    <table>
        <thead><tr><th>Attribute</th><th>SQL (Relational Databases)</th><th>NoSQL (Document Databases)</th></tr></thead>
        <tbody>
            <tr><td><strong>Schema</strong></td><td>Rigid, tabular schemas pre-defined with DDL.</td><td>Flexible JSON-like BSON documents with dynamic fields.</td></tr>
            <tr><td><strong>Scaling</strong></td><td>Vertical scaling (larger CPU/RAM servers).</td><td>Horizontal scaling (sharding across clusters).</td></tr>
            <tr><td><strong>Relations</strong></td><td>Foreign keys and complex table joins.</td><td>Embedded subdocuments or lightweight document references.</td></tr>
        </tbody>
    </table>

    <!-- Table 5 -->
    <h3>5. MongoDB vs. Mongoose</h3>
    <table>
        <thead><tr><th>Attribute</th><th>MongoDB</th><th>Mongoose</th></tr></thead>
        <tbody>
            <tr><td><strong>What it is</strong></td><td>The underlying database engine.</td><td>Object Data Modeling (ODM) library for Node.js.</td></tr>
            <tr><td><strong>Validation</strong></td><td>Schemaless by default.</td><td>Enforces strict schema models, types, and validators.</td></tr>
            <tr><td><strong>Hooks</strong></td><td>Requires database triggers.</td><td>Provides built-in lifecycle middleware (pre/post save).</td></tr>
        </tbody>
    </table>

    <!-- Table 6 -->
    <h3>6. Authentication vs. Authorization</h3>
    <table>
        <thead><tr><th>Attribute</th><th>Authentication (AuthN)</th><th>Authorization (AuthZ)</th></tr></thead>
        <tbody>
            <tr><td><strong>Definition</strong></td><td>Verifying <em>who</em> a user is.</td><td>Verifying <em>what</em> a user is allowed to do.</td></tr>
            <tr><td><strong>Mechanism</strong></td><td>Passwords, email OTPs, JWT signatures.</td><td>User roles (e.g. <code>role: 'admin'</code>), ownership checks.</td></tr>
            <tr><td><strong>PriceRadar</strong></td><td><code>requireAuth</code> verifies JWT token.</td><td>Checking that an alert belongs to <code>req.user.id</code> before editing.</td></tr>
        </tbody>
    </table>

    <!-- Table 7 -->
    <h3>7. Hashing vs. Encryption</h3>
    <table>
        <thead><tr><th>Attribute</th><th>Hashing</th><th>Encryption</th></tr></thead>
        <tbody>
            <tr><td><strong>Reversibility</strong></td><td>One-way mathematical function (irreversible).</td><td>Two-way cipher (reversible with secret key).</td></tr>
            <tr><td><strong>Purpose</strong></td><td>Password security and data integrity verification.</td><td>Protecting confidential data in transit or at rest.</td></tr>
            <tr><td><strong>PriceRadar</strong></td><td><code>bcrypt.hash(password, 10)</code>.</td><td>HTTPS/TLS encrypts network traffic to Render.</td></tr>
        </tbody>
    </table>

    <!-- Table 8 -->
    <h3>8. JWT vs. Session-Based Authentication</h3>
    <table>
        <thead><tr><th>Attribute</th><th>JWT (Stateless)</th><th>Session Cookies (Stateful)</th></tr></thead>
        <tbody>
            <tr><td><strong>Storage</strong></td><td>Client stores token; server stores 0 state.</td><td>Server stores active session IDs in Redis/database.</td></tr>
            <tr><td><strong>Scalability</strong></td><td>Instant horizontal scaling across microservices.</td><td>Requires shared session cache or sticky load balancers.</td></tr>
            <tr><td><strong>Revocation</strong></td><td>Harder to revoke before expiration.</td><td>Instant revocation by deleting server session.</td></tr>
        </tbody>
    </table>

    <!-- Table 9 -->
    <h3>9. GET vs. POST</h3>
    <table>
        <thead><tr><th>Attribute</th><th>GET Method</th><th>POST Method</th></tr></thead>
        <tbody>
            <tr><td><strong>Idempotency</strong></td><td>Idempotent and safe (no server mutations).</td><td>Non-idempotent (creates resources or triggers actions).</td></tr>
            <tr><td><strong>Payload</strong></td><td>Parameters passed in URL query string.</td><td>Payload passed in HTTP request body.</td></tr>
            <tr><td><strong>PriceRadar</strong></td><td><code>GET /api/products/search</code></td><td><code>POST /api/alerts</code></td></tr>
        </tbody>
    </table>

    <!-- Table 10 -->
    <h3>10. PUT vs. PATCH</h3>
    <table>
        <thead><tr><th>Attribute</th><th>PUT Method</th><th>PATCH Method</th></tr></thead>
        <tbody>
            <tr><td><strong>Scope</strong></td><td>Replaces the entire resource document.</td><td>Applies partial updates to specific fields.</td></tr>
            <tr><td><strong>Payload</strong></td><td>Must provide all mandatory resource fields.</td><td>Provides only the fields being modified.</td></tr>
            <tr><td><strong>PriceRadar</strong></td><td><code>PUT /api/notification-preferences</code></td><td><code>PATCH /api/alerts/:id</code> (e.g. toggle status)</td></tr>
        </tbody>
    </table>

    <!-- Table 11 -->
    <h3>11. Synchronous vs. Asynchronous Execution</h3>
    <table>
        <thead><tr><th>Attribute</th><th>Synchronous</th><th>Asynchronous</th></tr></thead>
        <tbody>
            <tr><td><strong>Blocking</strong></td><td>Blocks execution thread until instruction finishes.</td><td>Offloads long tasks; notifies via event loop callback.</td></tr>
            <tr><td><strong>Performance</strong></td><td>Poor for I/O and network operations.</td><td>High throughput and concurrency on single thread.</td></tr>
        </tbody>
    </table>

    <!-- Table 12 -->
    <h3>12. Promise vs. <code>async/await</code></h3>
    <table>
        <thead><tr><th>Attribute</th><th>Promise</th><th>async / await</th></tr></thead>
        <tbody>
            <tr><td><strong>Syntax</strong></td><td>Chained <code>.then()</code> and <code>.catch()</code> callbacks.</td><td>Sequential statements with standard <code>try/catch</code>.</td></tr>
            <tr><td><strong>Readability</strong></td><td>Can lead to promise chaining clutter.</td><td>Clean, linear control flow identical to synchronous code.</td></tr>
        </tbody>
    </table>

    <!-- Table 13 -->
    <h3>13. Props vs. State in React</h3>
    <table>
        <thead><tr><th>Attribute</th><th>Props</th><th>State</th></tr></thead>
        <tbody>
            <tr><td><strong>Ownership</strong></td><td>Passed down from parent component (external).</td><td>Declared and managed inside the component (internal).</td></tr>
            <tr><td><strong>Mutability</strong></td><td>Immutable read-only values.</td><td>Mutable via state setter functions (<code>setCount</code>).</td></tr>
        </tbody>
    </table>

    <!-- Table 14 -->
    <h3>14. <code>useState</code> vs. <code>useEffect</code></h3>
    <table>
        <thead><tr><th>Attribute</th><th>useState</th><th>useEffect</th></tr></thead>
        <tbody>
            <tr><td><strong>Purpose</strong></td><td>Stores reactive data within component memory.</td><td>Executes side effects (API calls, timers) after render.</td></tr>
            <tr><td><strong>Trigger</strong></td><td>Updating state triggers a re-render.</td><td>Executes on mount or when dependencies change.</td></tr>
        </tbody>
    </table>

    <!-- Table 15 -->
    <h3>15. Array <code>map</code> vs. <code>filter</code> vs. <code>reduce</code></h3>
    <table>
        <thead><tr><th>Method</th><th>Input Array Length</th><th>Output Structure</th><th>PriceRadar Use Case</th></tr></thead>
        <tbody>
            <tr><td><strong>map</strong></td><td>$N$ elements</td><td>New array of exactly $N$ items</td><td>Extracting prices from offers array.</td></tr>
            <tr><td><strong>filter</strong></td><td>$N$ elements</td><td>New array of $\le N$ items</td><td>Filtering offers that are in stock.</td></tr>
            <tr><td><strong>reduce</strong></td><td>$N$ elements</td><td>Single accumulated value</td><td>Finding lowest price across retailers.</td></tr>
        </tbody>
    </table>

    <!-- Table 16 -->
    <h3>16. Route vs. Controller</h3>
    <table>
        <thead><tr><th>Layer</th><th>Primary Responsibility</th><th>PriceRadar File</th></tr></thead>
        <tbody>
            <tr><td><strong>Route</strong></td><td>Binds HTTP verb & URL path to middleware.</td><td><code>server/src/routes/alerts.js</code></td></tr>
            <tr><td><strong>Controller</strong></td><td>Unpacks HTTP inputs and sends JSON responses.</td><td><code>server/src/controllers/alertsController.js</code></td></tr>
        </tbody>
    </table>

    <!-- Table 17 -->
    <h3>17. Controller vs. Service</h3>
    <table>
        <thead><tr><th>Layer</th><th>Primary Responsibility</th><th>PriceRadar File</th></tr></thead>
        <tbody>
            <tr><td><strong>Controller</strong></td><td>HTTP transport, status codes, JSON serialization.</td><td><code>controllers/monitorController.js</code></td></tr>
            <tr><td><strong>Service</strong></td><td>Pure business logic, price math, lock coordination.</td><td><code>services/priceMonitor.js</code></td></tr>
        </tbody>
    </table>

    <!-- Table 18 -->
    <h3>18. Service vs. Model</h3>
    <table>
        <thead><tr><th>Layer</th><th>Primary Responsibility</th><th>PriceRadar File</th></tr></thead>
        <tbody>
            <tr><td><strong>Service</strong></td><td>Business workflows spanning multiple collections.</td><td><code>services/alertEvaluator.js</code></td></tr>
            <tr><td><strong>Model</strong></td><td>Collection schema, types, indexes, and validation.</td><td><code>models/Alert.js</code></td></tr>
        </tbody>
    </table>

    <!-- Table 19 -->
    <h3>19. Sample Data vs. Live Data in PriceRadar</h3>
    <table>
        <thead><tr><th>Dimension</th><th>Sample / Fixture Data</th><th>Live Data</th></tr></thead>
        <tbody>
            <tr><td><strong>Origin</strong></td><td>Local JSON fixtures (<code>fixtureData.json</code>).</td><td>Real-time external API (Apify, eBay).</td></tr>
            <tr><td><strong>UI Badge</strong></td><td>Yellow <code>Sample Catalog</code> badge.</td><td>Green <code>Live Deal</code> badge.</td></tr>
            <tr><td><strong>Offline</strong></td><td>Works 100% offline without internet.</td><td>Requires external credentials and connectivity.</td></tr>
        </tbody>
    </table>

    <!-- Table 20 -->
    <h3>20. In-Memory Mutex vs. Distributed Mutex Lock</h3>
    <table>
        <thead><tr><th>Dimension</th><th>In-Memory Mutex (Boolean)</th><th>Distributed Mutex (MongoDB)</th></tr></thead>
        <tbody>
            <tr><td><strong>Scope</strong></td><td>Single Node.js process only.</td><td>Cluster-wide across multiple cloud instances.</td></tr>
            <tr><td><strong>Latency</strong></td><td>0 milliseconds (instant synchronous check).</td><td>~5 to 15 milliseconds (database roundtrip).</td></tr>
            <tr><td><strong>Crash Recovery</strong></td><td>Resets on process restart.</td><td>Recovers stale locks via heartbeat leases.</td></tr>
        </tbody>
    </table>
</div>
"""
