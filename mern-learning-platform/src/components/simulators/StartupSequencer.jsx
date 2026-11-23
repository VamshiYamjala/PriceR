// mern-learning-platform/src/components/simulators/StartupSequencer.jsx
import React, { useState } from 'react';
import { Play, ArrowRight, ArrowLeft, CheckCircle2, Server, Monitor, Terminal } from 'lucide-react';

export const frontendStartupSteps = [
  {
    step: 1,
    title: 'Developer runs "npm run dev"',
    file: 'client/package.json',
    action: 'Executes "vite" development server script.',
    details: 'Vite reads vite.config.js, starts an internal HTTP server on port 5173, and enables Hot Module Replacement (HMR) powered by native ES modules.'
  },
  {
    step: 2,
    title: 'Browser requests "http://localhost:5173/"',
    file: 'client/index.html',
    action: 'Vite serves the root HTML template containing <div id="root">.',
    details: 'The HTML document includes Bootstrap CSS from CDN and loads the root module script: <script type="module" src="/src/main.jsx">.'
  },
  {
    step: 3,
    title: 'Vite compiles & serves main.jsx',
    file: 'client/src/main.jsx',
    action: 'ReactDOM.createRoot binds to document.getElementById("root").',
    details: 'The application tree is wrapped in <BrowserRouter> for URL routing and <AuthProvider> for global authentication state.'
  },
  {
    step: 4,
    title: 'App.jsx mounts layout and route table',
    file: 'client/src/App.jsx',
    action: 'Renders Navbar, Footer, and evaluates React Router <Routes>.',
    details: 'If URL is "/", HomePage mounts. If URL is "/dashboard", ProtectedRoute checks user authentication before mounting DashboardPage.'
  },
  {
    step: 5,
    title: 'Virtual DOM Reconciles into Browser DOM',
    file: 'Browser DOM / Screen',
    action: 'Initial paint complete in sub-second time.',
    details: 'The user sees the PriceRadar Forest Green interface, ready for searches and interactions.'
  }
];

export const backendStartupSteps = [
  {
    step: 1,
    title: 'Developer runs "npm run dev" / "npm start"',
    file: 'server/package.json',
    action: 'Executes "node src/server.js" (or nodemon in dev).',
    details: 'Node.js runtime starts the V8 engine and begins executing server/src/server.js sequentially.'
  },
  {
    step: 2,
    title: 'Loads & validates environment variables',
    file: 'server/src/config/env.js',
    action: 'dotenv loads variables from .env into process.env.',
    details: 'Validates presence of critical keys: MONGODB_URI, JWT_SECRET, CLIENT_ORIGIN, and MONITOR_TRIGGER_SECRET. Halts early if missing.'
  },
  {
    step: 3,
    title: 'Assembles Express application pipeline',
    file: 'server/src/app.js',
    action: 'app = express() configures middleware and routes.',
    details: 'Registers CORS allowlist, express.json() body parser, public GET /api/health probe, fast-fail database check, 10 route modules, and errorHandler.'
  },
  {
    step: 4,
    title: 'Connects to MongoDB Atlas cloud',
    file: 'server/src/config/db.js',
    action: 'Executes mongoose.connect(process.env.MONGODB_URI).',
    details: 'Opens connection pool, attaches error and disconnect listeners. Once readyState === 1, server is database-ready.'
  },
  {
    step: 5,
    title: 'Starts in-process 4-hour cron scheduler',
    file: 'server/src/services/scheduler.js',
    action: 'Initializes startScheduler() with 4-hour interval.',
    details: 'Registers internal fallback timer that calls triggerScheduledCycle() every 4 hours, guarded by MongoDB MonitorLock.'
  },
  {
    step: 6,
    title: 'Express binds to port and begins listening',
    file: 'server/src/server.js',
    action: 'app.listen(PORT, callback).',
    details: 'Logs "Server running on port 5000" (or 10000 on Render). The backend is now ready to receive HTTP REST requests.'
  }
];

export default function StartupSequencer() {
  const [activeTab, setActiveTab] = useState('backend'); // 'frontend' | 'backend'
  const [stepIndex, setStepIndex] = useState(0);

  const steps = activeTab === 'frontend' ? frontendStartupSteps : backendStartupSteps;
  const currentStep = steps[stepIndex];

  function handleTabChange(tab) {
    setActiveTab(tab);
    setStepIndex(0);
  }

  return (
    <div className="card-base p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" /> Application Startup Sequencer
          </h3>
          <p className="text-sm text-slate-400">Step through the precise boot sequence of the React client and Express server.</p>
        </div>

        <div className="flex items-center bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => handleTabChange('frontend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'frontend' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Frontend Boot (Vite + React)
          </button>
          <button
            onClick={() => handleTabChange('backend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'backend' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" /> Backend Boot (Node + Express)
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-5 md:grid-cols-6 gap-2 mb-6">
        {steps.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setStepIndex(idx)}
            className={`text-left p-2.5 rounded-lg border transition-all text-xs ${
              idx === stepIndex
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold ring-1 ring-emerald-500'
                : idx < stepIndex
                ? 'bg-slate-900 border-slate-700 text-slate-300'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
            }`}
          >
            <div className="text-[10px] uppercase font-mono mb-0.5">Step {s.step}</div>
            <div className="truncate text-[11px]">{s.title.split(' ')[0]} {s.title.split(' ')[1]}</div>
          </button>
        ))}
      </div>

      {/* Step Details Display Card */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold font-mono uppercase px-2.5 py-1 rounded bg-slate-800 text-emerald-400">
              Stage {currentStep.step} of {steps.length}
            </span>
            <h4 className="text-lg font-bold text-white mt-2">{currentStep.title}</h4>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 uppercase font-semibold">Responsible File</span>
            <div className="font-mono text-xs text-cyan-400 font-bold">{currentStep.file}</div>
          </div>
        </div>

        <div className="space-y-4 my-4">
          <div>
            <div className="text-xs font-bold uppercase text-slate-400 mb-1">Execution Action:</div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300">
              {currentStep.action}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase text-slate-400 mb-1">Under the Hood Details:</div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
              {currentStep.details}
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-6">
          <button
            onClick={() => setStepIndex(prev => Math.max(0, prev - 1))}
            disabled={stepIndex === 0}
            className="btn-secondary text-xs disabled:opacity-30"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous Stage
          </button>
          <span className="text-xs text-slate-500 font-mono">
            {stepIndex + 1} / {steps.length} Completed
          </span>
          <button
            onClick={() => setStepIndex(prev => Math.min(steps.length - 1, prev + 1))}
            disabled={stepIndex === steps.length - 1}
            className="btn-primary text-xs disabled:opacity-30"
          >
            Next Stage <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
