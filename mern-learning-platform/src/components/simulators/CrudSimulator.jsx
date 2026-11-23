// mern-learning-platform/src/components/simulators/CrudSimulator.jsx
import React, { useState } from 'react';
import { PlusCircle, Search, Edit3, Trash2, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

export const crudOperations = [
  {
    id: 'create',
    action: 'CREATE',
    title: 'Create a Target Price Alert',
    verb: 'POST',
    endpoint: '/api/alerts',
    userAction: 'User fills target price (₹45,000) on AlertFormPage.jsx and clicks "Save Alert".',
    reactCode: `const targetPaise = rupeesToPaise(45000); // 4500000
await api.createAlert({ offerId, type: 'target_price', targetPriceInPaise: targetPaise, channels: ['email'] });`,
    routeLayer: 'router.post("/", requireAuth, validate, createAlert)',
    controllerLayer: 'alertsController.createAlert creates new Alert document with armed: true',
    dbOperation: 'db.alerts.insertOne({ userId, offerId, targetPriceInPaise: 4500000, armed: true })',
    responseCode: 'HTTP 201 Created',
    uiUpdate: 'Redirects to /alerts with green toast: "Alert active and armed!"'
  },
  {
    id: 'read',
    action: 'READ',
    title: 'Search Catalog & Compare Prices',
    verb: 'GET',
    endpoint: '/api/products/search?q=iphone',
    userAction: 'User types "iphone" into the search box on SearchPage.jsx.',
    reactCode: `useEffect(() => {
  api.searchProducts(searchTerm).then(data => setProducts(data.products));
}, [searchTerm]);`,
    routeLayer: 'router.get("/search", searchProducts)',
    controllerLayer: 'productsController.searchProducts runs regex search and aggregates lowest retailer offers',
    dbOperation: 'Product.find({ title: { $regex: "iphone", $options: "i" } }) & Offer.find({ productId })',
    responseCode: 'HTTP 200 OK',
    uiUpdate: 'SearchPage renders a responsive grid of ProductCard components with lowest price badges.'
  },
  {
    id: 'update',
    action: 'UPDATE',
    title: 'Pause an Active Price Alert',
    verb: 'PATCH',
    endpoint: '/api/alerts/:id',
    userAction: 'User toggles the Pause switch next to an alert on AlertManagementPage.jsx.',
    reactCode: `await api.updateAlert(alert._id, { status: 'paused' });
setAlerts(prev => prev.map(a => a._id === alert._id ? { ...a, status: 'paused' } : a));`,
    routeLayer: 'router.patch("/:id", requireAuth, validate, updateAlert)',
    controllerLayer: 'alertsController.updateAlert verifies alert belongs to req.user.id and applies partial update',
    dbOperation: 'Alert.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { status: "paused" }, { new: true })',
    responseCode: 'HTTP 200 OK',
    uiUpdate: 'Alert badge switches from green "Active" to yellow "Paused".'
  },
  {
    id: 'delete',
    action: 'DELETE',
    title: 'Remove an Offer from Watchlist',
    verb: 'DELETE',
    endpoint: '/api/watchlist/:id',
    userAction: 'User clicks the trash icon on a saved listing in WatchlistPage.jsx.',
    reactCode: `await api.removeFromWatchlist(watchlistItemId);
setWatchlist(prev => prev.filter(item => item._id !== watchlistItemId));`,
    routeLayer: 'router.delete("/:id", requireAuth, removeFromWatchlist)',
    controllerLayer: 'watchlistController.removeFromWatchlist removes join document scoped to req.user.id',
    dbOperation: 'WatchlistItem.deleteOne({ _id: req.params.id, userId: req.user.id })',
    responseCode: 'HTTP 200 OK',
    uiUpdate: 'Item animates out of the watchlist table, and total counter decrements by 1.'
  }
];

export default function CrudSimulator() {
  const [selectedOp, setSelectedOp] = useState(crudOperations[0]);

  return (
    <div className="card-base p-6">
      <div className="mb-6 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
          <Layers className="w-3.5 h-3.5" /> Module 12 Interactive CRUD Simulator
        </div>
        <h3 className="text-xl font-bold text-white">Full-Stack CRUD Flow Simulations</h3>
        <p className="text-sm text-slate-400">
          Select an operation to follow the journey from user click to Mongoose execution and back to the React UI.
        </p>
      </div>

      {/* Operation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {crudOperations.map(op => {
          const isSelected = selectedOp.id === op.id;
          return (
            <button
              key={op.id}
              onClick={() => setSelectedOp(op)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold ring-1 ring-emerald-500'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold ${
                  op.verb === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                  op.verb === 'GET' ? 'bg-emerald-500/20 text-emerald-400' :
                  op.verb === 'PATCH' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-rose-500/20 text-rose-400'
                }`}>
                  {op.action} ({op.verb})
                </span>
              </div>
              <div className="text-xs text-white truncate">{op.title}</div>
            </button>
          );
        })}
      </div>

      {/* Selected CRUD Execution Sequence */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase text-emerald-400">Step-by-Step Execution Journey</span>
            <h4 className="text-lg font-bold text-white mt-0.5">{selectedOp.title}</h4>
          </div>
          <span className="font-mono text-xs text-cyan-400 bg-slate-950 px-3 py-1 rounded border border-slate-800">
            {selectedOp.verb} {selectedOp.endpoint}
          </span>
        </div>

        {/* 6 Stages Grid */}
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
            <span className="font-mono font-bold text-emerald-400 shrink-0">1. User Action:</span>
            <span className="text-slate-300">{selectedOp.userAction}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
            <span className="font-mono font-bold text-sky-400 shrink-0">2. React & Axios:</span>
            <pre className="text-sky-300 font-mono text-[11px] overflow-x-auto flex-1">{selectedOp.reactCode}</pre>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
            <span className="font-mono font-bold text-amber-400 shrink-0">3. Express Route:</span>
            <span className="font-mono text-amber-300">{selectedOp.routeLayer}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
            <span className="font-mono font-bold text-teal-400 shrink-0">4. Controller Logic:</span>
            <span className="text-slate-300">{selectedOp.controllerLayer}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
            <span className="font-mono font-bold text-purple-400 shrink-0">5. MongoDB Query:</span>
            <span className="font-mono text-purple-300">{selectedOp.dbOperation}</span>
          </div>

          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30 flex items-start gap-3">
            <span className="font-mono font-bold text-emerald-400 shrink-0">6. UI Update ({selectedOp.responseCode}):</span>
            <span className="text-emerald-300 font-semibold">{selectedOp.uiUpdate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
