import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Hammer, CheckCircle2, ChevronRight, ChevronLeft, Copy, FileCode, Check } from 'lucide-react';

const WORKSHOP_MISSIONS = [
  {
    step: 1,
    title: 'Initialize Repository & Folder Structure',
    fileToCreate: 'Project Root Directory',
    folder: './',
    task: 'Create the top-level repository containing isolated client and server packages.',
    code: `mkdir my-mern-app && cd my-mern-app
git init
mkdir server client
echo "node_modules\n.env\ndist\n" > .gitignore`,
    explanation: 'Keeping client and server in separate directories inside one git repo ensures decoupled frontend and backend dependencies without version conflicts.'
  },
  {
    step: 2,
    title: 'Scaffold React with Vite',
    fileToCreate: 'client/package.json & client/vite.config.js',
    folder: 'client/',
    task: 'Initialize lightning-fast React 18 bundler using Vite.',
    code: `// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});`,
    explanation: 'The dev proxy routes all /api requests from localhost:5173 directly to localhost:5000, eliminating CORS issues during local development.'
  },
  {
    step: 3,
    title: 'Bootstrap Express & Node Server',
    fileToCreate: 'server/src/app.js & server/src/server.js',
    folder: 'server/src/',
    task: 'Create the Express application entry point with CORS and JSON middleware.',
    code: `// server/src/app.js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

module.exports = app;`,
    explanation: 'Separating app.js (configuration and middleware) from server.js (app.listen) enables fast, clean Supertest integration testing.'
  },
  {
    step: 4,
    title: 'Connect MongoDB via Mongoose',
    fileToCreate: 'server/src/config/db.js',
    folder: 'server/src/config/',
    task: 'Establish database connection with connection pooling and graceful error handling.',
    code: `// server/src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;`,
    explanation: 'process.exit(1) ensures the process crashes immediately if the database is unreachable, prompting container orchestrators (like Docker or Render) to restart.'
  },
  {
    step: 5,
    title: 'Configure Axios with Centralized Interceptors',
    fileToCreate: 'client/src/services/api.js',
    folder: 'client/src/services/',
    task: 'Create Axios instance with baseURL and automatic Bearer JWT attachment.',
    code: `// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

export default api;`,
    explanation: 'Centralizing your HTTP client in api.js means baseURL and authentication headers are configured once and applied automatically across all components.'
  },
  {
    step: 6,
    title: 'Create First REST API Endpoint',
    fileToCreate: 'server/src/routes/itemRoutes.js & server/src/controllers/itemController.js',
    folder: 'server/src/',
    task: 'Build modular route and controller files following Clean Architecture.',
    code: `// server/src/controllers/itemController.js
const Item = require('../models/Item');

exports.getItems = async (req, res, next) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};`,
    explanation: 'Passing errors to next(err) triggers the global Express error-handling middleware, standardizing error response envelopes.'
  },
  {
    step: 7,
    title: 'Design Production Mongoose Model',
    fileToCreate: 'server/src/models/Item.js',
    folder: 'server/src/models/',
    task: 'Create schema with timestamps, type validation, and index optimization.',
    code: `// server/src/models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  priceInPaise: { type: Number, required: true, validate: Number.isInteger },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

itemSchema.index({ title: 'text' });

module.exports = mongoose.model('Item', itemSchema);`,
    explanation: 'priceInPaise avoids floating-point precision loss. timestamps: true automatically adds createdAt and updatedAt fields.'
  },
  {
    step: 8,
    title: 'Build React UI with State Integration',
    fileToCreate: 'client/src/pages/ItemList.jsx',
    folder: 'client/src/pages/',
    task: 'Fetch items from backend and render a responsive grid.',
    code: `// client/src/pages/ItemList.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/items')
      .then(res => setItems(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading catalog...</div>;
  return (
    <div>
      {items.map(item => (
        <div key={item._id}>
          <h3>{item.title}</h3>
          <p>₹{item.priceInPaise / 100}</p>
        </div>
      ))}
    </div>
  );
}`,
    explanation: 'useEffect with empty dependency array [] runs once on mount. finally() guarantees the loading spinner turns off on both success and error.'
  },
  {
    step: 9,
    title: 'Implement JWT Authentication & Protected Routes',
    fileToCreate: 'server/src/middleware/authMiddleware.js',
    folder: 'server/src/middleware/',
    task: 'Protect sensitive API endpoints with token verification.',
    code: `// server/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};`,
    explanation: 'jwt.verify decodes the payload and verifies the cryptographic signature. req.user makes identity available to subsequent controllers.'
  },
  {
    step: 10,
    title: 'Complete Full CRUD Flow',
    fileToCreate: 'server/src/controllers/itemController.js',
    folder: 'server/src/controllers/',
    task: 'Implement Create, Read, Update, and Delete actions.',
    code: `// Delete item endpoint
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
};`,
    explanation: 'findByIdAndDelete atomically removes the document and returns the deleted record, or null if it did not exist.'
  },
  {
    step: 11,
    title: 'Environment Variables & Security Config',
    fileToCreate: 'server/.env & client/.env',
    folder: 'Root / server / client',
    task: 'Configure production environment variables without committing secrets to git.',
    code: `# server/.env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mydb
JWT_SECRET=super_secret_jwt_key_12345
CLIENT_URL=http://localhost:5173

# client/.env
VITE_API_URL=http://localhost:5000/api`,
    explanation: 'Variables without VITE_ in client/.env are ignored by Vite, preventing accidental leakage of backend secrets to the browser.'
  },
  {
    step: 12,
    title: 'Production Build & Deployment',
    fileToCreate: 'package.json (Build Script)',
    folder: 'Project Root',
    task: 'Build client assets and configure production serving.',
    code: `// In root package.json:
"scripts": {
  "build": "cd client && npm run build",
  "start": "node server/src/server.js"
}

// In server/src/app.js (Production serving):
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/dist/index.html'));
  });
}`,
    explanation: 'Serving the compiled client/dist/ from Express allows you to deploy the entire full-stack application on a single serverless instance or container.'
  }
];

export default function BoilerplateWorkshop() {
  const { awardXP } = useGame();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentMission = WORKSHOP_MISSIONS[currentStepIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMission.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = () => {
    if (currentStepIdx < WORKSHOP_MISSIONS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      awardXP(30, `Completed Boilerplate Step ${currentStepIdx + 1}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0e7490, #0f172a)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{
            background: '#06b6d4',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            Boilerplate Workshop
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            12-Step Production Blueprint
          </span>
        </div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#fff' }}>
          Build Your Own MERN Project Workshop
        </h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Learn how to build brand new, clean-architecture MERN projects from scratch. Follow this 12-mission blueprint to create production-ready applications.
        </p>
      </div>

      {/* Steps Scroller */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {WORKSHOP_MISSIONS.map((m, idx) => {
          const isActive = idx === currentStepIdx;
          const isPassed = idx < currentStepIdx;

          return (
            <button
              key={m.step}
              onClick={() => setCurrentStepIdx(idx)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: isActive ? '2px solid #06b6d4' : '1px solid var(--border-color)',
                background: isActive ? 'var(--bg-card)' : isPassed ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-secondary)',
                color: isActive ? '#06b6d4' : isPassed ? '#06b6d4' : 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              {isPassed ? <CheckCircle2 size={14} color="#06b6d4" /> : <span>Step {m.step}</span>}
              <span>{m.title}</span>
            </button>
          );
        })}
      </div>

      {/* Step Workspace */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <span style={{
              background: '#06b6d420',
              color: '#06b6d4',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              Step {currentMission.step} of {WORKSHOP_MISSIONS.length}
            </span>
            <h3 style={{ margin: '8px 0 4px 0', color: 'var(--text-primary)', fontSize: '1.3rem' }}>
              {currentMission.title}
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontFamily: 'JetBrains Mono, monospace' }}>
              Create File: {currentMission.fileToCreate} ({currentMission.folder})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={currentStepIdx === 0}
              onClick={() => setCurrentStepIdx(prev => prev - 1)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                cursor: currentStepIdx === 0 ? 'not-allowed' : 'pointer',
                opacity: currentStepIdx === 0 ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem'
              }}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              disabled={currentStepIdx === WORKSHOP_MISSIONS.length - 1}
              onClick={handleNext}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#06b6d4',
                color: '#fff',
                cursor: currentStepIdx === WORKSHOP_MISSIONS.length - 1 ? 'not-allowed' : 'pointer',
                opacity: currentStepIdx === WORKSHOP_MISSIONS.length - 1 ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              Next Step
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          padding: '14px 18px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          lineHeight: '1.5',
          marginBottom: '16px'
        }}>
          <strong>Task: </strong>{currentMission.task}
        </div>

        {/* Code Box with Copy */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
              Boilerplate Source Implementation
            </div>
            <button
              onClick={handleCopy}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: copied ? '#10b981' : 'var(--text-primary)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <div style={{
            background: '#0d1117',
            color: '#c9d1d9',
            padding: '16px',
            borderRadius: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.85rem',
            overflowX: 'auto',
            border: '1px solid #30363d'
          }}>
            <pre style={{ margin: 0 }}>{currentMission.code}</pre>
          </div>
        </div>

        {/* Explanation */}
        <div style={{
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: '10px',
          padding: '14px 18px',
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
          lineHeight: '1.5'
        }}>
          <strong style={{ color: '#06b6d4' }}>Why This Matters: </strong>{currentMission.explanation}
        </div>
      </div>
    </div>
  );
}
