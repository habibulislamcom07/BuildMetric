/* =========================================================
   BuildMetric — Shared JavaScript
   File: assets/js/main.js
   Author: BuildMetric
   Description: Global helper functions used across all
   calculator pages. Lightweight, dependency-free, and
   designed to work in every modern browser.
   ========================================================= */

'use strict';

/* =========================================================
   1. DOM READY WRAPPER
   Ensures all code runs only after the HTML is fully parsed.
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {

  /* -------------------------------------------------------
     1.1 MOBILE NAVIGATION TOGGLE
     Toggles the .open class on the site navigation when the
     hamburger button is clicked. Also updates ARIA attributes
     for screen readers.
     ------------------------------------------------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('open');
      var isOpen = siteNav.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile nav when a link is clicked
    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (siteNav.classList.contains('open')) {
          siteNav.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Close mobile nav when clicking outside of it
    document.addEventListener('click', function (event) {
      if (!siteNav.classList.contains('open')) return;
      if (siteNav.contains(event.target)) return;
      if (navToggle.contains(event.target)) return;
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });

    // Close mobile nav on window resize (desktop breakpoint)
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760 && siteNav.classList.contains('open')) {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* -------------------------------------------------------
     1.2 AUTO YEAR IN FOOTER
     Fills any element with id="yr" with the current year.
     Keeps the copyright notice always up to date.
     ------------------------------------------------------- */
  var yearEl = document.getElementById('yr');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

});

/* =========================================================
   2. NUMBER FORMATTING HELPER
   Used by every calculator to display results with
   thousands separators and controlled decimal places.
   Example: fmt(1234.567, 2) → "1,234.57"
   ========================================================= */
function fmt(num, decimals) {
  if (decimals === undefined || decimals === null) {
    decimals = 2;
  }
  if (num === null || num === undefined) {
    return '0';
  }
  var n = Number(num);
  if (!isFinite(n) || isNaN(n)) {
    return '0';
  }
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/* =========================================================
   3. ROUND TO DECIMAL PLACES
   Safer rounding helper that avoids floating-point errors.
   Example: roundTo(1.235, 2) → 1.24
   ========================================================= */
function roundTo(num, decimals) {
  if (decimals === undefined) decimals = 2;
  var factor = Math.pow(10, decimals);
  return Math.round((Number(num) + Number.EPSILON) * factor) / factor;
}
/* =========================================================
   4. INPUT VALIDATION HELPERS
   Used by every calculator to safely read user input.
   Returns null if the input is missing, empty, negative,
   zero, or not a valid number.
   ========================================================= */

/* ---------------------------------------------------------
   4.1 posNum(id)
   Reads a numeric value from an input by its ID.
   Returns a positive float (> 0) or null.
   --------------------------------------------------------- */
function posNum(id) {
  var el = document.getElementById(id);
  if (!el) return null;
  var raw = String(el.value).trim();
  if (raw === '') return null;
  var v = parseFloat(raw);
  if (isNaN(v) || !isFinite(v) || v <= 0) return null;
  return v;
}

/* ---------------------------------------------------------
   4.2 posInt(id)
   Same as posNum but returns a positive integer.
   Useful for counts (number of posts, tiles, bags, etc.).
   --------------------------------------------------------- */
function posInt(id) {
  var v = posNum(id);
  if (v === null) return null;
  return Math.floor(v);
}

/* ---------------------------------------------------------
   4.3 nonNegNum(id)
   Returns a non-negative float (>= 0) or null.
   Useful for fields where zero is a valid value
   (e.g. waste percentage, discount, offset).
   --------------------------------------------------------- */
function nonNegNum(id) {
  var el = document.getElementById(id);
  if (!el) return null;
  var raw = String(el.value).trim();
  if (raw === '') return null;
  var v = parseFloat(raw);
  if (isNaN(v) || !isFinite(v) || v < 0) return null;
  return v;
}

/* ---------------------------------------------------------
   4.4 getSelect(id)
   Returns the selected value from a <select> by ID.
   Returns empty string if the element does not exist.
   --------------------------------------------------------- */
function getSelect(id) {
  var el = document.getElementById(id);
  if (!el) return '';
  return String(el.value || '');
}

/* =========================================================
   5. RESULT DISPLAY HELPERS
   Every calculator uses these to show output or errors.
   ========================================================= */

/* ---------------------------------------------------------
   5.1 showResult(html)
   Injects HTML into the #result container and reveals it.
   Adds a subtle fade-in animation (defined in CSS).
   --------------------------------------------------------- */
function showResult(html) {
  var box = document.getElementById('result');
  if (!box) {
    // Fallback: if no #result box exists, log to console so
    // developers notice the missing container.
    if (window.console && console.warn) {
      console.warn('BuildMetric: #result container not found.');
    }
    return;
  }
  box.innerHTML = html;
  box.classList.add('show');
  // Ensure the box is visible even if it was hidden previously
  box.style.display = 'block';
}

/* ---------------------------------------------------------
   5.2 showError(message)
   Displays a styled error message in the result box.
   Used when validation fails.
   --------------------------------------------------------- */
function showError(message) {
  if (!message) {
    message = 'Please enter valid positive numbers in all required fields.';
  }
  showResult(
    '<p style="color:#dc2626;font-weight:600;margin:0;">' +
      '⚠ ' + message +
    '</p>'
  );
}

/* ---------------------------------------------------------
   5.3 clearResult()
   Hides the result box and clears its contents.
   Useful for a "Reset" button or when switching modes.
   --------------------------------------------------------- */
function clearResult() {
  var box = document.getElementById('result');
  if (!box) return;
  box.innerHTML = '';
  box.classList.remove('show');
}

/* ---------------------------------------------------------
   5.4 buildResultLine(label, value)
   Convenience helper for building a single result row.
   Returns an HTML string (does not render anything).
   Example:
     buildResultLine('Volume', '1.23 cubic yards')
     → '<div class="result-line"><span>Volume</span>
        <span>1.23 cubic yards</span></div>'
   --------------------------------------------------------- */
function buildResultLine(label, value) {
  return (
    '<div class="result-line">' +
      '<span>' + label + '</span>' +
      '<span>' + value + '</span>' +
    '</div>'
  );
}

/* ---------------------------------------------------------
   5.5 buildResultBlock(title, linesHtml, note)
   Builds a full result block with a title, multiple lines,
   and an optional italic note at the bottom.
   --------------------------------------------------------- */
function buildResultBlock(title, linesHtml, note) {
  var html = '';
  if (title) {
    html += '<h3>' + title + '</h3>';
  }
  html += linesHtml || '';
  if (note) {
    html += '<p class="result-note">' + note + '</p>';
  }
  return html;
}

/* =========================================================
   6. FORM UTILITIES
   Small helpers to reset forms and read all values at once.
   ========================================================= */

/* ---------------------------------------------------------
   6.1 resetForm(formId)
   Clears all inputs and selects inside a form by ID.
   Also hides any visible result box.
   --------------------------------------------------------- */
function resetForm(formId) {
  var form = document.getElementById(formId);
  if (form) {
    form.reset();
  }
  clearResult();
}

/* ---------------------------------------------------------
   6.2 setValue(id, value)
   Safely sets the value of an input or select by ID.
   Useful when one field depends on another.
   --------------------------------------------------------- */
function setValue(id, value) {
  var el = document.getElementById(id);
  if (el) el.value = value;
}

/* ---------------------------------------------------------
   6.3 toggleVisibility(id, show)
   Shows or hides an element by ID using display: none/block.
   Useful for switching between calculator modes.
   --------------------------------------------------------- */
function toggleVisibility(id, show) {
  var el = document.getElementById(id);
  if (!el) return;
  el.style.display = show ? 'block' : 'none';
}

/* =========================================================
   7. SMOOTH SCROLL FOR ANCHOR LINKS
   When a user clicks a link that starts with "#", smoothly
   scroll to the target section instead of jumping.
   ========================================================= */
document.addEventListener('click', function (event) {
  var target = event.target.closest('a[href^="#"]');
  if (!target) return;
  var href = target.getAttribute('href');
  if (!href || href === '#' || href.length < 2) return;
  var destination = document.querySelector(href);
  if (!destination) return;
  event.preventDefault();
  destination.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* =========================================================
   8. COPY RESULT TO CLIPBOARD (Optional Utility)
   Some calculators may include a "Copy result" button.
   This helper handles it with a graceful fallback.
   ========================================================= */
function copyResultToClipboard() {
  var box = document.getElementById('result');
  if (!box) return;
  var text = box.innerText || box.textContent || '';
  if (!text.trim()) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      flashCopyFeedback('Copied!');
    }).catch(function () {
      flashCopyFeedback('Press Ctrl+C to copy');
    });
  } else {
    // Fallback for older browsers
    var temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    try {
      document.execCommand('copy');
      flashCopyFeedback('Copied!');
    } catch (e) {
      flashCopyFeedback('Press Ctrl+C to copy');
    }
    document.body.removeChild(temp);
  }
}

/* ---------------------------------------------------------
   8.1 flashCopyFeedback(message)
   Shows a brief toast-style message near the top of the page.
   --------------------------------------------------------- */
function flashCopyFeedback(message) {
  var toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText =
    'position:fixed;top:20px;left:50%;transform:translateX(-50%);' +
    'background:#0f4c81;color:#fff;padding:10px 18px;' +
    'border-radius:8px;font-size:0.9rem;font-weight:600;' +
    'z-index:9999;box-shadow:0 4px 14px rgba(15,76,129,0.25);' +
    'opacity:0;transition:opacity 0.2s ease;';
  document.body.appendChild(toast);
  requestAnimationFrame(function () {
    toast.style.opacity = '1';
  });
  setTimeout(function () {
    toast.style.opacity = '0';
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 220);
  }, 1600);
}

/* =========================================================
   9. UNIT CONVERSION HELPERS
   Common conversions used by many calculators. Keeping
   them in one place reduces duplication and mistakes.
   ========================================================= */

/* ---------------------------------------------------------
   9.1 Imperial ↔ Metric conversions
   --------------------------------------------------------- */
var Units = {
  /* Length */
  feetToMetres: function (ft) { return ft * 0.3048; },
  metresToFeet: function (m) { return m / 0.3048; },
  inchesToCm: function (inch) { return inch * 2.54; },
  cmToInches: function (cm) { return cm / 2.54; },
  inchesToFeet: function (inch) { return inch / 12; },
  feetToInches: function (ft) { return ft * 12; },

  /* Area */
  sqftToSqm: function (sqft) { return sqft * 0.092903; },
  sqmToSqft: function (sqm) { return sqm / 0.092903; },

  /* Volume */
  cubicFeetToCubicYards: function (cf) { return cf / 27; },
  cubicYardsToCubicFeet: function (cy) { return cy * 27; },
  cubicFeetToCubicMetres: function (cf) { return cf * 0.0283168; },
  cubicMetresToCubicFeet: function (cm) { return cm / 0.0283168; },
  litresToGallonsUS: function (l) { return l * 0.264172; },
  gallonsUSToLitres: function (g) { return g / 0.264172; },

  /* Weight */
  poundsToKg: function (lb) { return lb * 0.453592; },
  kgToPounds: function (kg) { return kg / 0.453592; }
};

/* =========================================================
   10. SAFE MATH WRAPPERS
   Prevent division-by-zero and NaN errors in calculators.
   ========================================================= */

/* ---------------------------------------------------------
   10.1 safeDivide(a, b, fallback)
   Returns a / b, or fallback if b is 0 or invalid.
   --------------------------------------------------------- */
function safeDivide(a, b, fallback) {
  if (fallback === undefined) fallback = 0;
  var result = Number(a) / Number(b);
  if (!isFinite(result) || isNaN(result)) return fallback;
  return result;
}

/* ---------------------------------------------------------
   10.2 safeMultiply(a, b, fallback)
   Returns a * b, or fallback if either value is invalid.
   --------------------------------------------------------- */
function safeMultiply(a, b, fallback) {
  if (fallback === undefined) fallback = 0;
  var result = Number(a) * Number(b);
  if (!isFinite(result) || isNaN(result)) return fallback;
  return result;
}

/* =========================================================
   11. WASTE / OVERAGE HELPER
   Most construction calculators add 5–10% waste.
   This helper applies a waste percentage to a base quantity.
   Example: applyWaste(100, 10) → 110
   ========================================================= */
function applyWaste(quantity, wastePercent) {
  if (wastePercent === undefined || wastePercent === null) {
    wastePercent = 0;
  }
  var q = Number(quantity);
  var w = Number(wastePercent);
  if (!isFinite(q) || !isFinite(w) || q < 0 || w < 0) return 0;
  return q * (1 + w / 100);
}

/* =========================================================
   12. BAGGED-MATERIAL HELPER
   Many tools (concrete, mortar, soil) need to convert a
   total volume into the number of bags, given the yield
   of one bag in the same unit.
   Example: bagsNeeded(33.33, 0.6) → 56 (rounded up)
   ========================================================= */
function bagsNeeded(totalVolume, yieldPerBag) {
  var tv = Number(totalVolume);
  var y = Number(yieldPerBag);
  if (!isFinite(tv) || !isFinite(y) || tv <= 0 || y <= 0) return 0;
  return Math.ceil(tv / y);
}

/* =========================================================
   END OF SCRIPT
   BuildMetric — Shared JavaScript
   Total: 12 sections (DOM ready → bagged-material helper)
   ========================================================= */

 
/* =========================================================
   SECTION 13 — UNIT SYSTEM TOGGLE (Imperial vs Metric)
   =========================================================
   Har calculator page pe ek toggle hoga:
     [ Imperial ] [ Metric ]
   
   Features:
   - Auto-detect browser locale (en-US = Imperial, baaki = Metric)
   - localStorage mein preference save
   - Field labels dynamically change (ft ↔ m, in ↔ cm)
   - Existing values automatically convert
   - Result units bhi change
   ========================================================= */

/* ---------------------------------------------------------
   13.1 GLOBAL STATE
   Har page pe active unit system track karta hai.
   --------------------------------------------------------- */
var BM_UNITS = {
  current: 'imperial',          // 'imperial' ya 'metric'
  storageKey: 'bm_preferred_units',
  config: null,                 // Har tool apni config set karega
  onChangeCallbacks: []         // Tools apne callbacks register karenge
};

/* ---------------------------------------------------------
   13.2 DETECT PREFERRED UNITS
   Priority:
     1. localStorage (agar pehle save kiya hai)
     2. Browser locale (en-US → imperial, baaki → metric)
     3. Default: imperial
   --------------------------------------------------------- */
function detectPreferredUnits() {
  try {
    var saved = localStorage.getItem(BM_UNITS.storageKey);
    if (saved === 'imperial' || saved === 'metric') {
      return saved;
    }
  } catch (e) {
    // localStorage blocked (private mode, etc.) — ignore
  }

  var lang = (navigator.language || navigator.userLanguage || 'en-US').toLowerCase();

  // Countries that use Imperial system for construction
  var imperialLocales = ['en-us', 'en-lr', 'en-mm', 'my-mm'];

  for (var i = 0; i < imperialLocales.length; i++) {
    if (lang.indexOf(imperialLocales[i]) === 0) {
      return 'imperial';
    }
  }

  // Default to metric for all other locales
  return 'metric';
}

/* ---------------------------------------------------------
   13.3 SAVE PREFERENCE
   --------------------------------------------------------- */
function savePreferredUnits(system) {
  try {
    localStorage.setItem(BM_UNITS.storageKey, system);
  } catch (e) {
    // Silent fail — localStorage may be blocked
  }
}

/* ---------------------------------------------------------
   13.4 REGISTER CALLBACK
   Tools apna recalculate function register kar sakte hain.
   Jab toggle change ho, yeh callback fire hoga.
   --------------------------------------------------------- */
function onUnitChange(callback) {
  if (typeof callback === 'function') {
    BM_UNITS.onChangeCallbacks.push(callback);
  }
}

/* ---------------------------------------------------------
   13.5 SET UNIT SYSTEM
   Main function jo toggle click pe call hota hai.
   --------------------------------------------------------- */
function setUnitSystem(system, options) {
  if (system !== 'imperial' && system !== 'metric') return;
  if (BM_UNITS.current === system && !(options && options.force)) return;

  var oldSystem = BM_UNITS.current;
  BM_UNITS.current = system;
  savePreferredUnits(system);

  // Update toggle UI
  updateUnitToggleUI();

  // Update field labels
  if (BM_UNITS.config) {
    updateFieldLabels(system);
    convertFieldValues(oldSystem, system);
  }

  // Fire callbacks (tools recalculate)
  BM_UNITS.onChangeCallbacks.forEach(function (cb) {
    try {
      cb(system, oldSystem);
    } catch (e) {
      if (window.console && console.warn) {
        console.warn('BuildMetric: unit change callback error', e);
      }
    }
  });
}

/* ---------------------------------------------------------
   13.6 UPDATE TOGGLE UI
   Selected button ko highlight karta hai.
   --------------------------------------------------------- */
function updateUnitToggleUI() {
  var buttons = document.querySelectorAll('[data-unit-btn]');
  buttons.forEach(function (btn) {
    var btnSystem = btn.getAttribute('data-unit-btn');
    var isActive = (btnSystem === BM_UNITS.current);
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

/* ---------------------------------------------------------
   13.7 UPDATE FIELD LABELS
   Config mein har field ka label imperial/metric hota hai.
   Yeh function label text change karta hai.
   --------------------------------------------------------- */
function updateFieldLabels(system) {
  var config = BM_UNITS.config;
  if (!config || !config.fields) return;

  Object.keys(config.fields).forEach(function (fieldId) {
    var field = config.fields[fieldId];
    var labelEl = document.querySelector('label[for="' + fieldId + '"]');
    if (labelEl && field.labels && field.labels[system]) {
      labelEl.textContent = field.labels[system];
    }
    // Also update placeholder if defined
    var inputEl = document.getElementById(fieldId);
    if (inputEl && field.placeholders && field.placeholders[system]) {
      inputEl.setAttribute('placeholder', field.placeholders[system]);
    }
  });
}

/* ---------------------------------------------------------
   13.8 CONVERT FIELD VALUES
   Agar user ne pehle se value daali hai aur toggle change
   karta hai, toh value automatically convert ho jaati hai.
   --------------------------------------------------------- */
function convertFieldValues(fromSystem, toSystem) {
  var config = BM_UNITS.config;
  if (!config || !config.fields) return;
  if (fromSystem === toSystem) return;

  Object.keys(config.fields).forEach(function (fieldId) {
    var field = config.fields[fieldId];
    if (!field.conversions) return;

    var inputEl = document.getElementById(fieldId);
    if (!inputEl) return;

    var rawValue = String(inputEl.value).trim();
    if (rawValue === '') return;

    var numValue = parseFloat(rawValue);
    if (isNaN(numValue) || numValue <= 0) return;

    // Get conversion factor for direction
    var factor = field.conversions[fromSystem + 'To' + capitalize(toSystem)];
    if (typeof factor === 'number' && isFinite(factor)) {
      var converted = numValue * factor;
      // Round to reasonable precision
      inputEl.value = roundTo(converted, field.decimals || 2);
    }
  });
}

/* ---------------------------------------------------------
   13.9 CAPITALIZE HELPER
   --------------------------------------------------------- */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ---------------------------------------------------------
   13.10 INITIALIZE UNIT TOGGLE
   Har page pe DOMContentLoaded pe call hota hai.
   --------------------------------------------------------- */
function initUnitToggle(toolConfig) {
  if (toolConfig) {
    BM_UNITS.config = toolConfig;
  }

  // Set initial unit system based on preference
  var preferred = detectPreferredUnits();
  BM_UNITS.current = preferred;

  // Update UI + labels
  updateUnitToggleUI();
  if (BM_UNITS.config) {
    updateFieldLabels(preferred);
  }

  // Attach click handlers to toggle buttons
  var buttons = document.querySelectorAll('[data-unit-btn]');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var system = btn.getAttribute('data-unit-btn');
      setUnitSystem(system);
    });

    // Keyboard accessibility
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var system = btn.getAttribute('data-unit-btn');
        setUnitSystem(system);
      }
    });
  });
}

/* =========================================================
   SECTION 14 — UNIT TOGGLE HTML HELPER
   =========================================================
   Ek function jo toggle ka HTML generate karta hai.
   Tools isse use karke inject kar sakte hain.
   ========================================================= */
function buildUnitToggleHTML() {
  return (
    '<div class="unit-toggle" role="group" aria-label="Unit system">' +
      '<span class="unit-toggle-label">Units:</span>' +
      '<button type="button" class="unit-btn" data-unit-btn="imperial" aria-pressed="false">' +
        'Imperial (ft, in, lb)' +
      '</button>' +
      '<button type="button" class="unit-btn" data-unit-btn="metric" aria-pressed="false">' +
        'Metric (m, cm, kg)' +
      '</button>' +
    '</div>'
  );
}

/* =========================================================
   SECTION 15 — FORMAT RESULT WITH UNITS
   =========================================================
   Result ko unit label ke saath format karta hai.
   Example: formatWithUnits(1.23, 'cubic yards', 'cubic meters')
   → Imperial mode mein "1.23 cubic yards"
   → Metric mode mein "0.94 cubic meters"
   ========================================================= */
function formatWithUnits(imperialValue, metricValue, imperialUnit, metricUnit) {
  if (BM_UNITS.current === 'metric') {
    return fmt(metricValue, 2) + ' ' + metricUnit;
  }
  return fmt(imperialValue, 2) + ' ' + imperialUnit;
}

/* =========================================================
   SECTION 16 — GET CURRENT SYSTEM
   =========================================================
   Tool ke andar easily check karne ke liye.
   Example: if (isMetric()) { ... }
   ========================================================= */
function isMetric() {
  return BM_UNITS.current === 'metric';
}

function isImperial() {
  return BM_UNITS.current === 'imperial';
}

/* =========================================================
   SECTION 17 — AUTO-INIT ON PAGE LOAD
   =========================================================
   Agar page pe [data-unit-btn] buttons hain, toh automatically
   initialize kar do. Tool-specific config baad mein bhi set
   ho sakti hai.
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelector('[data-unit-btn]')) {
    // Don't pass config — tool apna config set karega
    initUnitToggle(null);
  }
});

/* =========================================================
   SECTION 18 — EXPOSE GLOBAL API
   =========================================================
   Tools ko accessible banane ke liye.
   ========================================================= */
window.BuildMetric = {
  units: BM_UNITS,
  setUnitSystem: setUnitSystem,
  initUnitToggle: initUnitToggle,
  buildUnitToggleHTML: buildUnitToggleHTML,
  formatWithUnits: formatWithUnits,
  isMetric: isMetric,
  isImperial: isImperial,
  onUnitChange: onUnitChange,
  // Existing helpers
  fmt: fmt,
  roundTo: roundTo,
  posNum: posNum,
  showResult: showResult,
  showError: showError,
  Units: Units,
  applyWaste: applyWaste,
  bagsNeeded: bagsNeeded
};


/* =========================================================
   SECTION 19 — FAQ ACCORDION
   =========================================================
   Click on FAQ question → toggle open/close
   Auto-initializes on any page that has .faq-accordion
   ========================================================= */

function initFaqAccordion() {
  var faqItems = document.querySelectorAll('.faq-accordion');
  if (!faqItems.length) return;

  faqItems.forEach(function (item) {
    var button = item.querySelector('.faq-question');
    if (!button) return;

    button.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      // Close all other FAQs (optional — remove this block to allow multiple open)
      faqItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          var otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      item.classList.toggle('open', !isOpen);
      button.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });

    // Keyboard accessibility
    button.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });
  });
}

/* Auto-initialize on page load */
document.addEventListener('DOMContentLoaded', function () {
  initFaqAccordion();
});

/* Expose globally */
if (typeof window.BuildMetric !== 'undefined') {
  window.BuildMetric.initFaqAccordion = initFaqAccordion;
}

/* =========================================================
   END OF SCRIPT — FINAL
   BuildMetric — Shared JavaScript
   Total: 19 sections
   Sections 1–12: Core helpers (Phase 1 + 2)
   Sections 13–19: Unit Toggle System (Phase 3)
   ========================================================= */
