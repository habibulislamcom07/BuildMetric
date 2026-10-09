/* ==================== SEARCH.JS ==================== */

(function() {
    'use strict';

    // ==================== SEARCH FUNCTION ====================
    function performSearch(query) {
        const trimmed = query.trim();
        
        if (!trimmed) {
            return false;
        }
        
        // Redirect to search page with query
        window.location.href = '/search.html?q=' + encodeURIComponent(trimmed);
        return true;
    }

    // ==================== HEADER SEARCH ====================
    const headerSearchInput = document.getElementById('headerSearch');
    const headerSearchBtn = headerSearchInput?.nextElementSibling;

    if (headerSearchInput && headerSearchBtn) {
        headerSearchBtn.addEventListener('click', function() {
            performSearch(headerSearchInput.value);
        });

        headerSearchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(this.value);
            }
        });
    }

    // ==================== HERO SEARCH ====================
    const heroSearchForm = document.querySelector('.hero-search');
    
    if (heroSearchForm) {
        heroSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = this.querySelector('input[name="q"]');
            if (input) {
                performSearch(input.value);
            }
        });
    }

    // ==================== SEARCH PAGE — FILTER RESULTS ====================
    const searchPageInput = document.getElementById('searchPageInput');
    const searchResults = document.querySelectorAll('.search-result-item');

    if (searchPageInput && searchResults.length > 0) {
        // Get query from URL
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';
        
        searchPageInput.value = query;
        
        if (query) {
            filterResults(query);
        }
        
        searchPageInput.addEventListener('input', function() {
            filterResults(this.value);
        });
    }

    function filterResults(query) {
        const trimmed = query.toLowerCase().trim();
        let visibleCount = 0;
        
        searchResults.forEach(function(item) {
            const text = item.textContent.toLowerCase();
            const match = !trimmed || text.includes(trimmed);
            
            item.style.display = match ? '' : 'none';
            if (match) visibleCount++;
        });
        
        // Show "no results" message
        const noResults = document.getElementById('noResults');
        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
        
        // Update results count
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = visibleCount;
        }
    }

})();
