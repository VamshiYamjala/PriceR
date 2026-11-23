# scripts/generate_guide/part10_security.py

def get_part10_html():
    return """
<div class="chapter-container page-break" id="part-10">
    <h1>Part 10: Authentication, Authorization & Security Architecture</h1>
    <p>
        Security in PriceRadar is engineered defensively at every layer—from database schema projections to cryptographic hashing, stateless token verification, and Server-Side Request Forgery (SSRF) prevention.
    </p>

    <h2>10.1 Password Hashing with bcryptjs</h2>
    <p>
        Storing plaintext passwords in a database is an immediate failure in any production software review. PriceRadar uses <strong>bcryptjs</strong> with 10 salt rounds.
    </p>

    <div class="callout callout-arch">
        <div class="callout-title">Hashing vs. Encryption (Crucial Interview Distinction)</div>
        <p>
            <strong>Hashing (One-Way):</strong> A mathematical trapdoor function. Data is transformed into a fixed-length string that <em>cannot</em> be decrypted or reversed back into the original input. It is used for passwords.
        </p>
        <p>
            <strong>Encryption (Two-Way):</strong> A reversible cipher. Plaintext is scrambled using an encryption key and can be completely recovered using the matching decryption key. It is used for confidential data in transit (TLS) or storage.
        </p>
    </div>

    <h3>How bcrypt Works Under the Hood</h3>
    <ol>
        <li><strong>Automatic Salt Generation:</strong> bcrypt generates a 16-byte cryptographically secure random string called a <em>salt</em> (e.g. <code>$2a$10$N9qo8uLO...</code>). This guarantees that two users with the exact same password (e.g. <code>Password123!</code>) produce completely different hash strings, defeating precomputed rainbow table attacks.</li>
        <li><strong>Adaptive Cost Factor (Work Factor = 10):</strong> The salt rounds parameter ($2^{10} = 1024$ iterations of Blowfish key expansion) makes computing the hash deliberately CPU-intensive (~80ms). This stops automated brute-force attacks while remaining imperceptible to real users.</li>
        <li><strong>Password Verification via <code>bcrypt.compare()</code>:</strong> When logging in, the server extracts the salt from the stored hash, hashes the candidate password using that exact salt and work factor, and checks if the outputs match:
            <pre><code>// server/src/controllers/authController.js
const isMatch = await bcrypt.compare(password, user.passwordHash);
if (!isMatch) {
  return res.status(401).json({ success: false, error: 'Invalid email or password.' });
}</code></pre>
        </li>
    </ol>

    <h2>10.2 Stateless JWT (JSON Web Token) Authentication</h2>
    <p>
        PriceRadar uses JSON Web Tokens (RFC 7519) to authenticate API requests without requiring server-side session memory.
    </p>

    <div class="diagram-box">
        <svg viewBox="0 0 880 140" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, sans-serif;">
            <rect x="20" y="25" width="260" height="90" rx="6" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
            <text x="150" y="50" font-size="11" font-weight="bold" fill="#b91c1c" text-anchor="middle">1. HEADER (Base64Url)</text>
            <text x="150" y="72" font-size="8.5" fill="#334155" text-anchor="middle">Algorithm: HS256 (HMAC-SHA256)</text>
            <text x="150" y="90" font-size="8.5" fill="#334155" text-anchor="middle">Token Type: JWT</text>

            <text x="295" y="75" font-size="18" font-weight="bold" fill="#64748b" text-anchor="middle">.</text>

            <rect x="310" y="25" width="260" height="90" rx="6" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.5"/>
            <text x="440" y="50" font-size="11" font-weight="bold" fill="#0369a1" text-anchor="middle">2. PAYLOAD (Base64Url)</text>
            <text x="440" y="72" font-size="8.5" fill="#334155" text-anchor="middle">id: "66a1b2c3d4..." (User ObjectId)</text>
            <text x="440" y="90" font-size="8.5" fill="#334155" text-anchor="middle">role: "user" | exp: 7 days</text>

            <text x="585" y="75" font-size="18" font-weight="bold" fill="#64748b" text-anchor="middle">.</text>

            <rect x="600" y="25" width="260" height="90" rx="6" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
            <text x="730" y="50" font-size="11" font-weight="bold" fill="#15803d" text-anchor="middle">3. SIGNATURE (HMAC-SHA256)</text>
            <text x="730" y="72" font-size="8.5" fill="#334155" text-anchor="middle">HMACSHA256(</text>
            <text x="730" y="90" font-size="8" fill="#15803d" text-anchor="middle">base64(Header) + "." + base64(Payload), JWT_SECRET)</text>
        </svg>
        <div class="diagram-caption">Figure 10.1: Anatomy of a Signed JSON Web Token</div>
    </div>

    <h3>Token Verification Middleware (<code>server/src/middleware/auth.js</code>)</h3>
    <pre><code>export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Populates req.user.id and req.user.role
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}</code></pre>

    <div class="callout callout-warning">
        <div class="callout-title">Critical JWT Interview Insight: JWTs are NOT Encrypted</div>
        <p>
            A signed JWT is <strong>Base64Url encoded</strong>, NOT encrypted. Anyone who intercepts the token can decode the payload string and view the user's ID and role. The signature only proves that the payload was not tampered with. For this reason, <strong>passwords, secrets, or financial details must NEVER be placed inside a JWT payload</strong>.
        </p>
    </div>

    <h2>10.3 Four-Step Email OTP Security Architecture</h2>
    <p>
        PriceRadar uses short-lived One-Time Passwords (OTPs) for both Registration verification and Password Resets:
    </p>
    <ul>
        <li><strong>SHA-256 Hashing at Rest:</strong> OTPs are never saved as plaintext in MongoDB. The controller hashes the 6-digit code with SHA-256 before writing to <code>OtpChallenge.otpHash</code>.</li>
        <li><strong>MongoDB Native TTL Index:</strong> <code>expiresAt</code> is indexed with <code>{ expires: 0 }</code>. MongoDB's internal background thread automatically cleans up and deletes expired challenges.</li>
        <li><strong>Brute-Force Rate Limiting:</strong> Each challenge tracks <code>attempts: { type: Number, default: 0 }</code>. If an attacker submits more than 5 incorrect guesses, the challenge is invalidated immediately.</li>
        <li><strong>60-Second Resend Cooldown:</strong> <code>resendAvailableAt</code> enforces a 60-second delay between OTP emails, preventing inbox-bombing spam.</li>
    </ul>

    <h2>10.4 Defense-in-Depth Security Guardrails</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 25%;">Security Guardrail</th>
                <th style="width: 35%;">Implementation in PriceRadar</th>
                <th style="width: 40%;">Vulnerability Mitigated</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Mongoose <code>select: false</code></strong></td>
                <td><code>passwordHash: { type: String, select: false }</code> in <code>User.js</code>.</td>
                <td>Prevents accidental credential leakage if a developer executes <code>User.find()</code> or serializes users to JSON.</td>
            </tr>
            <tr>
                <td><strong>SSRF Domain Allowlist</strong></td>
                <td><code>validate_url()</code> in Python worker checks domain against <code>ALLOWED_DOMAINS</code> and validates redirect destinations.</td>
                <td>Stops Server-Side Request Forgery (SSRF) targeting internal AWS/Render metadata endpoints (e.g. <code>169.254.169.254</code>).</td>
            </tr>
            <tr>
                <td><strong>Fast-Fail 503 Guard</strong></td>
                <td>Middleware checks <code>mongoose.connection.readyState !== 1</code> before servicing routes.</td>
                <td>Prevents request pile-ups and 30-second connection timeouts when MongoDB Atlas is unreachable.</td>
            </tr>
            <tr>
                <td><strong>CORS Allowlist</strong></td>
                <td><code>cors({ origin: allowedOrigins, credentials: true })</code> in <code>app.js</code>.</td>
                <td>Blocks cross-origin requests from unauthorized third-party websites in user browsers.</td>
            </tr>
            <tr>
                <td><strong>Input Sanitization</strong></td>
                <td><code>express-validator</code> schemas on all POST/PATCH routes.</td>
                <td>Blocks NoSQL injection payloads, negative prices, and XSS script tags.</td>
            </tr>
            <tr>
                <td><strong>Data Isolation</strong></td>
                <td>Queries strictly scope to <code>req.user.id</code> (e.g. <code>Alert.find({ userId: req.user.id })</code>).</td>
                <td>Prevents Insecure Direct Object Reference (IDOR) attacks where one user views another user's alerts.</td>
            </tr>
        </tbody>
    </table>
</div>
"""
