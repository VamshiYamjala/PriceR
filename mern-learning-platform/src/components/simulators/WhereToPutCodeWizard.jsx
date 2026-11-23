import React, { useState } from 'react';
import { HelpCircle, FolderPlus, FilePlus, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';

const SCENARIOS = [
  {
    id: 'new_collection',
    question: 'I want to add a new database collection (e.g. Reviews, Coupons)',
    targetFolder: 'server/src/models/',
    recommendedFile: 'server/src/models/Review.js',
    rule: 'Create a Mongoose Schema and Model file here. Define the fields, types, indexes, and validation rules.',
    exampleCode: `const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true, maxlength: 500 }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);`
  },
  {
    id: 'new_endpoint',
    question: 'I want to add a new API endpoint (e.g. GET /api/reviews)',
    targetFolder: 'server/src/routes/ & server/src/controllers/',
    recommendedFile: 'server/src/routes/reviewRoutes.js & server/src/controllers/reviewController.js',
    rule: 'Routes declare the URL path and HTTP verb. Controllers execute the database queries and return JSON.',
    exampleCode: `// 1. In reviewRoutes.js:
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', reviewController.getReviews);
router.post('/', requireAuth, reviewController.createReview);
module.exports = router;

// 2. Register in server/src/app.js:
app.use('/api/reviews', reviewRoutes);`
  },
  {
    id: 'new_page',
    question: 'I want to add a new React screen/page (e.g. /profile, /settings)',
    targetFolder: 'client/src/pages/',
    recommendedFile: 'client/src/pages/Profile.jsx',
    rule: 'Full screen views that have their own URL route belong in client/src/pages/. Then register them in client/src/App.jsx inside <Routes>.',
    exampleCode: `// In client/src/App.jsx:
import Profile from './pages/Profile';

<Routes>
  <Route path="/profile" element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } />
</Routes>`
  },
  {
    id: 'protect_route',
    question: 'I want to protect an API route so only logged-in users or admins can access it',
    targetFolder: 'server/src/middleware/',
    recommendedFile: 'server/src/middleware/authMiddleware.js',
    rule: 'Attach requireAuth or requireAdmin middleware before the controller function in the route definition.',
    exampleCode: `// In route file:
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Regular authenticated user:
router.post('/alerts', requireAuth, alertController.createAlert);

// Admin-only route:
router.delete('/products/:id', requireAuth, requireAdmin, productController.deleteProduct);`
  },
  {
    id: 'api_call',
    question: 'I want to make an HTTP API call from a React component',
    targetFolder: 'client/src/services/ or client/src/context/',
    recommendedFile: 'client/src/services/api.js',
    rule: 'Never use raw fetch() with hardcoded URLs. Import the configured axios instance from services/api.js which already has the baseURL and JWT interceptor.',
    exampleCode: `import api from '../services/api';

const fetchReviews = async (productId) => {
  try {
    const { data } = await api.get(\`/reviews?productId=\${productId}\`);
    return data.data;
  } catch (err) {
    console.error('Error fetching reviews:', err.response?.data?.message);
  }
};`
  },
  {
    id: 'shared_state',
    question: 'I want to share state (like user login status or cart items) across multiple components',
    targetFolder: 'client/src/context/',
    recommendedFile: 'client/src/context/AuthContext.jsx',
    rule: 'Create a React Context with a Provider component and a custom hook (e.g. useAuth()). Wrap the app in main.jsx or App.jsx.',
    exampleCode: `import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  return (
    <CartContext.Provider value={{ items, setItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);`
  },
  {
    id: 'env_var',
    question: 'I want to store a sensitive secret (DB password, JWT secret, API key)',
    targetFolder: '.env (Root or server/)',
    recommendedFile: 'server/.env and client/.env',
    rule: 'Backend secrets go in server/.env (never committed to git!). Frontend secrets must start with VITE_ (e.g. VITE_API_BASE_URL).',
    exampleCode: `# server/.env (Backend)
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=super_secret_key_123

# client/.env (Frontend - Vite)
VITE_API_URL=http://localhost:5000/api`
  },
  {
    id: 'reusable_ui',
    question: 'I want to build a reusable UI element (Button, Modal, Card, Navbar)',
    targetFolder: 'client/src/components/',
    recommendedFile: 'client/src/components/common/Button.jsx',
    rule: 'Small, reusable presentation components that accept props belong in client/src/components/. They should not contain route-specific business logic.',
    exampleCode: `export default function Button({ children, variant = 'primary', onClick, loading }) {
  return (
    <button
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}`
  }
];

export default function WhereToPutCodeWizard() {
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{
        background: 'var(--bg-card)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <HelpCircle size={22} color="var(--accent-color)" />
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
            Code Placement Wizard: "Where Do I Put This Code?"
          </h3>
        </div>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          One of the biggest struggles for beginners is knowing where to create a new file or add a new piece of logic. Select your scenario below to see the exact convention used in PriceRadar and standard MERN architectures.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
        {SCENARIOS.map(sc => {
          const isSelected = selectedScenario.id === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => setSelectedScenario(sc)}
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                background: isSelected ? 'var(--bg-card)' : 'var(--bg-secondary)',
                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                textAlign: 'left',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              <Lightbulb size={18} color={isSelected ? 'var(--accent-color)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
              <span>{sc.question}</span>
            </button>
          );
        })}
      </div>

      {/* Answer Box */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <CheckCircle2 size={24} color="#10b981" />
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Recommended Location & Architecture Pattern
            </span>
            <h4 style={{ margin: '4px 0 0 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
              {selectedScenario.targetFolder}
            </h4>
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
          <strong>The Rule: </strong>{selectedScenario.rule}
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
            Example Implementation Pattern:
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
            <pre style={{ margin: 0 }}>{selectedScenario.exampleCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
