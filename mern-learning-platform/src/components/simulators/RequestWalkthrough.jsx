import React, { useState } from 'react';
import { Play, CheckCircle, ArrowRight, UserCheck, Key, Search, Bell, AlertTriangle } from 'lucide-react';

const STORIES = [
  {
    id: 'story_register',
    title: 'Story 1: Registration & OTP Verification',
    icon: UserCheck,
    summary: 'From filling the registration form to receiving an email OTP, verifying it, and creating the MongoDB user record.',
    steps: [
      {
        step: 1,
        title: 'User Fills Register Form',
        location: 'client/src/pages/Register.jsx',
        actor: 'Client (Browser)',
        action: 'User inputs name, email, and password. React component verifies matching password confirmation.',
        codeSnippet: `const { register } = useAuth();
await register({ name, email, password });`
      },
      {
        step: 2,
        title: 'Axios POST /api/auth/register',
        location: 'client/src/services/api.js',
        actor: 'Network Layer',
        action: 'Axios serializes payload to JSON and dispatches HTTP POST over TLS.',
        codeSnippet: `POST /api/auth/register HTTP/1.1
Content-Type: application/json
{"name":"Rahul","email":"rahul@test.com","password":"SecretPassword123"}`
      },
      {
        step: 3,
        title: 'Express Validation & Password Hash',
        location: 'server/src/controllers/authController.js',
        actor: 'Express Server',
        action: 'Validates email format, generates 6-digit random OTP, hashes OTP using crypto or bcrypt, and sends verification email.',
        codeSnippet: `const otp = Math.floor(100000 + Math.random() * 900000).toString();
const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
await sendVerificationEmail(email, otp);`
      },
      {
        step: 4,
        title: 'User Submits OTP in UI',
        location: 'client/src/pages/VerifyOtp.jsx',
        actor: 'Client (Browser)',
        action: 'User enters the 6-digit code received in their inbox.',
        codeSnippet: `await api.post('/auth/verify-otp', { email, otp });`
      },
      {
        step: 5,
        title: 'MongoDB User Creation & JWT Return',
        location: 'server/src/models/User.js',
        actor: 'Database & Auth',
        action: 'Server checks OTP validity. Hashes user password with bcrypt (salt 10). Saves document to MongoDB and issues JWT token.',
        codeSnippet: `const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
const newUser = await User.create({ email, password: hashedPassword, isVerified: true });
const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);`
      }
    ]
  },
  {
    id: 'story_search',
    title: 'Story 2: Product Search & Pagination',
    icon: Search,
    summary: 'User types search query on dashboard, frontend debounces API call, Express executes compound text index query on MongoDB.',
    steps: [
      {
        step: 1,
        title: 'User Types in SearchBar',
        location: 'client/src/components/SearchBar.jsx',
        actor: 'Client UI',
        action: 'Input change triggers state update. Debounced search waits 300ms before dispatching API call.',
        codeSnippet: `useEffect(() => {
  const timer = setTimeout(() => fetchProducts(query), 300);
  return () => clearTimeout(timer);
}, [query]);`
      },
      {
        step: 2,
        title: 'Axios GET /api/products?q=iphone&page=1',
        location: 'client/src/services/api.js',
        actor: 'Network Layer',
        action: 'Sends HTTP GET request with query parameters to the Express backend.',
        codeSnippet: `GET /api/products?q=iphone&page=1&limit=10 HTTP/1.1
Host: api.priceradar.local`
      },
      {
        step: 3,
        title: 'Express Controller Query Parser',
        location: 'server/src/controllers/productController.js',
        actor: 'Express Server',
        action: 'Parses `req.query.q`, builds Mongoose text search filter with pagination calculations.',
        codeSnippet: `const { q, page = 1, limit = 10 } = req.query;
const filter = q ? { $text: { $search: q } } : {};
const skip = (page - 1) * limit;`
      },
      {
        step: 4,
        title: 'MongoDB Compound Index Lookup',
        location: 'server/src/models/Product.js',
        actor: 'MongoDB Engine',
        action: 'MongoDB leverages the compound text index `{ title: "text", category: "text" }` to execute query in sub-millisecond time.',
        codeSnippet: `const products = await Product.find(filter)
  .skip(skip)
  .limit(Number(limit))
  .lean();`
      },
      {
        step: 5,
        title: 'React Card Grid Re-renders',
        location: 'client/src/pages/Dashboard.jsx',
        actor: 'Client UI',
        action: 'React state updates with retrieved array. ProductCard components map over the data to display titles, prices, and vendor badges.',
        codeSnippet: `{products.map(product => (
  <ProductCard key={product._id} product={product} />
))}`
      }
    ]
  },
  {
    id: 'story_cron',
    title: 'Story 3: 4-Hour Background Price Evaluation',
    icon: Bell,
    summary: 'GitHub Actions wakes up backend, price monitor acquires distributed MongoDB lock, evaluates price thresholds, and dispatches alerts.',
    steps: [
      {
        step: 1,
        title: 'GitHub Actions Timer Event (0 */4 * * *)',
        location: '.github/workflows/monitor.yml',
        actor: 'CI/CD Cloud Runner',
        action: 'Runs every 4 hours automatically. Dispatches authorized POST webhook to the PriceRadar backend.',
        codeSnippet: `curl -X POST \${{ secrets.BACKEND_URL }}/api/cron/check-prices \\
  -H "Authorization: Bearer \${{ secrets.CRON_SECRET }}"`
      },
      {
        step: 2,
        title: 'Distributed Lock Acquisition',
        location: 'server/src/models/MonitorLock.js',
        actor: 'Concurrency Guard',
        action: 'Checks MongoDB `monitorlocks` collection. If a lock exists and heartbeat is < 15 min old, rejects run to avoid duplicate scraping.',
        codeSnippet: `const acquired = await MonitorLock.findOneAndUpdate(
  { key: 'price_monitor', $or: [{ isLocked: false }, { expiresAt: { $lt: new Date() } }] },
  { $set: { isLocked: true, expiresAt: new Date(Date.now() + 15 * 60 * 1000) } }
);`
      },
      {
        step: 3,
        title: 'Fetch Vendor Prices & Save History',
        location: 'server/src/services/priceMonitor.js',
        actor: 'Scraper Service',
        action: 'Iterates through active offers. Scrapes current price, inserts a new PriceHistory document with integer paise.',
        codeSnippet: `const latestPrice = await scrapePrice(offer.url);
await PriceHistory.create({
  offerId: offer._id,
  priceInPaise: latestPrice,
  recordedAt: new Date()
});`
      },
      {
        step: 4,
        title: 'Evaluate User Target Thresholds',
        location: 'server/src/controllers/alertController.js',
        actor: 'Alert Evaluator',
        action: 'Queries all active alerts for this offer. Checks if `latestPrice <= alert.targetPriceInPaise`.',
        codeSnippet: `const triggeredAlerts = await Alert.find({
  offerId: offer._id,
  targetPriceInPaise: { $gte: latestPrice },
  isActive: true
}).populate('userId');`
      },
      {
        step: 5,
        title: 'Deduplicated Email Dispatch',
        location: 'server/src/services/emailService.js',
        actor: 'Notification System',
        action: 'Checks `NotificationEvent.dedupeKey` to prevent spamming the user twice for the same drop, then sends email via SMTP.',
        codeSnippet: `const dedupeKey = \`\${alert._id}_\${latestPrice}_\${today}\`;
await NotificationEvent.create({ dedupeKey, userId: alert.userId });
await sendPriceDropAlert(alert.userId.email, offer, latestPrice);`
      }
    ]
  }
];

export default function RequestWalkthrough() {
  const [selectedStory, setSelectedStory] = useState(STORIES[0]);
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  const activeStep = selectedStory.steps[activeStepIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {STORIES.map(story => {
          const Icon = story.icon;
          const isSelected = selectedStory.id === story.id;
          return (
            <button
              key={story.id}
              onClick={() => { setSelectedStory(story); setActiveStepIdx(0); }}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                background: isSelected ? 'var(--bg-card)' : 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Icon size={16} color={isSelected ? 'var(--accent-color)' : 'var(--text-secondary)'} />
              {story.title}
            </button>
          );
        })}
      </div>

      <div style={{
        background: 'var(--bg-secondary)',
        padding: '16px 20px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Scenario Overview:
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {selectedStory.summary}
        </div>
      </div>

      {/* Steps Breadcrumbs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '12px 4px'
      }}>
        {selectedStory.steps.map((st, idx) => (
          <button
            key={st.step}
            onClick={() => setActiveStepIdx(idx)}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: 'none',
              background: idx === activeStepIdx ? 'var(--accent-color)' : idx < activeStepIdx ? '#10b98133' : 'var(--bg-card)',
              color: idx === activeStepIdx ? '#fff' : idx < activeStepIdx ? '#10b981' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            {idx < activeStepIdx ? <CheckCircle size={14} /> : <span>{st.step}.</span>}
            {st.title}
          </button>
        ))}
      </div>

      {/* Step Detail Card */}
      {activeStep && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'var(--accent-color)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  Step {activeStep.step} of {selectedStory.steps.length}
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-color)'
                }}>
                  Layer: {activeStep.actor}
                </span>
              </div>
              <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                {activeStep.title}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontFamily: 'JetBrains Mono, monospace' }}>
                {activeStep.location}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={activeStepIdx === 0}
                onClick={() => setActiveStepIdx(prev => prev - 1)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  cursor: activeStepIdx === 0 ? 'not-allowed' : 'pointer',
                  opacity: activeStepIdx === 0 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              <button
                disabled={activeStepIdx === selectedStory.steps.length - 1}
                onClick={() => setActiveStepIdx(prev => prev + 1)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'var(--accent-color)',
                  color: '#fff',
                  cursor: activeStepIdx === selectedStory.steps.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: activeStepIdx === selectedStory.steps.length - 1 ? 0.5 : 1
                }}
              >
                Next Step
              </button>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            padding: '14px 18px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            {activeStep.action}
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
              Underlying Code Implementation:
            </div>
            <div style={{
              background: '#0d1117',
              color: '#c9d1d9',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.85rem',
              overflowX: 'auto',
              border: '1px solid #30363d'
            }}>
              <pre style={{ margin: 0 }}>{activeStep.codeSnippet}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
