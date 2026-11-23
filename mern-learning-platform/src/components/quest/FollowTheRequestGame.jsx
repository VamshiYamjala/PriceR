import React, { useState } from 'react';
import {
  Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  ArrowRight, Database, Server, Globe, Layers, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { useGame } from '../../context/GameContext';

const SCENARIOS = [
  {
    id: 'watchlist',
    title: 'Scenario 1: User Adds Offer to Watchlist',
    userAction: 'User clicks "Add to Watchlist" on a ₹499 item.',
    stations: [
      {
        station: 1,
        name: 'React UI Button',
        file: 'client/src/components/ProductCard.jsx',
        layer: 'Frontend UI',
        what: 'User clicks the "+ Watchlist" button.',
        why: 'Initiates user intention to track price fluctuations for this specific product offer.',
        data: 'Button onClick event with offerId: "6699a1b2c3d4e5f6"',
        next: 'Invokes handleAddToWatchlist event handler inside component scope.'
      },
      {
        station: 2,
        name: 'React Event Handler',
        file: 'client/src/components/ProductCard.jsx',
        layer: 'Frontend Logic',
        what: 'Event handler prevents default form action and prepares payload.',
        why: 'Extracts offerId, verifies user is logged in, and calls API service function.',
        data: '{ offerId: "6699a1b2c3d4e5f6" }',
        next: 'Delegates network dispatch to services/api.js.'
      },
      {
        station: 3,
        name: 'Axios API Function',
        file: 'client/src/services/api.js',
        layer: 'Network Client',
        what: 'Axios request interceptor reads JWT from localStorage and attaches header.',
        why: 'Protected endpoints require Bearer authorization; interceptor avoids manual header passing.',
        data: 'Headers: { Authorization: "Bearer eyJhbGciOiJIUzI1Ni..." }',
        next: 'Transmits serialized JSON packet over HTTP protocol to localhost:5000.'
      },
      {
        station: 4,
        name: 'HTTP Request Packet',
        file: 'Network / Transport Layer',
        layer: 'Protocol',
        what: 'POST /api/watchlist HTTP/1.1 payload travelling across network.',
        why: 'HTTP protocol defines how client and server negotiate requests and content encoding.',
        data: 'POST /api/watchlist\nContent-Type: application/json\n{"offerId":"6699a1b2c3d4e5f6"}',
        next: 'Reaches Express server TCP socket port 5000.'
      },
      {
        station: 5,
        name: 'Express Router',
        file: 'server/src/routes/watchlistRoutes.js',
        layer: 'Backend Routing',
        what: 'Express matches URL path `/api/watchlist` and HTTP verb POST.',
        why: 'Directs incoming traffic to the registered middleware pipeline and controller function.',
        data: 'router.post("/", requireAuth, watchlistController.addToWatchlist)',
        next: 'Executes requireAuth middleware.'
      },
      {
        station: 6,
        name: 'Authentication Middleware',
        file: 'server/src/middleware/authMiddleware.js',
        layer: 'Security Checkpoint',
        what: 'Verifies JWT token signature using process.env.JWT_SECRET.',
        why: 'Ensures the caller is authenticated and extracts user ID safely.',
        data: 'req.user = { _id: "60d0fe4f5311236168a109ca", role: "user" }',
        next: 'Calls next() to proceed to controller.'
      },
      {
        station: 7,
        name: 'Watchlist Controller',
        file: 'server/src/controllers/watchlistController.js',
        layer: 'Business Logic',
        what: 'Extracts userId from req.user and offerId from req.body.',
        why: 'Coordinates database query and enforces business constraints.',
        data: 'const { offerId } = req.body; const userId = req.user._id;',
        next: 'Invokes Mongoose User or Watchlist model.'
      },
      {
        station: 8,
        name: 'Mongoose Model Layer',
        file: 'server/src/models/User.js',
        layer: 'Data Modeling (ODM)',
        what: 'Executes `$addToSet: { watchlist: offerId }` update.',
        why: '$addToSet prevents duplicate offer entries in the user watchlist array.',
        data: 'User.findByIdAndUpdate(userId, { $addToSet: { watchlist: offerId } })',
        next: 'Dispatches BSON command over MongoDB wire protocol.'
      },
      {
        station: 9,
        name: 'MongoDB Database Engine',
        file: 'MongoDB Server (Port 27017)',
        layer: 'Database Storage',
        what: 'Updates user document on disk and appends to oplog.',
        why: 'Persists watchlist mutation permanently in ACID-compliant storage.',
        data: 'BSON document modified: nModified = 1',
        next: 'Returns acknowledgement back to Mongoose driver.'
      },
      {
        station: 10,
        name: 'Backend JSON Response',
        file: 'server/src/controllers/watchlistController.js',
        layer: 'HTTP Response',
        what: 'Controller sends HTTP 200 OK with standardized JSON payload.',
        why: 'Informs frontend that the item was successfully added.',
        data: 'res.json({ success: true, message: "Added to watchlist" })',
        next: 'Transmits response packet back across network to browser.'
      },
      {
        station: 11,
        name: 'Axios Response Interceptor',
        file: 'client/src/services/api.js',
        layer: 'Network Client',
        what: 'Axios receives 200 OK and resolves promise with response.data.',
        why: 'Centralized place to unwrap data and handle global success/error toasts.',
        data: '{ success: true, data: { ... } }',
        next: 'Promise resolves in React component.'
      },
      {
        station: 12,
        name: 'React State Update',
        file: 'client/src/components/ProductCard.jsx',
        layer: 'React State',
        what: 'Component calls setIsWatchlisted(true).',
        why: 'React state mutation triggers reconciliation in the component sub-tree.',
        data: 'isWatchlisted: true',
        next: 'React schedules Virtual DOM diffing.'
      },
      {
        station: 13,
        name: 'Virtual DOM Diffing',
        layer: 'React Engine',
        what: 'React compares previous VDOM tree with new VDOM tree.',
        why: 'Identifies that only the button icon and text changed from "+ Watchlist" to "✓ Saved".',
        data: 'Calculated patch: 1 DOM node text & class change',
        next: 'Flushes patch to real browser DOM.'
      },
      {
        station: 14,
        name: 'Updated Browser UI',
        layer: 'Browser Viewport',
        what: 'The button color turns green and displays "✓ Saved".',
        why: 'The user receives instant visual confirmation of their action without full page reload.',
        data: 'Visual feedback complete!',
        next: 'Cycle finished. Ready for next user interaction.'
      }
    ]
  }
];

export default function FollowTheRequestGame() {
  const { awardXP, unlockAchievement } = useGame();
  const [selectedScenario] = useState(SCENARIOS[0]);
  const [currentStationIdx, setCurrentStationIdx] = useState(0);

  const currentStation = selectedScenario.stations[currentStationIdx];
  const totalStations = selectedScenario.stations.length;

  const handleNext = () => {
    if (currentStationIdx < totalStations - 1) {
      setCurrentStationIdx(prev => prev + 1);
      if (currentStationIdx + 2 === totalStations) {
        awardXP(150, 'Completed full 14-station request journey!');
        unlockAchievement('ach_request_master');
      }
    }
  };

  const handlePrev = () => {
    if (currentStationIdx > 0) {
      setCurrentStationIdx(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStationIdx(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b, #0f172a)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{
            background: '#10b981',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            Interactive Simulation
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Follow The Request • 14 Stations
          </span>
        </div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#fff' }}>
          Follow The Request: From Button Click to Database & Back
        </h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {selectedScenario.userAction} Watch how an HTTP packet travels across every station in the MERN architecture.
        </p>
      </div>

      {/* Stations Visual Track */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '16px',
        overflowX: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {selectedScenario.stations.map((st, idx) => {
          const isActive = idx === currentStationIdx;
          const isPassed = idx < currentStationIdx;

          return (
            <React.Fragment key={st.station}>
              <button
                onClick={() => setCurrentStationIdx(idx)}
                style={{
                  minWidth: '120px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: isActive ? '2px solid #10b981' : '1px solid var(--border-color)',
                  background: isActive ? 'var(--bg-card)' : isPassed ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)',
                  color: isActive ? '#10b981' : isPassed ? '#10b981' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  boxShadow: isActive ? '0 0 16px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.8 }}>
                  Station {st.station}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {st.name}
                </div>
              </button>
              {idx < totalStations - 1 && (
                <ChevronRight size={16} color={isPassed ? '#10b981' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Station Deep Dive Screen */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <span style={{
              background: '#10b98120',
              color: '#10b981',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 800
            }}>
              Station {currentStation.station} of {totalStations}: {currentStation.layer}
            </span>
            <h3 style={{ margin: '8px 0 0 0', color: 'var(--text-primary)', fontSize: '1.4rem' }}>
              {currentStation.name}
            </h3>
            {currentStation.file && (
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
                Responsible File: {currentStation.file}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleReset}
              title="Restart Flow"
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={16} />
            </button>
            <button
              disabled={currentStationIdx === 0}
              onClick={handlePrev}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                cursor: currentStationIdx === 0 ? 'not-allowed' : 'pointer',
                opacity: currentStationIdx === 0 ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600
              }}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              disabled={currentStationIdx === totalStations - 1}
              onClick={handleNext}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#10b981',
                color: '#fff',
                cursor: currentStationIdx === totalStations - 1 ? 'not-allowed' : 'pointer',
                opacity: currentStationIdx === totalStations - 1 ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              Next Station
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 5-Question Architectural Analysis Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Question 1: What is happening */}
          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', marginBottom: '6px' }}>
              1. What is Happening?
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {currentStation.what}
            </div>
          </div>

          {/* Question 2: Why is this happening */}
          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#3b82f6', marginBottom: '6px' }}>
              2. Why is This Happening?
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {currentStation.why}
            </div>
          </div>

          {/* Question 3: Data being passed */}
          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#f59e0b', marginBottom: '6px' }}>
              3. What Data is Being Passed?
            </div>
            <div style={{
              background: '#0d1117',
              color: '#c9d1d9',
              padding: '10px 12px',
              borderRadius: '6px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.8rem',
              overflowX: 'auto',
              border: '1px solid #30363d',
              marginTop: '4px'
            }}>
              <pre style={{ margin: 0 }}>{currentStation.data}</pre>
            </div>
          </div>

          {/* Question 4: What happens next */}
          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#8b5cf6', marginBottom: '6px' }}>
              4. What Happens Next?
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {currentStation.next}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
