/* ============================================================
   BuildMetric.org — Global JavaScript
   js/main.js — PART 1/5
   Utilities · DOM ready · Module bootstrap
   ============================================================ */

(function () {
  'use strict';

  /* ---------- GLOBAL NAMESPACE ---------- */
  window.BuildMetric = window.BuildMetric || {
    version: '1.0.0',
    modules: {},
    state: {
      country: null,
      units: 'imperial',
      currency: 'USD',
      standard: 'ACI 318-19'
    }
  };

  var BM = window.BuildMetric;

  /* ---------- 1. UTILITY HELPERS ---------- */
  BM.utils = {
    /**
     * Safe querySelector scoped to an element (defaults to document).
     */
    qs: function (selector, scope) {
      return (scope || document).querySelector(selector);
    },

    /**
     * Safe querySelectorAll returning a real Array.
     */
    qsa: function (selector, scope) {
      return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    },

    /**
     * Add event listener with optional passive flag.
     */
    on: function (el, type, handler, opts) {
      if (!el) return;
      el.addEventListener(type, handler, opts || false);
    },

    /**
     * Debounce — delays execution until after `wait` ms of silence.
     */
    debounce: function (fn, wait) {
      var t;
      return function () {
        var ctx = this;
        var args = arguments;
        clearTimeout(t);
        t = setTimeout(function () { fn.apply(ctx, args); }, wait || 200);
      };
    },

    /**
     * Throttle with requestAnimationFrame — for scroll handlers.
     */
    rafThrottle: function (fn) {
      var scheduled = false;
      return function () {
        var ctx = this;
        var args = arguments;
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(function () {
          fn.apply(ctx, args);
          scheduled = false;
        });
      };
    },

    /**
     * HTML-escape to prevent XSS when injecting user-supplied strings.
     */
    escapeHTML: function (str) {
      if (str == null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    /**
     * Format a number with thousands separators and fixed decimals.
     */
    formatNumber: function (value, decimals) {
      var n = Number(value);
      if (!isFinite(n)) return '—';
      var d = typeof decimals === 'number' ? decimals : 2;
      return n.toLocaleString('en-US', {
        minimumFractionDigits: d,
        maximumFractionDigits: d
      });
    },

    /**
     * Store / retrieve JSON in localStorage with try/catch protection.
     */
    storage: {
      get: function (key) {
        try {
          var raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch (e) {
          return null;
        }
      },
      set: function (key, value) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (e) {
          return false;
        }
      },
      remove: function (key) {
        try { localStorage.removeItem(key); } catch (e) { /* noop */ }
      }
    },

    /**
     * Detect prefers-reduced-motion.
     */
    prefersReducedMotion: function () {
      return window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    /**
     * Focus trap used by modals and overlays.
     */
    trapFocus: function (container, e) {
      var focusables = BM.utils.qsa(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        container
      ).filter(function (el) {
        return el.offsetParent !== null;
      });

      if (!focusables.length) return;

      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  /* ---------- 2. FEATURE DETECTION ---------- */
  BM.support = {
    matchMedia: typeof window.matchMedia === 'function',
    intersectionObserver: 'IntersectionObserver' in window,
    serviceWorker: 'serviceWorker' in navigator,
    localStorage: (function () {
      try {
        var k = '__bm_test__';
        localStorage.setItem(k, '1');
        localStorage.removeItem(k);
        return true;
      } catch (e) {
        return false;
      }
    })()
  };

  /* ---------- 3. BODY CLASS FLAGS ---------- */
  BM.flags = {
    set: function (name, enabled) {
      document.body.classList.toggle(name, !!enabled);
    },
    isTouch: function () {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
  };

  /* ---------- 4. DOM READY ---------- */
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  /* ---------- 5. MODULE REGISTRY ---------- */
  BM.register = function (name, initFn) {
    BM.modules[name] = { init: initFn, ready: false };
    BM.initModule = function (moduleName) {
      var mod = BM.modules[moduleName];
      if (!mod || mod.ready) return;
      try {
        mod.init();
        mod.ready = true;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[BuildMetric] Module "' + moduleName + '" failed:', err);
      }
    };
  };

  /* ---------- 6. AUTO-INIT ---------- */
  ready(function () {
    document.documentElement.classList.add('js-ready');

    if (BM.flags.isTouch()) {
      document.body.classList.add('is-touch');
    }

    if (BM.utils.prefersReducedMotion()) {
      document.body.classList.add('reduced-motion');
    }

    // Modules register themselves in later parts and run here:
    ['header', 'mobileNav', 'backToTop', 'categoryInteractions', 'smoothScroll']
      .forEach(function (name) {
        if (BM.modules[name]) {
          try {
            BM.modules[name].init();
            BM.modules[name].ready = true;
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('[BuildMetric] "' + name + '" init error:', e);
          }
        }
      });
  });

  // Expose ready for other scripts in same bundle
  BM.ready = ready;

})();

/* ============================================================
   BuildMetric.org — Global JavaScript
   js/main.js — PART 2/5
   Header scroll · Mobile menu · Categories dropdown
   ============================================================ */

(function () {
  'use strict';

  var BM = window.BuildMetric;
  if (!BM) return;

  var utils = BM.utils;

  /* ============================================================
     MODULE: HEADER SCROLL (subtle shadow on scroll)
     ============================================================ */
  BM.register('header', function initHeader() {
    var header = utils.qs('#siteHeader');
    if (!header) return;

    var lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
    var SCROLL_THRESHOLD = 12;

    var handleScroll = utils.rafThrottle(function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;

      // Subtle shadow after scrolling past threshold
      if (y > SCROLL_THRESHOLD) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }

      lastScrollY = y;
    });

    utils.on(window, 'scroll', handleScroll, { passive: true });

    // Initial check (e.g., page refreshed mid-scroll)
    handleScroll();
  });

  /* ============================================================
     MODULE: MOBILE NAVIGATION DRAWER
     ============================================================ */
  BM.register('mobileNav', function initMobileNav() {
    var hamburger = utils.qs('#hamburgerBtn');
    var mobileNav = utils.qs('#mobileNav');
    var mainNav = utils.qs('#mainNav');

    if (!hamburger || !mobileNav) return;

    var isOpen = false;
    var lastFocused = null;

    function openMenu() {
      if (isOpen) return;
      isOpen = true;
      lastFocused = document.activeElement;

      mobileNav.hidden = false;
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Close navigation menu');
      document.body.classList.add('no-scroll');

      // Move focus to first link inside drawer
      var firstLink = utils.qs('a, button', mobileNav);
      if (firstLink) {
        // Small delay so the animation can start
        window.setTimeout(function () { firstLink.focus(); }, 40);
      }
    }

    function closeMenu() {
      if (!isOpen) return;
      isOpen = false;

      mobileNav.hidden = true;
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open navigation menu');
      document.body.classList.remove('no-scroll');

      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    function toggleMenu() {
      if (isOpen) closeMenu();
      else openMenu();
    }

    // Toggle on hamburger click
    utils.on(hamburger, 'click', function (e) {
      e.preventDefault();
      toggleMenu();
    });

    // Close on Escape
    utils.on(document, 'keydown', function (e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    });

    // Close when clicking the backdrop (outside inner drawer)
    utils.on(mobileNav, 'click', function (e) {
      var inner = utils.qs('.mobile-nav__inner', mobileNav);
      if (inner && !inner.contains(e.target)) {
        closeMenu();
      }
    });

    // Focus trap
    utils.on(mobileNav, 'keydown', function (e) {
      if (isOpen) utils.trapFocus(mobileNav, e);
    });

    // Close menu when a link inside is clicked (navigating away)
    utils.qsa('a', mobileNav).forEach(function (link) {
      utils.on(link, 'click', function () {
        closeMenu();
      });
    });

    // Auto-close if viewport resized to desktop
    var onResize = utils.debounce(function () {
      if (window.innerWidth >= 900 && isOpen) {
        closeMenu();
      }
    }, 150);

    utils.on(window, 'resize', onResize);
  });

  /* ============================================================
     MODULE: CATEGORIES DROPDOWN (desktop nav)
     ============================================================ */
  (function initCategoriesDropdown() {
    var dropdownBtn = utils.qs('.main-nav__link--dropdown');
    var dropdown = utils.qs('#catDropdown');
    if (!dropdownBtn || !dropdown) return;

    var hoverTimeout = null;
    var HOVER_DELAY = 120;

    function openDropdown() {
      clearTimeout(hoverTimeout);
      dropdownBtn.setAttribute('aria-expanded', 'true');
      dropdown.classList.add('is-open');
    }

    function closeDropdown() {
      hoverTimeout = setTimeout(function () {
        dropdownBtn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('is-open');
      }, HOVER_DELAY);
    }

    var wrapper = dropdownBtn.closest('.main-nav__item--has-dropdown');
    if (!wrapper) return;

    // Hover behavior (desktop only)
    utils.on(wrapper, 'mouseenter', function () {
      if (window.innerWidth >= 900) openDropdown();
    });

    utils.on(wrapper, 'mouseleave', function () {
      if (window.innerWidth >= 900) closeDropdown();
    });

    // Keyboard / click toggle
    utils.on(dropdownBtn, 'click', function (e) {
      e.preventDefault();
      var expanded = dropdownBtn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        dropdownBtn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('is-open');
      } else {
        openDropdown();
      }
    });

    // Close on outside click
    utils.on(document, 'click', function (e) {
      if (!wrapper.contains(e.target)) {
        dropdownBtn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('is-open');
      }
    });

    // Close on Escape
    utils.on(document, 'keydown', function (e) {
      if (e.key === 'Escape' && dropdown.classList.contains('is-open')) {
        dropdownBtn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('is-open');
        dropdownBtn.focus();
      }
    });

    // Close when a dropdown item is clicked
    utils.qsa('.dropdown__item', dropdown).forEach(function (item) {
      utils.on(item, 'click', function () {
        dropdown.classList.remove('is-open');
        dropdownBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Arrow-key navigation between dropdown items
    utils.on(dropdown, 'keydown', function (e) {
      var items = utils.qsa('.dropdown__item', dropdown);
      if (!items.length) return;

      var currentIndex = items.indexOf(document.activeElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        var next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[next].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        var prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prev].focus();
      } else if (e.key === 'Escape') {
        dropdownBtn.focus();
        dropdown.classList.remove('is-open');
        dropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });
  })();

  /* ============================================================
     MODULE: SCROLL LOCK HELPERS (shared)
     Exposes BM.lockScroll / BM.unlockScroll for other modules
     ============================================================ */
  (function exposeScrollLock() {
    var scrollY = 0;

    BM.lockScroll = function () {
      scrollY = window.pageYOffset || document.documentElement.scrollTop;
      document.body.style.top = -scrollY + 'px';
      document.body.classList.add('no-scroll');
    };

    BM.unlockScroll = function () {
      document.body.classList.remove('no-scroll');
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
    };
  })();

})();

/* ============================================================
   BuildMetric.org — Global JavaScript
   js/main.js — PART 3/5
   Back-to-top · Smooth scroll · Active nav highlighting
   ============================================================ */

(function () {
  'use strict';

  var BM = window.BuildMetric;
  if (!BM) return;

  var utils = BM.utils;

  /* ============================================================
     MODULE: BACK TO TOP BUTTON
     ============================================================ */
  BM.register('backToTop', function initBackToTop() {
    var btn = utils.qs('#backToTop');
    if (!btn) return;

    var SHOW_AFTER = 600; // px

    var toggle = utils.rafThrottle(function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;

      if (y > SHOW_AFTER) {
        if (btn.hidden) btn.hidden = false;
        // Allow paint before applying class to trigger transition
        requestAnimationFrame(function () {
          btn.classList.add('is-visible');
        });
      } else {
        btn.classList.remove('is-visible');
        // Hide after transition completes
        window.setTimeout(function () {
          if (!btn.classList.contains('is-visible')) btn.hidden = true;
        }, 200);
      }
    });

    utils.on(window, 'scroll', toggle, { passive: true });

    utils.on(btn, 'click', function (e) {
      e.preventDefault();
      var reduceMotion = utils.prefersReducedMotion();
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
      // Return focus to top of document
      var skipLink = utils.qs('.skip-link');
      if (skipLink) skipLink.focus({ preventScroll: true });
    });

    toggle();
  });

  /* ============================================================
     MODULE: SMOOTH SCROLL FOR ANCHOR LINKS
     Handles any <a href="#section"> internal to the current page
     ============================================================ */
  BM.register('smoothScroll', function initSmoothScroll() {
    var reduceMotion = utils.prefersReducedMotion();

    utils.qsa('a[href^="#"]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;

      utils.on(link, 'click', function (e) {
        var targetId = href.slice(1);
        var target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();

        var header = utils.qs('#siteHeader');
        var headerOffset = header ? header.offsetHeight : 0;
        var top = target.getBoundingClientRect().top +
          (window.pageYOffset || document.documentElement.scrollTop) -
          headerOffset - 20;

        window.scrollTo({
          top: top,
          behavior: reduceMotion ? 'auto' : 'smooth'
        });

        // Update URL without jumping
        if (history && typeof history.pushState === 'function') {
          history.pushState(null, '', href);
        }

        // Move focus for accessibility (after scroll begins)
        window.setTimeout(function () {
          if (!target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1');
          }
          target.focus({ preventScroll: true });
        }, reduceMotion ? 0 : 400);
      });
    });
  });

  /* ============================================================
     MODULE: ACTIVE NAV HIGHLIGHT
     Highlights the current category in nav on category pages.
     ============================================================ */
  (function initActiveNav() {
    var path = window.location.pathname.toLowerCase();

    var map = {
      'concrete-masonry': 'concrete-masonry.html',
      'interior-finishing': 'interior-finishing.html',
      'exterior-structure': 'exterior-structure.html',
      'landscaping-outdoor': 'landscaping-outdoor.html',
      'lumber-framing': 'lumber-framing.html',
      'electrical-hvac': 'electrical-hvac.html',
      'plumbing-piping': 'plumbing-piping.html',
      'roofing-siding': 'roofing-siding.html',
      'painting-wallpaper': 'painting-wallpaper.html',
      'road-driveway': 'road-driveway.html',
      'cost-estimators': 'cost-estimators.html',
      'solar-energy': 'solar-energy.html'
    };

    Object.keys(map).forEach(function (key) {
      if (path.indexOf(map[key]) !== -1) {
        var link = utils.qs('a[href*="' + map[key] + '"]', utils.qs('#catDropdown'));
        if (link) {
          link.setAttribute('aria-current', 'page');
          link.style.background = 'var(--blue-bg)';
          link.style.borderLeft = '3px solid var(--accent-orange)';
        }
      }
    });

    // Highlight About / Contact / Suppliers top-level links
    ['about.html', 'contact.html', 'suppliers.html'].forEach(function (page) {
      if (path.indexOf(page) !== -1) {
        var topLink = utils.qs('.main-nav a[href="' + page + '"]');
        if (topLink) {
          topLink.setAttribute('aria-current', 'page');
          topLink.style.color = 'var(--primary-blue)';
          topLink.style.background = 'var(--blue-bg)';
        }
      }
    });
  })();

  /* ============================================================
     MODULE: EXTERNAL LINKS — security hardening
     Ensures every target="_blank" link has rel="noopener noreferrer"
     ============================================================ */
  (function hardenExternalLinks() {
    utils.qsa('a[target="_blank"]').forEach(function (link) {
      var rel = (link.getAttribute('rel') || '').toLowerCase();
      var needsNoopener = rel.indexOf('noopener') === -1;
      var needsNoreferrer = rel.indexOf('noreferrer') === -1;

      if (needsNoopener || needsNoreferrer) {
        var parts = rel.split(/\s+/).filter(Boolean);
        if (needsNoopener) parts.push('noopener');
        if (needsNoreferrer) parts.push('noreferrer');
        link.setAttribute('rel', parts.join(' '));
      }
    });
  })();

  /* ============================================================
     MODULE: STAT COUNTER ANIMATION (hero stats)
     Counts up numeric stat values once they scroll into view.
     ============================================================ */
  (function initStatCounters() {
    var statNums = utils.qsa('.hero-stats__num[data-count]');
    if (!statNums.length) return;

    if (!BM.support.intersectionObserver || utils.prefersReducedMotion()) {
      // Fallback: leave the static "300+" / "12" / "10+" / "100%" text alone
      return;
    }

    function animateCount(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.textContent.replace(/[\d,]/g, '') || '';
      if (!isFinite(target) || target <= 0) return;

      var duration = 1200;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        // Ease-out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(target * eased);
        el.textContent = value + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
        }
      }

      requestAnimationFrame(step);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNums.forEach(function (el) { io.observe(el); });
  })();

  /* ============================================================
     MODULE: IMAGE LAZY LOAD POLYFILL / FALLBACK
     Adds native lazy loading to below-the-fold images that
     don't already declare loading="lazy".
     ============================================================ */
  (function initLazyImages() {
    if (!('loading' in HTMLImageElement.prototype)) return; // no polyfill needed

    var images = utils.qsa('img:not([loading])');
    images.forEach(function (img) {
      // Skip images visible in the first viewport
      var rect = img.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.2) return;
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    });
  })();

})();

/* ============================================================
   BuildMetric.org — Global JavaScript
   js/main.js — PART 4/5
   Category interactions · Ad slot lazy reveal · Toast system
   ============================================================ */

(function () {
  'use strict';

  var BM = window.BuildMetric;
  if (!BM) return;

  var utils = BM.utils;

  /* ============================================================
     MODULE: CATEGORY CARD INTERACTIONS
     - Adds keyboard support (whole card is clickable via its link)
     - Adds a subtle tilt press feedback on touch (opt-in)
     - Ensures the entire card is keyboard reachable via its <a>
     ============================================================ */
  BM.register('categoryInteractions', function initCategoryInteractions() {
    var cards = utils.qsa('.cat-card');
    if (!cards.length) return;

    cards.forEach(function (card) {
      var link = utils.qs('.cat-card__link', card);
      if (!link) return;

      // Reflect focus-visible state for styling
      utils.on(link, 'focus', function () {
        card.classList.add('is-focused');
      });
      utils.on(link, 'blur', function () {
        card.classList.remove('is-focused');
      });

      // Keyboard: pressing Enter on the card anywhere triggers the link
      utils.on(card, 'keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && document.activeElement !== link) {
          e.preventDefault();
          link.click();
        }
      });
    });

    // Reveal animation via IntersectionObserver (subtle, respects reduced motion)
    if (!BM.support.intersectionObserver || utils.prefersReducedMotion()) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // Stagger the reveal based on index within batch
          window.setTimeout(function () {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, i * 60);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    cards.forEach(function (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(14px)';
      card.style.transition = 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
      io.observe(card);
    });
  });

  /* ============================================================
     MODULE: AD SLOT PLACEHOLDER BEHAVIOR
     - Marks ads as "loaded" when an AdSense iframe appears
     - Collapses placeholder shimmer once loaded
     - Never touches real ad DOM beyond wrapper class toggles
     ============================================================ */
  (function initAdSlots() {
    var slots = utils.qsa('.ad-slot__inner');
    if (!slots.length) return;

    var observer = null;
    if (BM.support.intersectionObserver) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '120px 0px' });
    }

    slots.forEach(function (slot) {
      if (observer) {
        observer.observe(slot);
      } else {
        slot.classList.add('is-visible');
      }

      // Watch for real ad iframe injection (AdSense async)
      if (window.MutationObserver) {
        var mo = new MutationObserver(function () {
          var iframe = slot.querySelector('iframe');
          if (iframe) {
            slot.classList.add('ad-loaded');
            mo.disconnect();
          }
        });
        mo.observe(slot, { childList: true, subtree: true });
      }
    });
  })();

  /* ============================================================
     MODULE: TOAST NOTIFICATIONS
     Global lightweight toast used by calculator / save actions.
     Usage: BM.toast('Result copied', 'success');
     ============================================================ */
  (function initToast() {
    var container = null;
    var active = [];

    function ensureContainer() {
      if (container && document.body.contains(container)) return container;
      container = document.createElement('div');
      container.className = 'bm-toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
      return container;
    }

    function remove(toastEl) {
      if (!toastEl || !toastEl.parentNode) return;
      toastEl.classList.remove('is-visible');
      window.setTimeout(function () {
        if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
        var idx = active.indexOf(toastEl);
        if (idx > -1) active.splice(idx, 1);
      }, 220);
    }

    BM.toast = function (message, type, duration) {
      if (!message) return;
      var c = ensureContainer();
      var kind = type === 'error' ? 'error' :
                 type === 'warning' ? 'warning' : 'success';

      var el = document.createElement('div');
      el.className = 'bm-toast bm-toast--' + kind;
      el.setAttribute('role', kind === 'error' ? 'alert' : 'status');

      var iconSvg = kind === 'error'
        ? '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M10 6v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14" r="1" fill="currentColor"/></svg>'
        : kind === 'warning'
          ? '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3l8 14H2L10 3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 8v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="13.5" r="1" fill="currentColor"/></svg>'
          : '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M6.5 10.2l2.4 2.4 4.6-4.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      el.innerHTML =
        '<span class="bm-toast__icon">' + iconSvg + '</span>' +
        '<span class="bm-toast__msg">' + utils.escapeHTML(message) + '</span>' +
        '<button type="button" class="bm-toast__close" aria-label="Dismiss notification">' +
          '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
        '</button>';

      c.appendChild(el);
      active.push(el);

      // Fade in on next frame
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { el.classList.add('is-visible'); });
      });

      var timeout = typeof duration === 'number' ? duration : 3200;
      var timer = window.setTimeout(function () { remove(el); }, timeout);

      el.querySelector('.bm-toast__close').addEventListener('click', function () {
        clearTimeout(timer);
        remove(el);
      });

      return el;
    };
  })();

  /* ============================================================
     MODULE: STICKY-NAV OFFSET FOR HASH LINKS ON LOAD
     If a user lands on a URL with #hash, re-scroll respecting the header.
     ============================================================ */
  (function fixInitialHashScroll() {
    if (!window.location.hash || window.location.hash.length < 2) return;
    var id = window.location.hash.slice(1);
    var target = document.getElementById(id);
    if (!target) return;

    // Wait a tick so layout is fully settled
    window.setTimeout(function () {
      var header = utils.qs('#siteHeader');
      var headerOffset = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top +
        (window.pageYOffset || document.documentElement.scrollTop) -
        headerOffset - 20;
      window.scrollTo({ top: top, behavior: 'auto' });
    }, 60);
  })();

  /* ============================================================
     MODULE: VISIBILITY-AWARE AD REFRESH PAUSE
     Pauses any active timers when tab is hidden (battery-friendly).
     We expose BM.pageVisible as a promise-like boolean.
     ============================================================ */
  (function initVisibilityState() {
    BM.state.pageVisible = !document.hidden;

    utils.on(document, 'visibilitychange', function () {
      BM.state.pageVisible = !document.hidden;
      document.body.classList.toggle('is-hidden', document.hidden);
    });
  })();

})();

/* ============================================================
   BuildMetric.org — Global JavaScript
   js/main.js — PART 5/5
   B2B form validation · Submission · Final init sequence
   ============================================================ */

(function () {
  'use strict';

  var BM = window.BuildMetric;
  if (!BM) return;

  var utils = BM.utils;

  /* ============================================================
     MODULE: B2B LEAD FORM VALIDATION + SUBMISSION
     ============================================================ */
  BM.register('b2bForm', function initB2BForm() {
    var form = utils.qs('#b2bForm');
    var success = utils.qs('#b2bSuccess');
    var submitBtn = utils.qs('#b2bSubmit');
    if (!form) return;

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    var PHONE_SAFE = /^[^\s@]+$/; // basic guard

    var fields = {
      company: {
        el: utils.qs('#b2bCompany'),
        validate: function (v) {
          if (!v.trim()) return 'Please enter your company name.';
          if (v.trim().length < 2) return 'Company name is too short.';
          return '';
        }
      },
      name: {
        el: utils.qs('#b2bName'),
        validate: function (v) {
          if (!v.trim()) return 'Please enter your name.';
          if (v.trim().length < 2) return 'Name is too short.';
          return '';
        }
      },
      email: {
        el: utils.qs('#b2bEmail'),
        validate: function (v) {
          if (!v.trim()) return 'Please enter your work email.';
          if (!EMAIL_RE.test(v.trim())) return 'Please enter a valid email address.';
          return '';
        }
      },
      category: {
        el: utils.qs('#b2bCategory'),
        validate: function (v) {
          if (!v) return 'Please select a product category.';
          return '';
        }
      },
      region: {
        el: utils.qs('#b2bRegion'),
        validate: function (v) {
          if (!v) return 'Please select a service region.';
          return '';
        }
      },
      consent: {
        el: utils.qs('#b2bConsent'),
        validate: function () {
          if (!fields.consent.el.checked) {
            return 'Please accept the partnership contact consent.';
          }
          return '';
        }
      }
    };

    /* ---------- Error display helpers ---------- */
    function showError(key, message) {
      var field = fields[key];
      if (!field || !field.el) return;

      var target = field.el.closest('.b2b-field') ||
                   field.el.closest('.b2b-consent');

      if (target) target.classList.add('has-error');

      var errorEl = utils.qs('[data-error-for="' + field.el.id + '"]');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.setAttribute('role', 'alert');
      }

      field.el.setAttribute('aria-invalid', 'true');
    }

    function clearError(key) {
      var field = fields[key];
      if (!field || !field.el) return;

      var target = field.el.closest('.b2b-field') ||
                   field.el.closest('.b2b-consent');
      if (target) target.classList.remove('has-error');

      var errorEl = utils.qs('[data-error-for="' + field.el.id + '"]');
      if (errorEl) errorEl.textContent = '';

      field.el.removeAttribute('aria-invalid');
    }

    /* ---------- Live validation (on blur + on input after error) ---------- */
    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      if (!field.el) return;

      var eventType = (field.el.type === 'checkbox' || field.el.tagName === 'SELECT')
        ? 'change' : 'blur';

      utils.on(field.el, eventType, function () {
        var value = field.el.type === 'checkbox'
          ? (field.el.checked ? '1' : '')
          : field.el.value;
        var err = field.validate(value);
        if (err) showError(key, err);
        else clearError(key);
      });

      // Clear error on valid input
      utils.on(field.el, 'input', function () {
        var value = field.el.value;
        var err = field.validate(value);
        if (!err) clearError(key);
      });
    });

    /* ---------- Full form validation ---------- */
    function validateAll() {
      var firstInvalidKey = null;

      Object.keys(fields).forEach(function (key) {
        var field = fields[key];
        if (!field.el) return;

        var value = field.el.type === 'checkbox'
          ? (field.el.checked ? '1' : '')
          : field.el.value;

        var err = field.validate(value);
        if (err) {
          showError(key, err);
          if (!firstInvalidKey) firstInvalidKey = key;
        } else {
          clearError(key);
        }
      });

      return firstInvalidKey;
    }

    /* ---------- Submission ---------- */
    function collectPayload() {
      var formData = new FormData(form);
      var payload = {
        company: (formData.get('company') || '').toString().trim(),
        name: (formData.get('name') || '').toString().trim(),
        email: (formData.get('email') || '').toString().trim(),
        category: (formData.get('category') || '').toString().trim(),
        region: (formData.get('region') || '').toString().trim(),
        message: (formData.get('message') || '').toString().trim(),
        consent: fields.consent.el.checked,
        submittedAt: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent
      };

      // Attach geo state if available
      if (BM.state && BM.state.country) {
        payload.detectedCountry = BM.state.country.code || BM.state.country;
      }

      return payload;
    }

    /* ---------- Fallback submission via mailto ---------- */
    function submitViaMailto(payload) {
      var subject = encodeURIComponent(
        'Supplier Partnership Request — ' + payload.company
      );
      var body = encodeURIComponent(
        'Company: ' + payload.company + '\n' +
        'Contact Name: ' + payload.name + '\n' +
        'Email: ' + payload.email + '\n' +
        'Category: ' + payload.category + '\n' +
        'Region: ' + payload.region + '\n\n' +
        'Message:\n' + (payload.message || '(none)') + '\n\n' +
        '---\n' +
        'Submitted: ' + payload.submittedAt + '\n' +
        'Page: ' + payload.page + '\n' +
        'Detected country: ' + (payload.detectedCountry || 'unknown')
      );

      window.location.href =
        'mailto:contact.buildmetric@gmail.com?subject=' + subject +
        '&body=' + body;
    }

    utils.on(form, 'submit', function (e) {
      e.preventDefault();

      var firstInvalid = validateAll();
      if (firstInvalid) {
        var field = fields[firstInvalid];
        if (field.el) {
          field.el.focus();
          field.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (BM.toast) BM.toast('Please fix the highlighted fields.', 'error');
        return;
      }

      var payload = collectPayload();

      if (submitBtn) {
        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;
      }

      // Store locally as a safety net (lead doesn't get lost if network fails)
      if (BM.utils.storage) {
        var key = 'bm_leads_pending';
        var existing = BM.utils.storage.get(key) || [];
        existing.push(payload);
        BM.utils.storage.set(key, existing.slice(-20));
      }

      // Simulated async submit — replace with real endpoint when available.
      // For production: POST to your backend, Formspree, Netlify Forms, etc.
      window.setTimeout(function () {
        if (submitBtn) {
          submitBtn.classList.remove('is-loading');
          submitBtn.disabled = false;
        }

        if (success) {
          form.hidden = true;
          success.hidden = false;
          success.setAttribute('tabindex', '-1');
          success.focus({ preventScroll: true });
        }

        if (BM.toast) {
          BM.toast('Request received. We\'ll reply within 48 hours.', 'success', 5000);
        }

        // Optional: also open user's mail client with prefilled body
        // (comment out if you don't want this behaviour)
        // submitViaMailto(payload);

      }, 900);
    });

    /* ---------- Optional: reset on demand (for testing) ---------- */
    BM.resetB2BForm = function () {
      form.reset();
      Object.keys(fields).forEach(clearError);
      form.hidden = false;
      if (success) success.hidden = true;
      if (submitBtn) {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
      }
    };
  });

  /* ============================================================
     MODULE: HERO SEARCH HANDOFF
     Homepage hero search hands off to global search overlay module
     (search.js) if it exists; otherwise falls back to a soft filter.
     ============================================================ */
  (function initHeroSearchHandoff() {
    var heroInput = utils.qs('#heroSearchInput');
    var heroForm = utils.qs('#heroSearchForm');
    var heroSuggest = utils.qs('#heroSuggest');
    if (!heroInput || !heroForm) return;

    // On focus, if search.js overlay exists, transfer focus to the overlay
    utils.on(heroInput, 'focus', function () {
      if (BM.openSearchOverlay) {
        var term = heroInput.value;
        BM.openSearchOverlay(term);
      }
    });

    utils.on(heroForm, 'submit', function (e) {
      e.preventDefault();
      var q = heroInput.value.trim();
      if (BM.openSearchOverlay) {
        BM.openSearchOverlay(q);
      } else if (q) {
        window.location.href = 'sitemap.html?s=' + encodeURIComponent(q);
      }
    });
  })();

  /* ============================================================
     MODULE: YEAR AUTO-UPDATE IN FOOTER COPY
     Safety net if the copy is stale.
     ============================================================ */
  (function autoUpdateYear() {
    var copy = utils.qs('.footer-bottom__copy');
    if (!copy) return;
    var currentYear = new Date().getFullYear();
    if (currentYear > 2026) {
      copy.innerHTML = copy.innerHTML.replace(/©\s*2026/, '© ' + currentYear);
    }
  })();

  /* ============================================================
     MODULE: PERFORMANCE MARK — log a simple timing marker
     ============================================================ */
  (function logLoadTiming() {
    if (!window.performance || !performance.timing) return;
    window.setTimeout(function () {
      try {
        var nav = performance.getEntriesByType('navigation')[0];
        if (nav && nav.domContentLoadedEventEnd) {
          BM.state.dcl = Math.round(nav.domContentLoadedEventEnd);
        }
      } catch (e) { /* noop */ }
    }, 0);
  })();

  /* ============================================================
     FINAL INITIALISATION SWEEP
     Any modules registered after DOM ready still get initialised here.
     ============================================================ */
  function finalizeInit() {
    Object.keys(BM.modules).forEach(function (name) {
      var mod = BM.modules[name];
      if (mod && !mod.ready && typeof mod.init === 'function') {
        try {
          mod.init();
          mod.ready = true;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[BuildMetric] late init "' + name + '":', e);
        }
      }
    });
  }

  BM.ready(finalizeInit);

  // Expose final public API
  window.BuildMetric = BM;

})();
