# scripts/generate_guide/part5_flows.py

def get_part5_html():
    return """
<div class="chapter-container page-break" id="part-5">
    <h1>Part 5: Complete File Connection & Code Flows</h1>
    <p>
        To master PriceRadar for technical interviews, you must understand exactly how files connect to execute business features. This section traces every major workflow step by step.
    </p>

    <!-- FLOW A -->
    <h2>Flow A: User Registration with Email OTP Verification</h2>
    <p>
        PriceRadar uses a secure two-step registration flow that guarantees email authenticity before creating the user in MongoDB:
    </p>

    <div class="callout callout-arch">
        <div class="callout-title">Registration Code Path Sequence</div>
        <p>
            <code>RegisterPage.jsx → api.initiateRegistration() → routes/auth.js → authController.initiateRegistration → OtpChallenge (MongoDB TTL) → Brevo Email API → RegisterPage (Step 2: Enter OTP) → api.verifyRegistration() → authController.verifyRegistration → User (MongoDB) → JWT Token → AuthContext</code>
        </p>
    </div>

    <ol>
        <li><strong>User Fills Form (<code>RegisterPage.jsx</code>):</strong> User enters Name, Email (e.g. <code>rahul@example.com</code>), and Password (minimum 8 characters).</li>
        <li><strong>Frontend Validation & Dispatch:</strong> Calls <code>initiateRegistration({ name, email, password })</code> in <code>client/src/services/api.js</code>.</li>
        <li><strong>Route & Input Sanitization (<code>routes/auth.js</code>):</strong> Express matches <code>POST /api/auth/register/initiate</code>. <code>express-validator</code> verifies valid email syntax and minimum 8-character password.</li>
        <li><strong>Controller Logic (<code>controllers/authController.js</code>):</strong>
            <ul>
                <li>Checks if user already exists: <code>await User.findOne({ email })</code>. If found, returns HTTP 400.</li>
                <li>Generates a secure 6-digit numeric OTP: <code>Math.floor(100000 + Math.random() * 900000).toString()</code>.</li>
                <li>Hashes the plaintext password with bcrypt: <code>const passwordHash = await bcrypt.hash(password, 10);</code>.</li>
                <li>Hashes the 6-digit OTP with SHA-256 for secure temporary storage.</li>
                <li>Saves an <code>OtpChallenge</code> document with <code>purpose: 'register'</code> and <code>expiresAt: new Date(Date.now() + 10 * 60 * 1000)</code> (10-minute expiration).</li>
                <li>Calls <code>sendEmail({ to: email, subject: 'Your PriceRadar Verification Code', ... })</code> via Brevo.</li>
            </ul>
        </li>
        <li><strong>User Enters OTP (<code>RegisterPage.jsx</code>):</strong> The UI shifts to Step 2 ("Enter 6-digit code"). The user enters <code>492810</code> and clicks "Verify & Register".</li>
        <li><strong>Verification Route:</strong> Calls <code>POST /api/auth/register/verify</code> with <code>{ email, otp: '492810' }</code>.</li>
        <li><strong>Verification & User Creation (<code>authController.js</code>):</strong>
            <ul>
                <li>Finds challenge: <code>await OtpChallenge.findOne({ email, purpose: 'register' })</code>.</li>
                <li>Computes SHA-256 of submitted OTP and verifies match with <code>otpHash</code>.</li>
                <li>Creates permanent user: <code>const user = await User.create({ name: challenge.name, email, passwordHash: challenge.passwordHash })</code>.</li>
                <li>Deletes challenge: <code>await OtpChallenge.deleteMany({ email })</code>.</li>
                <li>Issues JWT: <code>const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })</code>.</li>
            </ul>
        </li>
        <li><strong>Client State Update:</strong> Frontend saves token in <code>localStorage</code>, <code>AuthContext</code> sets <code>user</code>, and redirects to <code>/dashboard</code>.</li>
    </ol>

    <!-- FLOW B -->
    <h2>Flow B: User Login & JWT Issuance</h2>
    <div class="callout callout-arch">
        <div class="callout-title">Login Code Path Sequence</div>
        <p>
            <code>LoginPage.jsx → api.login() → routes/auth.js → authController.login → User.findOne().select('+passwordHash') → bcrypt.compare() → jwt.sign() → localStorage.setItem() → AuthContext.setUser()</code>
        </p>
    </div>

    <ol>
        <li><strong>User Submits Credentials (<code>LoginPage.jsx</code>):</strong> Enters email and password.</li>
        <li><strong>API Call:</strong> Calls <code>api.login({ email, password })</code>.</li>
        <li><strong>Controller Query with Explicit Password Selection:</strong>
            <pre><code>// Notice .select('+passwordHash') because schema sets select: false!
const user = await User.findOne({ email }).select('+passwordHash');
if (!user) return res.status(401).json({ success: false, error: 'Invalid email or password.' });</code></pre>
        </li>
        <li><strong>Cryptographic Verification:</strong>
            <pre><code>const isMatch = await bcrypt.compare(password, user.passwordHash);
if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid email or password.' });</code></pre>
        </li>
        <li><strong>Token Issuance:</strong>
            <pre><code>const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
res.json({ success: true, data: { token, user: { id: user._id, name: user.name, email: user.email } } });</code></pre>
        </li>
        <li><strong>Client Storage:</strong> <code>AuthContext.jsx</code> receives token, executes <code>localStorage.setItem('priceradar_token', token)</code>, and sets user state. Subsequent Axios calls automatically include the token.</li>
    </ol>

    <!-- FLOW C -->
    <h2>Flow C: Multi-Retailer Product Search</h2>
    <div class="callout callout-arch">
        <div class="callout-title">Search Code Path Sequence</div>
        <p>
            <code>SearchPage.jsx → api.searchProducts(q) → routes/products.js → productsController.searchProducts → Product.find() & Offer.find() → priceComparison.js → ProductCard.jsx Grid</code>
        </p>
    </div>

    <ol>
        <li><strong>User Searches Keyword:</strong> Enters "iPhone 15" into search bar on <code>SearchPage.jsx</code>.</li>
        <li><strong>API Call:</strong> Calls <code>GET /api/products/search?q=iPhone%2015</code>.</li>
        <li><strong>Controller Search Logic (<code>controllers/productsController.js</code>):</strong>
            <ul>
                <li>Executes case-insensitive regex query against MongoDB: <code>Product.find({ title: { $regex: q, $options: 'i' } })</code>.</li>
                <li>For each matched product, queries all associated retailer listings: <code>Offer.find({ productId: product._id })</code>.</li>
                <li>Identifies the lowest price across retailers using <code>Math.min(...offers.map(o => o.priceInPaise))</code>.</li>
            </ul>
        </li>
        <li><strong>Response Formatting:</strong> Returns list of products with lowest price, offer count, and sample/live indicators.</li>
        <li><strong>UI Rendering:</strong> <code>SearchPage.jsx</code> renders responsive grid of <code>&lt;ProductCard&gt;</code> components.</li>
    </ol>

    <!-- FLOW D -->
    <h2>Flow D: Product Details & Price Comparison</h2>
    <div class="callout callout-arch">
        <div class="callout-title">Product Details Code Path Sequence</div>
        <p>
            <code>ProductDetailPage.jsx → api.getProduct(id) & api.getOfferHistory(offerId) → productsController & offersController → PriceObservation.find() → OfferRow.jsx & SVG Price Chart</code>
        </p>
    </div>

    <ol>
        <li><strong>User Clicks Product:</strong> Navigates to <code>/products/:productId</code>.</li>
        <li><strong>Parallel API Requests:</strong>
            <ul>
                <li><code>api.getProduct(productId)</code>: Retrieves canonical Product and all linked retailer Offers (Amazon, Flipkart, eBay).</li>
                <li><code>api.getOfferHistory(offerId)</code>: Retrieves historical price observations sorted by date.</li>
            </ul>
        </li>
        <li><strong>History Aggregation:</strong> <code>offersController.getOfferHistory</code> queries <code>PriceObservation.find({ offerId, status: 'success' }).sort({ fetchedAt: 1 })</code>.</li>
        <li><strong>UI Visualization:</strong>
            <ul>
                <li>Displays <code>&lt;OfferRow&gt;</code> components showing side-by-side retailer prices, availability badges (In Stock / Out of Stock), and retailer badges.</li>
                <li>Renders an interactive SVG price history line chart displaying price movement over time in Indian Rupees.</li>
            </ul>
        </li>
    </ol>

    <!-- FLOW E -->
    <h2>Flow E: Watchlist Item Management</h2>
    <ol>
        <li><strong>User Saves Offer:</strong> Clicks "Watch" on an offer row.</li>
        <li><strong>API Call:</strong> Sends <code>POST /api/watchlist</code> with <code>{ offerId: '66a1b2c3...' }</code>.</li>
        <li><strong>Auth & Model Storage (<code>watchlistController.js</code>):</strong>
            <ul>
                <li>Verifies user identity from <code>req.user.id</code>.</li>
                <li>Attempts upsert or creation: <code>await WatchlistItem.create({ userId: req.user.id, offerId })</code>.</li>
                <li>MongoDB unique compound index <code>{ userId: 1, offerId: 1 }</code> prevents duplicate records if clicked twice.</li>
            </ul>
        </li>
        <li><strong>Retrieval:</strong> On <code>/watchlist</code>, <code>WatchlistItem.find({ userId: req.user.id }).populate('offerId')</code> returns all saved listings.</li>
    </ol>

    <!-- FLOW F -->
    <h2>Flow F: Price Alert Creation (Target-Price vs Fixed-Drop)</h2>
    <ol>
        <li><strong>User Configures Alert (<code>AlertFormPage.jsx</code>):</strong>
            <ul>
                <li>Chooses Alert Type: <strong>Target Price</strong> (e.g. ₹45,000) OR <strong>Fixed Drop</strong> (e.g. ₹2,000 drop).</li>
                <li>Selects Notification Channels: Email checkbox and/or Telegram checkbox.</li>
            </ul>
        </li>
        <li><strong>Paise Conversion:</strong> Frontend converts entered rupees to integer paise:
            <pre><code>targetPriceInPaise = rupeesToPaise(45000); // 4500000</code></pre>
        </li>
        <li><strong>API Call:</strong> Sends <code>POST /api/alerts</code> with payload.</li>
        <li><strong>Validation & Storage (<code>alertsController.js</code>):</strong>
            <ul>
                <li>If <code>type === 'fixed_drop'</code>, reads the current offer price and saves it as <code>baselinePriceInPaise</code>.</li>
                <li>Saves <code>Alert</code> with <code>status: 'active'</code> and <code>armed: true</code>.</li>
            </ul>
        </li>
        <li><strong>Result:</strong> Alert enters the monitoring queue and will be evaluated during the next 4-hour cycle.</li>
    </ol>

    <!-- FLOW H -->
    <h2>Flow H: Telegram Account Linking</h2>
    <ol>
        <li><strong>User Requests Link Code (<code>NotificationPreferencesPage.jsx</code>):</strong> User clicks "Connect Telegram".</li>
        <li><strong>API Call:</strong> Calls <code>POST /api/telegram/link-code</code>.</li>
        <li><strong>Backend Code Generation:</strong> Generates a random alphanumeric 6-character linking code, hashes it, and saves it in a temporary store with a 15-minute expiration.</li>
        <li><strong>Deep Link Display:</strong> Returns <code>https://t.me/PriceRadarAlertBot?start=&lt;linkCode&gt;</code>. React displays a button: "Open in Telegram".</li>
        <li><strong>Telegram Webhook Ingestion:</strong> When the user clicks Start in Telegram, Telegram's servers POST a webhook payload to <code>/api/telegram/webhook</code> containing <code>chat.id</code> and the start code.</li>
        <li><strong>User Profile Update:</strong> The backend validates the code and updates the user's document:
            <pre><code>await User.findByIdAndUpdate(userId, { telegramChatId: chatId });</code></pre>
            The bot sends a confirmation message: <em>"✅ Your Telegram account is now linked to PriceRadar!"</em>.
        </li>
    </ol>

    <!-- FLOW I -->
    <h2>Flow I: Four-Step Password Reset Flow</h2>
    <ol>
        <li><strong>Step 1: Request Reset (<code>ForgotPasswordPage.jsx</code>):</strong> User enters registered email. Backend generates 6-digit OTP, saves SHA-256 hash in <code>OtpChallenge</code> with <code>purpose: 'reset_password'</code>, and dispatches an email via Brevo.</li>
        <li><strong>Step 2: Verify OTP:</strong> User submits OTP. Controller checks <code>OtpChallenge</code>. If valid, generates a cryptographically secure random <code>resetToken</code>, saves its hash in <code>OtpChallenge.resetTokenHash</code>, and returns the token to the frontend.</li>
        <li><strong>Step 3: New Password Submission:</strong> User enters a new 8+ character password. Frontend sends <code>{ email, resetToken, newPassword }</code> to <code>POST /api/auth/reset-password</code>.</li>
        <li><strong>Step 4: Update & Invalidation:</strong> Backend verifies <code>resetTokenHash</code> against the database, hashes the new password with bcrypt (10 rounds), updates <code>User.passwordHash</code>, and deletes the challenge to prevent token replay attacks.</li>
    </ol>
</div>
"""
