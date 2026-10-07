// Meli en Verdes - background.js
// Cache the BNA exchange rate for 1 hour
let cachedRate = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000;

async function fetchUSDRate() {
  const now = Date.now();
  if (cachedRate && (now - cacheTime) < CACHE_DURATION) {
    return cachedRate;
  }
  try {
    const response = await fetch('https://www.bna.com.ar/Cotizador/MonedasHistorico');
    const html = await response.text();
    // NOTE: DOMParser is NOT available in MV3 service workers, so we use regex
    const match = html.match(/Dolar U\.S\.A[^<]*<\/td>\s*<td[^>]*>([0-9.,]+)<\/td>\s*<td[^>]*>([0-9.,]+)<\/td>/i);
    if (match) {
      const rate = parseFloat(match[2].replace(',', '.'));
      if (!isNaN(rate) && rate > 0) {
        cachedRate = rate;
        cacheTime = now;
        console.log('[ML-USD] BNA rate fetched:', rate);
        return rate;
      }
    }
    console.warn('[ML-USD] Could not parse BNA rate');
  } catch (e) {
    console.error('[ML-USD] Fetch error:', e.message);
  }
  return cachedRate;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_USD_RATE') {
    fetchUSDRate().then(rate => sendResponse({ rate: rate || null }));
    return true;
  }
});