import React, { useState } from 'react';
import { ArrowRight, GitMerge, FileCode, CheckCircle, Layers, Server, Globe, Database } from 'lucide-react';

const FLOWS = [
  {
    id: 'auth_flow',
    title: '1. User Authentication (Login Flow)',
    description: 'Traces how user credentials move from the React form through Axios, JWT creation, and state storage.',
    color: '#3b82f6',
    nodes: [
      {
        id: 'ui',
        name: 'Login.jsx',
        path: 'client/src/pages/Login.jsx',
        layer: 'Frontend UI',
        icon: Globe,
        code: `const handleSubmit = async (e) => {
  e.preventDefault();
  await login(email, password); // Calls AuthContext
};`,
        explanation: 'User submits the HTML form with email and password state.'
      },
      {
        id: 'context',
        name: 'AuthContext.jsx',
        path: 'client/src/context/AuthContext.jsx',
        layer: 'React State',
        icon: Layers,
        code: `const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('pr_token', data.data.token);
  setUser(data.data.user);
};`,
        explanation: 'Delegates API call to axios instance and securely saves JWT token upon HTTP 200.'
      },
      {
        id: 'axios',
        name: 'api.js',
        path: 'client/src/services/api.js',
        layer: 'HTTP Client',
        icon: FileCode,
        code: `api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pr_token');
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});`,
        explanation: 'Attaches the Bearer token to all future outgoing requests automatically.'
      },
      {
        id: 'route',
        name: 'authRoutes.js',
        path: 'server/src/routes/authRoutes.js',
        layer: 'Express Routing',
        icon: Server,
        code: `router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], handleValidationErrors, authController.login);`,
        explanation: 'Express router intercepts POST /api/auth/login, runs express-validator rules.'
      },
      {
        id: 'controller',
        name: 'authController.js',
        path: 'server/src/controllers/authController.js',
        layer: 'Business Logic',
        icon: GitMerge,
        code: `exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  const isMatch = await bcrypt.compare(password, user.password);
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ success: true, data: { token, user: sanitize(user) } });
};`,
        explanation: 'Validates bcrypt password hash and generates signed JWT token with user ID and role.'
      },
      {
        id: 'model',
        name: 'User.js',
        path: 'server/src/models/User.js',
        layer: 'MongoDB Schema',
        icon: Database,
        code: `const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});`,
        explanation: 'Mongoose schema storing hashed credentials in MongoDB priceradar database.'
      }
    ]
  },
  {
    id: 'alert_flow',
    title: '2. Alert Creation & Automated Price Drop Monitoring',
    description: 'Traces creating a target price alert and how the 4-hour background cron triggers automated email notifications.',
    color: '#10b981',
    nodes: [
      {
        id: 'ui',
        name: 'Alerts.jsx',
        path: 'client/src/pages/Alerts.jsx',
        layer: 'Frontend UI',
        icon: Globe,
        code: `const createAlert = async () => {
  await api.post('/alerts', {
    offerId: selectedOffer,
    targetPrice: Number(targetPrice)
  });
};`,
        explanation: 'User enters desired target price in rupees on the React dashboard.'
      },
      {
        id: 'controller',
        name: 'alertController.js',
        path: 'server/src/controllers/alertController.js',
        layer: 'Express Controller',
        icon: GitMerge,
        code: `exports.createAlert = async (req, res, next) => {
  const targetPriceInPaise = toPaise(req.body.targetPrice);
  const alert = await Alert.create({
    userId: req.user._id,
    offerId: req.body.offerId,
    targetPriceInPaise
  });
  res.status(201).json({ success: true, data: alert });
};`,
        explanation: 'Converts price to integer paise (preventing float rounding bugs) and stores target.'
      },
      {
        id: 'cron',
        name: 'monitor.yml / scheduler.js',
        path: '.github/workflows/monitor.yml',
        layer: 'Automation Cron',
        icon: Server,
        code: `name: Price Monitor Cron
on:
  schedule:
    - cron: '0 */4 * * *' # Every 4 hours
jobs:
  run-monitor:
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST -H "Authorization: Bearer \${{ secrets.CRON_SECRET }}" \${{ secrets.BACKEND_URL }}/api/cron/check-prices`,
        explanation: 'GitHub Actions fires automated webhook to backend every 4 hours without server polling costs.'
      },
      {
        id: 'worker',
        name: 'priceMonitor.js',
        path: 'server/src/services/priceMonitor.js',
        layer: 'Scraping & Evaluation',
        icon: GitMerge,
        code: `// Acquire distributed MongoDB lock
const lock = await MonitorLock.acquire('price_monitor', 15 * 60 * 1000);
for (const offer of activeOffers) {
  const currentPrice = await scrapePrice(offer.url);
  if (currentPrice <= alert.targetPriceInPaise) {
    await notificationService.sendAlert(user, offer, currentPrice);
  }
}`,
        explanation: 'Acquires distributed lock, scrapes latest vendor price, and evaluates target thresholds.'
      },
      {
        id: 'notification',
        name: 'emailService.js',
        path: 'server/src/services/emailService.js',
        layer: 'Email Dispatch',
        icon: Database,
        code: `const sendPriceDropEmail = async (user, offer, newPrice) => {
  await transporter.sendMail({
    to: user.email,
    subject: \`Price Drop Alert: \${offer.title} is now ₹\${newPrice / 100}!\`,
    html: \`<p>Hurry! The price has dropped below your target.</p>\`
  });
};`,
        explanation: 'Dispatches responsive HTML price drop notification via Nodemailer SMTP.'
      }
    ]
  }
];

export default function FileConnectionMap() {
  const [selectedFlow, setSelectedFlow] = useState(FLOWS[0]);
  const [activeStep, setActiveStep] = useState(0);

  const currentStep = selectedFlow.nodes[activeStep];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {FLOWS.map((flow) => (
          <button
            key={flow.id}
            onClick={() => { setSelectedFlow(flow); setActiveStep(0); }}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: selectedFlow.id === flow.id ? `2px solid ${flow.color}` : '1px solid var(--border-color)',
              background: selectedFlow.id === flow.id ? 'var(--bg-card)' : 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <GitMerge size={16} color={flow.color} />
            {flow.title}
          </button>
        ))}
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
        {selectedFlow.description}
      </p>

      {/* Visual Connection Chain */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        padding: '16px 8px',
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        {selectedFlow.nodes.map((node, idx) => {
          const Icon = node.icon;
          const isActive = idx === activeStep;
          const isPassed = idx < activeStep;
          return (
            <React.Fragment key={node.id}>
              <div
                onClick={() => setActiveStep(idx)}
                style={{
                  minWidth: '160px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: isActive ? 'var(--bg-card)' : isPassed ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  border: isActive ? `2px solid ${selectedFlow.color}` : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? `0 0 16px ${selectedFlow.color}33` : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Icon size={16} color={isActive ? selectedFlow.color : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {node.layer}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {node.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {node.path}
                </div>
              </div>
              {idx < selectedFlow.nodes.length - 1 && (
                <ArrowRight size={20} color={isPassed ? selectedFlow.color : 'var(--text-muted)'} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Node Deep Dive */}
      {currentStep && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: `${selectedFlow.color}20`,
                color: selectedFlow.color,
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginRight: '10px'
              }}>
                Step {activeStep + 1} of {selectedFlow.nodes.length}: {currentStep.layer}
              </span>
              <h3 style={{ margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                {currentStep.name} (<code style={{ fontSize: '0.9rem', color: 'var(--accent-color)' }}>{currentStep.path}</code>)
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep(prev => prev - 1)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  cursor: activeStep === 0 ? 'not-allowed' : 'pointer',
                  opacity: activeStep === 0 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              <button
                disabled={activeStep === selectedFlow.nodes.length - 1}
                onClick={() => setActiveStep(prev => prev + 1)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: selectedFlow.color,
                  color: '#fff',
                  cursor: activeStep === selectedFlow.nodes.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: activeStep === selectedFlow.nodes.length - 1 ? 0.5 : 1
                }}
              >
                Next Step
              </button>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            {currentStep.explanation}
          </p>

          <div style={{ marginTop: '16px' }}>
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
              <pre style={{ margin: 0 }}>{currentStep.code}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
