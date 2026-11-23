# scripts/generate_guide/part13_js_qa.py

def get_part13_html():
    return """
<div class="chapter-container page-break" id="part-13">
    <h1>Part 13: Core JavaScript Interview Preparation (30 Topics)</h1>
    <p>
        Every topic below is explained with a clear definition, practical analogy, and direct connection to the PriceRadar codebase.
    </p>

    <h3>1. JavaScript vs. Node.js</h3>
    <ul>
        <li><strong>Explanation:</strong> JavaScript is a high-level programming language. Node.js is an asynchronous runtime environment built on Chrome's V8 engine that allows JavaScript to execute outside the browser (on servers).</li>
        <li><strong>PriceRadar Connection:</strong> JavaScript runs in the user's browser rendering React components, while Node.js runs on our Render server executing Express endpoints and connecting to MongoDB.</li>
    </ul>

    <h3>2. <code>var</code> vs. <code>let</code> vs. <code>const</code></h3>
    <ul>
        <li><strong>Explanation:</strong> <code>var</code> is function-scoped and hoisted (can cause subtle bugs). <code>let</code> is block-scoped (mutable). <code>const</code> is block-scoped and immutable (cannot be reassigned).</li>
        <li><strong>PriceRadar Connection:</strong> PriceRadar uses 100% <code>const</code> by default and <code>let</code> only when variables change (e.g. <code>let lock = await ...</code>). <code>var</code> is completely forbidden.</li>
    </ul>

    <h3>3. Primitive vs. Reference Types</h3>
    <ul>
        <li><strong>Explanation:</strong> Primitives (String, Number, Boolean, null, undefined, Symbol, BigInt) are stored directly on the stack by value. Reference types (Objects, Arrays, Functions) are stored in the heap, and variables hold a memory address pointer.</li>
        <li><strong>PriceRadar Connection:</strong> Passing an offer object to a function passes a reference. Mutating <code>offer.priceInPaise = 100</code> mutates the original object in memory.</li>
    </ul>

    <h3>4. Loose Equality (<code>==</code>) vs. Strict Equality (<code>===</code>)</h3>
    <ul>
        <li><strong>Explanation:</strong> <code>==</code> performs type coercion before comparison (e.g. <code>"5" == 5</code> is true). <code>===</code> checks both value and data type without coercion (e.g. <code>"5" === 5</code> is false).</li>
        <li><strong>PriceRadar Connection:</strong> We always use <code>===</code>: <code>if (alert.type === 'target_price')</code> to prevent accidental truthy/falsy bugs.</li>
    </ul>

    <h3>5. Regular Functions vs. Arrow Functions</h3>
    <ul>
        <li><strong>Explanation:</strong> Arrow functions (<code>() => {}</code>) do not have their own <code>this</code>, <code>arguments</code>, or <code>prototype</code>; they lexically bind <code>this</code> from the enclosing scope.</li>
        <li><strong>PriceRadar Connection:</strong> Used throughout React components and array transformations: <code>offers.map(o => o.priceInPaise)</code>.</li>
    </ul>

    <h3>6. Scope: Global, Function, and Block Scope</h3>
    <ul>
        <li><strong>Explanation:</strong> Scope determines variable accessibility. Global variables are accessible everywhere. Function scope is accessible only inside that function. Block scope (<code>{}</code> with <code>let</code>/<code>const</code>) is restricted to that block (e.g. inside an <code>if</code> or <code>for</code> statement).</li>
    </ul>

    <h3>7. Hoisting & The Temporal Dead Zone (TDZ)</h3>
    <ul>
        <li><strong>Explanation:</strong> JavaScript moves variable and function declarations to the top of their scope before execution. <code>var</code> initializes as <code>undefined</code>, while <code>let</code> and <code>const</code> enter the Temporal Dead Zone (TDZ) and throw a <code>ReferenceError</code> if accessed before declaration.</li>
    </ul>

    <h3>8. Closures (With Real PriceRadar Example)</h3>
    <ul>
        <li><strong>Explanation:</strong> A closure is a function bundled together with references to its surrounding lexical environment. A closure gives an inner function access to an outer function's scope even after the outer function has returned.</li>
        <li><strong>PriceRadar Example (<code>asyncHandler.js</code>):</strong>
            <pre><code>export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};</code></pre>
            The inner function retains closure access to <code>fn</code>, catching rejected promises across any controller route.
        </li>
    </ul>

    <h3>9. Callbacks & Callback Hell</h3>
    <ul>
        <li><strong>Explanation:</strong> A callback is a function passed as an argument to another function to be executed later. Deeply nested callbacks create unreadable "callback hell". Modern JavaScript replaces callbacks with Promises and <code>async/await</code>.</li>
    </ul>

    <h3>10. Promises (Pending, Fulfilled, Rejected)</h3>
    <ul>
        <li><strong>Explanation:</strong> A Promise represents the eventual completion or failure of an asynchronous operation and its resulting value. It starts in <code>pending</code> state and settles into either <code>fulfilled</code> (resolved) or <code>rejected</code>.</li>
    </ul>

    <h3>11. <code>async</code> and <code>await</code></h3>
    <ul>
        <li><strong>Explanation:</strong> Syntactic sugar built on top of Promises that allows asynchronous code to be written and read synchronously, making control flow and error handling with <code>try/catch</code> far cleaner.</li>
        <li><strong>PriceRadar Example:</strong>
            <pre><code>const product = await Product.findById(productId);
const offers = await Offer.find({ productId });</code></pre>
        </li>
    </ul>

    <h3>12. The JavaScript Event Loop</h3>
    <ul>
        <li><strong>Explanation:</strong> Coordinates code execution. Consists of:
            <ol>
                <li><strong>Call Stack:</strong> Executes synchronous code.</li>
                <li><strong>Web / Node APIs:</strong> Handles background I/O, timers, and HTTP calls.</li>
                <li><strong>Microtask Queue:</strong> High-priority queue for Promise callbacks (<code>.then</code>, <code>await</code>).</li>
                <li><strong>Macrotask Queue:</strong> Queue for <code>setTimeout</code>, <code>setInterval</code>, and I/O callbacks.</li>
            </ol>
            The Event Loop continually pushes microtasks to the Call Stack as soon as synchronous execution finishes.
        </li>
    </ul>

    <h3>13. Synchronous vs. Asynchronous Execution</h3>
    <ul>
        <li><strong>Explanation:</strong> Synchronous code executes sequentially line-by-line, blocking subsequent instructions until finished. Asynchronous code offloads long operations (like database queries) to background worker threads, allowing the main thread to continue processing other tasks.</li>
    </ul>

    <h3>14. Array <code>map</code>, <code>filter</code>, and <code>reduce</code></h3>
    <ul>
        <li><strong><code>map()</code>:</strong> Transforms every element and returns a new array:
            <pre><code>const prices = offers.map(o => o.priceInPaise / 100);</code></pre>
        </li>
        <li><strong><code>filter()</code>:</strong> Returns a new array with elements matching a boolean condition:
            <pre><code>const inStockOffers = offers.filter(o => o.availability === 'in_stock');</code></pre>
        </li>
        <li><strong><code>reduce()</code>:</strong> Accumulates array items into a single final value:
            <pre><code>const minPrice = offers.reduce((min, o) => o.priceInPaise < min ? o.priceInPaise : min, offers[0].priceInPaise);</code></pre>
        </li>
    </ul>

    <h3>15. Destructuring Assignment (Object & Array)</h3>
    <ul>
        <li><strong>Explanation:</strong> Unpacks values from arrays or properties from objects into distinct variables.</li>
        <li><strong>PriceRadar Example:</strong> <code>const { email, password } = req.body;</code> or <code>const [user, setUser] = useState(null);</code>.</li>
    </ul>

    <h3>16. Spread (<code>...</code>) and Rest (<code>...</code>) Operators</h3>
    <ul>
        <li><strong>Spread:</strong> Expands an array or object into elements: <code>const updated = { ...alert, status: 'paused' };</code>.</li>
        <li><strong>Rest:</strong> Gathers remaining parameters into an array: <code>function logErrors(...errs) {}</code>.</li>
    </ul>

    <h3>17. Template Literals</h3>
    <ul>
        <li><strong>Explanation:</strong> Strings delimited with backticks (<code>`</code>) supporting embedded expressions (<code>${expression}</code>) and multi-line formatting.</li>
        <li><strong>PriceRadar Example:</strong> <code>`https://t.me/PriceRadarAlertBot?start=${linkCode}`</code>.</li>
    </ul>

    <h3>18. Optional Chaining (<code>?.</code>)</h3>
    <ul>
        <li><strong>Explanation:</strong> Safely accesses deeply nested object properties without throwing a <code>TypeError</code> if a reference is null or undefined.</li>
        <li><strong>PriceRadar Example:</strong> <code>alert?._id?.toString()</code> prevents crashes if <code>alert</code> is null.</li>
    </ul>

    <h3>19. Nullish Coalescing (<code>??</code> vs. <code>||</code>)</h3>
    <ul>
        <li><strong>Explanation:</strong> <code>||</code> returns the right-hand operand if the left-hand is <em>falsy</em> (including <code>0</code>, <code>""</code>, <code>false</code>). <code>??</code> returns the right-hand operand <em>only</em> if the left-hand is strictly <code>null</code> or <code>undefined</code>.</li>
        <li><strong>PriceRadar Example:</strong> <code>price ?? 0</code> preserves a valid price of <code>0</code>, whereas <code>price || 100</code> would incorrectly overwrite a <code>0</code> price!</li>
    </ul>

    <h3>20. ES Modules (<code>import</code>/<code>export</code>) vs. CommonJS (<code>require</code>)</h3>
    <ul>
        <li><strong>Explanation:</strong> ES Modules (ESM) is the official ECMAScript standard: static, asynchronous, tree-shakeable. CommonJS is the legacy Node.js standard: dynamic and synchronous. PriceRadar specifies <code>"type": "module"</code> in <code>server/package.json</code> and uses pure ESM everywhere.</li>
    </ul>

    <h3>21. <code>try / catch / finally</code> Blocks</h3>
    <ul>
        <li><strong>Explanation:</strong> <code>try</code> tests a block of code; <code>catch</code> captures any thrown errors; <code>finally</code> executes regardless of whether an error occurred.</li>
        <li><strong>PriceRadar Example:</strong> The distributed mutex in <code>priceMonitor.js</code> releases the lock inside <code>finally</code> so a crash during price fetching never leaves the database permanently locked.</li>
    </ul>

    <h3>22. JSON Serialization (<code>JSON.stringify</code> and <code>JSON.parse</code>)</h3>
    <ul>
        <li><strong>Explanation:</strong> <code>JSON.stringify()</code> converts a JavaScript object into a JSON string for HTTP transmission; <code>JSON.parse()</code> deserializes a JSON string back into a JavaScript object.</li>
    </ul>

    <h3>23. Array Methods: <code>find</code>, <code>some</code>, <code>every</code>, <code>includes</code></h3>
    <ul>
        <li><strong><code>find()</code>:</strong> Returns the first element that satisfies a test: <code>offers.find(o => o.provider === 'amazon')</code>.</li>
        <li><strong><code>some()</code>:</strong> Returns true if at least one element passes: <code>channels.some(c => c === 'telegram')</code>.</li>
        <li><strong><code>every()</code>:</strong> Returns true if all elements pass: <code>tests.every(t => t.passed)</code>.</li>
    </ul>

    <h3>24. Object Methods: <code>Object.keys()</code>, <code>Object.values()</code>, <code>Object.entries()</code></h3>
    <ul>
        <li><strong>PriceRadar Example:</strong> Iterating over provider status dictionaries to display system diagnostics: <code>Object.entries(providerStatus).map(([name, status]) => ...)</code>.</li>
    </ul>

    <h3>25. Higher-Order Functions (HOFs)</h3>
    <ul>
        <li><strong>Explanation:</strong> A function that receives another function as an argument, returns a function, or both. Examples: <code>map()</code>, <code>filter()</code>, <code>asyncHandler()</code>.</li>
    </ul>

    <h3>26. Pure Functions & Immutability</h3>
    <ul>
        <li><strong>Explanation:</strong> A pure function given the same inputs always returns the same output without observable side effects. PriceRadar's <code>evaluateAlert()</code> is a 100% pure function: it receives alert and price parameters and returns a deterministic result object.</li>
    </ul>

    <h3>27. Sets for Deduplication (<code>new Set()</code>)</h3>
    <ul>
        <li><strong>PriceRadar Example:</strong> <code>const distinctOfferIds = [...new Set(activeAlerts.map(a => a.offerId.toString()))];</code> extracts unique offer IDs in O(N) time.</li>
    </ul>

    <h3>28. Debouncing vs. Throttling</h3>
    <ul>
        <li><strong>Debouncing:</strong> Postpones execution until a specified quiet period has elapsed after the last event (e.g. waiting 400ms after user stops typing in the search box).</li>
        <li><strong>Throttling:</strong> Enforces a maximum frequency limit, executing at most once per time window.</li>
    </ul>

    <h3>29. Custom Error Objects in JavaScript</h3>
    <ul>
        <li><strong>Explanation:</strong> Extending <code>Error</code> allows attaching custom HTTP status codes and error categories:
            <pre><code>class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}</code></pre>
        </li>
    </ul>

    <h3>30. Asynchronous Error Propagation in Express</h3>
    <ul>
        <li><strong>Explanation:</strong> In Express, an unhandled rejected promise inside an asynchronous route function will bypass normal Express error handling and terminate the Node process. PriceRadar wraps all controller routes in <code>asyncHandler</code>, ensuring rejected promises are passed to <code>next(err)</code> and caught by <code>errorHandler.js</code>.</li>
    </ul>
</div>
"""
