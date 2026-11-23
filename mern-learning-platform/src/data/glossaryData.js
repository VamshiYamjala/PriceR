// mern-learning-platform/src/data/glossaryData.js

export const glossaryData = [
  {
    term: 'API (Application Programming Interface)',
    analogy: 'A restaurant waiter who takes your food order to the kitchen and brings your dish back to your table.',
    definition: 'A standardized set of rules and protocols that allows two distinct software programs (like React and Express) to communicate and exchange data.',
    priceRadarUsage: 'The Express server exposes /api/products, /api/alerts, and /api/auth so the React frontend can fetch listings and save user preferences.'
  },
  {
    term: 'REST (Representational State Transfer)',
    analogy: 'Standard international road signs that everyone understands regardless of what vehicle they drive.',
    definition: 'An architectural style for network communication where clients manipulate resources via standard HTTP methods (GET, POST, PUT, PATCH, DELETE) and JSON payloads.',
    priceRadarUsage: 'GET /api/alerts reads existing alerts, POST /api/alerts creates a new alert, and DELETE /api/alerts/:id removes an alert.'
  },
  {
    term: 'MERN Stack',
    analogy: 'A 4-member relay race team where each runner specializes in one phase: React runs the track, Express directs the lanes, Node powers the race, and MongoDB stores the finish times.',
    definition: 'A full-stack JavaScript technology suite: MongoDB (database), Express.js (backend web framework), React (frontend UI library), and Node.js (server runtime).',
    priceRadarUsage: 'PriceRadar is 100% MERN: React 18 client, Express API server, Node 22 runtime, and MongoDB Atlas cloud datastore.'
  },
  {
    term: 'Axios',
    analogy: 'A secure courier van that drives between the browser and the cloud backend carrying JSON request packages and bringing back JSON responses.',
    definition: 'A promise-based HTTP client for browser and Node.js that simplifies network requests, handles automatic JSON serialization, and supports interceptors.',
    priceRadarUsage: 'Configured as a singleton in client/src/services/api.js, automatically injecting the JWT Bearer token into outgoing headers.'
  },
  {
    term: 'JWT (JSON Web Token)',
    analogy: 'A tamper-proof laminated wristband given at a concert entrance. Security guards only check the digital hologram signature to let you enter VIP areas without looking up your passport.',
    definition: 'An open standard (RFC 7519) for transmitting claims securely as a signed JSON object comprising Header, Payload, and Signature.',
    priceRadarUsage: 'Issued on login/verify, stored in localStorage as priceradar_token, verified on private routes by requireAuth middleware.'
  },
  {
    term: 'Integer Paise Policy',
    analogy: 'Counting currency in 1-rupee coins or 100-paise coins rather than measuring coins with a ruler, preventing fractional penny errors.',
    definition: 'A financial accuracy design rule that stores all prices as integers in paise (rupees * 100) to eliminate IEEE 754 floating-point rounding bugs (0.1 + 0.2 !== 0.3).',
    priceRadarUsage: 'Enforced by Mongoose validator in Offer.js and computed via rupeesToPaise() in server/src/utils/money.js.'
  },
  {
    term: 'Distributed Mutex Lock',
    analogy: 'A single physical bathroom key hung at a gas station counter. Only the person holding the key can use the bathroom, preventing two people from entering simultaneously.',
    definition: 'A cluster-wide mutual exclusion synchronization mechanism stored in a shared database (MongoDB MonitorLock) ensuring only one server instance executes a critical task at a time.',
    priceRadarUsage: 'Acquired atomically by acquireDistributedLock() in priceMonitor.js before the 4-hour price refresh loop begins.'
  },
  {
    term: 'SSRF (Server-Side Request Forgery)',
    analogy: 'Tricking a company delivery driver into driving into a restricted military base because the package label had a fake address.',
    definition: 'A critical web security vulnerability where an attacker manipulates a server into fetching internal, loopback, or cloud metadata network addresses.',
    priceRadarUsage: 'Prevented in the Python worker (worker/extractor.py) using an explicit domain allowlist and post-redirect URL destination checks.'
  },
  {
    term: 'Mongoose ODM',
    analogy: 'An architect blueprint that ensures bricklayers build rooms with exact dimensions and approved electrical wiring.',
    definition: 'An Object Data Modeling library for Node.js and MongoDB that enforces schemas, validates data types, defines indexes, and provides query builder methods.',
    priceRadarUsage: 'Defines User, Product, Offer, Alert, WatchlistItem, and PriceObservation schemas with compound unique indexes.'
  },
  {
    term: 'Cron Schedule (0 */4 * * *)',
    analogy: 'An automated alarm clock set to ring every 4 hours on the dot regardless of whether anyone is awake.',
    definition: 'A time-based job scheduler syntax. "0 */4 * * *" executes at minute 0 of every 4th hour: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC.',
    priceRadarUsage: 'Configured in .github/workflows/monitor.yml to trigger PriceRadar price updates on the cloud backend.'
  },
  {
    term: 'Bcrypt Hashing',
    analogy: 'Crushing a fruit into a smoothie. You can easily blend the fruit into a smoothie, but you can never reconstruct the original apple from the blended liquid.',
    definition: 'A slow, one-way cryptographic hashing algorithm based on Blowfish key expansion incorporating random salts and adjustable cost factors.',
    priceRadarUsage: 'Used in authController.js with 10 salt rounds to hash passwords before storing them in User.passwordHash.'
  },
  {
    term: 'TTL (Time To Live) Index',
    analogy: 'A self-destructing message timer in Mission Impossible that erases the tape 10 minutes after reading.',
    definition: 'A MongoDB index on a Date field ({ expires: 0 }) that causes MongoDB background threads to automatically delete documents whose expiration date has passed.',
    priceRadarUsage: 'Configured on OtpChallenge.expiresAt to auto-purge 6-digit OTP codes after 10 minutes.'
  },
  {
    term: 'HTTP 202 Accepted',
    analogy: 'A coat check clerk who hands you a claim ticket immediately and hangs your heavy coat in the back room while you walk into the theatre.',
    definition: 'An HTTP status code indicating that a request has been accepted for background processing, but the processing has not yet completed.',
    priceRadarUsage: 'Returned by POST /api/monitor/run so GitHub Actions does not time out while external prices are fetched over 60 seconds.'
  },
  {
    term: 'React Virtual DOM',
    analogy: 'A blueprint draft where an architect tests edits on paper and only sends bricklayers to fix the specific wall that changed, rather than rebuilding the whole house.',
    definition: 'A lightweight JavaScript representation of the actual browser DOM kept in memory and synced with the real DOM via reconciliation.',
    priceRadarUsage: 'When a user adds an offer to their watchlist, React re-renders only that specific row button without reloading the search catalog.'
  },
  {
    term: 'Middleware',
    analogy: 'Airport security checkpoints that verify your boarding pass, scan your luggage, and check your passport before letting you onto the airplane.',
    definition: 'Functions in the Express request pipeline with access to req, res, and next that filter, parse, authenticate, or log requests.',
    priceRadarUsage: 'app.use(cors()), app.use(express.json()), requireAuth, and validate execute before controller handlers.'
  }
];

export const GLOSSARY_TERMS = glossaryData;
export default glossaryData;

