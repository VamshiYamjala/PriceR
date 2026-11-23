// mern-learning-platform/src/data/modulesData.js

export const modulesData = [
  // --- MODULE 1 ---
  {
    id: 1,
    title: 'Module 1: The Big Picture of MERN Stack',
    subtitle: 'From zero knowledge to understanding full-stack architecture',
    analogy: {
      concept: 'The Full-Stack Restaurant Analogy',
      story: 'Imagine walking into a high-end restaurant: You (the User) sit at a dining table looking at the printed menu (React Frontend). You call the waiter (Axios / HTTP Request) to place your order. The waiter carries the order slip to the kitchen door, where the head chef checks your ticket for dining vouchers (Middleware). The station chef prepares the recipe instructions (Controller & Service), and opens the walk-in pantry (Mongoose & MongoDB) to fetch the raw ingredients. The chef plates the food, hands the finished dish back to the waiter, who brings the meal to your table (React State Update), and you enjoy your dinner (UI Update).'
    },
    coreConcepts: [
      { name: 'Web Application', desc: 'An interactive software program running on remote servers that users access over the internet using a web browser.' },
      { name: 'Client (Frontend)', desc: 'The visual, interactive side running in the user browser (HTML, CSS, React).' },
      { name: 'Server (Backend)', desc: 'The brain running on cloud hardware (Node.js & Express) managing security, data logic, and third-party APIs.' },
      { name: 'Database', desc: 'An organized, persistent digital warehouse (MongoDB) where accounts, prices, and alerts are permanently saved.' },
      { name: 'API (Application Programming Interface)', desc: 'A standardized communication contract allowing React to exchange JSON data with Express.' },
      { name: 'HTTP & JSON', desc: 'HTTP is the delivery vehicle protocol; JSON is the lightweight universal text language carrying data.' }
    ],
    interactiveTool: 'architecture-explorer',
    priceradarDetails: 'In PriceRadar, the Client is a React 18 SPA hosted on Render Static Sites. The Server is an Express.js API listening on port 10000. The Database is MongoDB Atlas in the cloud. External workers include an Apify scraper actor and a local Python FastAPI worker on 127.0.0.1:8000.',
    commonMistakes: [
      'Assuming React talks directly to MongoDB: In production, React NEVER connects directly to MongoDB because exposing database credentials in browser JavaScript is an immediate security vulnerability.',
      'Confusing Node.js with a programming language: JavaScript is the language; Node.js is the runtime environment that lets JavaScript run on servers.'
    ],
    interviewQuestions: [
      {
        q: 'What is the MERN stack and how do its four components collaborate?',
        a: 'MERN comprises MongoDB, Express.js, React, and Node.js. React renders the user interface in the browser and dispatches HTTP requests via Axios. Express runs inside the Node.js runtime, routing requests through middleware and controllers. Mongoose communicates with MongoDB to query and persist BSON documents, returning JSON data back to React.'
      }
    ]
  },

  // --- MODULE 2 ---
  {
    id: 2,
    title: 'Module 2: Complete Project Folder Structure',
    subtitle: 'Generic MERN skeleton vs. Real PriceRadar architecture',
    analogy: {
      concept: 'The Corporate Office Department Analogy',
      story: 'A chaotic company puts marketing, sales, accounting, and legal in one room with all documents in a pile. A professional enterprise organizes into clear departments: Reception (Routes), Supervisors (Middleware), Department Heads (Controllers), Operations Workers (Services), File Vault (Models), and Client Showroom (React Components). Each file has exactly one clear home.'
    },
    coreConcepts: [
      { name: 'Separation of Concerns (SoC)', desc: 'Splitting software into distinct sections so each section addresses a separate concern (UI, Routing, Logic, Data).' },
      { name: 'Routes vs Controllers', desc: 'Routes specify the URL path and HTTP verb; Controllers handle the req/res serialization logic.' },
      { name: 'Controllers vs Services', desc: 'Controllers handle HTTP transport (req/res); Services handle pure business logic independent of HTTP.' },
      { name: 'Models vs Providers', desc: 'Models define our internal database schemas; Providers adapt external retailer APIs into our internal format.' }
    ],
    interactiveTool: 'folder-explorer',
    priceradarDetails: 'PriceRadar structures code into client/ (React 18 SPA), server/ (Express REST API with 10 routes, 8 controllers, 10 models, 10 providers), worker/ (Python FastAPI service), and .github/workflows/ (CI and 4-hour cron monitor).',
    commonMistakes: [
      'Putting database queries directly inside route files instead of controllers or services.',
      'Storing secrets in frontend client code or committing .env files to Git repositories.'
    ],
    interviewQuestions: [
      {
        q: 'Why do you separate Express routes, controllers, and services instead of writing everything in routes?',
        a: 'Separating them follows the Single Responsibility Principle. Routes handle URL mapping, controllers handle HTTP inputs/outputs, and services contain pure business logic. This allows services (like price monitoring) to be reused by cron jobs and CLI scripts without mocking HTTP requests.'
      }
    ]
  },

  // --- MODULE 3 ---
  {
    id: 3,
    title: 'Module 3: How a MERN Application Starts & Runs',
    subtitle: 'The exact startup sequence from npm run dev to browser render',
    analogy: {
      concept: 'The Factory Power-Up Sequence',
      story: 'Before an automobile factory can build cars, two independent power grids boot up: The Showroom lights turn on (Vite starts the React dev server), and the Engine Assembly Line powers up (Node.js starts Express and verifies database connections). If the supply warehouse (MongoDB) is locked, the assembly line pauses with a warning.'
    },
    coreConcepts: [
      { name: 'Frontend Boot', desc: 'package.json → vite → index.html → main.jsx → ReactDOM.createRoot() → App.jsx → React Router.' },
      { name: 'Backend Boot', desc: 'package.json → nodemon → server.js → config/env.js → connectDB() → startScheduler() → app.listen(PORT).' },
      { name: 'Two Development Servers', desc: 'Vite runs on port 5173 for client HMR; Express runs on port 5000/10000 for REST API requests.' },
      { name: 'Fast-Fail 503 Guard', desc: 'Middleware in app.js that checks mongoose.connection.readyState !== 1, returning HTTP 503 immediately if DB is disconnected.' }
    ],
    interactiveTool: 'startup-sequencer',
    priceradarDetails: 'In server.js, connectDB() connects to MongoDB Atlas with auto-reconnect listeners. startScheduler() starts the fallback 4-hour timer. In client/src/main.jsx, ReactDOM wraps App in BrowserRouter and AuthProvider.',
    commonMistakes: [
      'Thinking Vite and Express run in the same process: They are two separate processes that communicate over local network ports (5173 to 5000).',
      'Forgetting that environment variables must be loaded before database connections initialize.'
    ],
    interviewQuestions: [
      {
        q: 'What is the difference between server.js and app.js in your Express backend?',
        a: 'app.js defines and configures the Express application (middleware, routes, error handling) without binding to a network port, making it testable with Supertest. server.js is the executable startup file that connects to MongoDB, starts schedulers, and binds app to a network port with app.listen().'
      }
    ]
  },

  // --- MODULE 4 ---
  {
    id: 4,
    title: 'Module 4: React Frontend Complete Flow',
    subtitle: 'Components, Props, State, Hooks & Route Guarding',
    analogy: {
      concept: 'The Modular LEGO Building Analogy',
      story: 'React components are modular LEGO bricks. A small OfferRow brick snaps inside a larger ProductCard brick, which snaps into the SearchPage view. When data (props) changes, only that specific brick repaints itself without dismantling the rest of the LEGO model.'
    },
    coreConcepts: [
      { name: 'JSX (JavaScript XML)', desc: 'Syntax extension allowing HTML-like markup inside JavaScript files, compiled into React.createElement() calls.' },
      { name: 'Props vs State', desc: 'Props are immutable inputs passed from parent components; State is local mutable memory triggering re-renders when updated.' },
      { name: 'React Hooks', desc: 'Functions (useState, useEffect, useContext, useRef, useMemo, useCallback) allowing functional components to tap into React features.' },
      { name: 'ProtectedRoute Guard', desc: 'Wrapper component checking useAuth() and redirecting unauthenticated visitors to /login.' }
    ],
    interactiveTool: 'architecture-explorer',
    priceradarDetails: 'PriceRadar uses custom AuthContext with useAuth() for session state, useRef for search debouncing, and useMemo in ProductDetailPage for calculating lowest retailer pricing.',
    commonMistakes: [
      'Mutating state directly (e.g. state.count = 5) instead of calling the setter function setCount(5).',
      'Missing dependency arrays in useEffect, causing infinite network request loops.'
    ],
    interviewQuestions: [
      {
        q: 'How does your ProtectedRoute component protect private pages?',
        a: 'ProtectedRoute consumes AuthContext via useAuth(). If auth state is still loading from localStorage, it renders a loading spinner. If loading finishes and user is null, it redirects to /login using React Router Navigate, saving the attempted path in location.state so the user returns after logging in.'
      }
    ]
  },

  // --- MODULE 5 ---
  {
    id: 5,
    title: 'Module 5: Axios — Frontend to Backend Communication',
    subtitle: 'HTTP Requests, Interceptors, Unwrapping & JWT Headers',
    analogy: {
      concept: 'The Diplomatic Courier Analogy',
      story: 'Every time an embassy sends a diplomatic pouch, an administrative officer (Axios Request Interceptor) stamps the official government seal (Authorization: Bearer <token>) onto the envelope. When the return pouch arrives, a clerk removes the outer security wrapper (unwrap helper) and hands the clean letter directly to the ambassador.'
    },
    coreConcepts: [
      { name: 'Axios Singleton', desc: 'A single, pre-configured Axios instance shared across the entire client application.' },
      { name: 'Base URL Normalization', desc: 'Trims trailing slashes and redundant /api prefixes from import.meta.env.VITE_API_URL.' },
      { name: 'Request Interceptor', desc: 'Runs before every request departs, reading priceradar_token from localStorage and attaching the Bearer header.' },
      { name: 'Response Unwrapping', desc: 'Function unwrap(promise) { return promise.then(res => res.data.data); } simplifying React component code.' }
    ],
    interactiveTool: 'axios-simulator',
    priceradarDetails: 'All client HTTP calls go through client/src/services/api.js. No component ever calls the native browser fetch() directly, ensuring 100% consistent error handling and JWT injection.',
    commonMistakes: [
      'Creating multiple axios.create() instances across different files, causing interceptor inconsistencies.',
      'Forgetting that Axios throws an error for HTTP status codes outside the 2xx range, requiring try/catch blocks.'
    ],
    interviewQuestions: [
      {
        q: 'Why use Axios over the native browser fetch() API in a MERN project?',
        a: 'Axios provides automatic JSON parsing (fetch requires two await steps: fetch() and res.json()), built-in request/response interceptors for attaching auth tokens, automatic rejection on 4xx/5xx HTTP status codes, and request cancellation support.'
      }
    ]
  },

  // --- MODULE 6 ---
  {
    id: 6,
    title: 'Module 6: REST API — Complete Understanding',
    subtitle: 'Endpoints, HTTP Verbs, Status Codes & Execution Tracing',
    analogy: {
      concept: 'The Universal Postal Sorting Center',
      story: 'The postal service has standardized delivery actions: SEND a new package (POST), READ an address (GET), UPDATE a street name (PATCH), or RETURN to sender (DELETE). Each parcel has an exact tracking number (Endpoint URI) and receipt confirmation code (Status Code: 200 OK, 201 Created, 404 Not Found).'
    },
    coreConcepts: [
      { name: 'HTTP Methods', desc: 'GET (safe read), POST (create/action), PATCH (partial update), PUT (full replace), DELETE (remove).' },
      { name: 'Status Codes', desc: '200 OK, 201 Created, 202 Accepted, 400 Bad Request, 401 Unauthorized, 404 Not Found, 409 Conflict, 503 Unavailable.' },
      { name: 'Stateless Communication', desc: 'Every HTTP request must contain all credentials and parameters needed to understand and process the request.' },
      { name: 'Standard Response Envelope', desc: '{ success: true, data: {...} } or { success: false, error: { code, message } }.' }
    ],
    interactiveTool: 'endpoint-explorer',
    priceradarDetails: 'PriceRadar implements over 20 REST endpoints across Auth, Products, Offers, Watchlist, Alerts, Notifications, Telegram, and Price Monitoring.',
    commonMistakes: [
      'Using GET requests to delete or update data (violating HTTP idempotency and safety).',
      'Returning HTTP 200 OK when a validation error or database failure actually occurred.'
    ],
    interviewQuestions: [
      {
        q: 'What is the difference between PUT and PATCH in a REST API?',
        a: 'PUT replaces the entire resource document and requires all mandatory fields. PATCH applies partial modifications to specific fields (e.g. updating only status: "paused" on an Alert) without overwriting other properties.'
      }
    ]
  },

  // --- MODULE 7 ---
  {
    id: 7,
    title: 'Module 7: Express.js — How the Backend Works',
    subtitle: 'App setup, Routing pipelines, Controllers & Business Services',
    analogy: {
      concept: 'The City Traffic Control System',
      story: 'Vehicles (HTTP requests) enter the city. The main toll gate (app.use middleware) checks vehicle permits. Rotary exits (express.Router()) guide cars onto specific avenues (routes/alerts.js), where specialized inspectors (controllers) direct goods to the local warehouses (services and models).'
    },
    coreConcepts: [
      { name: 'app.use() vs app.get()', desc: 'app.use() mounts middleware for all methods on a path prefix; app.get() binds strictly to GET requests on exact paths.' },
      { name: 'Router() Modularization', desc: 'express.Router() groups related endpoints into isolated route files (e.g. authRoutes, productRoutes).' },
      { name: 'next() Function', desc: 'Passes control to the next middleware in the stack; passing an argument next(err) jumps directly to the error handler.' },
      { name: 'asyncHandler Wrapper', desc: 'Higher-order function wrapping async controllers to catch unhandled Promise rejections and pass them to next(err).' }
    ],
    interactiveTool: 'architecture-explorer',
    priceradarDetails: 'In server/src/app.js, Express registers CORS, express.json, public health checks, fast-fail database middleware, 10 modular route routers, and the centralized errorHandler.',
    commonMistakes: [
      'Forgetting to call next() inside custom middleware, causing incoming requests to hang indefinitely.',
      'Mounting errorHandler before routes, preventing it from catching route errors.'
    ],
    interviewQuestions: [
      {
        q: 'What is the role of next() in Express middleware?',
        a: 'next() tells Express that the current middleware has finished its work and that control should pass to the next middleware or controller in the pipeline. If next(err) is called with an argument, Express skips all remaining normal middleware and jumps straight to the centralized error-handling middleware.'
      }
    ]
  },

  // --- MODULE 8 ---
  {
    id: 8,
    title: 'Module 8: Request & Response Objects Deep Dive',
    subtitle: 'Mastering req.body, req.params, req.query, req.headers, and res',
    analogy: {
      concept: 'The Delivery Packing Slip Analogy',
      story: 'When a parcel arrives at a warehouse, it has an exterior address label (req.params), a shipping barcode filter (req.query), special handling stickers (req.headers), and the physical cargo inside the box (req.body).'
    },
    coreConcepts: [
      { name: 'req.body', desc: 'Parsed JSON payload sent in POST, PUT, or PATCH request bodies (enabled by express.json()).' },
      { name: 'req.params', desc: 'Named route placeholders from the URL path (e.g. /api/products/:productId yields req.params.productId).' },
      { name: 'req.query', desc: 'Key-value pairs following the ? in the URL (e.g. ?q=iphone&limit=10 yields req.query.q).' },
      { name: 'req.headers', desc: 'HTTP metadata including Authorization (Bearer token) and X-Monitor-Secret.' },
      { name: 'res.status().json()', desc: 'Sets the HTTP response code and serializes a JavaScript object into JSON for transmission.' }
    ],
    interactiveTool: 'request-inspector',
    priceradarDetails: 'In alertsController.js, req.body provides targetPriceInPaise and channels; req.params provides alertId during updates; req.user provides the authenticated user ID.',
    commonMistakes: [
      'Trying to read req.body on GET requests (GET requests should not carry bodies; use req.query instead).',
      'Forgetting that req.params and req.query values arrive as strings, requiring parseInt() before mathematical comparisons.'
    ],
    interviewQuestions: [
      {
        q: 'When would you use req.params versus req.query?',
        a: 'req.params is used for identifying a specific resource by its unique identifier in the URL path (e.g. /api/products/:productId). req.query is used for optional filtering, sorting, searching, or pagination (e.g. /api/products/search?q=phone&category=tech).'
      }
    ]
  },

  // --- MODULE 9 ---
  {
    id: 9,
    title: 'Module 9: Express Middleware Architecture',
    subtitle: 'Interceptors, Auth Guards, Input Validation & Error Pipelines',
    analogy: {
      concept: 'The Airport Security Checkpoint',
      story: 'At an airport, you pass through multiple security gates: Gate 1 checks your airline ticket (CORS), Gate 2 scans your carry-on luggage for prohibited items (JSON Parser & express-validator), Gate 3 verifies your passport photo (requireAuth JWT guard), and only then do you board the plane (Controller).'
    },
    coreConcepts: [
      { name: 'CORS Middleware', desc: 'Inspects Origin headers and permits browser requests only from approved domains (CLIENT_ORIGIN).' },
      { name: 'requireAuth Guard', desc: 'Validates JWT signature, checks expiration, and attaches decoded claims to req.user.' },
      { name: 'express-validator', desc: 'Sanitizes inputs and rejects malformed emails or negative prices with HTTP 400.' },
      { name: 'In-Memory Rate Limiter', desc: 'Tracks client IP request counts to prevent brute-force attacks on login and OTP endpoints.' },
      { name: 'Centralized Error Handler', desc: 'Catches exceptions, logs errors, and returns clean JSON envelopes with appropriate status codes.' }
    ],
    interactiveTool: 'middleware-pipeline',
    priceradarDetails: 'server/src/middleware/ houses auth.js, errorHandler.js, rateLimiter.js, and validate.js. app.js also implements an inline fast-fail database check returning 503 if MongoDB disconnects.',
    commonMistakes: [
      'Sending an HTTP response (res.json) inside middleware AND still calling next(), resulting in "Cannot set headers after they are sent to the client" errors.',
      'Hardcoding CORS origins as "*" in production, allowing unauthorized third-party sites to send credentialed requests.'
    ],
    interviewQuestions: [
      {
        q: 'How does express-validator fit into the Express middleware pipeline?',
        a: 'Validation chains (e.g. body("email").isEmail()) are mounted as middleware arrays before the controller. A custom validate middleware checks validationResult(req). If validation errors exist, it halts execution immediately with HTTP 400 Bad Request; otherwise it calls next() to reach the controller.'
      }
    ]
  },

  // --- MODULE 10 ---
  {
    id: 10,
    title: 'Module 10: JWT & Authentication Complete Flow',
    subtitle: 'Stateless Tokens, bcrypt Hashing, 4-Step OTP & Route Guards',
    analogy: {
      concept: 'The Tamper-Proof Holographic Badge',
      story: 'When you show your birth certificate (Password / OTP) at the city office, the mayor stamps a laminated card with an unforgeable wax seal (JWT Signature). From then on, you never carry your birth certificate; you just flash the card at city gates. Guards verify the wax seal in 1 millisecond without opening the central archives.'
    },
    coreConcepts: [
      { name: 'Authentication vs Authorization', desc: 'Authentication verifies WHO you are (login); Authorization verifies WHAT you are permitted to do (user vs admin).' },
      { name: 'bcrypt Hashing', desc: 'One-way cryptographic function incorporating 10 salt rounds ($2^{10} = 1024$ iterations) protecting passwords.' },
      { name: 'JWT Anatomy', desc: 'Header (alg: HS256) + Payload (user ID, role, expiry) + Signature (HMAC-SHA256 of header+payload with secret).' },
      { name: 'select: false Security', desc: 'Mongoose schema setting on User.passwordHash preventing accidental credential leaks in standard queries.' },
      { name: '4-Step Email OTP Flow', desc: 'Cryptographically random 6-digit OTP hashed with SHA-256 and stored in OtpChallenge with MongoDB TTL auto-cleanup.' }
    ],
    interactiveTool: 'jwt-simulator',
    priceradarDetails: 'Tokens are issued on registration verification and login in authController.js with 7-day expiration. Stored in localStorage as priceradar_token and verified on all private routes.',
    commonMistakes: [
      'Assuming JWTs are encrypted: Standard JWT payloads are only Base64Url encoded. Never store sensitive passwords or credit cards in a JWT payload!',
      'Storing plaintext passwords in databases or using outdated MD5/SHA-1 hashes.'
    ],
    interviewQuestions: [
      {
        q: 'Explain the complete flow of JWT authentication in PriceRadar from login to protected route access.',
        a: 'The user submits credentials to /api/auth/login. The controller queries User with .select("+passwordHash") and verifies the password via bcrypt.compare(). If valid, it signs a JWT containing { id: user._id, role: user.role } with JWT_SECRET and returns it. React stores the token in localStorage. The Axios interceptor attaches Authorization: Bearer <token> to subsequent requests. On protected routes, requireAuth verifies the token with jwt.verify(), attaches decoded claims to req.user, and allows the controller to proceed.'
      }
    ]
  },

  // --- MODULE 11 ---
  {
    id: 11,
    title: 'Module 11: MongoDB & Mongoose Modeling',
    subtitle: 'Documents, Collections, Schemas, Compound Indexes & Paise Math',
    analogy: {
      concept: 'The Digital Filing Cabinet with Barcode Indexing',
      story: 'MongoDB is a warehouse of filing cabinets (Collections). Each folder inside is a BSON document. Mongoose is the strict archivist who ensures every folder follows a template (Schema), rejects folders missing required stamps, and maintains a high-speed card catalog (Indexes) so folders are found in milliseconds.'
    },
    coreConcepts: [
      { name: 'Document vs Collection', desc: 'A Document is a single JSON-like record; a Collection is an array of related documents.' },
      { name: 'ObjectId (_id)', desc: '12-byte unique primary key with 4-byte timestamp, 5-byte process value, and 3-byte incrementing counter.' },
      { name: 'Integer Paise Policy', desc: 'Every price is stored as an integer number of paise (rupees * 100) to eliminate IEEE 754 floating-point errors (0.1 + 0.2 !== 0.3).' },
      { name: 'Compound Unique Indexes', desc: '{ provider: 1, externalProductId: 1 } in Offer and { userId: 1, offerId: 1 } in WatchlistItem prevent duplicates.' },
      { name: 'TTL Index', desc: '{ expires: 0 } on OtpChallenge.expiresAt enables native automatic deletion of expired OTPs.' }
    ],
    interactiveTool: 'database-visualizer',
    priceradarDetails: 'PriceRadar maintains 10 Mongoose models in server/src/models/: User, Product, Offer, Alert, WatchlistItem, PriceObservation, NotificationEvent, MonitorRun, MonitorLock, and OtpChallenge.',
    commonMistakes: [
      'Storing prices as floating-point numbers, causing precision errors in automated price-drop calculations.',
      'Missing database indexes on fields frequently queried (like offerId and fetchedAt in time-series PriceObservation).'
    ],
    interviewQuestions: [
      {
        q: 'Why does PriceRadar store prices as integer paise instead of floating-point rupees?',
        a: 'JavaScript uses IEEE 754 binary floating-point arithmetic where fractions like 0.1 and 0.2 cannot be represented exactly in binary (0.1 + 0.2 === 0.30000000000000004). Storing prices as integer paise (e.g. ₹5,000 = 500000 paise) completely eliminates binary rounding bugs in price-drop evaluations.'
      }
    ]
  },

  // --- MODULE 12 ---
  {
    id: 12,
    title: 'Module 12: Complete CRUD Execution Flow',
    subtitle: 'Create, Read, Update, Delete with Real PriceRadar Operations',
    analogy: {
      concept: 'The Four Fundamental Actions of Data Management',
      story: 'Every data-driven business performs four basic actions: CREATE a new account, READ account details, UPDATE shipping addresses, and DELETE closed memberships. MERN provides an end-to-end pipeline for all four.'
    },
    coreConcepts: [
      { name: 'CREATE (POST)', desc: 'User submits form → Axios POST → route → validate → Alert.create() → MongoDB INSERT.' },
      { name: 'READ (GET)', desc: 'Search input → Axios GET → route → Product.find() & Offer.find() → MongoDB query → React UI grid.' },
      { name: 'UPDATE (PATCH)', desc: 'Toggle status → Axios PATCH → route → Alert.findByIdAndUpdate() → MongoDB updateOne.' },
      { name: 'DELETE (DELETE)', desc: 'Remove watch → Axios DELETE → route → WatchlistItem.deleteOne() → MongoDB deleteOne.' }
    ],
    interactiveTool: 'crud-simulator',
    priceradarDetails: 'CRUD operations in PriceRadar are implemented in controllers/alertsController.js, controllers/watchlistController.js, and controllers/productsController.js.',
    commonMistakes: [
      'Performing un-indexed collection scans for READ queries instead of leveraging compound indexes.',
      'Allowing users to UPDATE or DELETE records belonging to other users (missing user ownership checks).'
    ],
    interviewQuestions: [
      {
        q: 'How do you secure UPDATE and DELETE operations in PriceRadar?',
        a: 'All mutation controllers scope their queries to req.user.id (e.g. Alert.findOneAndDelete({ _id: req.params.id, userId: req.user.id })). This guarantees that even if a malicious user guesses another alert ObjectId, they cannot modify or delete resources they do not own.'
      }
    ]
  },

  // --- MODULE 13 ---
  {
    id: 13,
    title: 'Module 13: How Frontend and Backend Files Connect',
    subtitle: 'The import/export graph, dependency tracing & call chains',
    analogy: {
      concept: 'The Supply Chain Transit Map',
      story: 'Just like an electrical grid connects power plants to substations, transformers, and wall sockets, a MERN codebase forms an unbroken chain: LoginPage imports api.js, which calls routes/auth.js, which binds authController.js, which queries models/User.js.'
    },
    coreConcepts: [
      { name: 'ES Modules', desc: 'import and export statements creating static, tree-shakeable dependency graphs.' },
      { name: 'Call Chain', desc: 'React Component → Axios API Function → Express Route → Middleware Chain → Controller → Service → Model → MongoDB.' },
      { name: 'Cross-Tier Contracts', desc: 'VITE_API_URL and standard JSON response envelopes { success, data, error } act as the bridge between client and server.' }
    ],
    interactiveTool: 'file-connection-map',
    priceradarDetails: 'In PriceRadar, client/src/services/api.js imports axios and exports API caller functions that map 1-to-1 with route endpoints mounted in server/src/app.js.',
    commonMistakes: [
      'Circular dependency cycles where File A imports File B and File B imports File A.',
      'Hardcoding API endpoint strings inside individual React components instead of centralizing in api.js.'
    ],
    interviewQuestions: [
      {
        q: 'Trace the complete file connection chain when an authenticated user creates a price alert.',
        a: 'AlertFormPage.jsx imports createAlert from api.js. api.js issues an HTTP POST to /api/alerts. app.js routes this to routes/alerts.js. routes/alerts.js chains requireAuth (middleware/auth.js) and validate (middleware/validate.js) before calling createAlert in controllers/alertsController.js. alertsController imports models/Alert.js to persist the record in MongoDB Atlas and returns JSON.'
      }
    ]
  },

  // --- MODULE 14 ---
  {
    id: 14,
    title: 'Module 14: End-to-End Real-World Request Walkthrough',
    subtitle: 'Chronological step-by-step simulations of real user journeys',
    analogy: {
      concept: 'The Full Journey of an Online Purchase',
      story: 'Following a single package from the click of "Order Now", through warehouse packing, logistics routing, carrier transit, and final doorstep delivery.'
    },
    coreConcepts: [
      { name: 'User Action Phase', desc: 'User clicks button, form state updates, validation triggers.' },
      { name: 'Network Phase', desc: 'Axios serializes payload, adds Bearer header, executes TLS handshake.' },
      { name: 'Backend Pipeline Phase', desc: 'Express traverses CORS, body-parser, auth guard, and controller logic.' },
      { name: 'Data & External Phase', desc: 'Mongoose queries MongoDB Atlas, services call external APIs (Brevo/Telegram).' },
      { name: 'UI Reconciliation Phase', desc: 'React unwraps response, updates state/context, and triggers Virtual DOM reconciliation.' }
    ],
    interactiveTool: 'request-walkthrough',
    priceradarDetails: 'Interactive stepper allows walking through: 1) Registration OTP flow, 2) User Login, 3) Product Search, and 4) Alert Creation & 4-Hour Background Notification.',
    commonMistakes: [
      'Not providing visual loading states on the frontend while asynchronous network requests are in flight.',
      'Failing to handle network disconnections gracefully in React UI.'
    ],
    interviewQuestions: [
      {
        q: 'Walk me through the lifecycle of a price drop alert notification in PriceRadar.',
        a: '1) Alert is saved in MongoDB. 2) GitHub Actions cron fires every 4 hours, waking Render. 3) priceMonitor.js acquires distributed lock and fetches distinct offers once. 4) PriceObservation is saved. 5) alertEvaluator.js checks condition (target vs current). 6) If met and armed, alertDispatcher.js sends email via Brevo and push message via Telegram Bot. 7) NotificationEvent is saved with dedupeKey, and alert is disarmed to prevent duplicate alerts.'
      }
    ]
  },

  // --- MODULE 15 ---
  {
    id: 15,
    title: 'Module 15: Background Jobs & Price Monitoring Engine',
    subtitle: 'GitHub Actions Cron, Render Cold Starts, Distributed Locking & Deduplication',
    analogy: {
      concept: 'The Automatic Lighthouse Beacon',
      story: 'A remote lighthouse operates without humans inside. Every 4 hours, a satellite timer (GitHub Actions) sends a radio pulse to wake the generator (Render server). The generator acquires the master key (MonitorLock), scans all nearby ships (Retailer Offers), detects any changes, and beams radio warnings (Brevo/Telegram).'
    },
    coreConcepts: [
      { name: 'Cron Expression', desc: '0 */4 * * * runs at minute 0 of every 4th hour (00, 04, 08, 12, 16, 20 UTC → 05:30, 09:30, 13:30, 17:30, 21:30, 01:30 IST).' },
      { name: 'Render Cold Start Solution', desc: 'GitHub Actions sends pre-flight curl probe to GET /api/health with 6 retries (5s delay) to wake container.' },
      { name: 'HTTP 202 Accepted', desc: 'Backend starts monitoring in background and immediately responds 202; GitHub polls GET /api/monitor/status.' },
      { name: 'Distributed Mutex (MonitorLock)', desc: 'Atomic MongoDB lease with 15-min heartbeat preventing overlapping cycles and recovering crashed runs.' },
      { name: 'Distinct Offer Deduplication', desc: 'Consolidates 500 alerts on the same item into 1 upstream fetch, reducing external network traffic by 99%.' }
    ],
    interactiveTool: 'architecture-explorer',
    priceradarDetails: 'Detailed in server/src/services/priceMonitor.js and .github/workflows/monitor.yml. Supports Apify cloud actors, eBay Browse API, and local Python worker.',
    commonMistakes: [
      'Relying on setInterval() in free-tier cloud containers that sleep after 15 minutes of inactivity.',
      'Fetching the same retailer page hundreds of times for multiple users instead of deduplicating offers.'
    ],
    interviewQuestions: [
      {
        q: 'How do you prevent duplicate email notifications when a product price remains low across multiple monitoring cycles?',
        a: 'PriceRadar uses a stateful armed flag on Alert documents. When an alert triggers, it disarms (armed = false), preventing duplicate notifications during subsequent cycles. It re-arms only if the price rises back above the target. Additionally, NotificationEvent enforces a unique compound index on dedupeKey (${alertId}:${currentPriceInPaise}) as an immutable database safety net.'
      }
    ]
  },

  // --- MODULE 16 ---
  {
    id: 16,
    title: 'Module 16: Error Handling & Debugging Across the Stack',
    subtitle: 'try/catch, Async Handlers, Network Failures, 503 Guards & DevTools',
    analogy: {
      concept: 'The Automobile Diagnostic System (OBD-II)',
      story: 'When an engine misfires, the dashboard displays an exact trouble code (P0301) rather than the whole car exploding. In MERN, error handling catches exceptions gracefully, logs the root cause, and displays a friendly notice to the driver.'
    },
    coreConcepts: [
      { name: 'Frontend ErrorBoundary', desc: 'React class component capturing uncaught JavaScript rendering exceptions and rendering a fallback card.' },
      { name: 'Axios Error Interception', desc: 'Catches HTTP 401 Unauthorized, automatically clears invalid tokens from localStorage, and redirects to /login.' },
      { name: 'Fast-Fail 503 Guard', desc: 'Express middleware checking database connection state and returning actionable 503 instead of 30-second timeouts.' },
      { name: 'Structured Error Envelopes', desc: '{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }.' }
    ],
    interactiveTool: 'endpoint-explorer',
    priceradarDetails: 'server/src/middleware/errorHandler.js normalizes Mongoose cast errors, duplicate key 11000 errors, and validation errors into clean JSON.',
    commonMistakes: [
      'Swallowing errors silently with empty catch (e) {} blocks, making bugs impossible to trace.',
      'Leaking raw database stack traces or SQL/Mongo query dumps to clients in production.'
    ],
    interviewQuestions: [
      {
        q: 'How do you debug an API endpoint that fails in production?',
        a: '1) Inspect Chrome DevTools Network tab for Request URL, Headers, and Response body. 2) Check Render server logs for error stack traces. 3) Verify if express-validator rejected invalid inputs. 4) Check database connection state via GET /api/health. 5) Inspect MongoDB Atlas collections directly to verify schema field types and document presence.'
      }
    ]
  },

  // --- MODULE 17 ---
  {
    id: 17,
    title: 'Module 17: Core JavaScript Concepts Used in MERN',
    subtitle: 'Closures, Event Loop, Promises, Array Methods & ES Modules',
    analogy: {
      concept: 'The Tools in a Master Craftsman Toolbelt',
      story: 'You cannot build a house without knowing how a hammer, saw, and level work. You cannot master MERN without mastering JavaScript primitives, closures, and the asynchronous event loop.'
    },
    coreConcepts: [
      { name: 'Closures', desc: 'An inner function retaining access to outer lexical scope variables (e.g. asyncHandler wrapping controllers).' },
      { name: 'Event Loop', desc: 'Single-threaded non-blocking coordinator routing synchronous Call Stack tasks and asynchronous Microtasks.' },
      { name: 'map, filter, reduce', desc: 'Essential array transformers used for calculating prices, filtering in-stock offers, and finding minimums.' },
      { name: 'Destructuring & Spread', desc: 'const { email } = req.body; and { ...offer, status: "ok" }.' },
      { name: 'Nullish Coalescing (??)', desc: 'Returns right-hand side only if left is null/undefined, preserving valid 0 numbers.' }
    ],
    interactiveTool: 'architecture-explorer',
    priceradarDetails: 'PriceRadar uses pure ES Modules (import/export), async/await across all controllers, and functional array pipelines in services/priceComparison.js.',
    commonMistakes: [
      'Using || instead of ?? for numeric variables: price || 100 will incorrectly overwrite a valid price of 0!',
      'Modifying original arrays directly instead of using pure methods like map() or filter().'
    ],
    interviewQuestions: [
      {
        q: 'Explain the difference between microtasks and macrotasks in the JavaScript Event Loop.',
        a: 'Microtasks (Promises, process.nextTick, queueMicrotask) have higher priority and execute immediately after the current synchronous script completes, before any macrotasks (setTimeout, setInterval, I/O callbacks) are processed. In Express, Promise resolutions in async controllers execute as microtasks.'
      }
    ]
  },

  // --- MODULE 18 ---
  {
    id: 18,
    title: 'Module 18: Where Do I Add a New File or Feature?',
    subtitle: 'The Interactive Feature Placement Guide for Developers',
    analogy: {
      concept: 'The Architectural Blueprints for Expanding a Building',
      story: 'When adding a sunroom to a house, you do not tear down the kitchen. You follow the structural blueprints: foundation first, framing next, electrical wiring, and finally paint and furniture.'
    },
    coreConcepts: [
      { name: 'Adding a New Page', desc: 'Create in client/src/pages/, register route in client/src/App.jsx, add link in Navbar.jsx.' },
      { name: 'Adding an API Endpoint', desc: 'Define route in server/src/routes/, create handler in server/src/controllers/, add logic in server/src/services/.' },
      { name: 'Adding a Database Entity', desc: 'Create schema model in server/src/models/ with types, validators, and compound indexes.' },
      { name: 'Adding an API Client Method', desc: 'Add unwrapped Axios call function in client/src/services/api.js.' }
    ],
    interactiveTool: 'where-to-put-code',
    priceradarDetails: 'Interactive wizard walks through 11 real developer scenarios: from adding a new retailer scraper to adding user profile pictures or SMS alerts.',
    commonMistakes: [
      'Adding 500 lines of business logic directly into an Express controller instead of delegating to a service.',
      'Creating redundant axios instances in component files instead of exporting helpers from api.js.'
    ],
    interviewQuestions: [
      {
        q: 'If you were asked to add a new retailer (e.g. Croma) to PriceRadar, which files would you create or edit?',
        a: '1) Create server/src/providers/croma.js implementing fetchOffer(offer). 2) Update server/src/providers/index.js provider dispatcher to route offer.provider === "croma" to the new adapter. 3) Add "croma" to the retailer and provider enums in models/Offer.js. 4) Add Croma store badge and logo styling in client/src/components/OfferRow.jsx.'
      }
    ]
  },

  // --- MODULE 19 ---
  {
    id: 19,
    title: 'Module 19: Professional Deployment & DevOps',
    subtitle: 'Environment Variables, Git Workflows, Render Hosting & CI/CD',
    analogy: {
      concept: 'The Staging & Launch of a Rocket',
      story: 'A rocket is built in a sterile clean room (Local Dev), tested on a vibration simulator (GitHub Actions CI), fueled on the launchpad (Production Environment Variables), and launched into orbit (Render Cloud Hosting).'
    },
    coreConcepts: [
      { name: 'Environment Variables', desc: 'Secrets and URLs loaded at runtime via process.env, never hardcoded in source control.' },
      { name: 'CI/CD Pipeline (ci.yml)', desc: 'GitHub Actions workflow running linter and 277 Jest tests on every push and PR.' },
      { name: 'Render Web Service', desc: 'Hosts the Node.js Express backend with health checks and auto-deploys on git push.' },
      { name: 'Render Static Site', desc: 'Hosts the compiled Vite React frontend with single-page rewrite rules to /index.html.' }
    ],
    interactiveTool: 'architecture-explorer',
    priceradarDetails: 'Configured in docs/RENDER_DEPLOYMENT.md and .github/workflows/. Deployed at priceradar-web.onrender.com (frontend) and priceradar-api-02ib.onrender.com (backend).',
    commonMistakes: [
      'Accidentally committing .env files with live MongoDB Atlas connection strings or API keys to public GitHub repositories.',
      'Forgetting SPA rewrite rules on static site hosts, causing 404 errors on browser page refreshes.'
    ],
    interviewQuestions: [
      {
        q: 'Why do Single Page Applications (SPAs) require rewrite rules when deployed on static site hosts like Render or Netlify?',
        a: 'In an SPA, React Router manages routing in the browser. When a user directly visits https://priceradar-web.onrender.com/dashboard, the hosting server looks for a physical dashboard.html file. Because only index.html exists, the server returns 404 unless a rewrite rule redirects all /* requests back to /index.html with HTTP 200.'
      }
    ]
  },

  // --- MODULE 20 ---
  {
    id: 20,
    title: 'Module 20: Comprehensive Technical Interview Prep',
    subtitle: '50 Project-Specific Questions, MERN Fundamentals & Model Answers',
    analogy: {
      concept: 'The Grand Championship Final Exam',
      story: 'Bringing together every theoretical concept, architecture diagram, and line of code into fluent, confident, senior-level explanations that impress interviewers.'
    },
    coreConcepts: [
      { name: 'Fluency in Architecture', desc: 'Ability to draw and explain the entire request-response journey from memory.' },
      { name: 'Confidence in Code Choices', desc: 'Explaining WHY integer paise, WHY distributed locks, and WHY GitHub Actions cron was chosen.' },
      { name: 'Senior Problem-Solving', desc: 'Articulating failure scenarios, concurrency race conditions, and production scalability improvements.' }
    ],
    interactiveTool: 'quizzes',
    priceradarDetails: 'Contains 50 detailed project-specific questions with simple summaries, technical explanations, and follow-up answers.',
    commonMistakes: [
      'Memorizing textbook definitions without being able to connect them to actual project files.',
      'Claiming features (like automatic buying or durable queues) that are not implemented in the actual codebase.'
    ],
    interviewQuestions: [
      {
        q: 'What makes PriceRadar stand out as an engineering project on your resume?',
        a: 'PriceRadar goes far beyond a basic CRUD app. It implements an enterprise multi-tier architecture solving real distributed challenges: financial accuracy via integer-paise math, cloud cold-start resilience via automated pre-flight probes, race-safe distributed mutex locking in MongoDB, multi-tenant offer deduplication, and multi-channel alerting via Brevo and Telegram.'
      }
    ]
  }
];

export const MODULES = modulesData;
export default modulesData;

