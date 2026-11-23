import {
  Compass, Layers, Globe, Server, Database, Shield,
  GitMerge, Cpu, Search, Award
} from 'lucide-react';

export const WORLDS_DATA = [
  {
    id: 1,
    name: 'Web Development Kingdom',
    subtitle: 'The Gateway to the Web',
    icon: Compass,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    requiredLevel: 1,
    minXP: 0,
    description: 'Master the fundamental laws of client-server architecture, HTTP protocols, and request journeys.',
    boss: {
      id: 'boss_1',
      name: 'Architect Chronos',
      title: 'Keeper of the HTTP Protocol',
      avatar: '🧙‍♂️',
      hp: 100,
      rewardXP: 300,
      question: 'Explain the complete journey of a web request from the moment a user clicks a button to when the UI updates with database data.',
      keywords: ['browser', 'dns', 'http', 'tcp', 'ip', 'express', 'server', 'controller', 'database', 'json', 'react', 'state', 'render'],
      modelAnswer: 'When a user clicks a button, React triggers an event handler that calls an Axios HTTP request. The browser resolves the server domain via DNS and sends an HTTP packet over TCP/IP. The Express server receives the request, passes it through middleware (CORS, body-parser, auth), and routes it to the controller. The controller executes Mongoose queries against MongoDB, receives BSON documents, formats them into a JSON response, and sends it back with an HTTP status code (200/201). Axios receives the JSON, resolves the promise, React updates state via useState, and triggers a Virtual DOM reconciliation to update the screen.'
    },
    missions: [
      { id: 'm1_1', title: 'What is a Web Application?', moduleId: 1, xp: 50, type: 'concept' },
      { id: 'm1_2', title: 'Frontend vs Backend vs Database', moduleId: 1, xp: 50, type: 'concept' },
      { id: 'm1_3', title: 'The Request-Response Lifecycle', moduleId: 4, xp: 100, type: 'simulator' },
      { id: 'm1_4', title: 'Network Ports & Protocol Anatomy', moduleId: 8, xp: 75, type: 'quiz' }
    ]
  },
  {
    id: 2,
    name: 'React Frontend City',
    subtitle: 'The Metropolis of User Interfaces',
    icon: Layers,
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #0e7490, #06b6d4)',
    requiredLevel: 2,
    minXP: 250,
    description: 'Forge reactive user interfaces with React 18, JSX, Virtual DOM reconciliation, and modern state hooks.',
    boss: {
      id: 'boss_2',
      name: 'Lady Reacta',
      title: 'Grand Mistress of the Virtual DOM',
      avatar: '⚡',
      hp: 120,
      rewardXP: 400,
      question: 'Why does React use a Virtual DOM instead of updating the real DOM directly, and what role do hooks like useState and useEffect play?',
      keywords: ['virtual dom', 'reconciliation', 'diffing', 'batching', 'performance', 'usestate', 'useeffect', 'lifecycle', 're-render'],
      modelAnswer: 'Direct real DOM manipulation is slow because it causes expensive layout recalculations and browser repaints. React creates a lightweight JavaScript tree in memory (the Virtual DOM). When state changes via useState, React creates a new VDOM tree, runs a diffing algorithm (Reconciliation) to find minimal changes, and applies only those changes in a single batched real DOM update. useEffect handles side-effects like API data fetching and subscriptions synchronized with component lifecycle.'
    },
    missions: [
      { id: 'm2_1', title: 'Component Hierarchy & JSX Rules', moduleId: 5, xp: 60, type: 'concept' },
      { id: 'm2_2', title: 'State & Props Mastery (useState, useEffect)', moduleId: 7, xp: 80, type: 'simulator' },
      { id: 'm2_3', title: 'Shared State with Context API', moduleId: 7, xp: 90, type: 'concept' },
      { id: 'm2_4', title: 'Debounced Search & Performance (useRef)', moduleId: 7, xp: 100, type: 'code' }
    ]
  },
  {
    id: 3,
    name: 'Axios & API Gateway',
    subtitle: 'The Transport Highway',
    icon: Globe,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
    requiredLevel: 3,
    minXP: 600,
    description: 'Master HTTP verbs, asynchronous Axios clients, request interceptors, and robust error envelopes.',
    boss: {
      id: 'boss_3',
      name: 'Baron Axios',
      title: 'Master of Asynchronous Conduits',
      avatar: '🌐',
      hp: 140,
      rewardXP: 450,
      question: 'How do Axios interceptors work, and how does PriceRadar use them for automated JWT token attachment and error handling?',
      keywords: ['interceptor', 'request', 'response', 'bearer', 'authorization', 'token', 'localstorage', '401', 'error', 'envelope'],
      modelAnswer: 'Axios interceptors are middleware functions that intercept requests before they are sent and responses before they reach then/catch. In PriceRadar, a request interceptor reads the JWT token from localStorage and automatically attaches it as an Authorization: Bearer <token> header to every outgoing call. A response interceptor checks for 401 Unauthorized errors, clears invalid tokens, and redirects the user to the login screen, ensuring centralized auth management.'
    },
    missions: [
      { id: 'm3_1', title: 'HTTP Verbs: GET, POST, PUT, DELETE', moduleId: 9, xp: 70, type: 'concept' },
      { id: 'm3_2', title: 'Interactive Axios Playground', moduleId: 6, xp: 100, type: 'simulator' },
      { id: 'm3_3', title: 'Request & Response Interceptors', moduleId: 6, xp: 85, type: 'code' },
      { id: 'm3_4', title: 'Error Envelopes & Network Failures', moduleId: 10, xp: 90, type: 'quiz' }
    ]
  },
  {
    id: 4,
    name: 'Express Backend Fortress',
    subtitle: 'The Engine of Logic & Computation',
    icon: Server,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #047857, #10b981)',
    requiredLevel: 4,
    minXP: 1000,
    description: 'Construct scalable Node.js servers, Express middleware pipelines, modular routers, and robust controllers.',
    boss: {
      id: 'boss_4',
      name: 'Commander Expressor',
      title: 'Guardian of the Pipeline',
      avatar: '🛡️',
      hp: 150,
      rewardXP: 500,
      question: 'What is Express middleware, what is the role of next(), and what happens if you forget to call next() or send a response?',
      keywords: ['middleware', 'req', 'res', 'next', 'pipeline', 'hang', 'timeout', 'cors', 'body-parser', 'chain'],
      modelAnswer: 'Middleware is a function that receives (req, res, next) with access to request and response objects. It can inspect/modify requests, validate tokens, or reject invalid payloads. The next() function tells Express to pass control to the next middleware in the execution chain. If a middleware neither sends a response (like res.json()) nor calls next(), the HTTP request will hang indefinitely until the client or server times out.'
    },
    missions: [
      { id: 'm4_1', title: 'Node.js Event Loop & Express Server Boot', moduleId: 8, xp: 75, type: 'concept' },
      { id: 'm4_2', title: 'Modular Routing: Routes vs Controllers', moduleId: 9, xp: 85, type: 'concept' },
      { id: 'm4_3', title: 'The Middleware Pipeline Simulator', moduleId: 11, xp: 110, type: 'simulator' },
      { id: 'm4_4', title: 'Express Validator & Sanitization', moduleId: 11, xp: 90, type: 'code' }
    ]
  },
  {
    id: 5,
    name: 'MongoDB Database World',
    subtitle: 'The Vault of Persistent Data',
    icon: Database,
    color: '#059669',
    gradient: 'linear-gradient(135deg, #065f46, #059669)',
    requiredLevel: 5,
    minXP: 1450,
    description: 'Model documents with Mongoose, build compound indexes, execute CRUD, and enforce integer-paise financial accuracy.',
    boss: {
      id: 'boss_5',
      name: 'Golem Mongo',
      title: 'Lord of the BSON Vaults',
      avatar: '🗿',
      hp: 160,
      rewardXP: 550,
      question: 'Why does PriceRadar store currency in integer paise instead of floating-point rupees, and how do compound indexes improve query performance?',
      keywords: ['paise', 'integer', 'floating point', 'rounding', 'precision', 'ieee 754', 'index', 'compound', 'b-tree', 'lookup'],
      modelAnswer: 'JavaScript numbers follow IEEE 754 floating-point standard where operations like 0.1 + 0.2 yield 0.30000000000000004. In e-commerce, rounding inaccuracies cause billing discrepancies. PriceRadar avoids this by storing prices strictly in integer paise (₹499.00 = 49900 paise). Compound indexes (like { provider: 1, externalProductId: 1 }) create an ordered B-tree index, allowing MongoDB to find listings in sub-millisecond time without scanning the entire collection.'
    },
    missions: [
      { id: 'm5_1', title: 'NoSQL vs SQL & BSON Document Structure', moduleId: 13, xp: 80, type: 'concept' },
      { id: 'm5_2', title: 'Mongoose Schemas & Field Validation', moduleId: 13, xp: 90, type: 'code' },
      { id: 'm5_3', title: 'Interactive 6-Stage CRUD Simulator', moduleId: 14, xp: 120, type: 'simulator' },
      { id: 'm5_4', title: 'Mongoose Populate vs Embedded Documents', moduleId: 13, xp: 95, type: 'quiz' }
    ]
  },
  {
    id: 6,
    name: 'JWT Security Headquarters',
    subtitle: 'The Bastion of Cryptography',
    icon: Shield,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #b45309, #f59e0b)',
    requiredLevel: 6,
    minXP: 1950,
    description: 'Implement salted bcrypt password hashing, stateless JSON Web Tokens, Bearer auth, and role-based access control.',
    boss: {
      id: 'boss_6',
      name: 'Cyber Sentinel Cipher',
      title: 'Grand Inquisitor of Cryptography',
      avatar: '🔐',
      hp: 180,
      rewardXP: 600,
      question: 'Explain the three parts of a JWT, why tokens are stateless, and what prevents a malicious user from altering their user role in a token.',
      keywords: ['header', 'payload', 'signature', 'base64', 'stateless', 'secret', 'hmac', 'sha256', 'tamper', 'verification'],
      modelAnswer: 'A JWT consists of three Base64URL-encoded parts separated by dots: Header (algorithm), Payload (claims/userId/role), and Signature. It is stateless because the server does not need to store active sessions in a database; all identity data travels in the token. If an attacker alters their role from "user" to "admin" in the payload, the HMAC-SHA256 signature calculated with the secret key on the server will no longer match, causing jwt.verify() to throw JsonWebTokenError and reject the request.'
    },
    missions: [
      { id: 'm6_1', title: 'Password Hashing & Bcrypt Salts', moduleId: 12, xp: 85, type: 'concept' },
      { id: 'm6_2', title: 'JWT Structure & The Stateless Model', moduleId: 12, xp: 95, type: 'code' },
      { id: 'm6_3', title: 'Interactive JWT Simulator & Attack Lab', moduleId: 12, xp: 130, type: 'simulator' },
      { id: 'm6_4', title: 'requireAuth & requireAdmin Middleware', moduleId: 12, xp: 100, type: 'quiz' }
    ]
  },
  {
    id: 7,
    name: 'Full Stack Integration City',
    subtitle: 'The Confluence of Client & Server',
    icon: GitMerge,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #be185d, #ec4899)',
    requiredLevel: 7,
    minXP: 2500,
    description: 'Wire up complete end-to-end user journeys: forms, Axios dispatch, middleware validation, DB queries, and UI re-renders.',
    boss: {
      id: 'boss_7',
      name: 'Integrator Prime',
      title: 'Architect of Full-Stack Synchrony',
      avatar: '🔮',
      hp: 200,
      rewardXP: 700,
      question: 'Describe how an authentication state transition works from login form submit to protected dashboard render in a React + Express app.',
      keywords: ['authcontext', 'localstorage', 'setuser', 'api.post', 'protectedroute', 'jwt', 'bearer', 'redirect', 're-render'],
      modelAnswer: '1. User enters credentials in Login.jsx and clicks submit. 2. AuthContext calls api.post("/auth/login"). 3. Express verifies password with bcrypt and returns a signed JWT. 4. AuthContext saves token to localStorage and sets user state. 5. Axios interceptor now attaches this token to future requests. 6. React Router ProtectedRoute checks user state, grants access, and renders Dashboard.jsx, which immediately calls protected endpoints.'
    },
    missions: [
      { id: 'm7_1', title: 'End-to-End Registration & OTP Verification Flow', moduleId: 15, xp: 100, type: 'simulator' },
      { id: 'm7_2', title: 'Debounced Catalog Search & State Synchronization', moduleId: 16, xp: 110, type: 'simulator' },
      { id: 'm7_3', title: 'Watchlist Mutation & Optimistic UI Updates', moduleId: 14, xp: 120, type: 'code' },
      { id: 'm7_4', title: 'Full-Stack Error Handling & User Feedback', moduleId: 11, xp: 100, type: 'quiz' }
    ]
  },
  {
    id: 8,
    name: 'Project Architect Headquarters',
    subtitle: 'The Citadel of Production Architecture',
    icon: Cpu,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #4338ca, #6366f1)',
    requiredLevel: 8,
    minXP: 3100,
    description: 'Master clean architecture, separation of concerns, environment secrets management, and automated production pipelines.',
    boss: {
      id: 'boss_8',
      name: 'High Architect Vance',
      title: 'Chief of Production Engineering',
      avatar: '🏛️',
      hp: 220,
      rewardXP: 800,
      question: 'Where should business logic reside in a MERN application, and why should route handlers not directly run database queries?',
      keywords: ['separation of concerns', 'controller', 'service', 'model', 'testability', 'reusability', 'modular', 'clean code'],
      modelAnswer: 'Route files should strictly map URL paths and HTTP verbs to controller functions. Business logic and database operations belong in controllers or dedicated service modules. Mixing queries directly into routes creates monolithic, untestable code with tight coupling. Separating routes, controllers, services, and models ensures high testability, easy maintenance, and code reusability across webhooks, cron jobs, and API endpoints.'
    },
    missions: [
      { id: 'm8_1', title: 'Professional MERN Folder Structure Conventions', moduleId: 2, xp: 100, type: 'concept' },
      { id: 'm8_2', title: 'Code Placement Wizard: Where Do I Put This File?', moduleId: 19, xp: 130, type: 'simulator' },
      { id: 'm8_3', title: 'Environment Secrets (.env) & Production Config', moduleId: 18, xp: 110, type: 'code' },
      { id: 'm8_4', title: 'Render Cloud Deployment & 503 Startup Debugging', moduleId: 18, xp: 120, type: 'quiz' }
    ]
  },
  {
    id: 9,
    name: 'Real Project Training Ground',
    subtitle: 'PriceRadar Deep Inspection Zone',
    icon: Search,
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #0f766e, #14b8a6)',
    requiredLevel: 9,
    minXP: 3800,
    description: 'Deep dive into the actual PriceRadar codebase: distributed MongoDB mutex locks, 4-hour GitHub Actions cron, and price scrapers.',
    boss: {
      id: 'boss_9',
      name: 'Grandmaster Radar',
      title: 'Lord of Distributed Price Monitoring',
      avatar: '📡',
      hp: 250,
      rewardXP: 900,
      question: 'How does PriceRadar ensure that a 4-hour monitoring cycle does not run concurrently twice, and how does it prevent spamming users with duplicate price drop emails?',
      keywords: ['distributed lock', 'monitorlock', 'expiresat', 'heartbeat', 'dedupekey', 'unique index', 'notificationevent', 'concurrency'],
      modelAnswer: 'PriceRadar achieves concurrency safety using a distributed lease in the MonitorLock collection. Before scraping, the worker executes a findOneAndUpdate query acquiring a lock with a 15-minute expiration heartbeat. If another instance is running, the lock cannot be acquired, preventing duplicate runs. For email deduplication, PriceRadar writes to the NotificationEvent collection with a unique dedupeKey compound index (${userId}_${offerId}_${priceInPaise}_${date}), rejecting duplicate alerts at the database engine level.'
    },
    missions: [
      { id: 'm9_1', title: 'Deep Inspecting PriceRadar Source Tree & Models', moduleId: 2, xp: 110, type: 'simulator' },
      { id: 'm9_2', title: 'The 4-Hour Background Cron Flow & Pre-flight Wakeup', moduleId: 17, xp: 130, type: 'simulator' },
      { id: 'm9_3', title: 'Distributed Mutex Lock (MonitorLock.js) Analysis', moduleId: 17, xp: 140, type: 'code' },
      { id: 'm9_4', title: 'Offer Deduplication & Notification Event Tracing', moduleId: 16, xp: 120, type: 'quiz' }
    ]
  },
  {
    id: 10,
    name: 'Professional Developer Arena',
    subtitle: 'The Pinnacle of Full-Stack Mastery',
    icon: Award,
    color: '#e11d48',
    gradient: 'linear-gradient(135deg, #9f1239, #e11d48)',
    requiredLevel: 10,
    minXP: 4600,
    description: 'Defeat real-world production debugging bugs, solve the Architecture Builder challenge, and conquer technical review interviews.',
    boss: {
      id: 'boss_10',
      name: 'The Senior Tech Lead',
      title: 'Principal Full-Stack Architect',
      avatar: '👑',
      hp: 300,
      rewardXP: 1200,
      question: 'What makes your PriceRadar MERN application stand out as an enterprise-grade portfolio project during a technical interview?',
      keywords: ['integer paise', 'distributed lock', 'github actions', 'cold start', 'brevo', 'telegram', 'deduplication', 'jwt', 'security', 'enterprise'],
      modelAnswer: 'PriceRadar is not a generic tutorial CRUD app. It solves complex distributed systems challenges: financial precision via integer-paise currency math, zero-cost 4-hour serverless cron orchestration via GitHub Actions webhooks, serverless cold-start resilience via pre-flight health polling, race-condition safety via distributed MongoDB mutex leases, and multi-tenant notification deduplication via database-level unique compound keys.'
    },
    missions: [
      { id: 'm10_1', title: 'The Debugging Arena: Spot & Fix 6 Production Bugs', moduleId: 18, xp: 150, type: 'debugging' },
      { id: 'm10_2', title: 'The Architecture Builder: Organize Full-Stack Files', moduleId: 19, xp: 150, type: 'builder' },
      { id: 'm10_3', title: 'Build Your Own MERN Project Interactive Workshop', moduleId: 19, xp: 200, type: 'workshop' },
      { id: 'm10_4', title: '50+ Real Interview Review Questions Masterclass', moduleId: 20, xp: 250, type: 'quiz' }
    ]
  }
];

export const DEVELOPER_LEVELS = [
  { level: 1, title: 'Code Beginner', minXP: 0, badge: '🌱', perks: 'Can inspect web architecture' },
  { level: 2, title: 'Web Explorer', minXP: 250, badge: '🧭', perks: 'Unlocks React Frontend City' },
  { level: 3, title: 'React Apprentice', minXP: 600, badge: '⚡', perks: 'Unlocks Axios API Gateway' },
  { level: 4, title: 'API Navigator', minXP: 1000, badge: '🌐', perks: 'Unlocks Express Backend Fortress' },
  { level: 5, title: 'Backend Builder', minXP: 1450, badge: '🛠️', perks: 'Unlocks MongoDB Database World' },
  { level: 6, title: 'Database Engineer', minXP: 1950, badge: '🗄️', perks: 'Unlocks JWT Security HQ' },
  { level: 7, title: 'Security Specialist', minXP: 2500, badge: '🔐', perks: 'Unlocks Full Stack Integration City' },
  { level: 8, title: 'Full Stack Developer', minXP: 3100, badge: '🚀', perks: 'Unlocks Project Architect HQ' },
  { level: 9, title: 'Project Architect', minXP: 3800, badge: '🏛️', perks: 'Unlocks PriceRadar Training Ground' },
  { level: 10, title: 'MERN Master', minXP: 4600, badge: '👑', perks: 'All Bosses Defeated & Production Ready' }
];
