// Meli en Verdes - content.js v1.2
(function () {
  'use strict';

  const LABEL_CLASS = 'ml-usd-price-label';
  let usdRate = null;
  const labeled = new WeakSet();

  function fmt(usd) {
    if (usd >= 1000) return 'USD ' + usd.toLocaleString('en-US', { maximumFractionDigits: 0 });
    return 'USD ' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function makeLabel(text) {
    const el = document.createElement('span');
    el.className = LABEL_CLASS;
    el.textContent = text;
    el.style.cssText =
      'display:block;font-size:0.72em;color:#1a7a2e;background:#e6f4ea;' +
      'border:1px solid #a8d5b0;border-radius:3px;padding:1px 5px;margin-top:2px;' +
      'font-weight:600;line-height:1.4;width:fit-content;pointer-events:none;' +
      'user-select:none;font-family:inherit;';
    return el;
  }

  function amountFromAria(ariaLabel) {
    if (!ariaLabel) return null;
    const m = ariaLabel.match(/([\d]+(?:\.[\d]+)?)/);
    return m ? parseFloat(m[1]) : null;
  }

  function isUSD(container) {
    const sym = container.querySelector('.andes-money-amount__currency-symbol');
    return sym && sym.textContent.trim() === 'US$';
  }

  function processContainer(container) {
    if (labeled.has(container)) return;
    if (isUSD(container)) return; // already in USD, skip
    if (container.closest('.poly-price__installments')) return;
    const next = container.nextElementSibling;
    if (next && next.classList.contains(LABEL_CLASS)) return;

    const ariaLabel = container.getAttribute('aria-label') || '';
    if (ariaLabel.toLowerCase().startsWith('antes')) return;

    const amount = amountFromAria(ariaLabel);
    if (!amount || amount <= 0) return;
    if (!usdRate) return;

    labeled.add(container);
    const label = makeLabel(fmt(amount / usdRate));
    if (container.parentElement) {
      if (container.nextSibling) container.parentElement.insertBefore(label, container.nextSibling);
      else container.parentElement.appendChild(label);
    }
  }

  function injectAll() {
    document.querySelectorAll('.andes-money-amount[aria-label], .price-tag[aria-label]')
      .forEach(processContainer);
  }

  async function init() {
    try {
      const resp = await chrome.runtime.sendMessage({ type: 'GET_USD_RATE' });
      if (resp && resp.rate) {
        usdRate = resp.rate;
        console.log('[ML-USD] Rate received:', usdRate);
      } else {
        console.warn('[ML-USD] No rate received:', resp);
      }
    } catch (e) {
      console.warn('[ML-USD] sendMessage error:', e.message);
    }

    injectAll();
    new MutationObserver(injectAll).observe(document.body, { childList: true, subtree: true });

    setInterval(async () => {
      try {
        const resp = await chrome.runtime.sendMessage({ type: 'GET_USD_RATE' });
        if (resp && resp.rate && resp.rate !== usdRate) {
          usdRate = resp.rate;
          document.querySelectorAll('.' + LABEL_CLASS).forEach(el => el.remove());
          injectAll();
        }
      } catch (_) {}
    }, 60 * 60 * 1000);
  }

  init();
})();