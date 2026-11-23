// mern-learning-platform/src/components/simulators/EndpointExplorer.jsx
import React, { useState } from 'react';
import { Search, Filter, Key, Code, Database, ArrowRight, Layers } from 'lucide-react';
import { endpointsData } from '../../data/endpointsData.js';

export default function EndpointExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMethod, setSelectedMethod] = useState('All');
  const [activeEndpoint, setActiveEndpoint] = useState(endpointsData[0]);

  const categories = ['All', 'Authentication', 'Catalog', 'Alerts', 'Watchlist', 'Price Monitoring', 'System Health'];
  const methods = ['All', 'GET', 'POST', 'PATCH', 'DELETE'];

  const filteredEndpoints = endpointsData.filter(ep => {
    const matchesSearch = ep.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ep.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ep.controller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ep.category === selectedCategory;
    const matchesMethod = selectedMethod === 'All' || ep.method === selectedMethod;
    return matchesSearch && matchesCategory && matchesMethod;
  });

  return (
    <div className="card-base p-6">
      <div className="mb-6 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
          <Layers className="w-3.5 h-3.5" /> Interactive Endpoint Explorer
        </div>
        <h3 className="text-xl font-bold text-white">PriceRadar REST API Specification & Execution Traces</h3>
        <p className="text-sm text-slate-400">Search and explore all verified API endpoints, middleware stacks, and database models.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search endpoint path, controller, or purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            {methods.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Master Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoint List (5 Cols) */}
        <div className="lg:col-span-5 space-y-2 max-h-[580px] overflow-y-auto pr-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 mb-2">
            Endpoints ({filteredEndpoints.length})
          </div>
          {filteredEndpoints.map(ep => {
            const isSelected = activeEndpoint.id === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => setActiveEndpoint(ep)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500 text-white ring-1 ring-emerald-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase ${
                    ep.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' :
                    ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                    ep.method === 'PATCH' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-white truncate">{ep.path}</span>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">{ep.purpose}</div>
              </button>
            );
          })}
        </div>

        {/* Endpoint Blueprint Detail (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-4 max-h-[580px] overflow-y-auto">
          <div className="pb-3 border-b border-slate-800 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {activeEndpoint.method}
                </span>
                <span className="font-mono text-sm font-bold text-white">{activeEndpoint.path}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{activeEndpoint.purpose}</p>
            </div>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shrink-0 ${
              activeEndpoint.auth === 'Bearer JWT' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {activeEndpoint.auth}
            </span>
          </div>

          {/* Connected File Pipeline */}
          <div>
            <div className="text-xs font-bold uppercase text-slate-400 mb-2">Execution Flow Blueprint</div>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">1. Route File:</span>
                <span className="text-cyan-400">{activeEndpoint.routeFile}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">2. Middleware Stack:</span>
                <span className="text-amber-400 truncate max-w-[280px]">
                  {activeEndpoint.middleware.length > 0 ? activeEndpoint.middleware.join(', ') : 'None (Direct route)'}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">3. Controller:</span>
                <span className="text-emerald-400">{activeEndpoint.controller}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">4. Mongoose Model:</span>
                <span className="text-purple-400">{activeEndpoint.model}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">5. Client Caller:</span>
                <span className="text-sky-400 text-[11px] truncate max-w-[280px]">{activeEndpoint.frontendCaller}</span>
              </div>
            </div>
          </div>

          {/* Example Request / Response */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-bold uppercase text-slate-400 mb-1">Example Request Data:</div>
              <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-36">
                {activeEndpoint.exampleReq ? JSON.stringify(activeEndpoint.exampleReq, null, 2) : '// No body required'}
              </pre>
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-slate-400 mb-1">Standard JSON Response:</div>
              <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-36">
                {JSON.stringify(activeEndpoint.exampleRes, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
