// mern-learning-platform/src/components/simulators/ArchitectureExplorer.jsx
import React, { useState } from 'react';
import { Play, RotateCcw, ArrowRight, ArrowLeft, CheckCircle2, Info, Code, Layers } from 'lucide-react';

export const flowSteps = [
  {
    step: 1,
    title: 'User Interacts with React UI',
    nodeId: 'react',
    direction: 'downstream',
    actor: 'Browser / Client',
    description: 'The user fills out the alert form on AlertFormPage.jsx and clicks "Create Alert". React captures the event, calls rupeesToPaise(45000), and invokes api.createAlert().',
    payload: { action: 'submit_alert', offerId: '66off1...', targetPriceInPaise: 4500000, channels: ['email'] },
    filePath: 'client/src/pages/AlertFormPage.jsx',
    functionName: 'handleSubmit(e)'
  },
  {
    step: 2,
    title: 'Axios Prepares & Sends HTTP Request',
    nodeId: 'axios',
    direction: 'downstream',
    actor: 'Client Network Layer',
    description: 'The Axios singleton in api.js executes its request interceptor. It reads the JWT token from localStorage and appends Authorization: Bearer <token>. An HTTP POST request is dispatched to the backend.',
    payload: { method: 'POST', url: '/api/alerts', headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1Ni...' } },
    filePath: 'client/src/services/api.js',
    functionName: 'createAlert({ offerId, type, targetPriceInPaise, channels })'
  },
  {
    step: 3,
    title: 'Express Router Matches Path',
    nodeId: 'router',
    direction: 'downstream',
    actor: 'Server Gateway',
    description: 'server/src/app.js receives the incoming POST. It matches app.use("/api/alerts", alertRoutes) and delegates to server/src/routes/alerts.js matching router.post("/").',
    payload: { matchedRoute: 'POST /api/alerts', mountedRouter: 'routes/alerts.js' },
    filePath: 'server/src/routes/alerts.js',
    functionName: 'router.post("/", requireAuth, validate, createAlert)'
  },
  {
    step: 4,
    title: 'Middleware Pipeline Execution',
    nodeId: 'middleware',
    direction: 'downstream',
    actor: 'Security & Sanitization',
    description: '1) express.json() parses incoming JSON. 2) requireAuth verifies the JWT signature and populates req.user. 3) express-validator validates positive integer paise. 4) next() passes control.',
    payload: { reqUser: { id: '66usr123...', role: 'user' }, validationPassed: true },
    filePath: 'server/src/middleware/auth.js & validate.js',
    functionName: 'requireAuth(req, res, next) & validate(req, res, next)'
  },
  {
    step: 5,
    title: 'Controller Unpacking & Coordination',
    nodeId: 'controller',
    direction: 'downstream',
    actor: 'HTTP Transport Layer',
    description: 'alertsController.createAlert extracts targetPriceInPaise, channels, and req.user.id. It verifies that the referenced Offer exists before proceeding.',
    payload: { userId: '66usr123...', offerId: '66off1...', type: 'target_price' },
    filePath: 'server/src/controllers/alertsController.js',
    functionName: 'createAlert(req, res, next)'
  },
  {
    step: 6,
    title: 'Service Layer Business Validation',
    nodeId: 'service',
    direction: 'downstream',
    actor: 'Business Logic Engine',
    description: 'The service layer checks for duplicate active alerts for this user and computes initial baseline pricing if a fixed-drop alert was requested.',
    payload: { baselineVerified: true, armed: true, status: 'active' },
    filePath: 'server/src/services/alertEvaluator.js',
    functionName: 'evaluateAlert() rules preparation'
  },
  {
    step: 7,
    title: 'Mongoose ODM Schema Validation',
    nodeId: 'mongoose',
    direction: 'downstream',
    actor: 'Data Modeling Layer',
    description: 'Mongoose compiles new Alert({...}) and validates schema types: ensures targetPriceInPaise is strictly an integer (Number.isInteger) and channels has at least 1 valid channel.',
    payload: { schemaValidation: 'PASS', integerCheck: '4500000 is Integer' },
    filePath: 'server/src/models/Alert.js',
    functionName: 'new Alert(doc).save()'
  },
  {
    step: 8,
    title: 'MongoDB Atlas Persistence',
    nodeId: 'mongodb',
    direction: 'database',
    actor: 'Cloud Datastore',
    description: 'MongoDB writes the new document into the alerts collection, assigns an immutable _id ObjectId, creates timestamps, and returns the persisted record.',
    payload: { _id: '66alt999...', createdAt: '2026-11-23T10:30:00Z', insertedCount: 1 },
    filePath: 'MongoDB Atlas / alerts collection',
    functionName: 'db.alerts.insertOne({...})'
  },
  {
    step: 9,
    title: 'Express Serializes HTTP 201 Response',
    nodeId: 'controller',
    direction: 'upstream',
    actor: 'Server Response Gateway',
    description: 'The controller wraps the created document in our standard envelope: res.status(201).json({ success: true, data: newAlert }). The response streams back over TLS.',
    payload: { status: 201, body: { success: true, data: { _id: '66alt999...', armed: true } } },
    filePath: 'server/src/controllers/alertsController.js',
    functionName: 'res.status(201).json({...})'
  },
  {
    step: 10,
    title: 'React Unwraps & Renders UI Update',
    nodeId: 'react',
    direction: 'upstream',
    actor: 'Browser / UI',
    description: 'Axios unwrap() extracts res.data.data. React updates local state and redirects the user to /alerts with a green toast notification: "Alert active and armed!".',
    payload: { uiNotification: 'Toast: Alert Created', activeCount: '+1' },
    filePath: 'client/src/pages/AlertFormPage.jsx',
    functionName: 'navigate("/alerts")'
  }
];

export const nodesInfo = {
  react: {
    name: 'React 18 Frontend',
    type: 'Client Tier',
    description: 'Executes in the user browser via Virtual DOM. Handles user inputs, forms, and reactive UI state.',
    priceRadarFile: 'client/src/App.jsx & client/src/pages/',
    realExample: 'User clicks "Create Alert" on AlertFormPage.jsx. React validates form state and invokes api.createAlert().'
  },
  axios: {
    name: 'Axios Client (api.js)',
    type: 'Network Client',
    description: 'Promise-based HTTP client singleton configured with baseURL and request interceptors that attach JWT tokens.',
    priceRadarFile: 'client/src/services/api.js',
    realExample: 'api.interceptors.request.use(config => { config.headers.Authorization = `Bearer ${token}`; return config; });'
  },
  router: {
    name: 'Express Router',
    type: 'HTTP Router',
    description: 'Maps HTTP verbs and URL paths to specific middleware and controller functions.',
    priceRadarFile: 'server/src/routes/alerts.js (mounted in app.js)',
    realExample: 'router.post("/", requireAuth, validate, createAlert);'
  },
  middleware: {
    name: 'Middleware Guards',
    type: 'Request Interceptors',
    description: 'Filters incoming requests before controllers: verifies JWT (requireAuth) and sanitizes inputs (validate).',
    priceRadarFile: 'server/src/middleware/auth.js & validate.js',
    realExample: 'requireAuth verifies jwt.verify(token, JWT_SECRET) and attaches decoded user to req.user.'
  },
  controller: {
    name: 'Controller Layer',
    type: 'Transport Handler',
    description: 'Unpacks HTTP inputs (req.body, req.params, req.user) and returns standard JSON response envelopes.',
    priceRadarFile: 'server/src/controllers/alertsController.js',
    realExample: 'const { offerId, targetPriceInPaise } = req.body; const newAlert = await Alert.create({...}); res.status(201).json({...});'
  },
  service: {
    name: 'Service Layer',
    type: 'Business Logic',
    description: 'Houses pure business intelligence (price monitoring, distributed locks, alert evaluation) independent of HTTP.',
    priceRadarFile: 'server/src/services/alertEvaluator.js & priceMonitor.js',
    realExample: 'evaluateAlert(alert, currentPriceInPaise) checks if price dropped below target and handles armed state.'
  },
  mongoose: {
    name: 'Mongoose ODM',
    type: 'Data Modeling Layer',
    description: 'Enforces schemas, types, custom validators (Number.isInteger), and compound indexes on MongoDB collections.',
    priceRadarFile: 'server/src/models/Alert.js & Offer.js',
    realExample: 'priceInPaise: { type: Number, validate: { validator: Number.isInteger } } enforces integer-paise financial precision.'
  },
  mongodb: {
    name: 'MongoDB Atlas Cloud',
    type: 'Database Tier',
    description: 'High-performance cloud document datastore storing BSON records with compound indexes and TTL cleanup.',
    priceRadarFile: 'server/src/config/db.js (connected via MONGODB_URI)',
    realExample: 'Persists alerts, products, offers, observations, and distributed leases (MonitorLock).'
  }
};

export default function ArchitectureExplorer() {
  const [selectedNode, setSelectedNode] = useState('react');
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeStepData = flowSteps[currentStep - 1];

  function handleNext() {
    if (currentStep < flowSteps.length) {
      setCurrentStep(prev => prev + 1);
      setSelectedNode(flowSteps[currentStep].nodeId);
    }
  }

  function handlePrev() {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setSelectedNode(flowSteps[currentStep - 2].nodeId);
    }
  }

  function handleReset() {
    setCurrentStep(1);
    setSelectedNode('react');
    setIsPlaying(false);
  }

  return (
    <div className="card-base p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Layers className="w-3.5 h-3.5" /> Interactive Architectural Simulator
          </div>
          <h3 className="text-xl font-bold text-white">Full-Stack MERN Request & Response Lifecycle</h3>
          <p className="text-sm text-slate-400">Click any component to inspect its role, or step through the animated execution packet.</p>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
          <button onClick={handlePrev} disabled={currentStep === 1} className="btn-secondary text-xs px-2.5 py-1.5 disabled:opacity-40">
            <ArrowLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <span className="text-xs font-mono font-bold px-2 text-emerald-400">
            Step {currentStep} / {flowSteps.length}
          </span>
          <button onClick={handleNext} disabled={currentStep === flowSteps.length} className="btn-primary text-xs px-2.5 py-1.5 disabled:opacity-40">
            Next <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleReset} title="Reset flow" className="btn-secondary text-xs p-1.5 text-slate-400 hover:text-white">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid: Visual Diagram (Left) & Inspector Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Diagram Nodes */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            System Topology (Click to Inspect)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'react', name: '1. React 18 UI', tag: 'Browser Client', color: 'from-sky-500/20 to-sky-600/10 border-sky-500/40 text-sky-400' },
              { id: 'axios', name: '2. Axios (api.js)', tag: 'Network Client', color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/40 text-cyan-400' },
              { id: 'router', name: '3. Express Router', tag: 'Server Gateway', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/40 text-emerald-400' },
              { id: 'middleware', name: '4. Middleware Pipeline', tag: 'Auth & Validation', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-400' },
              { id: 'controller', name: '5. Controller Layer', tag: 'HTTP Serializer', color: 'from-teal-500/20 to-teal-600/10 border-teal-500/40 text-teal-400' },
              { id: 'service', name: '6. Service Layer', tag: 'Business Rules', color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/40 text-indigo-400' },
              { id: 'mongoose', name: '7. Mongoose ODM', tag: 'Schema & Types', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/40 text-purple-400' },
              { id: 'mongodb', name: '8. MongoDB Atlas', tag: 'Cloud Database', color: 'from-green-500/20 to-green-600/10 border-green-500/40 text-green-400' },
            ].map(node => {
              const isSelected = selectedNode === node.id;
              const isActiveStep = activeStepData.nodeId === node.id;

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-200 relative overflow-hidden bg-gradient-to-br ${node.color} ${
                    isSelected ? 'ring-2 ring-emerald-400 border-emerald-400 shadow-lg shadow-emerald-500/10' : 'hover:border-slate-600'
                  }`}
                >
                  {isActiveStep && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  )}
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{node.tag}</div>
                  <div className="font-bold text-sm text-white">{node.name}</div>
                </button>
              );
            })}
          </div>

          {/* Active Step Real-Time Journey Banner */}
          <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Step {activeStepData.step}: {activeStepData.title}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {activeStepData.actor}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">{activeStepData.description}</p>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto">
              <div className="text-slate-500 text-[10px] mb-1">Payload in transit:</div>
              <pre className="text-emerald-400">{JSON.stringify(activeStepData.payload, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* Right: Component Inspector Panel */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
              <Info className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-white text-sm">Component Inspector</h4>
              <span className="text-xs font-mono ml-auto px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {nodesInfo[selectedNode]?.type}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold uppercase text-slate-400 mb-1">Name & Layer</div>
                <div className="text-base font-bold text-white">{nodesInfo[selectedNode]?.name}</div>
                <p className="text-xs text-slate-300 mt-1">{nodesInfo[selectedNode]?.description}</p>
              </div>

              <div>
                <div className="text-xs font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-cyan-400" /> Real PriceRadar Source File
                </div>
                <div className="font-mono text-xs text-cyan-300 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800">
                  {nodesInfo[selectedNode]?.priceRadarFile}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase text-slate-400 mb-1">Real Code Example in Project</div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
                  {nodesInfo[selectedNode]?.realExample}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Click any node on the left to inspect</span>
            <span className="text-emerald-400 font-semibold font-mono">100% PriceRadar Codebase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
