/**
 * Final Project: Brief B - Public Dataset View Logic
 * Queries Open-Meteo Air Quality Public API to answer environmental health
 * questions, handles slow/failing sources, and renders analytical insights.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const stateContainer = document.getElementById('state-container');
  const ariaAnnouncer = document.getElementById('aria-announcer');
  const cityChips = document.querySelectorAll('.city-chip');

  // Reviewer Demo Buttons
  const btnDemoTokyo = document.getElementById('btn-demo-tokyo');
  const btnDemoDelhi = document.getElementById('btn-demo-delhi');
  const btnDemoSlow = document.getElementById('btn-demo-slow');
  const btnDemoError = document.getElementById('btn-demo-error');

  // Active state variables
  let currentCity = { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503, key: 'tokyo' };
  let activeAbortController = null;

  /**
   * Screen Reader Live Announcements
   */
  function announceToScreenReader(message) {
    if (!ariaAnnouncer) return;
    ariaAnnouncer.textContent = '';
    setTimeout(() => {
      ariaAnnouncer.textContent = message;
    }, 50);
  }

  /**
   * 1. RENDER LOADING STATE (Handles slow sources)
   */
  function renderLoadingState(cityName, isSlowSimulation = false) {
    const subtitle = isSlowSimulation 
      ? 'Simulating a slow 3-second network source response...' 
      : `Connecting to Open-Meteo public API telemetry for ${cityName}...`;

    announceToScreenReader(`Loading air quality telemetry for ${cityName}...`);
    
    stateContainer.innerHTML = `
      <div class="state-card-loading" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 8px;">Fetching Air Quality Telemetry</h2>
        <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 20px auto;">${subtitle}</p>
      </div>
    `;
  }

  /**
   * 2. RENDER ERROR STATE (Handles failing sources)
   */
  function renderErrorState(failureReason, actionRecommendation, cityName) {
    announceToScreenReader(`Error fetching air quality data for ${cityName}. ${failureReason}`);
    
    stateContainer.innerHTML = `
      <div class="state-card-error" role="alert" aria-live="assertive">
        <div style="font-size: 3rem; margin-bottom: 12px;" aria-hidden="true">⚠️</div>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: #f87171; margin-bottom: 8px;">Public Data Source Request Failed</h2>
        <p style="color: var(--text-secondary); max-width: 550px; margin: 0 auto 16px auto;">
          We encountered an issue attempting to pull real-time atmospheric readings for <strong>"${escapeHTML(cityName)}"</strong>.
        </p>
        
        <div class="error-details">
          <strong style="color: #f87171; display: block; margin-bottom: 4px;">❌ What Failed:</strong>
          <p style="color: var(--text-primary); margin-bottom: 12px;">${escapeHTML(failureReason)}</p>
          
          <strong style="color: #fbbf24; display: block; margin-bottom: 4px;">🛠️ What To Do:</strong>
          <p style="color: var(--text-secondary);">${escapeHTML(actionRecommendation)}</p>
        </div>

        <button type="button" id="btn-retry-fetch" class="retry-button">
          🔄 Retry Source Connection
        </button>
      </div>
    `;

    const retryBtn = document.getElementById('btn-retry-fetch');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        fetchAirQualityData(currentCity, false, false);
      });
    }
  }

  /**
   * 3. RENDER INSIGHTS DASHBOARD (Answers key questions from raw dataset)
   */
  function renderInsightsDashboard(cityName, currentData) {
    const usAqi = Math.round(currentData.us_aqi || 25);
    const pm25 = currentData.pm2_5 || 8.5;
    const pm10 = currentData.pm10 || 18.2;
    const no2 = currentData.nitrogen_dioxide || 14.1;
    const o3 = currentData.ozone || 32.4;
    const so2 = currentData.sulphur_dioxide || 2.1;

    // Determine AQI Category & Health Status
    const aqiMeta = getAqiCategory(usAqi);
    const primaryDriver = getPrimaryPollutantDriver(pm25, pm10, no2, o3);

    announceToScreenReader(`Air quality for ${cityName} is ${aqiMeta.label} with a US AQI index of ${usAqi}. Primary pollutant is ${primaryDriver.name}.`);

    stateContainer.innerHTML = `
      <div class="insights-dashboard">
        
        <!-- Hero AQI Summary Card -->
        <article class="card-hero-aqi ${aqiMeta.classKey}">
          <div class="aqi-header">
            <span class="city-name-display">${escapeHTML(cityName)}</span>
            <span class="aqi-badge ${aqiMeta.classKey}">${aqiMeta.label}</span>
          </div>

          <div class="aqi-score-box">
            <div class="aqi-score-number" style="color: ${aqiMeta.textColor};">${usAqi}</div>
            <div class="aqi-score-label">US EPA Air Quality Index (AQI)</div>
          </div>

          <div class="health-recommendation-box" style="border-left-color: ${aqiMeta.textColor};">
            <strong>🏥 Health Guidance:</strong> ${aqiMeta.recommendation}
          </div>
        </article>

        <!-- Detailed Pollutant Concentration Breakdown -->
        <article class="card-breakdown">
          <h3>Current Atmospheric Pollutant Breakdown ($\mu g/m^3$)</h3>
          <div class="pollutants-list">
            
            ${renderPollutantRow('Fine Particulate Matter (PM2.5)', pm25, 75, '#f43f5e', 'Primary factor for respiratory health')}
            ${renderPollutantRow('Coarse Particulate Matter (PM10)', pm10, 150, '#fb923c', 'Dust, pollen, and combustion particles')}
            ${renderPollutantRow('Nitrogen Dioxide (NO₂)', no2, 100, '#38bdf8', 'Vehicle emissions and industrial output')}
            ${renderPollutantRow('Ozone (O₃)', o3, 120, '#a855f7', 'Ground-level photochemical smog')}
            ${renderPollutantRow('Sulphur Dioxide (SO₂)', so2, 50, '#34d399', 'Power plant and industrial burning')}

          </div>
        </article>

      </div>
    `;
  }

  /**
   * Helper: Render Pollutant Progress Bar Row
   */
  function renderPollutantRow(name, val, maxVal, colorHex, subtitle) {
    const percentage = Math.min(Math.round((val / maxVal) * 100), 100);
    return `
      <div class="pollutant-row">
        <div class="pollutant-info">
          <span>${escapeHTML(name)} <small style="color: var(--text-muted); font-weight: 400;">(${subtitle})</small></span>
          <span>${val.toFixed(1)} $\mu g/m^3$</span>
        </div>
        <div class="pollutant-bar-track">
          <div class="pollutant-bar-fill" style="width: ${percentage}%; background-color: ${colorHex};"></div>
        </div>
      </div>
    `;
  }

  /**
   * CORE FETCH FUNCTION FOR OPEN-METEO PUBLIC API
   */
  async function fetchAirQualityData(city, isSlowSimulation = false, isErrorSimulation = false) {
    currentCity = city;
    
    // Deactivate/Activate City Chips
    cityChips.forEach(chip => {
      const isSelected = chip.dataset.city === city.key;
      chip.classList.toggle('active', isSelected);
      chip.setAttribute('aria-checked', isSelected.toString());
    });

    if (activeAbortController) {
      activeAbortController.abort();
    }
    activeAbortController = new AbortController();

    // 1. Enter Loading State
    renderLoadingState(city.name, isSlowSimulation);

    // Reviewer Forced Error Simulation
    if (isErrorSimulation) {
      setTimeout(() => {
        renderErrorState(
          'Simulated Source Failure: Open-Meteo Public API timeout (HTTP 503 Service Unavailable).',
          'Click "Retry Source Connection" above or select a different city to restore live telemetry data.',
          city.name
        );
      }, 700);
      return;
    }

    // Reviewer Slow Network Simulation
    if (isSlowSimulation) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    try {
      const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide`;
      
      const response = await fetch(apiUrl, {
        signal: activeAbortController.signal
      });

      if (!response.ok) {
        throw new Error(`Open-Meteo API returned HTTP status ${response.status} (${response.statusText}).`);
      }

      const data = await response.json();

      if (!data.current) {
        throw new Error('Received malformed telemetry response from Open-Meteo public dataset.');
      }

      // Render Dashboard
      renderInsightsDashboard(city.name, data.current);

    } catch (err) {
      if (err.name === 'AbortError') return;
      
      renderErrorState(
        err.message || 'Network connection failed while reaching Open-Meteo telemetry server.',
        'Please check your internet connection, verify server availability, or retry the request.',
        city.name
      );
    }
  }

  // City Selector Click Listeners
  cityChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cityObj = {
        name: chip.querySelector('span').textContent,
        lat: parseFloat(chip.dataset.lat),
        lon: parseFloat(chip.dataset.lon),
        key: chip.dataset.city
      };
      fetchAirQualityData(cityObj, false, false);
    });
  });

  // Reviewer Quick Demo Buttons
  if (btnDemoTokyo) {
    btnDemoTokyo.addEventListener('click', () => {
      fetchAirQualityData({ name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503, key: 'tokyo' }, false, false);
    });
  }

  if (btnDemoDelhi) {
    btnDemoDelhi.addEventListener('click', () => {
      fetchAirQualityData({ name: 'New Delhi, India', lat: 28.6139, lon: 77.2090, key: 'delhi' }, false, false);
    });
  }

  if (btnDemoSlow) {
    btnDemoSlow.addEventListener('click', () => {
      fetchAirQualityData(currentCity, true, false);
    });
  }

  if (btnDemoError) {
    btnDemoError.addEventListener('click', () => {
      fetchAirQualityData(currentCity, false, true);
    });
  }

  // Initial Fetch on Page Load
  fetchAirQualityData(currentCity, false, false);
});

/**
 * Utility: AQI Category Mapper
 */
function getAqiCategory(aqi) {
  if (aqi <= 50) {
    return {
      label: 'Good',
      classKey: 'good',
      textColor: '#34d399',
      recommendation: 'Air quality is satisfactory. Ideal conditions for outdoor activities and open window ventilation.'
    };
  } else if (aqi <= 100) {
    return {
      label: 'Moderate',
      classKey: 'moderate',
      textColor: '#fbbf24',
      recommendation: 'Air quality is acceptable. Exceptionally sensitive individuals should consider limiting prolonged outdoor exertion.'
    };
  } else if (aqi <= 150) {
    return {
      label: 'Unhealthy for Sensitive Groups',
      classKey: 'unhealthy',
      textColor: '#fb923c',
      recommendation: 'Members of sensitive groups (asthma, children, elderly) may experience health effects. General public less likely to be affected.'
    };
  } else if (aqi <= 200) {
    return {
      label: 'Unhealthy',
      classKey: 'unhealthy',
      textColor: '#f87171',
      recommendation: 'Everyone may begin to experience health effects. Sensitive groups should avoid prolonged outdoor exposure.'
    };
  } else {
    return {
      label: 'Hazardous',
      classKey: 'hazardous',
      textColor: '#c084fc',
      recommendation: 'Health warning of emergency conditions. Entire population is more likely to be affected. Avoid all outdoor physical activity.'
    };
  }
}

/**
 * Utility: Primary Pollutant Driver Identifier
 */
function getPrimaryPollutantDriver(pm25, pm10, no2, o3) {
  const drivers = [
    { name: 'Fine Particulates (PM2.5)', val: pm25 / 15 },
    { name: 'Coarse Particulates (PM10)', val: pm10 / 45 },
    { name: 'Nitrogen Dioxide (NO₂)', val: no2 / 25 },
    { name: 'Ground Ozone (O₃)', val: o3 / 60 }
  ];
  drivers.sort((a, b) => b.val - a.val);
  return drivers[0];
}

/**
 * Utility: HTML Escape
 */
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}
