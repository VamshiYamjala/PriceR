// mern-learning-platform/src/data/endpointsData.js

export const endpointsData = [
  // --- AUTH ---
  {
    id: 'auth-register-initiate',
    method: 'POST',
    path: '/api/auth/register/initiate',
    category: 'Authentication',
    purpose: 'Initiates 2-step registration: hashes password, generates 6-digit OTP, stores in OtpChallenge (10-min TTL), and sends verification email via Brevo.',
    auth: 'Public',
    routeFile: 'server/src/routes/auth.js',
    middleware: ['express.json()', 'validate([body("email"), body("password").isLength({min:8})])'],
    controller: 'authController.initiateRegistration',
    service: 'services/notifications/email.js',
    model: 'models/OtpChallenge.js',
    frontendCaller: 'api.initiateRegistration() in client/src/services/api.js',
    calledByPage: 'client/src/pages/RegisterPage.jsx',
    exampleReq: {
      name: 'Aarav Kumar',
      email: 'aarav@example.com',
      password: 'Password123!'
    },
    exampleRes: {
      success: true,
      data: {
        message: 'Verification code sent to your email address.',
        email: 'aarav@example.com',
        resendAvailableAt: '2026-11-23T10:30:00.000Z'
      }
    },
    errorResponses: [
      { status: 400, code: 'EMAIL_ALREADY_REGISTERED', message: 'A user with this email address already exists.' },
      { status: 429, code: 'TOO_MANY_REQUESTS', message: 'Too many registration attempts. Please wait 60 seconds.' }
    ]
  },
  {
    id: 'auth-register-verify',
    method: 'POST',
    path: '/api/auth/register/verify',
    category: 'Authentication',
    purpose: 'Verifies 6-digit OTP from OtpChallenge, creates the permanent User document, and issues a 7-day JWT token.',
    auth: 'Public',
    routeFile: 'server/src/routes/auth.js',
    middleware: ['validate([body("email"), body("otp").isLength({min:6, max:6})])'],
    controller: 'authController.verifyRegistration',
    service: 'jsonwebtoken (jwt.sign)',
    model: 'models/User.js & models/OtpChallenge.js',
    frontendCaller: 'api.verifyRegistration() in client/src/services/api.js',
    calledByPage: 'client/src/pages/RegisterPage.jsx',
    exampleReq: {
      email: 'aarav@example.com',
      otp: '749201'
    },
    exampleRes: {
      success: true,
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: '66a01f92e4b01a2b3c4d5e6f', name: 'Aarav Kumar', email: 'aarav@example.com', role: 'user' }
      }
    },
    errorResponses: [
      { status: 400, code: 'INVALID_OTP', message: 'Invalid or expired OTP code. 4 attempts remaining.' },
      { status: 410, code: 'CHALLENGE_EXPIRED', message: 'Verification session expired. Please register again.' }
    ]
  },
  {
    id: 'auth-login',
    method: 'POST',
    path: '/api/auth/login',
    category: 'Authentication',
    purpose: 'Authenticates user with email & password using bcrypt.compare() and returns a signed JWT token.',
    auth: 'Public',
    routeFile: 'server/src/routes/auth.js',
    middleware: ['validate([body("email"), body("password").notEmpty()])', 'rateLimiter'],
    controller: 'authController.login',
    service: 'bcryptjs (compare) + jsonwebtoken (sign)',
    model: 'models/User.js (with .select("+passwordHash"))',
    frontendCaller: 'api.login() in client/src/services/api.js',
    calledByPage: 'client/src/pages/LoginPage.jsx',
    exampleReq: {
      email: 'aarav@example.com',
      password: 'Password123!'
    },
    exampleRes: {
      success: true,
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: '66a01f92e4b01a2b3c4d5e6f', name: 'Aarav Kumar', email: 'aarav@example.com', role: 'user' }
      }
    },
    errorResponses: [
      { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
    ]
  },
  {
    id: 'auth-me',
    method: 'GET',
    path: '/api/auth/me',
    category: 'Authentication',
    purpose: 'Returns current authenticated user profile using token from Authorization header.',
    auth: 'Bearer JWT',
    routeFile: 'server/src/routes/auth.js',
    middleware: ['requireAuth'],
    controller: 'authController.getMe',
    service: 'AuthContext hydration',
    model: 'models/User.js',
    frontendCaller: 'api.getMe() in client/src/services/api.js',
    calledByPage: 'client/src/context/AuthContext.jsx',
    exampleReq: null,
    exampleRes: {
      success: true,
      data: {
        user: { id: '66a01f92e4b01a2b3c4d5e6f', name: 'Aarav Kumar', email: 'aarav@example.com', role: 'user', telegramChatId: '987654321' }
      }
    },
    errorResponses: [
      { status: 401, code: 'UNAUTHORIZED', message: 'Authentication token required or expired.' }
    ]
  },
  {
    id: 'auth-forgot-password',
    method: 'POST',
    path: '/api/auth/forgot-password',
    category: 'Authentication',
    purpose: 'Step 1 of password reset: verifies user exists, generates 6-digit OTP, and sends email.',
    auth: 'Public',
    routeFile: 'server/src/routes/auth.js',
    middleware: ['validate([body("email").isEmail()])'],
    controller: 'authController.forgotPassword',
    service: 'services/notifications/email.js',
    model: 'models/OtpChallenge.js',
    frontendCaller: 'api.forgotPassword() in client/src/services/api.js',
    calledByPage: 'client/src/pages/ForgotPasswordPage.jsx',
    exampleReq: { email: 'aarav@example.com' },
    exampleRes: { success: true, data: { message: 'Password reset code sent to your email.' } },
    errorResponses: [
      { status: 404, code: 'USER_NOT_FOUND', message: 'No account found with this email address.' }
    ]
  },
  {
    id: 'auth-reset-password',
    method: 'POST',
    path: '/api/auth/reset-password',
    category: 'Authentication',
    purpose: 'Step 3 of password reset: verifies one-time resetToken, hashes new password, and updates User.',
    auth: 'Public',
    routeFile: 'server/src/routes/auth.js',
    middleware: ['validate([body("email"), body("resetToken"), body("newPassword")])'],
    controller: 'authController.resetPassword',
    service: 'bcryptjs.hash(newPassword, 10)',
    model: 'models/User.js & models/OtpChallenge.js',
    frontendCaller: 'api.resetPassword() in client/src/services/api.js',
    calledByPage: 'client/src/pages/ForgotPasswordPage.jsx',
    exampleReq: {
      email: 'aarav@example.com',
      resetToken: 'rst_9f8e7d6c5b4a...',
      newPassword: 'BrandNewPassword2026!'
    },
    exampleRes: { success: true, data: { message: 'Password updated successfully. Please log in.' } },
    errorResponses: [
      { status: 400, code: 'INVALID_RESET_TOKEN', message: 'Reset session is invalid or has expired.' }
    ]
  },

  // --- PRODUCTS & OFFERS ---
  {
    id: 'products-search',
    method: 'GET',
    path: '/api/products/search',
    category: 'Catalog',
    purpose: 'Performs case-insensitive regex search on Product.title, finds linked Offers, and returns items with lowest prices in INR.',
    auth: 'Public',
    routeFile: 'server/src/routes/products.js',
    middleware: ['fastFailDatabaseCheck'],
    controller: 'productsController.searchProducts',
    service: 'services/priceComparison.js',
    model: 'models/Product.js & models/Offer.js',
    frontendCaller: 'api.searchProducts(q) in client/src/services/api.js',
    calledByPage: 'client/src/pages/SearchPage.jsx',
    exampleReq: { query: '?q=iphone&category=smartphones' },
    exampleRes: {
      success: true,
      data: {
        products: [
          {
            _id: '66a101f...',
            title: 'Apple iPhone 15 (128 GB) - Black',
            brand: 'Apple',
            lowestPriceInPaise: 6499900,
            lowestPriceRupees: 64999,
            offerCount: 3,
            dataStatus: 'live'
          }
        ]
      }
    },
    errorResponses: [
      { status: 503, code: 'DATABASE_DISCONNECTED', message: 'Database temporarily unreachable.' }
    ]
  },
  {
    id: 'products-get-one',
    method: 'GET',
    path: '/api/products/:productId',
    category: 'Catalog',
    purpose: 'Retrieves canonical Product details and all retailer Offer listings (Amazon, Flipkart, eBay) sorted by price.',
    auth: 'Public',
    routeFile: 'server/src/routes/products.js',
    middleware: ['fastFailDatabaseCheck'],
    controller: 'productsController.getProduct',
    service: 'priceComparison.findBestOffers',
    model: 'models/Product.js & models/Offer.js',
    frontendCaller: 'api.getProduct(id) in client/src/services/api.js',
    calledByPage: 'client/src/pages/ProductDetailPage.jsx',
    exampleReq: { params: { productId: '66a101f...' } },
    exampleRes: {
      success: true,
      data: {
        product: { title: 'Apple iPhone 15', brand: 'Apple', category: 'smartphones' },
        offers: [
          { _id: '66off1...', retailer: 'flipkart', priceInPaise: 6499900, availability: 'in_stock' },
          { _id: '66off2...', retailer: 'amazon', priceInPaise: 6699900, availability: 'in_stock' }
        ]
      }
    },
    errorResponses: [
      { status: 404, code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' }
    ]
  },
  {
    id: 'offers-history',
    method: 'GET',
    path: '/api/offers/:offerId/history',
    category: 'Catalog',
    purpose: 'Queries PriceObservation collection sorted chronologically to power the interactive SVG price history chart.',
    auth: 'Public',
    routeFile: 'server/src/routes/offers.js',
    middleware: [],
    controller: 'offersController.getOfferHistory',
    service: 'services/priceComparison.js',
    model: 'models/PriceObservation.js (compound index { offerId: 1, fetchedAt: -1 })',
    frontendCaller: 'api.getOfferHistory(id) in client/src/services/api.js',
    calledByPage: 'client/src/pages/ProductDetailPage.jsx',
    exampleReq: { params: { offerId: '66off1...' } },
    exampleRes: {
      success: true,
      data: {
        history: [
          { fetchedAt: '2026-11-20T00:00:00Z', priceInPaise: 6799900, status: 'success' },
          { fetchedAt: '2026-11-20T04:00:00Z', priceInPaise: 6699900, status: 'success' },
          { fetchedAt: '2026-11-20T08:00:00Z', priceInPaise: 6499900, status: 'success' }
        ]
      }
    },
    errorResponses: [
      { status: 404, code: 'OFFER_NOT_FOUND', message: 'Offer listing not found.' }
    ]
  },

  // --- ALERTS ---
  {
    id: 'alerts-create',
    method: 'POST',
    path: '/api/alerts',
    category: 'Alerts',
    purpose: 'Creates a new target-price or fixed-drop alert rule with integer paise thresholds and armed state.',
    auth: 'Bearer JWT',
    routeFile: 'server/src/routes/alerts.js',
    middleware: ['requireAuth', 'validate([body("offerId"), body("type"), body("channels")])'],
    controller: 'alertsController.createAlert',
    service: 'services/alertEvaluator.js',
    model: 'models/Alert.js',
    frontendCaller: 'api.createAlert() in client/src/services/api.js',
    calledByPage: 'client/src/pages/AlertFormPage.jsx',
    exampleReq: {
      offerId: '66off1...',
      type: 'target_price',
      targetPriceInPaise: 6400000,
      channels: ['email', 'telegram']
    },
    exampleRes: {
      success: true,
      data: {
        alert: {
          _id: '66alt99...',
          userId: '66a01f...',
          offerId: '66off1...',
          type: 'target_price',
          targetPriceInPaise: 6400000,
          channels: ['email', 'telegram'],
          armed: true,
          status: 'active'
        }
      }
    },
    errorResponses: [
      { status: 400, code: 'VALIDATION_ERROR', message: 'targetPriceInPaise must be a positive integer.' },
      { status: 404, code: 'OFFER_NOT_FOUND', message: 'Referenced offer does not exist.' }
    ]
  },
  {
    id: 'alerts-list',
    method: 'GET',
    path: '/api/alerts',
    category: 'Alerts',
    purpose: 'Returns all price alerts configured by the logged-in user with populated Offer and Product details.',
    auth: 'Bearer JWT',
    routeFile: 'server/src/routes/alerts.js',
    middleware: ['requireAuth'],
    controller: 'alertsController.getAlerts',
    service: 'alertsController (Mongoose populate)',
    model: 'models/Alert.js (scoped to { userId: req.user.id })',
    frontendCaller: 'api.getAlerts() in client/src/services/api.js',
    calledByPage: 'client/src/pages/AlertManagementPage.jsx',
    exampleReq: null,
    exampleRes: {
      success: true,
      data: {
        alerts: [
          {
            _id: '66alt99...',
            type: 'target_price',
            targetPriceInPaise: 6400000,
            armed: true,
            status: 'active',
            offerId: { title: 'iPhone 15', priceInPaise: 6499900, retailer: 'flipkart' }
          }
        ]
      }
    },
    errorResponses: [
      { status: 401, code: 'UNAUTHORIZED', message: 'Token required.' }
    ]
  },
  {
    id: 'alerts-patch',
    method: 'PATCH',
    path: '/api/alerts/:id',
    category: 'Alerts',
    purpose: 'Updates alert thresholds, notification channels, or toggles active/paused status.',
    auth: 'Bearer JWT',
    routeFile: 'server/src/routes/alerts.js',
    middleware: ['requireAuth', 'validate'],
    controller: 'alertsController.updateAlert',
    service: 'alertsController',
    model: 'models/Alert.js',
    frontendCaller: 'api.updateAlert(id, changes) in client/src/services/api.js',
    calledByPage: 'client/src/pages/AlertManagementPage.jsx',
    exampleReq: { status: 'paused' },
    exampleRes: { success: true, data: { alert: { _id: '66alt99...', status: 'paused' } } },
    errorResponses: [
      { status: 404, code: 'ALERT_NOT_FOUND', message: 'Alert not found or unauthorized.' }
    ]
  },

  // --- WATCHLIST ---
  {
    id: 'watchlist-add',
    method: 'POST',
    path: '/api/watchlist',
    category: 'Watchlist',
    purpose: 'Saves an offer to the user watchlist. Compound unique index { userId: 1, offerId: 1 } prevents duplicates.',
    auth: 'Bearer JWT',
    routeFile: 'server/src/routes/watchlist.js',
    middleware: ['requireAuth', 'validate([body("offerId").isMongoId()])'],
    controller: 'watchlistController.addToWatchlist',
    service: 'watchlistController',
    model: 'models/WatchlistItem.js',
    frontendCaller: 'api.addToWatchlist(offerId) in client/src/services/api.js',
    calledByPage: 'client/src/pages/ProductDetailPage.jsx',
    exampleReq: { offerId: '66off1...' },
    exampleRes: { success: true, data: { item: { _id: '66w1...', userId: '66usr...', offerId: '66off1...' } } },
    errorResponses: [
      { status: 409, code: 'ALREADY_WATCHED', message: 'This listing is already in your watchlist.' }
    ]
  },
  {
    id: 'watchlist-get',
    method: 'GET',
    path: '/api/watchlist',
    category: 'Watchlist',
    purpose: 'Fetches the logged-in user watchlist with populated offer, product title, and latest prices.',
    auth: 'Bearer JWT',
    routeFile: 'server/src/routes/watchlist.js',
    middleware: ['requireAuth'],
    controller: 'watchlistController.getWatchlist',
    service: 'watchlistController',
    model: 'models/WatchlistItem.js (scoped to req.user.id)',
    frontendCaller: 'api.getWatchlist() in client/src/services/api.js',
    calledByPage: 'client/src/pages/WatchlistPage.jsx',
    exampleReq: null,
    exampleRes: {
      success: true,
      data: {
        items: [
          { _id: '66w1...', offerId: { title: 'iPhone 15', priceInPaise: 6499900, retailer: 'flipkart' } }
        ]
      }
    },
    errorResponses: []
  },

  // --- MONITOR & CRON ---
  {
    id: 'monitor-run',
    method: 'POST',
    path: '/api/monitor/run',
    category: 'Price Monitoring',
    purpose: 'Triggered by GitHub Actions cron. Acquires distributed MonitorLock, starts price cycle asynchronously, returns HTTP 202 immediately.',
    auth: 'X-Monitor-Secret Header',
    routeFile: 'server/src/routes/monitor.js',
    middleware: ['validateMonitorSecret', 'fastFailDatabaseCheck'],
    controller: 'monitorController.runMonitor',
    service: 'services/priceMonitor.js (runMonitoringCycle)',
    model: 'models/MonitorLock.js & models/MonitorRun.js',
    frontendCaller: 'GitHub Actions runner in .github/workflows/monitor.yml',
    calledByPage: 'GitHub Actions cron (0 */4 * * *)',
    exampleReq: { headers: { 'X-Monitor-Secret': 'super_secret_cron_token_32' } },
    exampleRes: {
      success: true,
      message: 'Monitoring cycle accepted and started in background.',
      data: { runId: '66run7788...', status: 'running', startedAt: '2026-11-23T10:30:00.000Z' }
    },
    errorResponses: [
      { status: 401, code: 'UNAUTHORIZED_SECRET', message: 'Missing or invalid X-Monitor-Secret header.' },
      { status: 409, code: 'CYCLE_ALREADY_RUNNING', message: 'Another monitoring cycle is already in progress.' }
    ]
  },
  {
    id: 'monitor-status',
    method: 'GET',
    path: '/api/monitor/status',
    category: 'Price Monitoring',
    purpose: 'Polled every 10 seconds by GitHub Actions or UI to track background monitoring execution.',
    auth: 'Public',
    routeFile: 'server/src/routes/monitor.js',
    middleware: [],
    controller: 'monitorController.getStatus',
    service: 'services/priceMonitor.js (getMonitorState)',
    model: 'models/MonitorRun.js',
    frontendCaller: 'api.getMonitorStatus() & GitHub Actions polling loop',
    calledByPage: 'GitHub Actions / DashboardPage.jsx',
    exampleReq: null,
    exampleRes: {
      success: true,
      data: {
        isRunning: false,
        lastRunAt: '2026-11-23T10:30:45.000Z',
        lastRunOffersChecked: 14,
        lastRunErrors: 0,
        status: 'completed'
      }
    },
    errorResponses: []
  },

  // --- HEALTH ---
  {
    id: 'health-check',
    method: 'GET',
    path: '/api/health',
    category: 'System Health',
    purpose: 'Public health probe used by Render deployment monitor and GitHub Actions pre-flight wakeup curl.',
    auth: 'Public',
    routeFile: 'server/src/app.js (mounted directly)',
    middleware: [],
    controller: 'Inline handler in app.js',
    service: 'mongoose.connection.readyState check',
    model: 'None (direct mongoose connection inspect)',
    frontendCaller: 'curl pre-flight probe in monitor.yml',
    calledByPage: 'Render cloud infrastructure / GitHub Actions',
    exampleReq: null,
    exampleRes: {
      status: 'ok',
      database: 'connected',
      time: '2026-11-23T10:30:00.000Z'
    },
    errorResponses: [
      { status: 503, statusText: 'unhealthy', database: 'disconnected' }
    ]
  }
];

export const PRICERADAR_ENDPOINTS = endpointsData;
export default endpointsData;

