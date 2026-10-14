import axios from 'axios';

// The one shared Axios instance for the whole app.
// Every request goes through this — never create a second axios instance
// and never use the raw fetch() API anywhere in this codebase.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// localStorage key for the JWT — must match AuthContext.jsx exactly.
const TOKEN_KEY = 'priceradar_token';

// --- Request interceptor -----------------------------------------------
// Runs before every request leaves the browser. If a token is saved in
// localStorage, attach it as "Authorization: Bearer <token>". Routes that
// don't require auth simply ignore the header on the server side.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response helper -----------------------------------------------------
// Every successful backend response is shaped { success: true, data: {...} }
// (Document 1, Section 6). This helper unwraps it so callers just get the
// payload. Errors are shaped { success: false, error: { code, message } };
// we let those reject normally and let each caller decide how to show them.
function unwrap(responsePromise) {
  return responsePromise.then((res) => res.data.data);
}

// =========================================================================
// Auth — Document 1 Section 6.1
// =========================================================================
export function register({ name, email, password }) {
  return unwrap(api.post('/api/auth/register', { name, email, password }));
}

export function login({ email, password }) {
  return unwrap(api.post('/api/auth/login', { email, password }));
}

export function getMe() {
  return unwrap(api.get('/api/auth/me'));
}

// =========================================================================
// Products and offers — Document 1 Section 6.2 & Multi-Provider Architecture
// =========================================================================
export function searchProducts(q, options = {}) {
  const params = typeof q === 'object' ? q : { q, ...options };
  return unwrap(api.get('/api/products/search', { params }));
}

export function getProduct(productId) {
  return unwrap(api.get(`/api/products/${productId}`));
}

export function getCategories() {
  return unwrap(api.get('/api/products/categories'));
}

export function getProviderStatus() {
  return unwrap(api.get('/api/products/providers/status'));
}

export function getOfferHistory(offerId) {
  return unwrap(api.get(`/api/offers/${offerId}/history`));
}

// =========================================================================
// Watchlist — Document 1 Section 6.3
// =========================================================================
export function getWatchlist() {
  return unwrap(api.get('/api/watchlist'));
}

export function addToWatchlist(offerId) {
  return unwrap(api.post('/api/watchlist', { offerId }));
}

export function removeFromWatchlist(watchlistItemId) {
  return unwrap(api.delete(`/api/watchlist/${watchlistItemId}`));
}

// =========================================================================
// Alerts — Document 1 Section 6.4
// =========================================================================
export function getAlerts() {
  return unwrap(api.get('/api/alerts'));
}

export function createAlert({ offerId, type, targetPriceInPaise, dropAmountInPaise, channels }) {
  return unwrap(
    api.post('/api/alerts', {
      offerId,
      type,
      targetPriceInPaise,
      dropAmountInPaise,
      channels,
    })
  );
}

export function updateAlert(alertId, changes) {
  return unwrap(api.patch(`/api/alerts/${alertId}`, changes));
}

export function deleteAlert(alertId) {
  return unwrap(api.delete(`/api/alerts/${alertId}`));
}

// =========================================================================
// Notifications — Document 1 Section 6.5
// =========================================================================
export function getNotifications() {
  return unwrap(api.get('/api/notifications'));
}

export function getNotificationPreferences() {
  return unwrap(api.get('/api/notification-preferences'));
}

export function updateNotificationPreferences({ email }) {
  return unwrap(api.put('/api/notification-preferences', { email }));
}

export function getTelegramLinkCode() {
  return unwrap(api.post('/api/telegram/link-code'));
}

export function linkTelegram(linkCode, chatId) {
  return unwrap(api.post('/api/telegram/link', { linkCode, chatId }));
}

export default api;
