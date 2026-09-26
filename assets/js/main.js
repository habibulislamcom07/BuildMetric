/* =========================================================
   BuildMetric — Shared JavaScript
   File: assets/js/main.js
   Global helpers, unit toggle system, FAQ accordion, API.
   Lightweight, dependency-free, modern browser support.
   ========================================================= */

'use strict';

/* =========================================================
   SECTION 1 — DOM READY WRAPPER
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {

  /* -------------------------------------------------------
     1.1 MOBILE NAVIGATION TOGGLE
     ------------------------------------------------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('open');
      var isOpen = siteNav.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (siteNav.classList.contains('open')) {
          siteNav.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    document.addEventListener('click', function (event) {
      if (!siteNav.classList.contains('open')) return;
      if (siteNav.contains(event.target)) return;
      if (navToggle.contains(event.target)) return;
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 760 && siteNav.classList.contains('open')) {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* -------------------------------------------------------
     1.2 AUTO YEAR IN FOOTER
     ------------------------------------------------------- */
  var yearEl = document.getElementById('yr');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* -------------------------------------------------------
     1.3 FAQ ACCORDION AUTO-INIT
     ------------------------------------------------------- */
  initFaqAccordion();

  /* -------------------------------------------------------
     1.4 UNIT TOGGLE AUTO-INIT
     ------------------------------------------------------- */
  if (document.querySelector('[data-unit-btn]')) {
    initUnitToggle(null);
  }

});

/* =========================================================
   SECTION 2 — NUMBER FORMATTING
   ========================================================= */
function fmt(num, decimals) {
  if (decimals === undefined || decimals === null) decimals = 2;
  if (num === null || num === undefined) return '0';
  var n = Number(num);
  if (!isFinite(n) || isNaN(n)) return '0';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function roundTo(num, decimals) {
  if (decimals === undefined) decimals = 2;
  var factor = Math.pow(10, decimals);
  return Math.round((Number(num) + Number.EPSILON) * factor) / factor;
}

/* =========================================================
   SECTION 3 — INPUT VALIDATION HELPERS
   ========================================================= */
function posNum(id) {
  var el = document.getElementById(id);
  if (!el) return null;
  var raw = String(el.value).trim();
  if (raw === '') return null;
  var v = parseFloat(raw);
  if (isNaN(v) || !isFinite(v) || v <= 0) return null;
  return v;
}

function posInt(id) {
  var v = posNum(id);
  if (v === null) return null;
  return Math.floor(v);
}

function nonNegNum(id) {
  var el = document.getElementById(id);
  if (!el) return null;
  var raw = String(el.value).trim();
  if (raw === '') return null;
  var v = parseFloat(raw);
  if (isNaN(v) || !isFinite(v) || v < 0) return null;
  return v;
}

function getSelect(id) {
  var el = document.getElementById(id);
  if (!el) return '';
  return String(el.value || '');
}

/* =========================================================
   SECTION 4 — RESULT DISPLAY HELPERS
   ========================================================= */
function showResult(html) {
  var box = document.getElementById('result');
  if (!box) {
    if (window.console && console.warn) {
      console.warn('BuildMetric: #result container not found.');
    }
    return;
  }
  box.innerHTML = html;
  box.classList.add('show');
  box.style.display = 'block';
}

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

function clearResult() {
  var box = document.getElementById('result');
  if (!box) return;
  box.innerHTML = '';
  box.classList.remove('show');
}

function buildResultLine(label, value) {
  return (
    '<div class="result-line">' +
      '<span>' + label + '</span>' +
      '<span>' + value + '</span>' +
    '</div>'
  );
}

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
   SECTION 5 — FORM UTILITIES
   ========================================================= */
function resetForm(formId) {
  var form = document.getElementById(formId);
  if (form) form.reset();
  clearResult();
}

function setValue(id, value) {
  var el = document.getElementById(id);
  if (el) el.value = value;
}

function toggleVisibility(id, show) {
  var el = document.getElementById(id);
  if (!el) return;
  el.style.display = show ? 'block' : 'none';
}

/* =========================================================
   SECTION 6 — SMOOTH SCROLL FOR ANCHOR LINKS
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
   SECTION 7 — COPY RESULT TO CLIPBOARD
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
   SECTION 8 — UNIT CONVERSION HELPERS
   ========================================================= */
var Units = {
  feetToMetres: function (ft) { return ft * 0.3048; },
  metresToFeet: function (m) { return m / 0.3048; },
  inchesToCm: function (inch) { return inch * 2.54; },
  cmToInches: function (cm) { return cm / 2.54; },
  inchesToFeet: function (inch) { return inch / 12; },
  feetToInches: function (ft) { return ft * 12; },

  sqftToSqm: function (sqft) { return sqft * 0.092903; },
  sqmToSqft: function (sqm) { return sqm / 0.092903; },

  cubicFeetToCubicYards: function (cf) { return cf / 27; },
  cubicYardsToCubicFeet: function (cy) { return cy * 27; },
  cubicFeetToCubicMetres: function (cf) { return cf * 0.0283168; },
  cubicMetresToCubicFeet: function (cm) { return cm / 0.0283168; },
  litresToGallonsUS: function (l) { return l * 0.264172; },
  gallonsUSToLitres: function (g) { return g / 0.264172; },

  poundsToKg: function (lb) { return lb * 0.453592; },
  kgToPounds: function (kg) { return kg / 0.453592; }
};

/* =========================================================
   SECTION 9 — SAFE MATH WRAPPERS
   ========================================================= */
function safeDivide(a, b, fallback) {
  if (fallback === undefined) fallback = 0;
  var result = Number(a) / Number(b);
  if (!isFinite(result) || isNaN(result)) return fallback;
  return result;
}

function safeMultiply(a, b, fallback) {
  if (fallback === undefined) fallback = 0;
  var result = Number(a) * Number(b);
  if (!isFinite(result) || isNaN(result)) return fallback;
  return result;
}

/* =========================================================
   SECTION 10 — WASTE HELPER
   ========================================================= */
function applyWaste(quantity, wastePercent) {
  if (wastePercent === undefined || wastePercent === null) wastePercent = 0;
  var q = Number(quantity);
  var w = Number(wastePercent);
  if (!isFinite(q) || !isFinite(w) || q < 0 || w < 0) return 0;
  return q * (1 + w / 100);
}

/* =========================================================
   SECTION 11 — BAGGED-MATERIAL HELPER
   ========================================================= */
function bagsNeeded(totalVolume, yieldPerBag) {
  var tv = Number(totalVolume);
  var y = Number(yieldPerBag);
  if (!isFinite(tv) || !isFinite(y) || tv <= 0 || y <= 0) return 0;
  return Math.ceil(tv / y);
}

/* =========================================================
   SECTION 12 — FAQ ACCORDION
   ========================================================= */
function initFaqAccordion() {
  var faqItems = document.querySelectorAll('.faq-accordion');
  if (!faqItems.length) return;

  faqItems.forEach(function (item) {
    var button = item.querySelector('.faq-question');
    if (!button) return;

    button.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      // Close other FAQs (accordion behavior)
      faqItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          var otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('open', !isOpen);
      button.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });

    button.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });
  });
}

/* =========================================================
   SECTION 13 — UNIT TOGGLE SYSTEM (Imperial vs Metric)
   ========================================================= */
var BM_UNITS = {
  current: 'imperial',
  storageKey: 'bm_preferred_units',
  config: null,
  onChangeCallbacks: []
};

function detectPreferredUnits() {
  try {
    var saved = localStorage.getItem(BM_UNITS.storageKey);
    if (saved === 'imperial' || saved === 'metric') return saved;
  } catch (e) {}

  var lang = (navigator.language || navigator.userLanguage || 'en-US').toLowerCase();
  var imperialLocales = ['en-us', 'en-lr', 'en-mm', 'my-mm'];

  for (var i = 0; i < imperialLocales.length; i++) {
    if (lang.indexOf(imperialLocales[i]) === 0) return 'imperial';
  }
  return 'metric';
}

function savePreferredUnits(system) {
  try {
    localStorage.setItem(BM_UNITS.storageKey, system);
  } catch (e) {}
}

function onUnitChange(callback) {
  if (typeof callback === 'function') {
    BM_UNITS.onChangeCallbacks.push(callback);
  }
}

function setUnitSystem(system, options) {
  if (system !== 'imperial' && system !== 'metric') return;
  if (BM_UNITS.current === system && !(options && options.force)) return;

  var oldSystem = BM_UNITS.current;
  BM_UNITS.current = system;
  savePreferredUnits(system);

  updateUnitToggleUI();

  if (BM_UNITS.config) {
    updateFieldLabels(system);
    convertFieldValues(oldSystem, system);
  }

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

function updateUnitToggleUI() {
  var buttons = document.querySelectorAll('[data-unit-btn]');
  buttons.forEach(function (btn) {
    var btnSystem = btn.getAttribute('data-unit-btn');
    var isActive = (btnSystem === BM_UNITS.current);
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function updateFieldLabels(system) {
  var config = BM_UNITS.config;
  if (!config || !config.fields) return;

  Object.keys(config.fields).forEach(function (fieldId) {
    var field = config.fields[fieldId];
    var labelEl = document.querySelector('label[for="' + fieldId + '"]');
    if (labelEl && field.labels && field.labels[system]) {
      labelEl.textContent = field.labels[system];
    }
    var inputEl = document.getElementById(fieldId);
    if (inputEl && field.placeholders && field.placeholders[system]) {
      inputEl.setAttribute('placeholder', field.placeholders[system]);
    }
  });
}

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

    var factor = field.conversions[fromSystem + 'To' + capitalize(toSystem)];
    if (typeof factor === 'number' && isFinite(factor)) {
      var converted = numValue * factor;
      inputEl.value = roundTo(converted, field.decimals || 2);
    }
  });
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function initUnitToggle(toolConfig) {
  if (toolConfig) {
    BM_UNITS.config = toolConfig;
  }

  var preferred = detectPreferredUnits();
  BM_UNITS.current = preferred;

  updateUnitToggleUI();
  if (BM_UNITS.config) {
    updateFieldLabels(preferred);
  }

  var buttons = document.querySelectorAll('[data-unit-btn]');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var system = btn.getAttribute('data-unit-btn');
      setUnitSystem(system);
    });

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
   SECTION 14 — UNIT TOGGLE HTML BUILDER
   ========================================================= */
function buildUnitToggleHTML() {
  return (
    '<div class="unit-toggle" role="group" aria-label="Unit system">' +
      '<span class="unit-toggle-label">Units:</span>' +
      '<button type="button" class="unit-btn" data-unit-btn="imperial" aria-pressed="false">' +
        'Imperial (US)' +
      '</button>' +
      '<button type="button" class="unit-btn" data-unit-btn="metric" aria-pressed="false">' +
        'Metric (EU)' +
      '</button>' +
    '</div>'
  );
}

/* =========================================================
   SECTION 15 — FORMAT RESULT WITH UNITS
   ========================================================= */
function formatWithUnits(imperialValue, metricValue, imperialUnit, metricUnit) {
  if (BM_UNITS.current === 'metric') {
    return fmt(metricValue, 2) + ' ' + metricUnit;
  }
  return fmt(imperialValue, 2) + ' ' + imperialUnit;
}

function isMetric() {
  return BM_UNITS.current === 'metric';
}

function isImperial() {
  return BM_UNITS.current === 'imperial';
}


/* =========================================================
   SECTION 15.1 — PRINT & SHARE RESULT
   =========================================================
   Print/Save as PDF + native share for calculator results
   ========================================================= */

/* ---------------------------------------------------------
   15.1.1 PRINT RESULT
   Opens browser print dialog. User can save as PDF.
   --------------------------------------------------------- */
function printResult() {
  var resultBox = document.getElementById('result');
  if (!resultBox || !resultBox.classList.contains('show')) {
    if (window.console && console.warn) {
      console.warn('BuildMetric: Calculate first before printing.');
    }
    return;
  }
  window.print();
}

/* ---------------------------------------------------------
   15.1.2 SHARE RESULT
   Uses Web Share API if available, otherwise copies to clipboard.
   --------------------------------------------------------- */
function shareResult() {
  var resultBox = document.getElementById('result');
  if (!resultBox || !resultBox.classList.contains('show')) {
    if (window.console && console.warn) {
      console.warn('BuildMetric: Calculate first before sharing.');
    }
    return;
  }

  // Build share text
  var pageTitle = document.title || 'BuildMetric Calculator';
  var resultText = (resultBox.innerText || resultBox.textContent || '').trim();
  var pageUrl = window.location.href;

  var shareData = {
    title: pageTitle,
    text: resultText + '\n\nCalculated with BuildMetric — https://buildmetric.org',
    url: pageUrl
  };

  // Try Web Share API first (mobile + modern desktop)
  if (navigator.share) {
    navigator.share(shareData).catch(function (err) {
      // User cancelled or error — silently ignore
      if (err && err.name !== 'AbortError' && window.console) {
        console.warn('Share cancelled or failed:', err);
      }
    });
    return;
  }

  // Fallback: copy to clipboard
  var fallbackText = shareData.text + '\n' + pageUrl;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fallbackText).then(function () {
      flashCopyFeedback('Result copied — share anywhere!');
    }).catch(function () {
      legacyCopy(fallbackText);
    });
  } else {
    legacyCopy(fallbackText);
  }
}

/* ---------------------------------------------------------
   15.1.3 LEGACY COPY FALLBACK
   --------------------------------------------------------- */
function legacyCopy(text) {
  var temp = document.createElement('textarea');
  temp.value = text;
  temp.style.position = 'fixed';
  temp.style.opacity = '0';
  document.body.appendChild(temp);
  temp.select();
  try {
    document.execCommand('copy');
    flashCopyFeedback('Result copied — share anywhere!');
  } catch (e) {
    flashCopyFeedback('Press Ctrl+C to copy');
  }
  document.body.removeChild(temp);
}
/* =========================================================
   SECTION 16 — EXPOSE GLOBAL API
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
  initFaqAccordion: initFaqAccordion,

  // Helpers
  fmt: fmt,
  roundTo: roundTo,
  posNum: posNum,
  posInt: posInt,
  nonNegNum: nonNegNum,
  getSelect: getSelect,
  showResult: showResult,
  showError: showError,
  clearResult: clearResult,
  buildResultLine: buildResultLine,
  buildResultBlock: buildResultBlock,
  resetForm: resetForm,
  setValue: setValue,
  toggleVisibility: toggleVisibility,
  copyResultToClipboard: copyResultToClipboard,
  Units: Units,
  safeDivide: safeDivide,
  safeMultiply: safeMultiply,
  applyWaste: applyWaste,
  bagsNeeded: bagsNeeded
};

 // Print & Share (naya)
 printResult: printResult,
 shareResult: shareResult

/* =========================================================
   END OF SCRIPT
   BuildMetric — Shared JavaScript
   Total: 16 sections
   ========================================================= */
