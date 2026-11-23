// mern-learning-platform/src/components/simulators/DatabaseVisualizer.jsx
import React, { useState } from 'react';
import { Database, Layers, Key, ShieldCheck, Clock, CheckCircle2, FileText } from 'lucide-react';

export const modelsData = [
  {
    name: 'User',
    collection: 'users',
    file: 'server/src/models/User.js',
    role: 'User credentials, roles, and Telegram link identifier.',
    fields: [
      { name: '_id', type: 'ObjectId', rules: 'Primary Key' },
      { name: 'name', type: 'String', rules: 'required: true, trim: true' },
      { name: 'email', type: 'String', rules: 'required, unique: true, lowercase: true' },
      { name: 'passwordHash', type: 'String', rules: 'required, select: false (hidden by default)' },
      { name: 'telegramChatId', type: 'String', rules: 'optional, default: null' },
      { name: 'role', type: 'String', rules: "enum: ['user', 'admin'], default: 'user'" },
      { name: 'createdAt / updatedAt', type: 'Date', rules: 'Managed by timestamps: true' }
    ],
    indexes: ['email: 1 (unique)'],
    sampleDoc: {
      _id: 'ObjectId("66a01f92e4b01a2b3c4d5e6f")',
      name: 'Ananya Sharma',
      email: 'ananya@example.com',
      passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMye...',
      telegramChatId: '987654321',
      role: 'user',
      createdAt: '2026-11-20T10:00:00Z'
    }
  },
  {
    name: 'Product',
    collection: 'products',
    file: 'server/src/models/Product.js',
    role: 'Canonical master product identity independent of specific retailers.',
    fields: [
      { name: '_id', type: 'ObjectId', rules: 'Primary Key' },
      { name: 'title', type: 'String', rules: 'required: true, trim: true' },
      { name: 'canonicalKey', type: 'String', rules: 'required, unique: true, lowercase: true' },
      { name: 'brand', type: 'String', rules: 'optional' },
      { name: 'category', type: 'String', rules: 'optional, trim: true' },
      { name: 'dataStatus', type: 'String', rules: "enum: ['sample', 'live', 'cached', 'unavailable']" }
    ],
    indexes: ['canonicalKey: 1 (unique)'],
    sampleDoc: {
      _id: 'ObjectId("66prod010101...")',
      title: 'Apple iPhone 15 (128 GB) - Black',
      canonicalKey: 'apple-iphone-15-128gb-black',
      brand: 'Apple',
      category: 'smartphones',
      dataStatus: 'live'
    }
  },
  {
    name: 'Offer',
    collection: 'offers',
    file: 'server/src/models/Offer.js',
    role: 'Specific retailer listing with live price in integer paise.',
    fields: [
      { name: '_id', type: 'ObjectId', rules: 'Primary Key' },
      { name: 'productId', type: 'ObjectId', rules: 'required, ref: "Product"' },
      { name: 'provider', type: 'String', rules: "enum: ['flipkart', 'amazon', 'ebay', 'dummyjson', 'fixture', ...]" },
      { name: 'externalProductId', type: 'String', rules: 'required' },
      { name: 'priceInPaise', type: 'Number', rules: 'required, validate: Number.isInteger (rupees * 100)' },
      { name: 'availability', type: 'String', rules: "enum: ['in_stock', 'out_of_stock', 'unknown']" },
      { name: 'lastFetchedAt', type: 'Date', rules: 'Timestamp of last scraper check' },
      { name: 'lastStatus', type: 'String', rules: "enum: ['ok', 'stale', 'error']" }
    ],
    indexes: ['{ provider: 1, externalProductId: 1 } (unique compound)'],
    sampleDoc: {
      _id: 'ObjectId("66off10101...")',
      productId: 'ObjectId("66prod010101...")',
      provider: 'flipkart',
      retailer: 'flipkart',
      externalProductId: 'MOBGTAGPA3FZX...',
      title: 'Apple iPhone 15 (Black, 128 GB)',
      productUrl: 'https://flipkart.com/...',
      priceInPaise: 6499900,
      availability: 'in_stock',
      lastFetchedAt: '2026-11-23T04:00:00Z',
      lastStatus: 'ok'
    }
  },
  {
    name: 'Alert',
    collection: 'alerts',
    file: 'server/src/models/Alert.js',
    role: 'User price drop threshold subscription and stateful armed state.',
    fields: [
      { name: '_id', type: 'ObjectId', rules: 'Primary Key' },
      { name: 'userId', type: 'ObjectId', rules: 'required, ref: "User"' },
      { name: 'offerId', type: 'ObjectId', rules: 'required, ref: "Offer"' },
      { name: 'type', type: 'String', rules: "enum: ['target_price', 'fixed_drop'], required" },
      { name: 'targetPriceInPaise', type: 'Number', rules: 'required if type===target_price (Integer)' },
      { name: 'dropAmountInPaise', type: 'Number', rules: 'required if type===fixed_drop (Integer)' },
      { name: 'channels', type: '[String]', rules: "enum: ['email', 'telegram'], min: 1" },
      { name: 'armed', type: 'Boolean', rules: 'default: true (disarms upon firing to suppress duplicates)' },
      { name: 'status', type: 'String', rules: "enum: ['active', 'paused'], default: 'active'" }
    ],
    indexes: ['userId: 1', 'offerId: 1'],
    sampleDoc: {
      _id: 'ObjectId("66alt9900...")',
      userId: 'ObjectId("66a01f92e4b01a2b3c4d5e6f")',
      offerId: 'ObjectId("66off10101...")',
      type: 'target_price',
      targetPriceInPaise: 6400000,
      channels: ['email', 'telegram'],
      armed: true,
      status: 'active'
    }
  },
  {
    name: 'PriceObservation',
    collection: 'priceobservations',
    file: 'server/src/models/PriceObservation.js',
    role: 'Immutable time-series record of price fetch attempts powering charts.',
    fields: [
      { name: '_id', type: 'ObjectId', rules: 'Primary Key' },
      { name: 'offerId', type: 'ObjectId', rules: 'required, ref: "Offer"' },
      { name: 'priceInPaise', type: 'Number', rules: 'required if status===success (Integer)' },
      { name: 'status', type: 'String', rules: "enum: ['success', 'failure']" },
      { name: 'fetchedAt', type: 'Date', rules: 'default: Date.now' }
    ],
    indexes: ['{ offerId: 1, fetchedAt: -1 } (Compound Time-Series Index)'],
    sampleDoc: {
      _id: 'ObjectId("66obs5544...")',
      offerId: 'ObjectId("66off10101...")',
      priceInPaise: 6499900,
      status: 'success',
      fetchedAt: '2026-11-23T04:00:00Z'
    }
  },
  {
    name: 'NotificationEvent',
    collection: 'notificationevents',
    file: 'server/src/models/NotificationEvent.js',
    role: 'Audit log of sent notifications with unique dedupeKey.',
    fields: [
      { name: '_id', type: 'ObjectId', rules: 'Primary Key' },
      { name: 'userId', type: 'ObjectId', rules: 'required, ref: "User"' },
      { name: 'alertId', type: 'ObjectId', rules: 'required, ref: "Alert"' },
      { name: 'channel', type: 'String', rules: "enum: ['email', 'telegram']" },
      { name: 'status', type: 'String', rules: "enum: ['sent', 'failed', 'skipped_duplicate']" },
      { name: 'dedupeKey', type: 'String', rules: 'unique: true (${alertId}:${currentPriceInPaise})' }
    ],
    indexes: ['dedupeKey: 1 (unique)'],
    sampleDoc: {
      _id: 'ObjectId("66notif2211...")',
      userId: 'ObjectId("66a01f92e4b01a2b3c4d5e6f")',
      alertId: 'ObjectId("66alt9900...")',
      channel: 'telegram',
      status: 'sent',
      dedupeKey: '66alt9900:6399900'
    }
  },
  {
    name: 'MonitorLock',
    collection: 'monitorlocks',
    file: 'server/src/models/MonitorLock.js',
    role: 'Singleton distributed mutex preventing concurrent monitoring cycles.',
    fields: [
      { name: '_id', type: 'String', rules: "default: 'monitoring_cycle_lock'" },
      { name: 'isLocked', type: 'Boolean', rules: 'default: false' },
      { name: 'currentRunId', type: 'ObjectId', rules: 'ref: "MonitorRun"' },
      { name: 'heartbeatAt', type: 'Date', rules: 'Used for stale lease recovery (15-min timeout)' },
      { name: 'instanceId', type: 'String', rules: 'Unique container identifier' }
    ],
    indexes: ['_id (singleton)', 'heartbeatAt: 1'],
    sampleDoc: {
      _id: 'monitoring_cycle_lock',
      isLocked: true,
      currentRunId: 'ObjectId("66run000...")',
      acquiredAt: '2026-11-23T04:00:00Z',
      heartbeatAt: '2026-11-23T04:01:15Z',
      instanceId: 'render-node-inst-a7b8'
    }
  },
  {
    name: 'OtpChallenge',
    collection: 'otpchallenges',
    file: 'server/src/models/OtpChallenge.js',
    role: 'Hashed 6-digit OTP codes with automatic TTL self-destruction.',
    fields: [
      { name: '_id', type: 'ObjectId', rules: 'Primary Key' },
      { name: 'email', type: 'String', rules: 'required, lowercase: true' },
      { name: 'otpHash', type: 'String', rules: 'SHA-256 hash of 6-digit OTP' },
      { name: 'purpose', type: 'String', rules: "enum: ['register', 'login', 'reset_password']" },
      { name: 'attempts', type: 'Number', rules: 'default: 0 (max 5 attempts)' },
      { name: 'expiresAt', type: 'Date', rules: 'index: { expires: 0 } (MongoDB TTL Auto-Purge)' }
    ],
    indexes: ['email: 1', 'expiresAt: 1 (TTL index)'],
    sampleDoc: {
      _id: 'ObjectId("66otp8877...")',
      email: 'ananya@example.com',
      otpHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4...',
      purpose: 'register',
      attempts: 0,
      expiresAt: '2026-11-23T10:40:00Z'
    }
  }
];

export default function DatabaseVisualizer() {
  const [selectedModel, setSelectedModel] = useState(modelsData[2]); // Offer by default
  const [activeTab, setActiveTab] = useState('schema'); // 'schema' | 'sample'

  return (
    <div className="card-base p-6">
      <div className="mb-6 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
          <Database className="w-3.5 h-3.5" /> Module 11 Database Visualizer
        </div>
        <h3 className="text-xl font-bold text-white">MongoDB Atlas Collections & Mongoose Schemas</h3>
        <p className="text-sm text-slate-400">
          Inspect PriceRadar Mongoose models, compound unique indexes, TTL auto-cleanup, and financial integer-paise rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Model Tabs (4 Cols) */}
        <div className="lg:col-span-4 space-y-2 max-h-[560px] overflow-y-auto pr-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 mb-2">
            Mongoose Collections ({modelsData.length})
          </div>
          {modelsData.map(m => {
            const isSelected = selectedModel.name === m.name;
            return (
              <button
                key={m.name}
                onClick={() => setSelectedModel(m)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500 text-white ring-1 ring-emerald-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">{m.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{m.collection}</span>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{m.role}</div>
              </button>
            );
          })}
        </div>

        {/* Model Inspector (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-4 max-h-[560px] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold font-mono text-white">{selectedModel.name}</h4>
                <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                  collection: {selectedModel.collection}
                </span>
              </div>
              <div className="text-xs font-mono text-cyan-400 mt-0.5">{selectedModel.file}</div>
            </div>

            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('schema')}
                className={`px-3 py-1 rounded font-bold transition-all ${activeTab === 'schema' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
              >
                Schema & Rules
              </button>
              <button
                onClick={() => setActiveTab('sample')}
                className={`px-3 py-1 rounded font-bold transition-all ${activeTab === 'sample' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
              >
                Sample BSON Doc
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
            {selectedModel.role}
          </p>

          {activeTab === 'schema' ? (
            <div className="space-y-4">
              {/* Fields Table */}
              <div>
                <div className="text-xs font-bold uppercase text-slate-400 mb-2">Schema Fields & Validation Rules:</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2">Field</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">Validation / Constraint</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {selectedModel.fields.map((f, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/40">
                          <td className="p-2 font-bold text-white">{f.name}</td>
                          <td className="p-2 text-cyan-400">{f.type}</td>
                          <td className="p-2 text-emerald-400 text-[11px]">{f.rules}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Indexes */}
              <div>
                <div className="text-xs font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" /> Database Indexes Configured:
                </div>
                <ul className="text-xs font-mono text-amber-300 space-y-1 bg-slate-950 p-2.5 rounded border border-slate-800">
                  {selectedModel.indexes.map((idx, i) => (
                    <li key={i}>• {idx}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" /> Live MongoDB Document Representation:
              </div>
              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                {JSON.stringify(selectedModel.sampleDoc, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
