/**
 * Accessible Plan Comparison Table - Application Logic
 * Implements keyboard accessibility, ARIA live region announcements,
 * difference highlighting, and mobile plan column filter controls.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const table = document.getElementById('comparison-table');
  const highlightToggle = document.getElementById('highlight-toggle');
  const ariaAnnouncer = document.getElementById('aria-announcer');
  const planTabs = document.querySelectorAll('.plan-tab');
  const ctaButtons = document.querySelectorAll('.cta-button');

  // Count total features and differing features
  const featureRows = document.querySelectorAll('.feature-row');
  const totalFeatures = featureRows.length;
  const differingFeatures = document.querySelectorAll('.feature-row[data-different="true"]').length;

  /**
   * Helper function to announce messages to screen readers via aria-live
   * @param {string} message - The text to be announced
   */
  function announceToScreenReader(message) {
    if (!ariaAnnouncer) return;
    ariaAnnouncer.textContent = '';
    // Small timeout ensures screen readers detect text mutation
    setTimeout(() => {
      ariaAnnouncer.textContent = message;
    }, 50);
  }

  /**
   * Toggle Difference Highlighting State
   */
  function toggleHighlightDifferences() {
    const isCurrentlyChecked = highlightToggle.getAttribute('aria-checked') === 'true';
    const newCheckedState = !isCurrentlyChecked;

    // Update ARIA state on switch button
    highlightToggle.setAttribute('aria-checked', newCheckedState.toString());

    // Update Table visual class
    if (newCheckedState) {
      table.classList.add('highlight-diff-active');
      announceToScreenReader(
        `Highlighting differences active. ${differingFeatures} of ${totalFeatures} features differ across plans.`
      );
    } else {
      table.classList.remove('highlight-diff-active');
      announceToScreenReader('Highlighting differences turned off. Showing standard view.');
    }
  }

  // Event Listener: Highlight Switch Click
  if (highlightToggle) {
    highlightToggle.addEventListener('click', toggleHighlightDifferences);

    // Ensure Keyboard Support (Space and Enter)
    highlightToggle.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault(); // Prevent default scroll on Space
        toggleHighlightDifferences();
      }
    });
  }

  /**
   * Mobile Plan Tab Switcher Logic
   */
  planTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // Deactivate all tabs
      planTabs.forEach((t) => {
        t.setAttribute('aria-selected', 'false');
        t.classList.remove('active');
      });

      // Activate clicked tab
      tab.setAttribute('aria-selected', 'true');
      tab.classList.add('active');

      // Extract target filter name from tab ID (tab-all -> all, tab-starter -> starter, etc.)
      const filterName = tab.id.replace('tab-', '');
      
      if (filterName === 'all') {
        table.removeAttribute('data-filter-plan');
        announceToScreenReader('Showing all plans in comparison table.');
      } else {
        table.setAttribute('data-filter-plan', filterName);
        const planCapitalized = filterName.charAt(0).toUpperCase() + filterName.slice(1);
        announceToScreenReader(`Filtering table to show ${planCapitalized} plan features.`);
      }
    });
  });

  /**
   * CTA Button Click Feedback (Accessible interactive feedback)
   */
  ctaButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const planLabel = btn.getAttribute('aria-label') || btn.textContent.trim();
      announceToScreenReader(`Action confirmed: ${planLabel}`);
      
      // Visual feedback ripple effect
      const originalText = btn.textContent;
      btn.textContent = 'Selected ✓';
      btn.style.opacity = '0.85';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.opacity = '1';
      }, 2000);
    });
  });
});
