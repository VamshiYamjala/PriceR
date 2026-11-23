// mern-learning-platform/src/data/filesData.js

export const genericMernStructure = {
  name: 'Standard Industry MERN Skeleton',
  description: 'How modern production MERN applications are conventionally organized across teams.',
  folders: [
    {
      name: 'client/src/components',
      purpose: 'Stateless or semi-stateful reusable UI elements (Buttons, Cards, Navbars, Modals).',
      whatBelongs: 'Components rendered in multiple screens that do not own major business routes.',
      whatDoesNotBelong: 'Full-page layouts, heavy API orchestration, direct route handlers.'
    },
    {
      name: 'client/src/pages',
      purpose: 'Full-screen views mapped 1-to-1 with React Router URL paths.',
      whatBelongs: 'DashboardPage, LoginPage, SearchPage, CheckoutPage.',
      whatDoesNotBelong: 'Small reusable buttons, database models, raw SQL/Mongo queries.'
    },
    {
      name: 'client/src/context',
      purpose: 'Global state managers using React Context API to avoid prop drilling.',
      whatBelongs: 'AuthContext, ThemeContext, CartContext, NotificationContext.',
      whatDoesNotBelong: 'One-off form inputs or temporary component state.'
    },
    {
      name: 'client/src/services',
      purpose: 'Centralized HTTP communication layer wrapping Axios or Fetch.',
      whatBelongs: 'api.js, authService.js, productService.js with interceptors.',
      whatDoesNotBelong: 'JSX markup, CSS styles, direct DOM manipulation.'
    },
    {
      name: 'server/src/routes',
      purpose: 'Express URL endpoint definitions and middleware binding.',
      whatBelongs: 'authRoutes.js, productRoutes.js, alertRoutes.js.',
      whatDoesNotBelong: 'Direct database queries, heavy algorithms, password hashing.'
    },
    {
      name: 'server/src/controllers',
      purpose: 'HTTP request/response handlers: unpacks input, invokes services/models, returns status codes.',
      whatBelongs: 'authController.js, productsController.js.',
      whatDoesNotBelong: 'HTML generation, complex data scraping scripts.'
    },
    {
      name: 'server/src/services',
      purpose: 'Pure business logic, orchestration, and third-party API integrations.',
      whatBelongs: 'paymentService.js, priceMonitor.js, emailService.js.',
      whatDoesNotBelong: 'Express req/res objects (services should be decoupled from HTTP transport).'
    },
    {
      name: 'server/src/models',
      purpose: 'Mongoose ODM schemas defining collection shapes, types, indexes, and validation.',
      whatBelongs: 'User.js, Product.js, Order.js with custom schema validators.',
      whatDoesNotBelong: 'Express routing, email templates, UI styles.'
    },
    {
      name: 'server/src/middleware',
      purpose: 'Intermediary request interceptors executing before controllers.',
      whatBelongs: 'auth.js (JWT verify), validate.js (input sanitization), rateLimiter.js.',
      whatDoesNotBelong: 'Final HTTP responses for successful requests (must call next()).'
    }
  ]
};

export const priceRadarFiles = [
  // --- CLIENT FILES ---
  {
    id: 'client-main-jsx',
    name: 'main.jsx',
    path: 'client/src/main.jsx',
    layer: 'Frontend Bootstrap',
    whyExists: 'The initial JavaScript execution entrypoint for the browser.',
    responsibility: 'Finds the HTML <div id="root"> element, creates the ReactDOM root, and mounts App inside BrowserRouter.',
    imports: ["react", "react-dom/client", "react-router-dom (BrowserRouter)", "./App.jsx", "./styles/theme.css"],
    exports: ['None (executes root render immediately)'],
    functions: ['ReactDOM.createRoot(document.getElementById("root")).render(...)'],
    usedBy: ['client/index.html (via <script type="module" src="/src/main.jsx">)'],
    dependsOn: ['client/src/App.jsx', 'client/src/context/AuthContext.jsx'],
    codeSnippet: `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);`,
    flowPosition: 'Step 1 in Client App Boot Sequence.'
  },
  {
    id: 'client-app-jsx',
    name: 'App.jsx',
    path: 'client/src/App.jsx',
    layer: 'Frontend Routing',
    whyExists: 'Defines the entire client-side URL hierarchy and layout shell.',
    responsibility: 'Renders Navbar & Footer, wraps screen routing in ErrorBoundary, maps URLs to page components, and guards private routes with <ProtectedRoute>.',
    imports: ['react-router-dom (Routes, Route)', './components/Navbar', './components/Footer', './components/ProtectedRoute', 'Pages (Home, Search, Details, Login, Register, Dashboard, Alerts, Watchlist)'],
    exports: ['export default function App()'],
    functions: ['App() component function returning JSX layout'],
    usedBy: ['client/src/main.jsx'],
    dependsOn: ['All page components in client/src/pages/'],
    codeSnippet: `export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><AlertManagementPage /></ProtectedRoute>} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}`,
    flowPosition: 'Central router directing browser traffic to matching pages.'
  },
  {
    id: 'client-api-js',
    name: 'api.js',
    path: 'client/src/services/api.js',
    layer: 'Frontend API Client',
    whyExists: 'The single, centralized HTTP transport module connecting React to the Express REST API.',
    responsibility: 'Configures Axios singleton, reads VITE_API_URL, uses request interceptors to automatically attach JWT Bearer token from localStorage, and unwraps response data payloads.',
    imports: ['axios'],
    exports: ['login, register, searchProducts, getProduct, getOfferHistory, createAlert, getWatchlist, addToWatchlist, triggerPriceRefresh'],
    functions: ['unwrap(responsePromise)', 'api.interceptors.request.use(...)', 'searchProducts(q)', 'createAlert(data)'],
    usedBy: ['Almost every page in client/src/pages/'],
    dependsOn: ['localStorage (priceradar_token)'],
    codeSnippet: `const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Auto-attach JWT Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('priceradar_token');
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

// Unwraps { success: true, data: {...} } -> returns data directly
function unwrap(p) { return p.then(res => res.data.data); }

export function searchProducts(q) {
  return unwrap(api.get('/api/products/search', { params: { q } }));
}`,
    flowPosition: 'Bridge: Translates React UI actions into outbound HTTP requests.'
  },
  {
    id: 'client-auth-context',
    name: 'AuthContext.jsx',
    path: 'client/src/context/AuthContext.jsx',
    layer: 'Frontend State Management',
    whyExists: 'Maintains global user login state across the entire React component tree.',
    responsibility: 'Stores { user, token, loading }, provides login(token, user) and logout() functions, re-hydrates user on page refresh via /api/auth/me.',
    imports: ['react (createContext, useState, useEffect, useContext)', '../services/api (getMe)'],
    exports: ['AuthProvider component', 'useAuth() custom hook'],
    functions: ['AuthProvider({ children })', 'useAuth()', 'login(newToken, newUser)', 'logout()'],
    usedBy: ['client/src/main.jsx', 'client/src/components/Navbar.jsx', 'client/src/components/ProtectedRoute.jsx'],
    dependsOn: ['client/src/services/api.js'],
    codeSnippet: `const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('priceradar_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getMe().then(res => setUser(res.user)).catch(() => logout());
    }
    setLoading(false);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}`,
    flowPosition: 'Global memory bank for active session authentication.'
  },

  // --- SERVER FILES ---
  {
    id: 'server-server-js',
    name: 'server.js',
    path: 'server/src/server.js',
    layer: 'Backend Entry Point',
    whyExists: 'The server startup process that boots the application listener.',
    responsibility: 'Loads environment variables, initializes MongoDB connection pool via connectDB(), starts in-process fallback scheduler, and binds app to HTTP PORT.',
    imports: ['./config/env.js', './app.js', './config/db.js', './services/scheduler.js'],
    exports: ['None (CLI entrypoint: node src/server.js)'],
    functions: ['startServer() async boot sequence', 'process.on("SIGINT") graceful shutdown'],
    usedBy: ['Render Web Service (npm start)', 'npm run dev (nodemon)'],
    dependsOn: ['server/src/app.js', 'server/src/config/db.js'],
    codeSnippet: `import './config/env.js';
import app from './app.js';
import { connectDB } from './config/db.js';
import { startScheduler } from './services/scheduler.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  startScheduler(); // Starts 4-hour internal timer
  app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
}
startServer();`,
    flowPosition: 'Stage 1 of Backend Boot.'
  },
  {
    id: 'server-app-js',
    name: 'app.js',
    path: 'server/src/app.js',
    layer: 'Express Application Assembler',
    whyExists: 'Assembles Express application middleware, routes, and global error handlers.',
    responsibility: 'Configures CORS allowlist, parses JSON body streams, exposes public /api/health probe, mounts fast-fail DB 503 middleware, mounts all 10 route modules, and catches errors with errorHandler.',
    imports: ['express', 'cors', 'mongoose', '10 route files', './middleware/errorHandler.js'],
    exports: ['export default app'],
    functions: ['app.use(cors())', 'app.use(express.json())', 'app.use("/api/products", productRoutes)'],
    usedBy: ['server/src/server.js', 'server/tests/ (Supertest test runner)'],
    dependsOn: ['All files in server/src/routes/'],
    codeSnippet: `const app = express();
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Public health probe
app.get('/api/health', (req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/monitor', monitorRoutes);

// Error handler MUST be last
app.use(errorHandler);
export default app;`,
    flowPosition: 'Central traffic controller routing incoming HTTP requests.'
  },
  {
    id: 'server-auth-middleware',
    name: 'auth.js',
    path: 'server/src/middleware/auth.js',
    layer: 'Backend Security Guard',
    whyExists: 'Protects private endpoints from unauthorized public access.',
    responsibility: 'Extracts Authorization: Bearer <token> header, cryptographically verifies HMAC-SHA256 signature using JWT_SECRET, and attaches decoded payload { id, role } to req.user.',
    imports: ['jsonwebtoken'],
    exports: ['export function requireAuth(req, res, next)'],
    functions: ['requireAuth(req, res, next)'],
    usedBy: ['server/src/routes/alerts.js', 'server/src/routes/watchlist.js', 'server/src/routes/notifications.js'],
    dependsOn: ['process.env.JWT_SECRET'],
    codeSnippet: `export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token required.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Populates req.user.id
    next(); // Passes to next handler!
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}`,
    flowPosition: 'Security gatekeeper between router and controller.'
  },
  {
    id: 'server-price-monitor',
    name: 'priceMonitor.js',
    path: 'server/src/services/priceMonitor.js',
    layer: 'Core Business Service',
    whyExists: 'The heartbeat engine that powers 4-hour automated price checks.',
    responsibility: 'Coordinates in-memory and MongoDB MonitorLock distributed leases, emits heartbeats, fetches distinct tracked offers once per cycle, saves PriceObservation records, evaluates active alerts, and dispatches notifications.',
    imports: ['../models/Offer.js', '../models/Alert.js', '../models/MonitorLock.js', '../models/PriceObservation.js', '../providers/index.js', './alertEvaluator.js', './alertDispatcher.js'],
    exports: ['runMonitoringCycle()', 'acquireDistributedLock()', 'releaseDistributedLock()', 'getMonitorState()'],
    functions: ['runMonitoringCycle()', 'acquireDistributedLock(instanceId)'],
    usedBy: ['server/src/controllers/monitorController.js', 'server/src/services/scheduler.js'],
    dependsOn: ['server/src/providers/index.js', 'server/src/models/MonitorLock.js'],
    codeSnippet: `export async function runMonitoringCycle(options = {}) {
  const lock = await acquireDistributedLock(instanceId);
  if (!lock.acquired) return { skipped: true, reason: 'LOCKED' };

  try {
    const activeAlerts = await Alert.find({ status: 'active' });
    const distinctOfferIds = [...new Set(activeAlerts.map(a => a.offerId.toString()))];

    for (const offerId of distinctOfferIds) {
      const offer = await Offer.findById(offerId);
      const freshPrice = await providerDispatcher.fetchOffer(offer);
      
      // Save observation
      await PriceObservation.create({ offerId, priceInPaise: freshPrice.priceInPaise, status: 'success' });
      
      // Evaluate alerts
      const matchingAlerts = activeAlerts.filter(a => a.offerId.toString() === offerId);
      for (const alert of matchingAlerts) {
        const evalResult = evaluateAlert(alert, freshPrice.priceInPaise);
        if (evalResult.shouldNotify) {
          await dispatchAlertNotifications(alert, freshPrice.priceInPaise);
          await Alert.findByIdAndUpdate(alert._id, { armed: false });
        }
      }
    }
  } finally {
    await releaseDistributedLock(instanceId); // Lock released safely!
  }
}`,
    flowPosition: 'Core background automation engine.'
  },
  {
    id: 'server-offer-model',
    name: 'Offer.js',
    path: 'server/src/models/Offer.js',
    layer: 'Database ODM Model',
    whyExists: 'Stores individual retailer pricing, availability, and external IDs.',
    responsibility: 'Enforces integer-paise financial precision policy, compound unique indexing { provider: 1, externalProductId: 1 }, and availability tracking.',
    imports: ['mongoose'],
    exports: ['export default Offer'],
    functions: ['Mongoose Offer schema definition and model compilation'],
    usedBy: ['server/src/controllers/productsController.js', 'server/src/services/priceMonitor.js', 'server/src/controllers/offersController.js'],
    dependsOn: ['server/src/models/Product.js (ref: Product)'],
    codeSnippet: `const offerSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  provider: { type: String, enum: ['flipkart', 'amazon', 'dummyjson', 'ebay', 'fixture', 'scrapling', 'apify'], required: true },
  externalProductId: { type: String, required: true },
  title: { type: String, required: true },
  productUrl: { type: String, required: true },
  priceInPaise: {
    type: Number,
    required: true,
    validate: { validator: Number.isInteger, message: 'priceInPaise must be an integer (rupees * 100)' }
  },
  availability: { type: String, enum: ['in_stock', 'out_of_stock', 'unknown'], default: 'in_stock' }
}, { timestamps: true });

// Compound unique index stops duplicate retailer listings
offerSchema.index({ provider: 1, externalProductId: 1 }, { unique: true });

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;`,
    flowPosition: 'Database entity representing an e-commerce store listing.'
  }
];

export const PRICERADAR_FILES = priceRadarFiles;
export const GENERIC_MERN_STRUCTURE = genericMernStructure;
export default priceRadarFiles;

