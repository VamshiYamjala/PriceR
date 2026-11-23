# scripts/generate_guide/part16_git_deploy.py

def get_part16_html():
    return """
<div class="chapter-container page-break" id="part-16">
    <h1>Part 16: Git, GitHub Actions & Cloud Deployment Architecture</h1>
    <p>
        PriceRadar is maintained in Git version control and hosted on Render with automated GitHub Actions CI/CD pipelines.
    </p>

    <h2>16.1 Git Fundamentals for Freshers</h2>
    <ul>
        <li><strong>Repository (Repo):</strong> The central project workspace containing all code, commit history, and branches.</li>
        <li><strong>Commit:</strong> An immutable snapshot of changes recorded with a descriptive message and unique cryptographic SHA hash.</li>
        <li><strong>Branch:</strong> An independent line of development (e.g. <code>main</code> for production code, feature branches for experiments).</li>
        <li><strong>Push / Pull:</strong> <code>git push</code> uploads local commits to GitHub; <code>git pull</code> downloads and merges remote commits into your local branch.</li>
        <li><strong>Pull Request (PR):</strong> A proposed change submitted to a branch that triggers automated CI tests and code reviews before merging.</li>
    </ul>

    <h2>16.2 CI Pipeline vs. Scheduled Monitoring Workflow</h2>
    <p>
        The repository maintains two distinct GitHub Actions workflows in <code>.github/workflows/</code>:
    </p>

    <table>
        <thead>
            <tr>
                <th style="width: 25%;">Attribute</th>
                <th style="width: 38%;">Continuous Integration (<code>ci.yml</code>)</th>
                <th style="width: 37%;">Price Monitor (<code>monitor.yml</code>)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Trigger Event</strong></td>
                <td>Pushes to <code>main</code> and Pull Requests.</td>
                <td>Cron schedule (<code>0 */4 * * *</code>) & manual <code>workflow_dispatch</code>.</td>
            </tr>
            <tr>
                <td><strong>Purpose</strong></td>
                <td>Quality assurance: verifies code integrity before deployment.</td>
                <td>Operational execution: drives the 4-hour background price refresh cycle.</td>
            </tr>
            <tr>
                <td><strong>Tasks Executed</strong></td>
                <td>Installs dependencies, runs linter, and executes 277 Jest test cases.</td>
                <td>Wakes Render server, calls <code>POST /api/monitor/run</code>, polls until run finishes.</td>
            </tr>
            <tr>
                <td><strong>Target Environment</strong></td>
                <td>Ephemeral GitHub Ubuntu container.</td>
                <td>Live production Render cloud backend.</td>
            </tr>
            <tr>
                <td><strong>Required Secrets</strong></td>
                <td>None (runs in isolated test environment).</td>
                <td><code>BACKEND_URL</code>, <code>MONITOR_TRIGGER_SECRET</code>.</td>
            </tr>
        </tbody>
    </table>

    <h2>16.3 Production Deployment on Render</h2>
    <p>
        PriceRadar is split into two separate cloud hosting services on Render:
    </p>

    <h3>1. Frontend: Render Static Site (<code>priceradar-web.onrender.com</code>)</h3>
    <ul>
        <li><strong>Root Directory:</strong> <code>client</code></li>
        <li><strong>Build Command:</strong> <code>npm install && npm run build</code></li>
        <li><strong>Publish Directory:</strong> <code>dist</code></li>
        <li><strong>Environment Variable:</strong> <code>VITE_API_URL=https://priceradar-api-02ib.onrender.com</code></li>
        <li><strong>Single Page Application Rewrite Rule:</strong> Any route (<code>/*</code>) redirects to <code>/index.html</code> (HTTP 200) to allow client-side React Router navigation.</li>
    </ul>

    <h3>2. Backend: Render Web Service (<code>priceradar-api-02ib.onrender.com</code>)</h3>
    <ul>
        <li><strong>Root Directory:</strong> <code>server</code></li>
        <li><strong>Runtime:</strong> Node.js (v18+)</li>
        <li><strong>Build Command:</strong> <code>npm install</code></li>
        <li><strong>Start Command:</strong> <code>npm start</code> (runs <code>node src/server.js</code>)</li>
        <li><strong>Internal Port:</strong> Defaults to <code>PORT=10000</code> or <code>PORT=5000</code>.</li>
        <li><strong>Health Check Path:</strong> <code>/api/health</code> (Render monitors this to verify healthy deploys).</li>
    </ul>

    <h2>16.4 Environment Variables Architecture</h2>
    <p>
        Production secrets are configured strictly through Render's encrypted environment variables dashboard and are never committed to Git:
    </p>
    <ul>
        <li><code>NODE_ENV=production</code></li>
        <li><code>PORT=10000</code></li>
        <li><code>MONGODB_URI</code>: Secure connection string to MongoDB Atlas.</li>
        <li><code>JWT_SECRET</code>: 256-bit cryptographically random secret string.</li>
        <li><code>CLIENT_ORIGIN=https://priceradar-web.onrender.com</code></li>
        <li><code>BREVO_API_KEY</code>: Enterprise transactional email token.</li>
        <li><code>TELEGRAM_BOT_TOKEN</code>: Telegram bot authorization key.</li>
        <li><code>MONITOR_TRIGGER_SECRET</code>: Shared secret authorizing cron execution.</li>
    </ul>
</div>
"""
