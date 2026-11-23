// mern-learning-platform/src/components/simulators/JwtSimulator.jsx
import React, { useState } from 'react';
import { Key, Shield, Lock, Unlock, CheckCircle2, XCircle, ArrowRight, RefreshCw, Layers } from 'lucide-react';

export default function JwtSimulator() {
  const [authState, setAuthState] = useState('logged_out'); // 'logged_out' | 'registered' | 'logged_in'
  const [userName, setUserName] = useState('Ananya Sharma');
  const [userEmail, setUserEmail] = useState('ananya@example.com');
  const [userPassword, setUserPassword] = useState('SecurePass2026!');
  const [otpCode, setOtpCode] = useState('839201');
  const [tokenStatus, setTokenStatus] = useState('valid'); // 'valid' | 'expired' | 'invalid' | 'missing'
  const [protectedResult, setProtectedResult] = useState(null);

  // Simulated JWT parts
  const simulatedHeader = { alg: 'HS256', typ: 'JWT' };
  const simulatedPayload = {
    id: '66a101f92e4b01a2b3c4d5e6',
    email: userEmail,
    role: 'user',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600
  };
  const simulatedSignature = 'c2lnbmF0dXJlX2htYWNfc2hhMjU2X3ZhbGlkYXRpb24';
  const fullToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YTEwMWY5MmU0YjAxYTJiM2M0ZDVlNiIsInJvbGUiOiJ1c2VyIn0.${simulatedSignature}`;

  function handleRegister() {
    setAuthState('registered');
  }

  function handleVerifyOtp() {
    setAuthState('logged_in');
    setTokenStatus('valid');
  }

  function handleLogin() {
    setAuthState('logged_in');
    setTokenStatus('valid');
  }

  function handleLogout() {
    setAuthState('logged_out');
    setProtectedResult(null);
  }

  function testProtectedRoute() {
    if (tokenStatus === 'missing' || authState === 'logged_out') {
      setProtectedResult({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'No Bearer token found in Authorization header.',
        success: false
      });
      return;
    }
    if (tokenStatus === 'expired') {
      setProtectedResult({
        status: 401,
        code: 'TOKEN_EXPIRED',
        message: 'jwt.verify() rejected: Token expired on 2026-11-20T00:00:00Z.',
        success: false
      });
      return;
    }
    if (tokenStatus === 'invalid') {
      setProtectedResult({
        status: 401,
        code: 'INVALID_SIGNATURE',
        message: 'jwt.verify() rejected: HMAC-SHA256 signature mismatch (tampered token).',
        success: false
      });
      return;
    }

    setProtectedResult({
      status: 200,
      code: 'AUTHORIZED',
      message: 'Access granted! Decoded req.user: { id: "66a1...", role: "user" }',
      success: true,
      data: {
        activeAlerts: 3,
        watchlistCount: 5,
        notificationsUnread: 1
      }
    });
  }

  return (
    <div className="card-base p-6">
      <div className="mb-6 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
          <Layers className="w-3.5 h-3.5" /> Module 10 Interactive Authentication State Machine
        </div>
        <h3 className="text-xl font-bold text-white">Interactive JWT Issuance & Protected Route Simulator</h3>
        <p className="text-sm text-slate-400">
          Walk through OTP registration, bcrypt verification, token generation, payload decoding, and route guarding.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Auth Actions & State Machine (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Authentication Actions</div>

          {authState === 'logged_out' && (
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white">Step 1: Registration with OTP</span>
                <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400">Logged Out</span>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Email</label>
                <input
                  type="text"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Password (will be bcrypt hashed)</label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleRegister} className="btn-primary flex-1 justify-center text-xs">
                  Initiate Registration (Sends OTP)
                </button>
                <button onClick={handleLogin} className="btn-secondary text-xs">
                  Direct Login
                </button>
              </div>
            </div>
          )}

          {authState === 'registered' && (
            <div className="p-4 bg-slate-900 rounded-xl border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-emerald-400">Step 2: Enter 6-Digit Email OTP</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">OTP Dispatched</span>
              </div>
              <p className="text-xs text-slate-300">
                Brevo sent code <strong className="text-emerald-400 font-mono">839201</strong> to {userEmail}. Stored in <code className="text-cyan-400">OtpChallenge</code> with 10-minute TTL.
              </p>
              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Verification Code</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-center text-sm font-mono tracking-widest text-emerald-400"
                />
              </div>
              <button onClick={handleVerifyOtp} className="w-full btn-primary justify-center text-xs">
                Verify OTP & Issue JWT Token
              </button>
            </div>
          )}

          {authState === 'logged_in' && (
            <div className="p-4 bg-slate-900 rounded-xl border border-emerald-500 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Authenticated Session Active</span>
                </div>
                <button onClick={handleLogout} className="text-xs text-rose-400 hover:underline">
                  Logout
                </button>
              </div>
              <div className="text-xs text-slate-300 font-mono space-y-1">
                <div>Logged in as: <strong className="text-white">{userEmail}</strong></div>
                <div>Storage: <code className="text-emerald-400">localStorage.setItem('priceradar_token', ...)</code></div>
              </div>

              {/* Token State Manipulator for Testing */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1.5">
                  Test Route Guard with Different Token States:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'valid', label: '✅ Valid Token' },
                    { id: 'expired', label: '⌛ Expired Token' },
                    { id: 'invalid', label: '⚠️ Invalid Signature' },
                    { id: 'missing', label: '🚫 Omit Token' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTokenStatus(t.id)}
                      className={`p-1.5 rounded text-[11px] font-mono border transition-all ${
                        tokenStatus === t.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={testProtectedRoute} className="w-full btn-primary justify-center text-xs mt-2">
                Call Protected Route: GET /api/alerts
              </button>
            </div>
          )}

          {/* Protected Route Result */}
          {protectedResult && (
            <div className={`p-4 rounded-xl border text-xs font-mono ${
              protectedResult.success ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300' : 'bg-rose-500/10 border-rose-500 text-rose-300'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <span>Response: HTTP {protectedResult.status} [{protectedResult.code}]</span>
                {protectedResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
              </div>
              <p className="mt-1">{protectedResult.message}</p>
              {protectedResult.data && (
                <pre className="mt-2 p-2 bg-slate-950 rounded text-emerald-400 text-[11px]">
                  {JSON.stringify(protectedResult.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Right: JWT Structure Anatomy (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Anatomy of the Issued JWT Token</div>

          {/* Header */}
          <div className="bg-slate-900 rounded-xl p-3 border border-rose-500/40">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-400 mb-1">
              <span>1. Header (Algorithm & Token Type)</span>
              <span className="text-[10px] text-slate-500">Base64Url Encoded</span>
            </div>
            <pre className="p-2 bg-slate-950 rounded text-xs font-mono text-rose-300">
              {JSON.stringify(simulatedHeader, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div className="bg-slate-900 rounded-xl p-3 border border-sky-500/40">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-sky-400 mb-1">
              <span>2. Payload (Claims & User Identity)</span>
              <span className="text-[10px] text-slate-500">Readable by Anyone!</span>
            </div>
            <pre className="p-2 bg-slate-950 rounded text-xs font-mono text-sky-300">
              {JSON.stringify(simulatedPayload, null, 2)}
            </pre>
          </div>

          {/* Signature */}
          <div className="bg-slate-900 rounded-xl p-3 border border-emerald-500/40">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 mb-1">
              <span>3. Digital Signature (HMAC-SHA256)</span>
              <span className="text-[10px] text-slate-500">Verified via JWT_SECRET</span>
            </div>
            <div className="p-2 bg-slate-950 rounded text-xs font-mono text-emerald-300 break-all">
              HMACSHA256(base64Url(Header) + "." + base64Url(Payload), process.env.JWT_SECRET)
            </div>
          </div>

          {/* Raw Full Token */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono break-all leading-relaxed">
            <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Raw Token in Authorization Header:</div>
            <span className="text-rose-400">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>.
            <span className="text-sky-400">eyJpZCI6IjY2YTEwMWY5MmU0YjAxYTJiM2M0ZDVlNiIsInJvbGUiOiJ1c2VyIn0</span>.
            <span className="text-emerald-400">{simulatedSignature}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
