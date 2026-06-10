const { getStore } = require('@netlify/blobs');

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  try {
    const store = getStore('site-counters');

    if (event.httpMethod === 'POST') {
      // Increment counter
      const raw = await store.get('cards-generated');
      const current = raw ? parseInt(raw) : 0;
      const next = current + 1;
      await store.set('cards-generated', String(next));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ count: next }) };
    }

    // GET — read current count
    const raw = await store.get('cards-generated');
    const count = raw ? parseInt(raw) : 0;
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ count }) };

  } catch (err) {
    console.error('Counter error:', err);
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ count: 0, _err: err.message, _hasCtx: !!process.env.NETLIFY_BLOBS_CONTEXT }) };
  }
};
