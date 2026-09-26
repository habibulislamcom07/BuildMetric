/* =========================================================
   BuildMetric — Tool Actions Script
   File: assets/js/script.js
   Handles: Print, Share (Web Share API + clipboard fallback)
   ========================================================= */

'use strict';

/* =========================================================
   SECTION 1 — PRINT RESULT (Save as PDF)
   ========================================================= */
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

/* =========================================================
   SECTION 2 — SHARE CALCULATOR
   Uses Web Share API if available, otherwise copies to clipboard.
   ========================================================= */
function shareCalculator() {
  var pageTitle = document.title || 'BuildMetric Calculator';
  var pageUrl = window.location.href;

  var resultBox = document.getElementById('result');
  var resultText = '';
  if (resultBox && resultBox.classList.contains('show')) {
    resultText = (resultBox.innerText || resultBox.textContent || '').trim();
  }

  var shareText = resultText
    ? resultText + '\n\nCalculated with BuildMetric — ' + pageUrl
    : 'Check out this free calculator on BuildMetric — ' + pageUrl;

  var shareData = {
    title: pageTitle,
    text: shareText,
    url: pageUrl
  };

  // Try Web Share API first (mobile + modern desktop)
  if (navigator.share) {
    navigator.share(shareData).catch(function (err) {
      if (err && err.name !== 'AbortError' && window.console) {
        console.warn('Share cancelled or failed:', err);
      }
    });
    return;
  }

  // Fallback: copy to clipboard
  var fallbackText = shareData.text;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fallbackText).then(function () {
      showToast('Link copied to clipboard!');
    }).catch(function () {
      legacyCopy(fallbackText);
    });
  } else {
    legacyCopy(fallbackText);
  }
}

/* =========================================================
   SECTION 3 — LEGACY COPY FALLBACK (for older browsers)
   ========================================================= */
function legacyCopy(text) {
  var temp = document.createElement('textarea');
  temp.value = text;
  temp.style.position = 'fixed';
  temp.style.opacity = '0';
  document.body.appendChild(temp);
  temp.select();
  try {
    document.execCommand('copy');
    showToast('Link copied to clipboard!');
  } catch (e) {
    showToast('Press Ctrl+C to copy');
  }
  document.body.removeChild(temp);
}

/* =========================================================
   SECTION 4 — TOAST NOTIFICATION
   ========================================================= */
function showToast(message) {
  var existing = document.getElementById('bm-toast');
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }

  var toast = document.createElement('div');
  toast.id = 'bm-toast';
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
  }, 1800);
}

/* =========================================================
   SECTION 5 — EXPOSE GLOBALLY
   ========================================================= */
window.printResult = printResult;
window.shareCalculator = shareCalculator;

/* =========================================================
   END OF SCRIPT
   BuildMetric — Tool Actions Script
   Total: 5 Sections
   ========================================================= */
