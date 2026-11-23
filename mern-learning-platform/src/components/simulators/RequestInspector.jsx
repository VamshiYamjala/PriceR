// mern-learning-platform/src/components/simulators/RequestInspector.jsx
import React, { useState } from 'react';
import { Eye, Layers, ArrowRight } from 'lucide-react';

export default function RequestInspector() {
  const [routeTemplate, setRouteTemplate] = useState('/api/products/:productId/offers/:offerId');
  const [paramProductId, setParamProductId] = useState('66a101f92e4b01a2b3c4d5e6');
  const [paramOfferId, setParamOfferId] = useState('66off99281a7b8c9d0e1f2a3');
  const [queryCategory, setQueryCategory] = useState('smartphones');
  const [queryMinPrice, setQueryMinPrice] = useState('50000');
  const [bearerToken, setBearerToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  const [jsonBody, setJsonBody] = useState(`{
  "targetPriceInPaise": 4500000,
  "channels": ["email", "telegram"]
}`);

  // Derived dynamic URL
  const dynamicUrl = `/api/products/${paramProductId}/offers/${paramOfferId}?category=${queryCategory}&minPrice=${queryMinPrice}`;

  return (
    <div className="card-base p-6">
      <div className="mb-6 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
          <Layers className="w-3.5 h-3.5" /> Module 8 Interactive Tool
        </div>
        <h3 className="text-xl font-bold text-white">Live Express Request & Response Inspector</h3>
        <p className="text-sm text-slate-400">
          Modify route parameters, query string filters, headers, and request body. Watch them map live to <code className="text-emerald-400">req.params</code>, <code className="text-cyan-400">req.query</code>, <code className="text-amber-400">req.headers</code>, and <code className="text-purple-400">req.body</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-500">Route Definition in routes/products.js</span>
            <div className="font-mono text-xs font-bold text-emerald-400 mt-1">
              router.post('{routeTemplate}', requireAuth, handler)
            </div>
          </div>

          {/* URL & Path Params */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Route Parameters (:productId, :offerId)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={paramProductId}
                onChange={(e) => setParamProductId(e.target.value)}
                placeholder=":productId"
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={paramOfferId}
                onChange={(e) => setParamOfferId(e.target.value)}
                placeholder=":offerId"
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Query Params */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Query String Parameters (?category=...&minPrice=...)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={queryCategory}
                onChange={(e) => setQueryCategory(e.target.value)}
                placeholder="category"
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                value={queryMinPrice}
                onChange={(e) => setQueryMinPrice(e.target.value)}
                placeholder="minPrice"
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Header */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Authorization Header</label>
            <input
              type="text"
              value={bearerToken}
              onChange={(e) => setBearerToken(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* JSON Body */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Request Body (JSON)</label>
            <textarea
              rows={4}
              value={jsonBody}
              onChange={(e) => setJsonBody(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-purple-300 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="text-slate-500">Live Computed Full URL: </span>
            <span className="text-emerald-400 break-all">{dynamicUrl}</span>
          </div>
        </div>

        {/* Right: Controller Inspector (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">What Express Controller Receives</div>

          {/* req.params */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-emerald-400">req.params</span>
              <span className="text-[10px] text-slate-400">Extracted from URL placeholders</span>
            </div>
            <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
              {JSON.stringify({ productId: paramProductId, offerId: paramOfferId }, null, 2)}
            </pre>
          </div>

          {/* req.query */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-cyan-400">req.query</span>
              <span className="text-[10px] text-slate-400">Parsed from URL query string</span>
            </div>
            <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
              {JSON.stringify({ category: queryCategory, minPrice: queryMinPrice }, null, 2)}
            </pre>
          </div>

          {/* req.body */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-purple-400">req.body</span>
              <span className="text-[10px] text-slate-400">Parsed by express.json() middleware</span>
            </div>
            <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-purple-300 overflow-x-auto">
              {(() => {
                try {
                  return JSON.stringify(JSON.parse(jsonBody), null, 2);
                } catch {
                  return '// Invalid JSON syntax';
                }
              })()}
            </pre>
          </div>

          {/* req.user */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-amber-400">req.user</span>
              <span className="text-[10px] text-slate-400">Attached by requireAuth middleware after verifying JWT</span>
            </div>
            <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
              {JSON.stringify({ id: '66a01f92e4b01a2b3c4d5e6f', role: 'user', exp: 1764000000 }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
