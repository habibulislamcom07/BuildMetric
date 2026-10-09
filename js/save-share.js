/* ==================== SAVE-SHARE.JS ==================== */

(function() {
    'use strict';

    // ==================== SAVE RESULT ====================
    window.saveResult = function(toolName, inputs, result) {
        try {
            const saved = JSON.parse(localStorage.getItem('buildmetric_saved') || '[]');
            
            const entry = {
                id: Date.now(),
                tool: toolName,
                inputs: inputs,
                result: result,
                date: new Date().toISOString(),
                url: window.location.href
            };
            
            saved.unshift(entry);
            
            // Keep only last 50 results
            if (saved.length > 50) {
                saved.splice(50);
            }
            
            localStorage.setItem('buildmetric_saved', JSON.stringify(saved));
            
            showToast('✓ Result saved to your browser');
            return true;
        } catch (e) {
            showToast('✗ Could not save result');
            return false;
        }
    };

    // ==================== COPY RESULT ====================
    window.copyResult = function(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                showToast('✓ Copied to clipboard');
            }).catch(function() {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    };

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            showToast('✓ Copied to clipboard');
        } catch (e) {
            showToast('✗ Copy failed');
        }
        
        document.body.removeChild(textarea);
    }

    // ==================== SHARE RESULT ====================
    window.shareResult = function(toolName, result, url) {
        const shareData = {
            title: 'BuildMetric — ' + toolName,
            text: 'Check my ' + toolName + ' result: ' + result,
            url: url || window.location.href
        };

        // Native share (mobile)
        if (navigator.share) {
            navigator.share(shareData).catch(function() {
                // User cancelled or error
            });
        } else {
            // Desktop fallback — show share menu
            showShareMenu(shareData);
        }
    };

    function showShareMenu(shareData) {
        const encodedUrl = encodeURIComponent(shareData.url);
        const encodedText = encodeURIComponent(shareData.text);
        
        const menu = document.createElement('div');
        menu.className = 'share-menu';
        menu.innerHTML = `
            <div class="share-menu-content">
                <h3>Share this result</h3>
                <div class="share-options">
                    <a href="https://wa.me/?text=${encodedText}%20${encodedUrl}" 
                       target="_blank" rel="noopener" class="share-option whatsapp">
                        <span>💬</span> WhatsApp
                    </a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" 
                       target="_blank" rel="noopener" class="share-option facebook">
                        <span>📘</span> Facebook
                    </a>
                    <a href="https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}" 
                       target="_blank" rel="noopener" class="share-option twitter">
                        <span>🐦</span> Twitter / X
                    </a>
                    <a href="mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodedText}%20${encodedUrl}" 
                       class="share-option email">
                        <span>✉️</span> Email
                    </a>
                    <button class="share-option copy-link" onclick="copyResult('${shareData.url}')">
                        <span>🔗</span> Copy Link
                    </button>
                </div>
                <button class="share-close" onclick="this.closest('.share-menu').remove()">Close</button>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Close on outside click
        menu.addEventListener('click', function(e) {
            if (e.target === menu) menu.remove();
        });
        
        // Close on escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const m = document.querySelector('.share-menu');
                if (m) m.remove();
            }
        }, { once: true });
    }

    // ==================== RESET ====================
    window.resetTool = function(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            const result = document.querySelector('.tool-result');
            if (result) result.innerHTML = '';
        }
    };

    // ==================== LOAD SAVED RESULT FROM URL ====================
    function loadFromUrl() {
        const params = new URLSearchParams(window.location.search);
        if (params.toString() === '') return;
        
        // Auto-fill form fields from URL params
        params.forEach(function(value, key) {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = value;
                // Trigger change event
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }

    // ==================== TOAST NOTIFICATION ====================
    function showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(function() {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(function() {
            toast.classList.remove('show');
            setTimeout(function() {
                toast.remove();
            }, 300);
        }, 2500);
    }

    // ==================== INIT ====================
    document.addEventListener('DOMContentLoaded', function() {
        loadFromUrl();
    });

})();
