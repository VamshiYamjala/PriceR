// mern-learning-platform/src/components/simulators/AxiosSimulator.jsx
import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, RefreshCw, Layers, ArrowRight } from 'lucide-react';
import { endpointsData } from '../../data/endpointsData.js';

export default function AxiosSimulator() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpointsData[2]); // /api/auth/login default
  const [includeToken, setIncludeToken] = useState(true);
  const [requestBodyText, setRequestBodyText] = useState(JSON.stringify(endpointsData[2].exampleReq, null, 2));
  const [isLoading, setIsLoading] = useState(false);
  const [simulatedResponse, setSimulatedResponse] = useState(null);

  function handleEndpointChange(e) {
    const ep = endpointsData.find(item => item.id === e.target.value);
    if (ep) {
      setSelectedEndpoint(ep);
      setRequestBodyText(ep.exampleReq ? JSON.stringify(ep.exampleReq, null, 2) : '');
      setSimulatedResponse(null);
    }
  }

  function handleSendRequest() {
    setIsLoading(true);
    setSimulatedResponse(null);

    setTimeout(() => {
      setIsLoading(false);
      // Check auth failure simulation
      if (selectedEndpoint.auth === 'Bearer JWT' && !includeToken) {
        setSimulatedResponse({
          status: 401,
          statusText: 'Unauthorized',
          durationMs: 14,
          data: {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication token required. None provided in Authorization header.'
            }
          }
        });
        return;
      }

      // Successful simulated response
      setSimulatedResponse({
        status: selectedEndpoint.method === 'POST' && selectedEndpoint.id.includes('create') ? 201 : 200,
        statusText: 'OK',
        durationMs: 38,
        data: selectedEndpoint.exampleRes
      });
    }, 600);
  }

  return (
    <div className="card-base p-6">
      <div className="mb-6 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
          <Layers className="w-3.5 h-3.5" /> Interactive Axios HTTP Simulator
        </div>
        <h3 className="text-xl font-bold text-white">Live Client-to-Backend HTTP Request Playground</h3>
        <p className="text-sm text-slate-400">
          Configure an HTTP request, trigger Axios dispatch, and trace how the backend routes, authenticates, and responds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Configuration (7 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Select Endpoint & Method</div>
          
          <div className="flex gap-2">
            <span className={`px-3 py-2 rounded-lg text-xs font-extrabold uppercase shrink-0 font-mono ${
              selectedEndpoint.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              selectedEndpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              selectedEndpoint.method === 'PATCH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {selectedEndpoint.method}
            </span>
            <select
              value={selectedEndpoint.id}
              onChange={handleEndpointChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            >
              {endpointsData.map(ep => (
                <option key={ep.id} value={ep.id}>
                  [{ep.method}] {ep.path} ({ep.category})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-300">
            <span className="font-bold text-slate-400">Purpose: </span>
            {selectedEndpoint.purpose}
          </div>

          {/* Headers & Auth Toggles */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">2. Headers & Interceptor</div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Content-Type:</span>
                <span className="text-emerald-400">application/json</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Authorization:</span>
                  <span className="text-[10px] text-slate-500">
                    {selectedEndpoint.auth === 'Bearer JWT' ? '(Required)' : '(Optional)'}
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeToken}
                    onChange={(e) => setIncludeToken(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span className={includeToken ? 'text-emerald-400 text-xs' : 'text-slate-500 text-xs'}>
                    {includeToken ? 'Bearer <token> attached' : 'Omit Token'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Request Body */}
          {selectedEndpoint.method !== 'GET' && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">3. JSON Request Body (req.body)</div>
              <textarea
                rows={5}
                value={requestBodyText}
                onChange={(e) => setRequestBodyText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Dispatch Button */}
          <button
            onClick={handleSendRequest}
            disabled={isLoading}
            className="w-full btn-primary py-2.5 justify-center text-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Axios Dispatching Request...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Send Simulated Axios Request
              </>
            )}
          </button>
        </div>

        {/* Right: Response & Trace (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">4. Backend Execution Trace</div>
          
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Route Handler:</span>
              <span className="font-mono text-cyan-400">{selectedEndpoint.routeFile}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Middleware Chain:</span>
              <span className="font-mono text-amber-400 text-[11px] truncate max-w-[220px]">
                {selectedEndpoint.middleware.length > 0 ? selectedEndpoint.middleware.join(', ') : 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Controller Function:</span>
              <span className="font-mono text-emerald-400">{selectedEndpoint.controller}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Mongoose Model:</span>
              <span className="font-mono text-purple-400">{selectedEndpoint.model}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">5. Simulated HTTP Response</span>
              {simulatedResponse && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  simulatedResponse.status < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  HTTP {simulatedResponse.status} {simulatedResponse.statusText} ({simulatedResponse.durationMs}ms)
                </span>
              )}
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 min-h-[180px] font-mono text-xs overflow-x-auto">
              {isLoading ? (
                <div className="h-36 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                  <span>Traversing Express routes...</span>
                </div>
              ) : simulatedResponse ? (
                <pre className={simulatedResponse.status < 300 ? 'text-emerald-400' : 'text-rose-400'}>
                  {JSON.stringify(simulatedResponse.data, null, 2)}
                </pre>
              ) : (
                <div className="h-36 flex flex-col items-center justify-center text-slate-600 gap-1">
                  <span>Click "Send Simulated Axios Request" above</span>
                  <span className="text-[11px] text-slate-600">Simulates real client-to-backend request resolution</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
