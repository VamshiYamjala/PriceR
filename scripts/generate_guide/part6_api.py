# scripts/generate_guide/part6_api.py

def get_part6_html():
    return """
<div class="chapter-container page-break" id="part-6">
    <h1>Part 6: Complete REST API Endpoint Reference</h1>
    <p>
        The PriceRadar backend exposes a fully RESTful HTTP interface. Every JSON response strictly follows our standardized contract:
    </p>

    <div class="callout callout-arch">
        <div class="callout-title">Standardized API Response Envelopes</div>
        <p><strong>Success Response (HTTP 200 / 201):</strong><br>
        <code>{ "success": true, "data": { ... } }</code></p>
        <p><strong>Error Response (HTTP 400 / 401 / 404 / 500 / 503):</strong><br>
        <code>{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }</code></p>
    </div>

    <h2>6.1 The Master API Endpoint Reference Table</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 8%;">Method</th>
                <th style="width: 22%;">Endpoint</th>
                <th style="width: 18%;">Purpose</th>
                <th style="width: 10%;">Auth</th>
                <th style="width: 16%;">Request Data</th>
                <th style="width: 14%;">Response / Result</th>
                <th style="width: 12%;">Files</th>
            </tr>
        </thead>
        <tbody>
            <!-- Auth -->
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/auth/register/initiate</code></td>
                <td>Starts registration; sends 6-digit email OTP</td>
                <td>Public</td>
                <td>Body: <code>{ name, email, password }</code></td>
                <td><code>{ success: true, message }</code></td>
                <td><code>routes/auth.js</code><br><code>authController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/auth/register/verify</code></td>
                <td>Verifies OTP and creates user</td>
                <td>Public</td>
                <td>Body: <code>{ email, otp }</code></td>
                <td><code>{ token, user }</code></td>
                <td><code>routes/auth.js</code><br><code>authController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/auth/register/resend</code></td>
                <td>Resends registration OTP</td>
                <td>Public</td>
                <td>Body: <code>{ email }</code></td>
                <td><code>{ success: true }</code></td>
                <td><code>routes/auth.js</code><br><code>authController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/auth/register</code></td>
                <td>Direct registration fallback</td>
                <td>Public</td>
                <td>Body: <code>{ name, email, password }</code></td>
                <td><code>{ token, user }</code></td>
                <td><code>routes/auth.js</code><br><code>authController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/auth/login</code></td>
                <td>Authenticates user & issues JWT</td>
                <td>Public</td>
                <td>Body: <code>{ email, password }</code></td>
                <td><code>{ token, user }</code></td>
                <td><code>routes/auth.js</code><br><code>authController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/api/auth/me</code></td>
                <td>Returns current authenticated profile</td>
                <td><span class="badge badge-auth">Bearer JWT</span></td>
                <td>None</td>
                <td><code>{ user }</code></td>
                <td><code>routes/auth.js</code><br><code>authController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/auth/forgot-password</code></td>
                <td>Sends password reset OTP</td>
                <td>Public</td>
                <td>Body: <code>{ email }</code></td>
                <td><code>{ success: true }</code></td>
                <td><code>routes/auth.js</code><br><code>authController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/auth/verify-reset-otp</code></td>
                <td>Verifies reset OTP; returns resetToken</td>
                <td>Public</td>
                <td>Body: <code>{ email, otp }</code></td>
                <td><code>{ resetToken }</code></td>
                <td><code>routes/auth.js</code><br><code>authController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/auth/resend-reset-otp</code></td>
                <td>Resends password reset OTP</td>
                <td>Public</td>
                <td>Body: <code>{ email }</code></td>
                <td><code>{ success: true }</code></td>
                <td><code>routes/auth.js</code><br><code>authController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/auth/reset-password</code></td>
                <td>Sets new password with resetToken</td>
                <td>Public</td>
                <td>Body: <code>{ email, resetToken, newPassword }</code></td>
                <td><code>{ success: true }</code></td>
                <td><code>routes/auth.js</code><br><code>authController.js</code></td>
            </tr>

            <!-- Products & Offers -->
            <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/api/products/search</code></td>
                <td>Searches catalog with lowest prices</td>
                <td>Public</td>
                <td>Query: <code>?q=phone&category=...</code></td>
                <td><code>{ products: [...] }</code></td>
                <td><code>routes/products.js</code><br><code>productsController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/api/products/autocomplete</code></td>
                <td>Returns instant search suggestions</td>
                <td>Public</td>
                <td>Query: <code>?q=iph</code></td>
                <td><code>{ suggestions: [...] }</code></td>
                <td><code>routes/products.js</code><br><code>productsController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/api/products/categories</code></td>
                <td>Lists distinct product categories</td>
                <td>Public</td>
                <td>None</td>
                <td><code>{ categories: [...] }</code></td>
                <td><code>routes/products.js</code><br><code>productsController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/api/products/providers/status</code></td>
                <td>Status of retailer adapters</td>
                <td>Public</td>
                <td>None</td>
                <td><code>{ providers: {...} }</code></td>
                <td><code>routes/products.js</code><br><code>productsController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/api/products/:productId</code></td>
                <td>Fetches product & all store offers</td>
                <td>Public</td>
                <td>Params: <code>:productId</code></td>
                <td><code>{ product, offers }</code></td>
                <td><code>routes/products.js</code><br><code>productsController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/api/offers/:offerId</code></td>
                <td>Fetches single offer details</td>
                <td>Public</td>
                <td>Params: <code>:offerId</code></td>
                <td><code>{ offer }</code></td>
                <td><code>routes/offers.js</code><br><code>offersController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/api/offers/:offerId/history</code></td>
                <td>Price history time-series data</td>
                <td>Public</td>
                <td>Params: <code>:offerId</code></td>
                <td><code>{ history: [...] }</code></td>
                <td><code>routes/offers.js</code><br><code>offersController.js</code></td>
            </tr>

            <!-- Watchlist -->
            <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/api/watchlist</code></td>
                <td>Gets logged-in user's watchlist</td>
                <td><span class="badge badge-auth">Bearer JWT</span></td>
                <td>None</td>
                <td><code>{ items: [...] }</code></td>
                <td><code>routes/watchlist.js</code><br><code>watchlistController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/watchlist</code></td>
                <td>Adds offer to user's watchlist</td>
                <td><span class="badge badge-auth">Bearer JWT</span></td>
                <td>Body: <code>{ offerId }</code></td>
                <td><code>{ item }</code></td>
                <td><code>routes/watchlist.js</code><br><code>watchlistController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-delete">DELETE</span></td>
                <td><code>/api/watchlist/:id</code></td>
                <td>Removes offer from watchlist</td>
                <td><span class="badge badge-auth">Bearer JWT</span></td>
                <td>Params: <code>:id</code></td>
                <td><code>{ success: true }</code></td>
                <td><code>routes/watchlist.js</code><br><code>watchlistController.js</code></td>
            </tr>

            <!-- Alerts -->
            <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/api/alerts</code></td>
                <td>Lists user's active & paused alerts</td>
                <td><span class="badge badge-auth">Bearer JWT</span></td>
                <td>None</td>
                <td><code>{ alerts: [...] }</code></td>
                <td><code>routes/alerts.js</code><br><code>alertsController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/alerts</code></td>
                <td>Creates new target/drop price alert</td>
                <td><span class="badge badge-auth">Bearer JWT</span></td>
                <td>Body: <code>{ offerId, type, ... }</code></td>
                <td><code>{ alert }</code></td>
                <td><code>routes/alerts.js</code><br><code>alertsController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-patch">PATCH</span></td>
                <td><code>/api/alerts/:id</code></td>
                <td>Updates alert thresholds or status</td>
                <td><span class="badge badge-auth">Bearer JWT</span></td>
                <td>Params: <code>:id</code>, Body: <code>{ ... }</code></td>
                <td><code>{ alert }</code></td>
                <td><code>routes/alerts.js</code><br><code>alertsController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-delete">DELETE</span></td>
                <td><code>/api/alerts/:id</code></td>
                <td>Deletes price alert</td>
                <td><span class="badge badge-auth">Bearer JWT</span></td>
                <td>Params: <code>:id</code></td>
                <td><code>{ success: true }</code></td>
                <td><code>routes/alerts.js</code><br><code>alertsController.js</code></td>
            </tr>

            <!-- Notifications -->
            <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/api/notifications</code></td>
                <td>User notification event history</td>
                <td><span class="badge badge-auth">Bearer JWT</span></td>
                <td>None</td>
                <td><code>{ events: [...] }</code></td>
                <td><code>routes/notifications.js</code><br><code>notificationsController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-delete">DELETE</span></td>
                <td><code>/api/notifications/:id</code></td>
                <td>Dismisses notification event</td>
                <td><span class="badge badge-auth">Bearer JWT</span></td>
                <td>Params: <code>:id</code></td>
                <td><code>{ success: true }</code></td>
                <td><code>routes/notifications.js</code><br><code>notificationsController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/api/notification-preferences</code></td>
                <td>Gets user notification channels</td>
                <td><span class="badge badge-auth">Bearer JWT</span></td>
                <td>None</td>
                <td><code>{ email, telegram }</code></td>
                <td><code>routes/notificationPreferences.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-put">PUT</span></td>
                <td><code>/api/notification-preferences</code></td>
                <td>Updates notification channel settings</td>
                <td><span class="badge badge-auth">Bearer JWT</span></td>
                <td>Body: <code>{ email }</code></td>
                <td><code>{ preferences }</code></td>
                <td><code>routes/notificationPreferences.js</code></td>
            </tr>

            <!-- Telegram -->
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/telegram/link-code</code></td>
                <td>Generates 15-min Telegram bot link</td>
                <td><span class="badge badge-auth">Bearer JWT</span></td>
                <td>None</td>
                <td><code>{ linkCode, botUrl }</code></td>
                <td><code>routes/telegram.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/telegram/link</code></td>
                <td>Links chatId with verification code</td>
                <td>Public</td>
                <td>Body: <code>{ linkCode, chatId }</code></td>
                <td><code>{ success: true }</code></td>
                <td><code>routes/telegram.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/telegram/disconnect</code></td>
                <td>Disconnects Telegram account</td>
                <td><span class="badge badge-auth">Bearer JWT</span></td>
                <td>None</td>
                <td><code>{ success: true }</code></td>
                <td><code>routes/telegram.js</code></td>
            </tr>

            <!-- Monitor & Diagnostics -->
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/monitor/run</code></td>
                <td>Asynchronous monitoring trigger</td>
                <td>Secret / Cron</td>
                <td>Header: <code>X-Monitor-Secret</code></td>
                <td><code>HTTP 202 { runId }</code></td>
                <td><code>routes/monitor.js</code><br><code>monitorController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/api/monitor/trigger</code></td>
                <td>UI manual refresh trigger</td>
                <td><span class="badge badge-auth">Bearer JWT</span></td>
                <td>None</td>
                <td><code>{ success: true, result }</code></td>
                <td><code>routes/monitor.js</code><br><code>monitorController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/api/monitor/status</code></td>
                <td>Polls execution state of monitor run</td>
                <td>Public</td>
                <td>None</td>
                <td><code>{ isRunning, lastRun }</code></td>
                <td><code>routes/monitor.js</code><br><code>monitorController.js</code></td>
            </tr>
            <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/api/health</code></td>
                <td>Public health check for Render & CI</td>
                <td>Public</td>
                <td>None</td>
                <td><code>{ status: 'ok', database }</code></td>
                <td><code>server/src/app.js</code></td>
            </tr>
        </tbody>
    </table>

    <h2>6.2 Core HTTP Methods Explained with PriceRadar Examples</h2>
    <ul>
        <li><strong>GET (Safe & Idempotent):</strong> Retrieves data without modifying server state. Example: <code>GET /api/products/search?q=laptop</code> queries MongoDB and returns matching products. It can be executed 100 times without side effects.</li>
        <li><strong>POST (Non-Idempotent):</strong> Creates new server resources or initiates stateful actions. Example: <code>POST /api/alerts</code> creates a brand new alert document in MongoDB with a unique <code>_id</code>. Sending it twice creates two separate records (or triggers duplicate validation).</li>
        <li><strong>PATCH (Partial Update):</strong> Modifies specific fields of an existing document without overwriting the entire document. Example: <code>PATCH /api/alerts/66a1...</code> with <code>{ "status": "paused" }</code> updates only the status field, leaving target prices and channels intact.</li>
        <li><strong>PUT (Full Replacement):</strong> Replaces the entire resource or ensures exact configuration state. Example: <code>PUT /api/notification-preferences</code> sets the complete channel preferences object.</li>
        <li><strong>DELETE (Idempotent Deletion):</strong> Removes a resource from the database. Example: <code>DELETE /api/watchlist/66a1...</code> deletes the join document. Calling it again returns HTTP 404 or success because the item is already gone.</li>
    </ul>

    <h2>6.3 Express Request and Response Primitives Explained</h2>
    <p>
        In Express controllers, data arrives through specific properties on the request object (<code>req</code>) and departs through the response object (<code>res</code>):
    </p>

    <ul>
        <li><code>req.body</code>: Contains the parsed JSON payload sent by POST/PATCH requests (enabled by <code>app.use(express.json())</code>). Example: <code>const { offerId, targetPriceInPaise } = req.body;</code>.</li>
        <li><code>req.params</code>: Contains named route URL parameters extracted from path placeholders. Example: In route <code>/api/products/:productId</code>, a request to <code>/api/products/123</code> yields <code>req.params.productId === '123'</code>.</li>
        <li><code>req.query</code>: Contains URL query string parameters following the <code>?</code> symbol. Example: In <code>/api/products/search?q=phone&category=tech</code>, <code>req.query.q === 'phone'</code>.</li>
        <li><code>req.headers</code>: Contains HTTP request headers sent by the client. Example: <code>req.headers.authorization</code> or <code>req.headers['x-monitor-secret']</code>.</li>
        <li><code>req.user</code>: A custom object attached to the request by the <code>requireAuth</code> middleware after successfully verifying the JWT token. Contains authenticated user credentials: <code>req.user = { id: user._id, role: user.role }</code>.</li>
        <li><code>res.status(code)</code>: Sets the HTTP status code (200 OK, 201 Created, 202 Accepted, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Error, 503 Service Unavailable).</li>
        <li><code>res.json(payload)</code>: Serializes the JavaScript object into a JSON string, sets the <code>Content-Type: application/json</code> header, and sends the response.</li>
    </ul>

    <h2>6.4 How to Debug an API Endpoint from Frontend to Database</h2>
    <p>
        If an endpoint fails or returns unexpected data, follow this structured 7-step debugging procedure:
    </p>
    <ol>
        <li><strong>Step 1 (Browser Network Tab):</strong> Open Chrome DevTools → Network tab. Inspect the failing request. Look at the Request URL, HTTP Method, Request Headers (is the Bearer token present?), and Request Payload.</li>
        <li><strong>Step 2 (Axios Service):</strong> Check <code>client/src/services/api.js</code>. Ensure the function maps to the correct endpoint path and uses <code>unwrap(api.post(...))</code>.</li>
        <li><strong>Step 3 (Express App & Route):</strong> Check <code>server/src/app.js</code> to verify route prefix mounting (e.g. <code>app.use('/api/alerts', alertRoutes)</code>) and <code>server/src/routes/alerts.js</code> to confirm parameter matching.</li>
        <li><strong>Step 4 (Middleware & Validation):</strong> Inspect console logs in the terminal. If <code>express-validator</code> failed, inspect <code>validate.js</code> to see which field caused the HTTP 400 Bad Request.</li>
        <li><strong>Step 5 (Controller & req.user):</strong> Add a breakpoint or log: <code>console.log('Controller received:', req.body, req.user);</code> inside the controller. Ensure <code>req.user.id</code> is populated.</li>
        <li><strong>Step 6 (Service & Model Logic):</strong> Check if the Mongoose query threw an error (e.g. invalid ObjectId format, missing required field, or failing <code>Number.isInteger</code> validation).</li>
        <li><strong>Step 7 (Database State via Atlas):</strong> Open MongoDB Atlas → Database → Browse Collections. Directly inspect the target document to verify that field names and types match schema expectations.</li>
    </ol>
</div>
"""
