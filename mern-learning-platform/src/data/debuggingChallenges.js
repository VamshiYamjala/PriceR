export const DEBUGGING_CHALLENGES = [
  {
    id: 'bug_1',
    title: 'The Hanging Middleware Mystery',
    category: 'Backend / Express',
    difficulty: 'Beginner',
    symptom: 'Client browser shows a spinning loading icon indefinitely until the request times out after 2 minutes.',
    file: 'server/src/middleware/authMiddleware.js',
    brokenCode: `function checkApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  if (apiKey === process.env.API_KEY) {
    req.isValid = true;
    // Missing something here!
  } else {
    res.status(403).json({ error: 'Invalid key' });
  }
}`,
    options: [
      { id: 'a', text: 'Add `return res.send(true)` inside the if block', isCorrect: false, explanation: 'Sending a response here stops the pipeline immediately before reaching the actual endpoint handler.' },
      { id: 'b', text: 'Call `next()` inside the if block to pass control forward', isCorrect: true, explanation: 'Exactly! Without calling next(), Express stops processing the chain and the client hangs forever waiting for a response.' },
      { id: 'c', text: 'Replace `req.headers` with `req.query`', isCorrect: false, explanation: 'API keys are passed via HTTP headers, not query parameters.' }
    ],
    fixExplanation: 'Middleware must either terminate the request by sending a response (`res.json()`, `res.status()`) OR call `next()` to pass control to the next handler in the Express pipeline.'
  },
  {
    id: 'bug_2',
    title: 'The Ghost Password Leak',
    category: 'Security / Mongoose',
    difficulty: 'Intermediate',
    symptom: 'The frontend receives the user object containing the bcrypt hashed password in the JSON response body!',
    file: 'server/src/controllers/authController.js',
    brokenCode: `exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  // Security vulnerability here!
  res.json({ success: true, token, user });
};`,
    options: [
      { id: 'a', text: 'Sanitize user or delete `user.password` before returning JSON', isCorrect: true, explanation: 'Correct! Never send password hashes over the wire, even if hashed with bcrypt. Convert to plain object and remove the password field.' },
      { id: 'b', text: 'Use bcrypt.hash() instead of bcrypt.compare()', isCorrect: false, explanation: 'bcrypt.compare is correct for checking passwords during login.' },
      { id: 'c', text: 'Store the password in localStorage on the client', isCorrect: false, explanation: 'Storing passwords in localStorage is a severe security vulnerability.' }
    ],
    fixExplanation: 'In PriceRadar, user models use `{ select: false }` on the password field and sanitize output: `const { password, ...safeUser } = user.toObject(); res.json({ user: safeUser });`'
  },
  {
    id: 'bug_3',
    title: 'The Floating-Point Paise Catastrophe',
    category: 'Database / Financial Logic',
    difficulty: 'Intermediate',
    symptom: 'Database stores product target price as ₹499.00000000000006, causing price drop alerts to fail comparison checks!',
    file: 'server/src/controllers/alertController.js',
    brokenCode: `exports.createAlert = async (req, res) => {
  const { targetPriceInRupees, offerId } = req.body;
  // Buggy calculation:
  const alert = await Alert.create({
    offerId,
    userId: req.user._id,
    targetPrice: targetPriceInRupees * 1.00 // Stored as IEEE 754 Float!
  });
  res.status(201).json(alert);
};`,
    options: [
      { id: 'a', text: 'Convert to integer paise using `Math.round(targetPriceInRupees * 100)` and validate `Number.isInteger`', isCorrect: true, explanation: 'Spot on! Real financial apps like PriceRadar store money as integer paise (e.g. 49900 paise) to eliminate float precision errors.' },
      { id: 'b', text: 'Use `parseFloat(targetPriceInRupees).toFixed(2)`', isCorrect: false, explanation: 'toFixed returns a string, which can cause unexpected lexicographical string comparisons like "50" > "100" in MongoDB!' },
      { id: 'c', text: 'Change MongoDB data type to Array', isCorrect: false, explanation: 'Arrays do not solve scalar numerical precision errors.' }
    ],
    fixExplanation: 'JavaScript numbers follow IEEE-754 double precision where `0.1 + 0.2 = 0.30000000000000004`. PriceRadar eliminates this by strictly enforcing `priceInPaise` with `validate: Number.isInteger` in `models/Offer.js` and `models/Alert.js`.'
  },
  {
    id: 'bug_4',
    title: 'The Forbidden State Mutation',
    category: 'Frontend / React',
    difficulty: 'Beginner',
    symptom: 'User clicks "Add to Watchlist", but the list on the screen never updates unless the entire page is refreshed!',
    file: 'client/src/pages/Watchlist.jsx',
    brokenCode: `const handleAdd = (newOffer) => {
  // Bug: Direct mutation of state array!
  watchlist.push(newOffer);
  setWatchlist(watchlist); 
};`,
    options: [
      { id: 'a', text: 'Call `window.location.reload()` after pushing', isCorrect: false, explanation: 'Page reloads defeat the purpose of a Single Page Application and destroy in-memory state.' },
      { id: 'b', text: 'Create a new array reference: `setWatchlist([...watchlist, newOffer])`', isCorrect: true, explanation: 'Bingo! React uses shallow object reference comparison (`prev === next`). If you mutate the existing array, React thinks state has not changed and skips re-rendering.' },
      { id: 'c', text: 'Use `watchlist.pop()` before pushing', isCorrect: false, explanation: 'pop removes the last element and still mutates the existing array.' }
    ],
    fixExplanation: 'React state must be treated as immutable. Always use the spread operator `[...watchlist, newOffer]` to provide a brand new array reference that triggers Virtual DOM re-rendering.'
  },
  {
    id: 'bug_5',
    title: 'The Undefined req.body Phantom',
    category: 'Backend / Express Middleware',
    difficulty: 'Beginner',
    symptom: '`TypeError: Cannot destructure property email of req.body as it is undefined` on POST /api/auth/login.',
    file: 'server/src/app.js',
    brokenCode: `const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');

// Missing body parser!
app.use('/api/auth', authRoutes);

module.exports = app;`,
    options: [
      { id: 'a', text: 'Add `app.use(express.json())` before registering routes', isCorrect: true, explanation: 'Correct! By default, Node.js streams raw bytes. `express.json()` reads the raw incoming stream and parses JSON into `req.body`.' },
      { id: 'b', text: 'Change GET to POST in authRoutes', isCorrect: false, explanation: 'The route was already a POST request; Express just had no JSON parser registered.' },
      { id: 'c', text: 'Read the data from `req.params.email` instead', isCorrect: false, explanation: 'POST body payloads are in `req.body`, not URL path parameters.' }
    ],
    fixExplanation: 'Express 4.16+ has built-in `express.json()` middleware. It must be mounted BEFORE any route handlers so that raw request payload streams are parsed into JavaScript objects.'
  },
  {
    id: 'bug_6',
    title: 'The Vanishing Distributed Lock',
    category: 'DevOps / Concurrency',
    difficulty: 'Advanced',
    symptom: 'When GitHub Actions fires the 4-hour cron, two simultaneous worker containers both scrape Amazon and send duplicate emails to users!',
    file: 'server/src/services/priceMonitor.js',
    brokenCode: `async function runMonitor() {
  const lock = await MonitorLock.findOne({ key: 'price_monitor' });
  if (lock && lock.isLocked) {
    return console.log('Already running');
  }
  // Race condition gap!
  await MonitorLock.updateOne({ key: 'price_monitor' }, { isLocked: true });
  await checkPrices();
}`,
    options: [
      { id: 'a', text: 'Use atomic `findOneAndUpdate` with condition `{ isLocked: false }`', isCorrect: true, explanation: 'Outstanding! `findOne` followed by `updateOne` has a race window where two processes can both see `isLocked: false`. `findOneAndUpdate` is atomic at the database level.' },
      { id: 'b', text: 'Add a `setTimeout` of 5 seconds before checking prices', isCorrect: false, explanation: 'Timeouts do not prevent concurrency race conditions across distributed serverless instances.' },
      { id: 'c', text: 'Use a local JavaScript boolean variable `let isLocked = false`', isCorrect: false, explanation: 'Separate server processes or GitHub Actions runners do not share in-memory variables!' }
    ],
    fixExplanation: 'PriceRadar uses atomic distributed leases via `MonitorLock.findOneAndUpdate` with a 15-minute expiration lease heartbeat, ensuring only ONE distributed runner can acquire the lock.'
  }
];
