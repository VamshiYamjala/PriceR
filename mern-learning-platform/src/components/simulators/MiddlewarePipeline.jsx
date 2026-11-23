// mern-learning-platform/src/components/simulators/MiddlewarePipeline.jsx
import React, { useState } from 'react';
import { Layers, ShieldCheck, CheckCircle2, XCircle, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';

export const pipelineStages = [
  {
    id: 'cors',
    name: '1. CORS Policy',
    file: 'server/src/app.js',
    role: 'Inspects origin header against CLIENT_ORIGIN.',
    behaviorOnPass: 'Origin matches https://priceradar-web.onrender.com → sets Access-Control-Allow-Origin → calls next().',
    behaviorOnFail: 'Origin is malicious.com → throws Error("CORS blocked for origin: ...") → passes to errorHandler.',
    defaultFail: false
  },
  {
    id: 'json',
    name: '2. express.json()',
    file: 'Built-in Express Middleware',
    role: 'Buffers incoming TCP byte stream and parses JSON payload into req.body.',
    behaviorOnPass: 'Valid JSON payload → populates req.body with JavaScript object → calls next().',
    behaviorOnFail: 'Malformed JSON syntax (e.g. trailing comma) → returns HTTP 400 Bad Request immediately.',
    defaultFail: false
  },
  {
    id: 'fastfail',
    name: '3. Fast-Fail DB Guard',
    file: 'server/src/app.js (custom guard)',
    role: 'Inspects mongoose.connection.readyState before querying.',
    behaviorOnPass: 'readyState === 1 (Connected) → calls next().',
    behaviorOnFail: 'readyState !== 1 (Disconnected) → returns HTTP 503 DATABASE_DISCONNECTED immediately instead of waiting for 30s timeout.',
    defaultFail: false
  },
  {
    id: 'auth',
    name: '4. requireAuth',
    file: 'server/src/middleware/auth.js',
    role: 'Validates Authorization: Bearer <token> using jwt.verify().',
    behaviorOnPass: 'Valid signature and unexpired → attaches decoded token to req.user → calls next().',
    behaviorOnFail: 'Missing token or invalid signature → returns HTTP 401 Unauthorized immediately.',
    defaultFail: false
  },
  {
    id: 'validate',
    name: '5. express-validator',
    file: 'server/src/middleware/validate.js',
    role: 'Checks validationResult(req) from schema rules.',
    behaviorOnPass: 'No validation errors → calls next().',
    behaviorOnFail: 'Invalid email, negative price, or short password → returns HTTP 400 with validation error array.',
    defaultFail: false
  },
  {
    id: 'controller',
    name: '6. Controller Handler',
    file: 'server/src/controllers/alertsController.js',
    role: 'Unpacks sanitized inputs and invokes business logic or Mongoose model.',
    behaviorOnPass: 'Executes Alert.create() → returns HTTP 201 Created with JSON envelope.',
    behaviorOnFail: 'Uncaught internal exception → calls next(err) → handled by centralized errorHandler.',
    defaultFail: false
  }
];

export default function MiddlewarePipeline() {
  const [failAtStage, setFailAtStage] = useState('none');
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  function getStatusForStage(index) {
    const stage = pipelineStages[index];
    if (failAtStage === 'none') return 'pass';
    const failIndex = pipelineStages.findIndex(s => s.id === failAtStage);
    if (index < failIndex) return 'pass';
    if (index === failIndex) return 'fail';
    return 'skipped';
  }

  return (
    <div className="card-base p-6">
      <div className="mb-6 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
          <Layers className="w-3.5 h-3.5" /> Module 9 Interactive Pipeline Simulator
        </div>
        <h3 className="text-xl font-bold text-white">Visual Middleware Execution & Guardrail Pipeline</h3>
        <p className="text-sm text-slate-400">
          Simulate normal execution or trigger failure conditions (e.g. CORS rejection, DB disconnect, missing JWT) to watch how the pipeline halts.
        </p>
      </div>

      {/* Failure Simulation Selector */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-slate-900 rounded-xl border border-slate-800">
        <span className="text-xs font-bold uppercase text-slate-400 mr-2 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Simulate Scenario:
        </span>
        {[
          { id: 'none', label: '✅ All Pass (Normal Request)' },
          { id: 'cors', label: '🚫 CORS Blocked' },
          { id: 'fastfail', label: '⚠️ DB Disconnected (503)' },
          { id: 'auth', label: '🔒 Missing / Invalid JWT (401)' },
          { id: 'validate', label: '❌ Validation Failed (400)' }
        ].map(sc => (
          <button
            key={sc.id}
            onClick={() => setFailAtStage(sc.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              failAtStage === sc.id
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {sc.label}
          </button>
        ))}
      </div>

      {/* Visual Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-6">
        {pipelineStages.map((stage, idx) => {
          const status = getStatusForStage(idx);
          const isSelected = activeStageIndex === idx;

          return (
            <button
              key={stage.id}
              onClick={() => setActiveStageIndex(idx)}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                isSelected ? 'ring-2 ring-emerald-400' : ''
              } ${
                status === 'pass' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' :
                status === 'fail' ? 'bg-rose-500/20 border-rose-500 text-rose-400' :
                'bg-slate-950/40 border-slate-800/60 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500">Gate {idx + 1}</span>
                {status === 'pass' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {status === 'fail' && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
              <div className="font-bold text-xs truncate text-white">{stage.name}</div>
              <div className="text-[10px] uppercase font-mono mt-1 font-semibold">
                {status === 'pass' ? 'Calls next()' : status === 'fail' ? 'Halts with Error' : 'Skipped'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail Card */}
      {(() => {
        const stage = pipelineStages[activeStageIndex];
        const status = getStatusForStage(activeStageIndex);

        return (
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Inspecting Pipeline Stage</span>
                <h4 className="text-lg font-bold text-white mt-0.5">{stage.name}</h4>
                <div className="font-mono text-xs text-cyan-400">{stage.file}</div>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                status === 'pass' ? 'bg-emerald-500/20 text-emerald-400' :
                status === 'fail' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'
              }`}>
                {status === 'pass' ? 'Status: Passes' : status === 'fail' ? 'Status: Rejects' : 'Status: Not Reached'}
              </span>
            </div>

            <div>
              <div className="text-xs font-bold uppercase text-slate-400 mb-1">Middleware Role:</div>
              <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
                {stage.role}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-bold uppercase text-emerald-400 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Behavior on Success:
                </div>
                <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
                  {stage.behaviorOnPass}
                </p>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-rose-400 mb-1 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Behavior on Failure:
                </div>
                <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
                  {stage.behaviorOnFail}
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
