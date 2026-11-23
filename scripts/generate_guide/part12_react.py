# scripts/generate_guide/part12_react.py

def get_part12_html():
    return """
<div class="chapter-container page-break" id="part-12">
    <h1>Part 12: Complete React 18 Architecture & Hooks Guide</h1>
    <p>
        The PriceRadar frontend is built with <strong>React 18</strong> and <strong>Vite</strong>. It embraces component-driven architecture, declarative state management, custom context providers, and responsive styling.
    </p>

    <h2>12.1 Core React Principles Used in PriceRadar</h2>
    <ul>
        <li><strong>Component Hierarchy:</strong> Reusable building blocks (e.g. <code>&lt;ProductCard&gt;</code>, <code>&lt;OfferRow&gt;</code>, <code>&lt;Navbar&gt;</code>) nested within top-level screen views (e.g. <code>&lt;SearchPage&gt;</code>, <code>&lt;DashboardPage&gt;</code>).</li>
        <li><strong>Unidirectional Data Flow:</strong> Data flows downwards from parent to child via <code>props</code>; state modifications flow upwards via callback functions.</li>
        <li><strong>Declarative UI:</strong> Components declare <em>what</em> the screen should look like based on current <code>state</code>, and React's Virtual DOM reconciler updates the browser DOM efficiently.</li>
        <li><strong>Controlled Components:</strong> Form inputs (such as email, password, and target price) have their values bound directly to React state:
            <pre><code>&lt;input value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} /&gt;</code></pre>
            This ensures React remains the single source of truth for all user input.</li>
        <li><strong>Virtual DOM Keys:</strong> When rendering lists of offers or alerts, every item requires a stable unique key (e.g. <code>&lt;OfferRow key={offer._id} offer={offer} /&gt;</code>). This allows React's diffing algorithm to identify exactly which items were added, removed, or changed without re-rendering the entire list.</li>
    </ul>

    <h2>12.2 Deep Dive into React Hooks Used in PriceRadar</h2>
    <p>
        PriceRadar leverages both foundational and performance-tuning React hooks. Here is how each is used in the actual codebase:
    </p>

    <h3>1. <code>useState</code> (Local Component State)</h3>
    <ul>
        <li><strong>What it is:</strong> A Hook that adds state variables to functional components. Calling the updater function schedules a re-render.</li>
        <li><strong>Where used in PriceRadar:</strong> Form fields, loading spinners, and error alerts across every page.</li>
        <li><strong>Actual Code Example (<code>client/src/pages/AlertFormPage.jsx</code>):</strong>
            <pre><code>const [targetPrice, setTargetPrice] = useState('');
const [channels, setChannels] = useState(['email']);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);</code></pre>
        </li>
        <li><strong>Explanation:</strong> When <code>setLoading(true)</code> is called, React re-renders the component to display a disabled button with a spinning icon. When the API completes, <code>setLoading(false)</code> restores the button.</li>
    </ul>

    <h3>2. <code>useEffect</code> (Side Effects & Lifecycle Management)</h3>
    <ul>
        <li><strong>What it is:</strong> Performs asynchronous data fetching, subscriptions, or DOM mutations after rendering.</li>
        <li><strong>Where used in PriceRadar:</strong> Fetching catalog items on page load and handling search query debouncing.</li>
        <li><strong>Actual Code Example (<code>client/src/pages/ProductDetailPage.jsx</code>):</strong>
            <pre><code>useEffect(() => {
  let isMounted = true;
  async function loadData() {
    setLoading(true);
    try {
      const data = await getProduct(productId);
      if (isMounted) setProduct(data.product);
    } catch (err) {
      if (isMounted) setError(err.message);
    } finally {
      if (isMounted) setLoading(false);
    }
  }
  loadData();
  return () => { isMounted = false; }; // Cleanup prevents memory leaks on unmount
}, [productId]); // Re-runs whenever the URL productId changes</code></pre>
        </li>
    </ul>

    <h3>3. <code>useContext</code> (Global State Subscription)</h3>
    <ul>
        <li><strong>What it is:</strong> Subscribes to a React Context object, eliminating the need to pass props down through multiple layers of intermediate components ("prop drilling").</li>
        <li><strong>Where used in PriceRadar:</strong> <code>useAuth()</code> custom hook consuming <code>AuthContext</code>.</li>
        <li><strong>Actual Code Example (<code>client/src/components/Navbar.jsx</code>):</strong>
            <pre><code>export default function Navbar() {
  const { user, logout } = useAuth(); // Subscribes to global auth state

  return (
    &lt;nav className="navbar"&gt;
      {user ? (
        &lt;button onClick={logout}&gt;Sign Out ({user.name})&lt;/button&gt;
      ) : (
        &lt;Link to="/login"&gt;Sign In&lt;/Link&gt;
      )}
    &lt;/nav&gt;
  );
}</code></pre>
        </li>
    </ul>

    <h3>4. <code>useRef</code> (Persistent Mutable References & DOM Access)</h3>
    <ul>
        <li><strong>What it is:</strong> Returns a mutable object whose <code>.current</code> property persists across renders without triggering a re-render when mutated. Also used for direct DOM references.</li>
        <li><strong>Where used in PriceRadar:</strong> Managing debounce timers in search inputs and referencing chart SVG canvas containers.</li>
        <li><strong>Actual Code Example (Debounce in <code>SearchPage.jsx</code>):</strong>
            <pre><code>const debounceTimerRef = useRef(null);

function handleSearchChange(e) {
  const query = e.target.value;
  setSearchTerm(query);
  clearTimeout(debounceTimerRef.current);
  debounceTimerRef.current = setTimeout(() => {
    executeSearch(query);
  }, 400); // Waits 400ms after user stops typing before calling API
}</code></pre>
        </li>
    </ul>

    <h3>5. <code>useMemo</code> (Memoizing Expensive Computations)</h3>
    <ul>
        <li><strong>What it is:</strong> Caches the calculated result of an expensive function between renders, recomputing only when specified dependencies change.</li>
        <li><strong>Where used in PriceRadar:</strong> Sorting offers to find the lowest price and calculating average discount percentages.</li>
        <li><strong>Actual Code Example (<code>ProductDetailPage.jsx</code>):</strong>
            <pre><code>const lowestOffer = useMemo(() => {
  if (!offers || offers.length === 0) return null;
  return offers.reduce((min, o) => (o.priceInPaise &lt; min.priceInPaise ? o : min), offers[0]);
}, [offers]); // Only recalculates when the offers array changes</code></pre>
        </li>
    </ul>

    <h3>6. <code>useCallback</code> (Memoizing Function References)</h3>
    <ul>
        <li><strong>What it is:</strong> Caches a callback function definition between renders to prevent unnecessary re-rendering of child components that rely on reference equality.</li>
        <li><strong>Where used in PriceRadar:</strong> Event handlers passed to child component rows (e.g. <code>handleToggleWatchlist</code> passed to <code>&lt;OfferRow&gt;</code>).</li>
    </ul>

    <h2>12.3 Global Auth State Management (<code>AuthContext.jsx</code>)</h2>
    <p>
        The <code>AuthContext</code> acts as the single source of truth for user authentication across the client application:
    </p>
    <pre><code>// client/src/context/AuthContext.jsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('priceradar_token'));
  const [loading, setLoading] = useState(true);

  // Re-hydrates user profile on initial application load
  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const profile = await getMe();
          setUser(profile.user);
        } catch {
          localStorage.removeItem('priceradar_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, [token]);

  function login(newToken, newUser) {
    localStorage.setItem('priceradar_token', newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem('priceradar_token');
    setToken(null);
    setUser(null);
  }

  return (
    &lt;AuthContext.Provider value={{ user, token, loading, login, logout }}&gt;
      {children}
    &lt;/AuthContext.Provider&gt;
  );
}</code></pre>

    <h2>12.4 Route Guarding with <code>&lt;ProtectedRoute&gt;</code></h2>
    <p>
        Protected pages (Dashboard, Watchlist, Alerts) are wrapped in <code>&lt;ProtectedRoute&gt;</code>:
    </p>
    <pre><code>// client/src/components/ProtectedRoute.jsx
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return &lt;div className="spinner-border text-success" /&gt;;
  }

  if (!user) {
    // Preserves original destination in location.state so login redirects back
    return &lt;Navigate to="/login" state={{ from: location }} replace /&gt;;
  }

  return children;
}</code></pre>
</div>
"""
