# MERN STACK DEVELOPER QUEST
> *"Start as a beginner. Complete missions. Build real applications. Become a full-stack developer."*

Welcome to **MERN Stack Developer Quest** — an interactive, gamified developer academy and architecture simulator built directly from your real **PriceRadar** codebase.

---

## 🎮 How to Launch & Play

### Option 1: Standalone Offline Single-File HTML (Zero Setup!)
A single-file standalone web game has been compiled with all React components, icons, styles, interactive simulators, games, quizzes, and glossary embedded into one file:
- **Double-click** the launcher script: [`run-learning-platform.bat`](file:///d:/priceR/run-learning-platform.bat)
- Or directly open: [`mern-learning-platform/dist/index.html`](file:///d:/priceR/mern-learning-platform/dist/index.html) in any web browser.
*(No server or Node process required. Works completely offline!)*

---

### Option 2: Live Local Development Server
To run the interactive React application with hot-module reloading:

```bash
# 1. Navigate to the quest directory
cd d:\priceR\mern-learning-platform

# 2. Start the Vite development server
npm run dev
```

Once started, open `http://localhost:5173`.

---

## 🗺️ The 10 Worlds of the Full-Stack Campaign

1. **World 1: Web Development Kingdom**: Client-Server architecture, HTTP/HTTPS protocols, DNS, and request lifecycles.
   - *Boss*: **Architect Chronos** (Keeper of the HTTP Protocol)
2. **World 2: React Frontend City**: React 18, JSX, Virtual DOM diffing, component trees, hooks (`useState`, `useEffect`, `useRef`), and Context API.
   - *Boss*: **Lady Reacta** (Grand Mistress of the Virtual DOM)
3. **World 3: Axios & API Gateway**: REST APIs, HTTP methods, headers, request bodies, and automated Bearer JWT interceptors.
   - *Boss*: **Baron Axios** (Master of Asynchronous Conduits)
4. **World 4: Express Backend Fortress**: Node.js event loop, Express server boots, middleware pipelines (`req, res, next`), routers, and controllers.
   - *Boss*: **Commander Expressor** (Guardian of the Pipeline)
5. **World 5: MongoDB Database World**: BSON documents, Mongoose ODM, validation constraints, compound indexes, and integer-paise financial precision.
   - *Boss*: **Golem Mongo** (Lord of the BSON Vaults)
6. **World 6: JWT Security Headquarters**: Salted bcrypt hashing, stateless JWT creation, Base64 structure, Bearer tokens, and RBAC route guards.
   - *Boss*: **Cyber Sentinel Cipher** (Grand Inquisitor of Cryptography)
7. **World 7: Full Stack Integration City**: End-to-end integration connecting forms, Axios calls, middleware, MongoDB queries, and reactive UI re-renders.
   - *Boss*: **Integrator Prime** (Architect of Full-Stack Synchrony)
8. **World 8: Project Architect Headquarters**: Clean Architecture, separation of concerns, environment secrets (`.env`), and Render 503 startup debugging.
   - *Boss*: **High Architect Vance** (Chief of Production Engineering)
9. **World 9: Real Project Training Ground**: Deep inspection of the real **PriceRadar** codebase: distributed mutex locks (`MonitorLock.js`), 4-hour GitHub Actions cron, and price scrapers.
   - *Boss*: **Grandmaster Radar** (Lord of Distributed Price Monitoring)
10. **World 10: Professional Developer Arena**: The Debugging Arena, Architecture Builder, and 50+ Real Interview Review Questions.
    - *Final Boss*: **The Senior Tech Lead** (Principal Full-Stack Architect)

---

## 🕹️ Interactive Mini-Games & Arenas

### 🚀 1. Follow The Request (14-Station Simulation)
An interactive simulation tracing a request across all 14 stations:
1. `React UI Button` ➔ 2. `Event Handler` ➔ 3. `Axios Client` ➔ 4. `HTTP Packet` ➔ 5. `Express Router` ➔ 6. `Auth Middleware` ➔ 7. `Controller` ➔ 8. `Service Layer` ➔ 9. `Mongoose Model` ➔ 10. `MongoDB Engine` ➔ 11. `JSON Response` ➔ 12. `Axios Interceptor` ➔ 13. `State Update` ➔ 14. `Browser Re-render`.
*Analyzed across 5 architectural questions at every station.*

### 🔍 2. Code Detective (PriceRadar Investigation)
Investigate real PriceRadar files like a software detective:
- Find the bcrypt sign-in controller (`server/src/controllers/authController.js`)
- Locate the MongoDB connection pool (`server/src/config/db.js`)
- Find the JWT auth route guard (`server/src/middleware/authMiddleware.js`)
- Locate the financial integer-paise model (`server/src/models/Offer.js`)
- Discover the distributed mutex lock (`server/src/models/MonitorLock.js`)

### 🏗️ 3. Architecture Builder (File Organization Puzzle)
Drag and organize full-stack files into their proper MERN directories:
- `client/src/pages/`, `components/`, `services/`
- `server/src/routes/`, `controllers/`, `models/`, `middleware/`, `config/`, `services/`, `utils/`
*Instant automated grading, explanations, and XP awards.*

### 🐛 4. The Debugging Arena (Fix 6 Real Production Bugs)
Inspect broken code snippets, diagnose symptoms, and deploy engineering patches:
- The Hanging Middleware Mystery (missing `next()`)
- The Ghost Password Leak (sanitizing user objects before returning JSON)
- The Floating-Point Paise Catastrophe (`Number.isInteger` validation)
- The Forbidden State Mutation (React array immutability)
- The Undefined req.body Phantom (`express.json()` body-parser order)
- The Vanishing Distributed Lock (atomic `findOneAndUpdate` race condition prevention)

### 🌳 5. Full-Stack Skill Tree
Visual branching RPG skill tree across 5 disciplines:
- Frontend Engineering (JS ES6 ➔ React 18 ➔ Hooks ➔ Context API ➔ Axios)
- Backend Architecture (Node Event Loop ➔ Express Boot ➔ Middleware Pipeline ➔ Controllers)
- Database & Data Integrity (MongoDB BSON ➔ Mongoose ODM ➔ Integer-Paise Precision ➔ Compound Indexes)
- Security & Cryptography (Bcrypt Salted Hash ➔ JWT Tokens ➔ Role-Based Access Control)
- DevOps & Distributed Systems (Dotenv Secrets ➔ Distributed Mutex Locking ➔ GitHub Actions Cron)

### 🛠️ 6. Build Your Own MERN Project Workshop
A 12-step guided interactive boilerplate builder:
- Step 1: Initialize Git & Repository
- Step 2: Scaffold React with Vite
- Step 3: Bootstrap Express & Node Server
- Step 4: Connect MongoDB via Mongoose
- Step 5: Configure Axios with Centralized Interceptors
- Step 6: Create First REST API Endpoint
- Step 7: Design Production Mongoose Model
- Step 8: Build React UI with State Integration
- Step 9: Implement JWT Auth & Protected Routes
- Step 10: Complete Full CRUD Flow
- Step 11: Environment Variables & Security Config
- Step 12: Production Build & Deployment Checklist

---

## 🏆 Gamification Engine & Progression

- **10 Developer Ranks**: From *Level 1: Code Beginner* to *Level 10: MERN Master*.
- **XP Progression**: Earn XP by completing lessons, solving detective cases, fixing bugs, and conquering bosses.
- **14 Achievements**: Badges with custom icons and rewards.
- **Daily Streak Tracker**: Tracks consecutive days of learning activity.
- **Boss Battle Evaluator**: Multi-criteria keyword scanner calculating real-time damage against the Boss's HP.
- **Local Persistence**: All game progress, completed missions, unlocked skills, and achievements save automatically in `localStorage`.
- **Zero Modification Guarantee**: Your original PriceRadar project code remains 100% clean and untouched.
