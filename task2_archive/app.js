/**
 * Task 2: Public Repository Search App - Logic & State Handling
 * Implements real GitHub API fetching with distinct Loading, Error,
 * Empty, and Success states, screen reader live announcements, and
 * reviewer quick-testing controls.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const stateContainer = document.getElementById('state-container');
  const ariaAnnouncer = document.getElementById('aria-announcer');
  const simulateErrorSwitch = document.getElementById('simulate-error-switch');

  // Reviewer Demo Buttons
  const btnDemoSuccess = document.getElementById('btn-demo-success');
  const btnDemoEmpty = document.getElementById('btn-demo-empty');
  const btnDemoError = document.getElementById('btn-demo-error');
  const btnDemoLoading = document.getElementById('btn-demo-loading');

  // Global State Variables
  let isForcedErrorActive = false;
  let activeAbortController = null;

  /**
   * Helper function to announce messages to screen readers via aria-live
   * @param {string} message - Text announcement
   */
  function announceToScreenReader(message) {
    if (!ariaAnnouncer) return;
    ariaAnnouncer.textContent = '';
    setTimeout(() => {
      ariaAnnouncer.textContent = message;
    }, 50);
  }

  /**
   * Toggle Simulated Error Switch
   */
  function toggleErrorSimulation() {
    isForcedErrorActive = !isForcedErrorActive;
    simulateErrorSwitch.setAttribute('aria-checked', isForcedErrorActive.toString());
    const statusMsg = isForcedErrorActive
      ? 'Error simulation turned ON. Next search request will fail.'
      : 'Error simulation turned OFF. Standard search restored.';
    announceToScreenReader(statusMsg);
  }

  if (simulateErrorSwitch) {
    simulateErrorSwitch.addEventListener('click', toggleErrorSimulation);
  }

  /**
   * 1. RENDER LOADING STATE
   * @param {string} query - The search query being fetched
   */
  function renderLoadingState(query) {
    announceToScreenReader(`Searching public GitHub repositories for '${query}'...`);
    stateContainer.innerHTML = `
      <div class="state-card state-loading" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <h2 class="state-title">Searching GitHub Repositories</h2>
        <p class="state-description">Fetching public repositories matching <strong>"${escapeHTML(query)}"</strong> from GitHub REST API...</p>
        
        <div class="skeleton-grid" aria-hidden="true">
          <div class="skeleton-card">
            <div class="skeleton-line title"></div>
            <div class="skeleton-line text"></div>
            <div class="skeleton-line text"></div>
            <div class="skeleton-line short"></div>
          </div>
          <div class="skeleton-card">
            <div class="skeleton-line title"></div>
            <div class="skeleton-line text"></div>
            <div class="skeleton-line text"></div>
            <div class="skeleton-line short"></div>
          </div>
          <div class="skeleton-card">
            <div class="skeleton-line title"></div>
            <div class="skeleton-line text"></div>
            <div class="skeleton-line text"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 2. RENDER EMPTY STATE (Search Succeeded, 0 Matches)
   * Presented explicitly as a SUCCESSFUL RESULT, NOT an error.
   * @param {string} query - The search query that returned no results
   */
  function renderEmptyState(query) {
    announceToScreenReader(`Search completed successfully. No public repositories matched '${query}'.`);
    stateContainer.innerHTML = `
      <div class="state-card state-empty" role="region" aria-label="Search Result: No Matching Repositories">
        <span class="badge-status">Search Succeeded</span>
        <div class="state-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </div>
        <h2 class="state-title">No Matching Repositories Found</h2>
        <p class="state-description">Your search for <strong>"${escapeHTML(query)}"</strong> completed successfully, but returned <strong>0 public repositories</strong>.</p>
        <div class="error-details-box" style="border-color: rgba(245, 158, 11, 0.3); background: rgba(15, 23, 42, 0.6);">
          <strong style="color: #fbbf24;">💡 What you can do:</strong>
          <ul style="margin-left: 20px; color: var(--text-secondary); line-height: 1.6;">
            <li>Check for spelling errors or typos in your search query.</li>
            <li>Try searching for broader keywords (e.g. <code>react</code> instead of <code>react-custom-xyz-123</code>).</li>
            <li>Use different programming language keywords or topic names.</li>
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * 3. RENDER ERROR STATE (Request Failed)
   * Clearly specifies WHAT FAILED and WHAT TO DO.
   * @param {string} failureReason - Explanation of the failure
   * @param {string} actionRecommendation - Recommended solution for the user
   * @param {string} query - Search query attempted
   */
  function renderErrorState(failureReason, actionRecommendation, query) {
    announceToScreenReader(`Error: Search request failed for '${query}'. ${failureReason}`);
    stateContainer.innerHTML = `
      <div class="state-card state-error" role="alert" aria-live="assertive">
        <div class="state-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h2 class="state-title" style="color: #f87171;">Request Failed</h2>
        <p class="state-description">We encountered a problem while trying to fetch search results for <strong>"${escapeHTML(query)}"</strong>.</p>
        
        <div class="error-details-box">
          <strong>❌ What Failed:</strong>
          <p style="margin-bottom: 10px; color: var(--text-primary);">${escapeHTML(failureReason)}</p>
          
          <strong>🛠️ What To Do:</strong>
          <p style="color: var(--text-secondary);">${escapeHTML(actionRecommendation)}</p>
        </div>

        <button type="button" id="btn-retry-search" class="retry-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
          Retry Search Request
        </button>
      </div>
    `;

    // Attach listener to retry button
    const retryBtn = document.getElementById('btn-retry-search');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        executeSearch(query);
      });
    }
  }

  /**
   * 4. RENDER SUCCESS RESULTS GRID
   * @param {Array} repos - Array of GitHub repository objects
   * @param {number} totalCount - Total matching count from GitHub API
   * @param {string} query - Search query
   */
  function renderResultsGrid(repos, totalCount, query) {
    announceToScreenReader(`Found ${totalCount.toLocaleString()} repositories for '${query}'. Showing top ${repos.length}.`);
    
    const cardsHTML = repos.map((repo) => {
      const langColor = getLanguageColor(repo.language);
      return `
        <article class="repo-card">
          <div>
            <div class="repo-card-header">
              <img src="${repo.owner.avatar_url}" alt="${escapeHTML(repo.owner.login)} owner avatar" class="owner-avatar" loading="lazy" />
              <div class="repo-title-wrapper">
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-name" title="View ${escapeHTML(repo.name)} on GitHub">
                  ${escapeHTML(repo.name)}
                </a>
                <span class="repo-owner">by ${escapeHTML(repo.owner.login)}</span>
              </div>
            </div>
            <p class="repo-description">${escapeHTML(repo.description || 'No description provided for this repository.')}</p>
          </div>
          
          <div class="repo-meta">
            ${repo.language ? `
              <div class="meta-item">
                <span class="lang-dot" style="background-color: ${langColor};"></span>
                <span>${escapeHTML(repo.language)}</span>
              </div>
            ` : ''}
            <div class="meta-item" title="${repo.stargazers_count.toLocaleString()} stars">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true" style="color: #fbbf24;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>${formatNumber(repo.stargazers_count)}</span>
            </div>
            <div class="meta-item" title="${repo.forks_count.toLocaleString()} forks">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
              <span>${formatNumber(repo.forks_count)}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    stateContainer.innerHTML = `
      <div>
        <div class="results-header">
          <h2 class="results-count">
            Found <span>${totalCount.toLocaleString()}</span> public repositories for "<span>${escapeHTML(query)}</span>"
          </h2>
        </div>
        <div class="repo-grid">
          ${cardsHTML}
        </div>
      </div>
    `;
  }

  /**
   * CORE SEARCH EXECUTION FUNCTION
   * @param {string} query - Query string to search
   */
  async function executeSearch(query) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      renderErrorState(
        'The search input box was submitted empty.',
        'Please enter a search keyword such as "react", "python", or "vue" and try again.',
        query
      );
      return;
    }

    // Cancel any pending fetch request
    if (activeAbortController) {
      activeAbortController.abort();
    }
    activeAbortController = new AbortController();

    // 1. Enter Loading State
    renderLoadingState(trimmedQuery);

    // Check if reviewer forced simulated error switch is enabled
    if (isForcedErrorActive) {
      setTimeout(() => {
        renderErrorState(
          'Simulated Server/Network Error (Forced by Reviewer Toggle Switch).',
          'Turn off the "Simulate Request Failure" toggle switch above, or click Retry Search to run a standard request.',
          trimmedQuery
        );
      }, 800);
      return;
    }

    try {
      // Fetch from GitHub REST API
      const apiUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(trimmedQuery)}&sort=stars&order=desc&per_page=12`;
      const response = await fetch(apiUrl, {
        signal: activeAbortController.signal,
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      // Handle non-200 HTTP response codes
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded (HTTP 403). Please wait 1 minute before retrying.');
        } else if (response.status === 422) {
          throw new Error('GitHub API validation failed (HTTP 422: Unprocessable Entity). Your query syntax was invalid.');
        } else {
          throw new Error(`GitHub API returned HTTP status ${response.status} (${response.statusText}).`);
        }
      }

      const data = await response.json();

      // 2. Check for EMPTY STATE (0 results)
      if (!data.items || data.items.length === 0) {
        renderEmptyState(trimmedQuery);
      } else {
        // 3. Render SUCCESS RESULTS GRID
        renderResultsGrid(data.items, data.total_count, trimmedQuery);
      }

    } catch (err) {
      if (err.name === 'AbortError') return; // Ignore aborted requests
      
      // Render ERROR STATE
      renderErrorState(
        err.message || 'Failed to connect to the GitHub Search API due to a network error.',
        'Check your internet connection, verify your search query format, or try again in a few moments.',
        trimmedQuery
      );
    }
  }

  // Event Listener: Search Form Submission
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      executeSearch(searchInput.value);
    });
  }

  // REVIEWER DEMO BUTTON EVENT LISTENERS
  if (btnDemoSuccess) {
    btnDemoSuccess.addEventListener('click', () => {
      searchInput.value = 'react';
      if (isForcedErrorActive) toggleErrorSimulation();
      executeSearch('react');
    });
  }

  if (btnDemoEmpty) {
    btnDemoEmpty.addEventListener('click', () => {
      searchInput.value = 'qwertyuiopxyz9999';
      if (isForcedErrorActive) toggleErrorSimulation();
      executeSearch('qwertyuiopxyz9999');
    });
  }

  if (btnDemoError) {
    btnDemoError.addEventListener('click', () => {
      searchInput.value = 'invalid:syntax:%%%';
      renderErrorState(
        'Failed to fetch repositories from GitHub API: HTTP 422 (Unprocessable Entity).',
        'Check your search parameters, ensure no invalid query syntax is used, or click Retry Search.',
        'invalid:syntax:%%%'
      );
    });
  }

  if (btnDemoLoading) {
    btnDemoLoading.addEventListener('click', () => {
      renderLoadingState('demonstration-loading-query');
    });
  }

  // Initial Search Execution on Page Load
  executeSearch('react');
});

/**
 * Utility: Escape HTML to prevent XSS injection
 */
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

/**
 * Utility: Format number (e.g. 12500 -> 12.5k)
 */
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

/**
 * Utility: Popular Language Color Mapping
 */
function getLanguageColor(lang) {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    HTML: '#e34c26',
    CSS: '#563d7c',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Kotlin: '#A97BFF'
  };
  return colors[lang] || '#818cf8';
}
