# scripts/generate_guide/part11_worker.py

def get_part11_html():
    return """
<div class="chapter-container page-break" id="part-11">
    <h1>Part 11: Python Extraction Worker Microservice</h1>
    <p>
        PriceRadar supplements its Node.js backend with an isolated Python microservice located in <code>worker/</code>. This decoupled architecture offloads heavy HTML parsing and enforces strict network sandboxing.
    </p>

    <h2>11.1 Why a Separate Python Worker Exists</h2>
    <p>
        Node.js runs on a <strong>single-threaded event loop</strong>. While it excels at non-blocking I/O (handling thousands of lightweight API requests), parsing large, multi-megabyte HTML documents using CPU-heavy regular expressions or DOM trees can block the event loop for tens or hundreds of milliseconds.
    </p>
    <ul>
        <li><strong>Event Loop Protection:</strong> Offloading HTML scraping to a separate Python process keeps the Express main thread responsive to user requests.</li>
        <li><strong>Ecosystem Strengths:</strong> Python possesses the industry's most robust web extraction libraries (Scrapling, BeautifulSoup4, Requests, Pydantic).</li>
        <li><strong>Network Sandboxing:</strong> The Python worker is bound strictly to <code>127.0.0.1:8000</code> and cannot be accessed from the public internet.</li>
    </ul>

    <h2>11.2 Microservice Communication & Data Flow</h2>
    <p>
        When Express encounters an offer configured with <code>provider: 'scrapling'</code>, it delegates the extraction over local HTTP:
    </p>

    <div class="diagram-box">
        <svg viewBox="0 0 880 140" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, sans-serif;">
            <defs>
                <marker id="wArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#7c3aed"/>
                </marker>
            </defs>

            <!-- Express -->
            <rect x="30" y="25" width="220" height="90" rx="8" fill="#f0fdfa" stroke="#0f766e" stroke-width="2"/>
            <text x="140" y="55" font-size="11" font-weight="bold" fill="#0f766e" text-anchor="middle">Express Backend</text>
            <text x="140" y="75" font-size="8.5" fill="#475569" text-anchor="middle">providers/scrapling.js</text>
            <text x="140" y="93" font-size="8" fill="#0284c7" text-anchor="middle">Axios POST to 127.0.0.1:8000</text>

            <line x1="250" y1="70" x2="330" y2="70" stroke="#7c3aed" stroke-width="2" marker-end="url(#wArrow)"/>
            <text x="290" y="60" font-size="8" fill="#7c3aed" font-weight="bold" text-anchor="middle">JSON URL</text>

            <!-- Python Worker -->
            <rect x="340" y="25" width="240" height="90" rx="8" fill="#f5f3ff" stroke="#7c3aed" stroke-width="2"/>
            <text x="460" y="50" font-size="11" font-weight="bold" fill="#6d28d9" text-anchor="middle">Python FastAPI Worker</text>
            <text x="460" y="70" font-size="8.5" fill="#475569" text-anchor="middle">1. SSRF & Allowlist Validation</text>
            <text x="460" y="85" font-size="8.5" fill="#475569" text-anchor="middle">2. Requests HTTP Fetch (10s timeout)</text>
            <text x="460" y="100" font-size="8.5" fill="#475569" text-anchor="middle">3. Regex & DOM Extraction</text>

            <line x1="580" y1="70" x2="660" y2="70" stroke="#7c3aed" stroke-width="2" marker-end="url(#wArrow)"/>
            <text x="620" y="60" font-size="8" fill="#7c3aed" font-weight="bold" text-anchor="middle">Parsed Data</text>

            <!-- External Site -->
            <rect x="670" y="25" width="180" height="90" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
            <text x="760" y="55" font-size="11" font-weight="bold" fill="#334155" text-anchor="middle">Authorized Target</text>
            <text x="760" y="75" font-size="8.5" fill="#475569" text-anchor="middle">books.toscrape.com</text>
            <text x="760" y="93" font-size="8" fill="#16a34a" text-anchor="middle">Allowed Domain</text>
        </svg>
        <div class="diagram-caption">Figure 11.1: Express to FastAPI Worker Microservice Communication</div>
    </div>

    <h2>11.3 FastAPI Service Endpoints & Pydantic Contracts</h2>
    <p>
        The service is implemented in <code>worker/main.py</code>:
    </p>

    <h3>1. Health Check Endpoint (<code>GET /health</code>)</h3>
    <pre><code>@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PriceRadar Scrapling Worker",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "allowed_domains": ["books.toscrape.com", "quotes.toscrape.com", "scrapingclub.com"]
    }</code></pre>

    <h3>2. Extraction Endpoint (<code>POST /extract</code>)</h3>
    <p>Receives <code>ExtractRequest</code> and returns normalized <code>ExtractResponse</code>:</p>
    <pre><code>class ExtractRequest(BaseModel):
    url: str
    currency: Optional[str] = "GBP"

class ExtractResponse(BaseModel):
    success: bool
    url: str
    title: Optional[str] = None
    price_in_paise: Optional[int] = None
    original_price: Optional[float] = None
    availability: Optional[str] = "unknown"
    data_status: str = "sample"
    retrieved_at: str
    error: Optional[str] = None</code></pre>

    <h2>11.4 Server-Side Request Forgery (SSRF) Defense</h2>
    <p>
        Accepting arbitrary URLs from users and fetching them on a server introduces severe <strong>SSRF vulnerabilities</strong>, where an attacker could trick the server into probing local host ports (e.g. <code>http://localhost:27017</code>) or querying cloud metadata endpoints (e.g. <code>http://169.254.169.254/latest/meta-data/</code>).
    </p>

    <div class="callout callout-arch">
        <div class="callout-title">The Three-Layer SSRF Defense in <code>worker/extractor.py</code></div>
        <ol>
            <li><strong>Strict Domain Allowlisting:</strong> Only pre-approved testbed catalogs are permitted:
                <pre><code>ALLOWED_DOMAINS = ["books.toscrape.com", "quotes.toscrape.com", "scrapingclub.com"]</code></pre>
                Any request targeting an unapproved host is rejected with HTTP 400.
            </li>
            <li><strong>Protocol Sanitization:</strong> Only <code>http://</code> and <code>https://</code> URL schemes are allowed; dangerous protocols like <code>file://</code>, <code>gopher://</code>, or <code>ftp://</code> are rejected immediately.</li>
            <li><strong>Post-Redirect URL Validation:</strong> Attackers often bypass domain checks by pointing an allowed domain to a server that issues an HTTP 302 redirect to an internal IP. The worker inspects the final landing URL after redirects:
                <pre><code>resp = requests.get(target_url, headers=headers, timeout=10, allow_redirects=True)
post_redirect_val = validate_url(resp.url)
if not post_redirect_val["valid"]:
    raise HTTPException(status_code=400, detail="Redirect SSRF rejected")</code></pre>
            </li>
        </ol>
    </div>

    <h2>11.5 Real-World Limitations to Disclose in Interviews</h2>
    <p>
        In an interview, do <strong>not</strong> claim that this Python worker is a universal scraper that can scrape live Amazon or Flipkart listings directly.
    </p>
    <ul>
        <li><strong>Anti-Bot Challenges:</strong> Modern retail platforms use Cloudflare Turnstile, Akamai Bot Manager, and perimeterX that block raw Python <code>requests</code> with CAPTCHAs and HTTP 403 Forbidden.</li>
        <li><strong>Our Architectural Solution:</strong> PriceRadar correctly uses <strong>Apify Cloud Actors</strong> (which manage proxy rotation, headless browsers, and fingerprinting) for heavy e-commerce stores, while reserving the Python worker for controlled sandbox testbeds.</li>
    </ul>
</div>
"""
