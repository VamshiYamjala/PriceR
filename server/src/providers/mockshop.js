// server/src/providers/mockshop.js
// Optional fictional storefront catalog provider adapter (Document prompt Section 4)
// Queries Shopify headless mock storefront (https://mock.shop) using GraphQL.
// Marks all returned data honestly as fictional/sample storefront data.

import axios from 'axios';

const MOCKSHOP_URL = process.env.MOCKSHOP_URL || 'https://mock.shop/api';
const TIMEOUT_MS = 5000;
const CAD_TO_INR = 61; // CAD currency conversion rate for sample normalization

const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data, ttlMs = CACHE_TTL_MS) {
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function clearCacheForTesting() {
  cache.clear();
}

const httpClient = axios.create({
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export function normalizeMockShopProduct(node) {
  if (!node || !node.id) return null;

  const rawVariant = node.variants?.edges?.[0]?.node;
  const rawAmount = parseFloat(rawVariant?.price?.amount || '0');
  const currencyCode = rawVariant?.price?.currencyCode || 'CAD';

  const priceInPaise = Math.round(rawAmount * CAD_TO_INR * 100);
  const cleanId = node.id.replace('gid://shopify/Product/', '');
  const imageUrl = node.featuredImage?.url || null;

  return {
    id: `mockshop-${cleanId}`,
    externalId: cleanId,
    title: node.title || 'Fictional Storefront Item',
    brand: 'MockShop Brand',
    model: cleanId,
    variant: null,
    category: 'apparel',
    description: node.description || '',
    imageUrl,
    images: imageUrl ? [imageUrl] : [],
    canonicalKey: `mockshop-${cleanId}`,
    sourceProvider: 'mockshop',
    sourceUrl: `https://mock.shop/products/${cleanId}`,
    dataStatus: 'sample',
    offers: [
      {
        id: `mockshop-offer-${cleanId}`,
        provider: 'mockshop',
        externalProductId: cleanId,
        title: node.title || 'Fictional Storefront Item',
        productUrl: `https://mock.shop/products/${cleanId}`,
        priceInPaise,
        originalPrice: rawAmount,
        originalCurrency: currencyCode,
        currency: 'INR',
        availability: 'in_stock',
        isSample: true,
        dataStatus: 'sample',
        lastStatus: 'ok',
        lastSuccessAt: new Date().toISOString(),
      },
    ],
  };
}

export async function searchProducts(query, { limit = 10 } = {}) {
  const cleanQ = (query || '').trim();
  const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 20);

  const cacheKey = `search:${cleanQ.toLowerCase()}:${safeLimit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const gqlQuery = `
    query GetProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            description
            featuredImage {
              url
            }
            variants(first: 1) {
              edges {
                node {
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await httpClient.post(MOCKSHOP_URL, {
      query: gqlQuery,
      variables: { first: safeLimit },
    });

    const edges = response.data?.data?.products?.edges || [];
    let items = edges.map((e) => normalizeMockShopProduct(e.node)).filter(Boolean);

    if (cleanQ) {
      const qLower = cleanQ.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(qLower) ||
          item.description.toLowerCase().includes(qLower)
      );
    }

    const result = {
      provider: 'mockshop',
      dataStatus: 'sample',
      total: items.length,
      products: items,
      success: true,
      error: null,
    };

    setCached(cacheKey, result);
    return result;
  } catch (err) {
    return {
      provider: 'mockshop',
      dataStatus: 'sample',
      total: 0,
      products: [],
      success: false,
      error: err.response?.data?.message || err.message || 'mock.shop query failed',
    };
  }
}

export async function fetchOffer(offer) {
  return {
    provider: 'mockshop',
    externalProductId: offer.externalProductId,
    title: offer.title,
    priceInPaise: offer.priceInPaise,
    currency: offer.currency || 'INR',
    availability: offer.availability || 'in_stock',
    productUrl: offer.productUrl,
    isSample: true,
    dataStatus: 'sample',
    success: true,
    errorMessage: null,
  };
}

export default {
  searchProducts,
  fetchOffer,
  normalizeMockShopProduct,
  clearCacheForTesting,
};
