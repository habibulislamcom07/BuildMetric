/* =============================================================
   BuildMetric.org — Main JavaScript
   File: js/main.js
   Purpose: Mobile drawer, search overlay, cookie consent,
            scroll-to-top, footer year, mega menu, scroll lock
   ============================================================= */

'use strict';

window.BM = window.BM || {};

/* ---------- CONFIG ---------- */
BM.config = {
  breakpointMobile: 768,
  storageKeys: {
    cookieConsent: 'bm_cookie_consent',
    cookiePrefs: 'bm_cookie_prefs'
  }
};

/* ---------- STATE ---------- */
BM.state = {
  mobileDrawerOpen: false,
  searchOverlayOpen: false,
  cookieModalOpen: false
};

/* ---------- DOM HELPERS ---------- */
BM.$ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
BM.$$ = function (sel, ctx) {
  return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
};
BM.on = function (el, ev, fn, opts) {
  if (el) el.addEventListener(ev, fn, opts || false);
};
BM.ready = function (fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else { fn(); }
};
BM.storage = {
  get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  remove: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
};

/* ---------- SCROLL LOCK ---------- */
BM.scrollLock = (function () {
  var scrollY = 0, locked = false;
  function lock() {
    if (locked) return;
    scrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollY + 'px';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    locked = true;
  }
  function unlock() {
    if (!locked) return;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, scrollY);
    locked = false;
  }
  return { lock: lock, unlock: unlock, isLocked: function () { return locked; } };
})();

/* ---------- FOCUS MANAGEMENT ---------- */
BM.focus = {
  _last: null,
  save: function () { BM.focus._last = document.activeElement; },
  restore: function () {
    var el = BM.focus._last;
    if (el && typeof el.focus === 'function') {
      try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
    }
  },
  trap: function (container, e) {
    if (e.key !== 'Tab') return;
    var f = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
};

/* ---------- UTILITIES ---------- */
BM.debounce = function (fn, wait) {
  var t;
  return function () {
    var ctx = this, args = arguments;
    clearTimeout(t);
    t = setTimeout(function () { fn.apply(ctx, args); }, wait || 150);
  };
};

BM.escapeHTML = function (str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/* =============================================================
   BuildMetric.org — Main JavaScript
   File: js/main.js — PART 2/5
   Purpose: Mobile drawer + search overlay
   ============================================================= */

/* ---------- MOBILE DRAWER ---------- */
BM.mobileDrawer = (function () {
  var drawer, openBtn, closeBtn, lastFocused;

  function open() {
    if (!drawer || BM.state.mobileDrawerOpen) return;
    lastFocused = document.activeElement;
    drawer.hidden = false;
    drawer.removeAttribute('hidden');
    drawer.setAttribute('aria-hidden', 'false');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    BM.scrollLock.lock();
    BM.state.mobileDrawerOpen = true;
    var first = drawer.querySelector('a, button');
    if (first) setTimeout(function () {
      try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
    }, 50);
  }

  function close() {
    if (!drawer || !BM.state.mobileDrawerOpen) return;
    drawer.hidden = true;
    drawer.setAttribute('hidden', '');
    drawer.setAttribute('aria-hidden', 'true');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    BM.scrollLock.unlock();
    BM.state.mobileDrawerOpen = false;
    if (lastFocused) try { lastFocused.focus({ preventScroll: true }); } catch (e) {}
  }

  function toggle() { if (BM.state.mobileDrawerOpen) close(); else open(); }

  function init() {
    drawer = BM.$('#mobileMenu');
    openBtn = BM.$('#hamburger');
    closeBtn = BM.$('#mobileClose');
    if (!drawer) return;

    drawer.hidden = true;
    drawer.setAttribute('hidden', '');
    drawer.setAttribute('aria-hidden', 'true');

    BM.on(openBtn, 'click', function (e) { e.preventDefault(); toggle(); });
    BM.on(closeBtn, 'click', function (e) { e.preventDefault(); close(); });
    BM.on(drawer, 'click', function (e) { if (e.target === drawer) close(); });
    BM.on(document, 'keydown', function (e) {
      if (e.key === 'Escape' && BM.state.mobileDrawerOpen) close();
    });
    BM.on(drawer, 'keydown', function (e) {
      if (BM.state.mobileDrawerOpen) BM.focus.trap(drawer, e);
    });
    BM.on(window, 'resize', function () {
      if (window.innerWidth > BM.config.breakpointMobile && BM.state.mobileDrawerOpen) close();
    });
    BM.$$('a', drawer).forEach(function (link) {
      BM.on(link, 'click', function () {
        if (BM.state.mobileDrawerOpen) {
          BM.scrollLock.unlock();
          BM.state.mobileDrawerOpen = false;
        }
      });
    });
  }

  return { init: init, open: open, close: close, toggle: toggle };
})();

/* ---------- SEARCH OVERLAY ---------- */
BM.searchOverlay = (function () {
  var overlay, openBtn, closeBtn, input, lastFocused;

  function open() {
    if (!overlay || BM.state.searchOverlayOpen) return;
    lastFocused = document.activeElement;
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    BM.scrollLock.lock();
    BM.state.searchOverlayOpen = true;
    if (input) setTimeout(function () {
      try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
    }, 50);
  }

  function close() {
    if (!overlay || !BM.state.searchOverlayOpen) return;
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    BM.scrollLock.unlock();
    BM.state.searchOverlayOpen = false;
    if (input) input.value = '';
    var results = BM.$('#searchResults');
    if (results) { results.innerHTML = ''; results.hidden = true; }
    var sugg = BM.$('#searchSuggestions');
    if (sugg) sugg.hidden = false;
    var empty = BM.$('#searchEmpty');
    if (empty) empty.hidden = true;
    if (lastFocused) try { lastFocused.focus({ preventScroll: true }); } catch (e) {}
  }

  function init() {
    overlay = BM.$('#searchOverlay');
    openBtn = BM.$('#searchTrigger');
    closeBtn = BM.$('#searchClose');
    input = BM.$('#searchInput');
    if (!overlay) return;

    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');

    BM.on(openBtn, 'click', function (e) { e.preventDefault(); open(); });
    BM.on(closeBtn, 'click', function (e) { e.preventDefault(); close(); });
    BM.on(overlay, 'click', function (e) { if (e.target === overlay) close(); });
    BM.on(document, 'keydown', function (e) {
      if (e.key === 'Escape' && BM.state.searchOverlayOpen) close();
    });
    BM.on(overlay, 'keydown', function (e) {
      if (BM.state.searchOverlayOpen) BM.focus.trap(overlay, e);
    });
  }

  return { init: init, open: open, close: close };
})();

/* =============================================================
   BuildMetric.org — Main JavaScript
   File: js/main.js — PART 3/5
   Purpose: Cookie consent + geo banner dismiss
   ============================================================= */

/* ---------- COOKIE CONSENT ---------- */
BM.cookieConsent = (function () {
  var banner, modal, acceptBtn, rejectBtn, customiseBtn;
  var modalClose, modalSave, modalReject;
  var analyticsToggle, advertisingToggle;
  var lastFocused;

  function getConsent() {
    var raw = BM.storage.get(BM.config.storageKeys.cookieConsent);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function saveConsent(obj) {
    BM.storage.set(BM.config.storageKeys.cookieConsent, JSON.stringify(obj));
    window.__bmConsent = obj;
  }

  function showBanner() {
    if (banner) { banner.hidden = false; banner.removeAttribute('hidden'); }
  }
  function hideBanner() {
    if (banner) { banner.hidden = true; banner.setAttribute('hidden', ''); }
  }

  function acceptAll() {
    saveConsent({ essential: true, analytics: true, advertising: true, ts: Date.now() });
    hideBanner();
  }

  function rejectAll() {
    saveConsent({ essential: true, analytics: false, advertising: false, ts: Date.now() });
    hideBanner();
  }

  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    var prefs = getConsent() || {};
    if (analyticsToggle) analyticsToggle.checked = !!prefs.analytics;
    if (advertisingToggle) advertisingToggle.checked = !!prefs.advertising;
    BM.scrollLock.lock();
    BM.state.cookieModalOpen = true;
    setTimeout(function () { if (modalClose) modalClose.focus(); }, 50);
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    BM.scrollLock.unlock();
    BM.state.cookieModalOpen = false;
    if (lastFocused) try { lastFocused.focus({ preventScroll: true }); } catch (e) {}
  }

  function savePrefs() {
    var prefs = {
      essential: true,
      analytics: analyticsToggle ? analyticsToggle.checked : false,
      advertising: advertisingToggle ? advertisingToggle.checked : false,
      ts: Date.now()
    };
    saveConsent(prefs);
    closeModal();
    hideBanner();
  }

  function init() {
    banner = BM.$('#cookieBanner');
    modal = BM.$('#cookieModal');
    acceptBtn = BM.$('#cookieAccept');
    rejectBtn = BM.$('#cookieReject');
    customiseBtn = BM.$('#cookieCustomize');
    modalClose = BM.$('#cookieModalClose');
    modalSave = BM.$('#cookieModalSave');
    modalReject = BM.$('#cookieModalReject');
    analyticsToggle = BM.$('#cookieAnalytics');
    advertisingToggle = BM.$('#cookieAdvertising');

    var existing = getConsent();
    if (existing) {
      hideBanner();
      window.__bmConsent = existing;
      return;
    }

    setTimeout(showBanner, 800);

    BM.on(acceptBtn, 'click', acceptAll);
    BM.on(rejectBtn, 'click', rejectAll);
    BM.on(customiseBtn, 'click', openModal);
    BM.on(modalClose, 'click', closeModal);
    BM.on(modalSave, 'click', savePrefs);
    BM.on(modalReject, 'click', function () { rejectAll(); closeModal(); });
    BM.on(modal, 'click', function (e) {
      if (e.target.classList.contains('cookie-modal-backdrop')) closeModal();
    });
    BM.on(document, 'keydown', function (e) {
      if (e.key === 'Escape' && BM.state.cookieModalOpen) closeModal();
    });
    BM.on(modal, 'keydown', function (e) {
      if (BM.state.cookieModalOpen) BM.focus.trap(modal, e);
    });
  }

  return { init: init, getConsent: getConsent };
})();

/* ---------- GEO BANNER DISMISS ---------- */
BM.geoBanner = (function () {

  function init() {
    var banner = BM.$('#geoBanner');
    var dismiss = BM.$('#geoDismissBtn');
    var change = BM.$('#geoChangeBtn');
    if (!banner) return;

    /* Check if user previously dismissed */
    if (BM.storage.get('bm_geo_dismissed') === '1') {
      banner.hidden = true;
      banner.setAttribute('hidden', '');
    }

    BM.on(dismiss, 'click', function () {
      banner.hidden = true;
      banner.setAttribute('hidden', '');
      BM.storage.set('bm_geo_dismissed', '1');
    });

    /* Change button handled by geo-detection.js — here we just
       make sure the button exists and is clickable */
    BM.on(change, 'click', function (e) {
      /* geo-detection.js will attach the real handler via
         its own addEventListener. We don't preventDefault here. */
    });
  }

  return { init: init };
})();

/* =============================================================
   BuildMetric.org — Main JavaScript
   File: js/main.js — PART 4/5
   Purpose: Scroll-to-top, footer year, header scroll state,
            mega menu keyboard, JS-enabled class
   ============================================================= */

/* ---------- SCROLL TO TOP ---------- */
BM.scrollTop = (function () {
  var btn, shown = false, threshold = 600;

  function check() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (y > threshold && !shown) {
      btn.hidden = false;
      btn.removeAttribute('hidden');
      shown = true;
    } else if (y <= threshold && shown) {
      btn.hidden = true;
      btn.setAttribute('hidden', '');
      shown = false;
    }
  }

  function init() {
    btn = BM.$('#scrollTop');
    if (!btn) return;
    btn.hidden = true;
    btn.setAttribute('hidden', '');
    BM.on(btn, 'click', function () {
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); }
      catch (e) { window.scrollTo(0, 0); }
    });
    var ticking = false;
    BM.on(window, 'scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () { check(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
    check();
  }

  return { init: init };
})();

/* ---------- FOOTER YEAR ---------- */
BM.footerYear = (function () {
  function init() {
    var el = BM.$('#footerYear');
    if (el) el.textContent = new Date().getFullYear();
  }
  return { init: init };
})();

/* ---------- HEADER SCROLL STATE ---------- */
BM.headerScroll = (function () {
  var header, isScrolled = false;

  function check() {
    var y = window.scrollY || window.pageYOffset || 0;
    var shouldBe = y > 10;
    if (shouldBe && !isScrolled) {
      header.classList.add('is-scrolled');
      isScrolled = true;
    } else if (!shouldBe && isScrolled) {
      header.classList.remove('is-scrolled');
      isScrolled = false;
    }
  }

  function init() {
    header = BM.$('#siteHeader');
    if (!header) return;
    var ticking = false;
    BM.on(window, 'scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () { check(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
    check();
  }

  return { init: init };
})();

/* ---------- MEGA MENU (desktop keyboard support) ---------- */
BM.megaMenu = (function () {
  var items = [];
  var openItem = null;

  function close(item) {
    if (!item) return;
    var btn = item.querySelector('.nav-link');
    var menu = item.querySelector('.mega-menu');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (menu) menu.classList.remove('is-open');
    if (openItem === item) openItem = null;
  }

  function open(item) {
    if (!item || openItem === item) return;
    if (openItem) close(openItem);
    var btn = item.querySelector('.nav-link');
    var menu = item.querySelector('.mega-menu');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    if (menu) menu.classList.add('is-open');
    openItem = item;
  }

  function init() {
    items = BM.$$('.nav-item.has-mega');
    if (!items.length) return;

    items.forEach(function (item) {
      var btn = item.querySelector('.nav-link');
      if (!btn) return;

      BM.on(btn, 'click', function (e) {
        e.preventDefault();
        if (openItem === item) close(item);
        else open(item);
      });

      BM.on(btn, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (openItem === item) close(item);
          else open(item);
        } else if (e.key === 'Escape' && openItem === item) {
          close(item);
          btn.focus();
        }
      });

      BM.on(item, 'focusout', function (e) {
        if (openItem === item && !item.contains(e.relatedTarget)) {
          setTimeout(function () {
            if (!item.contains(document.activeElement)) close(item);
          }, 10);
        }
      });
    });

    BM.on(document, 'click', function (e) {
      if (openItem && !openItem.contains(e.target)) close(openItem);
    });

    BM.on(document, 'keydown', function (e) {
      if (e.key === 'Escape' && openItem) close(openItem);
    });
  }

  return { init: init, closeAll: function () { close(openItem); } };
})();

/* ---------- JS-ENABLED CLASS + FOUC PREVENTION ---------- */
BM.jsEnabled = (function () {
  function init() {
    document.documentElement.classList.add('js-enabled');
    ['#mobileMenu', '#searchOverlay', '#geoModal', '#cookieModal'].forEach(function (sel) {
      var el = BM.$(sel);
      if (el) {
        el.hidden = true;
        el.setAttribute('hidden', '');
        el.setAttribute('aria-hidden', 'true');
      }
    });
  }
  return { init: init };
})();

/* =============================================================
   BuildMetric.org — Main JavaScript
   File: js/main.js — PART 5/5 (FINAL)
   Purpose: Boot sequence — initialise all modules
   ============================================================= */

/* ---------- SCROLL SANITY ----------
   Prevent browser scroll restoration on reload — start fresh. */
BM.scrollSanity = (function () {
  function init() {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }
  return { init: init };
})();

/* ---------- ONLINE / OFFLINE DETECTION ----------
   Adds classes to <html> when connection changes. */
BM.connection = (function () {
  function update() {
    var online = navigator.onLine !== false;
    document.documentElement.classList.toggle('is-online', online);
    document.documentElement.classList.toggle('is-offline', !online);
  }
  function init() {
    update();
    BM.on(window, 'online', update);
    BM.on(window, 'offline', update);
  }
  return { init: init };
})();

/* ---------- REDUCED MOTION ----------
   Adds class when user prefers reduced motion. */
BM.reducedMotion = (function () {
  function init() {
    if (!window.matchMedia) return;
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    function update() {
      document.documentElement.classList.toggle('reduce-motion', mq.matches);
    }
    update();
    if (mq.addEventListener) mq.addEventListener('change', update);
    else if (mq.addListener) mq.addListener(update);
  }
  return { init: init };
})();

/* ---------- PRINT GUARD ----------
   Adds classes to <body> before/after printing. */
BM.printGuard = (function () {
  function init() {
    BM.on(window, 'beforeprint', function () {
      document.body.classList.add('printing');
    });
    BM.on(window, 'afterprint', function () {
      document.body.classList.remove('printing');
    });
  }
  return { init: init };
})();

/* ---------- ERROR GUARD ----------
   Prevent one broken module from crashing the rest.
   Each module's init wrapped in try/catch. */
BM.safeInit = function (module, name) {
  if (!module || typeof module.init !== 'function') return;
  try {
    module.init();
  } catch (err) {
    if (window.console && window.console.error) {
      window.console.error('[BM] Failed to init ' + name + ':', err);
    }
  }
};

/* ---------- BOOT SEQUENCE ----------
   Runs when DOM is ready. Each module wrapped in safeInit. */
BM.ready(function () {

  BM.safeInit(BM.jsEnabled, 'jsEnabled');
  BM.safeInit(BM.reducedMotion, 'reducedMotion');
  BM.safeInit(BM.connection, 'connection');
  BM.safeInit(BM.scrollSanity, 'scrollSanity');
  BM.safeInit(BM.printGuard, 'printGuard');

  BM.safeInit(BM.footerYear, 'footerYear');
  BM.safeInit(BM.headerScroll, 'headerScroll');
  BM.safeInit(BM.mobileDrawer, 'mobileDrawer');
  BM.safeInit(BM.searchOverlay, 'searchOverlay');
  BM.safeInit(BM.cookieConsent, 'cookieConsent');
  BM.safeInit(BM.geoBanner, 'geoBanner');
  BM.safeInit(BM.scrollTop, 'scrollTop');
  BM.safeInit(BM.megaMenu, 'megaMenu');

  if (window.console && window.console.debug) {
    // console.debug('[BM] main.js boot complete');
  }
});

/* ---------- PUBLIC API ----------
   Expose commonly-needed methods for other scripts. */
BM.closeAll = function () {
  try { BM.mobileDrawer.close(); } catch (e) {}
  try { BM.searchOverlay.close(); } catch (e) {}
  try { BM.megaMenu.closeAll(); } catch (e) {}
  if (BM.scrollLock.isLocked()) BM.scrollLock.unlock();
};

/* ---------- END OF FILE ---------- */
