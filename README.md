# Global Air Quality & Environmental Health Insights Explorer (Brief B)

A responsive, WCAG-accessible web application built for **Final Project Brief B (A view onto a public dataset)**. It queries the live [Open-Meteo Air Quality Public API](https://open-meteo.com/en/docs/air-quality-api) to make complex atmospheric telemetry findable, comparable, and actionable across major metropolitan hubs.

---

## 🌐 Live Application & Repository Links

- 🌐 **Deployed Live URL:** [https://devconnect-task1.surge.sh](https://devconnect-task1.surge.sh)
- 📂 **GitHub Repository:** [https://github.com/thatikondaeaswarachary/DevConnect](https://github.com/thatikondaeaswarachary/DevConnect)

---

## ❓ Questions This Interface Allows Someone To Answer

Rather than presenting raw, uncontextualized JSON arrays, the interface directly answers core environmental health questions:

1. **What is the current health risk level for a metropolitan area?**
   - Renders a color-coded US EPA Air Quality Index (AQI) score with clear safety categories (**Good** 🟢, **Moderate** 🟡, **Unhealthy for Sensitive Groups** 🟠, **Unhealthy** 🔴, **Hazardous** 🟣).
2. **What action should sensitive or general populations take right now?**
   - Provides immediate, actionable health recommendations (e.g. outdoor physical activity limits, window ventilation advice).
3. **Which specific pollutant is the primary driver impairing air quality?**
   - Renders an interactive concentration breakdown ($\mu g/m^3$) across fine particulates ($\text{PM}_{2.5}$), coarse particulates ($\text{PM}_{10}$), nitrogen dioxide ($\text{NO}_2$), ground-level ozone ($\text{O}_3$), and sulphur dioxide ($\text{SO}_2$).

---

## ⚠️ Explicit Dataset Scope & Limitations (Brief B Requirement)

> **Important Note on Data Boundaries:** Overstating what a dataset establishes is a primary pitfall. Below is the explicit scope of what this dataset establishes and does not establish.

### ✅ What This Dataset DOES Establish
- **Current Ambient Air Quality Index (AQI)** calculated using standardized US EPA and European Air Quality Index formulas.
- **Near-Real-Time Atmospheric Concentrations** of key criteria pollutants ($\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{O}_3$, $\text{SO}_2$, $\text{CO}$).
- **Short-Term Environmental Exposure Guidance** for sensitive demographics (asthmatics, children, elderly).
- **Cross-City Comparative Benchmarks** across global metros (e.g. Tokyo vs. New Delhi vs. London).

### ❌ What This Dataset DOES NOT Establish
- **Long-Term Decadal Climate Change Trends**: The API provides short-term operational telemetry, not multi-decade climate baselines.
- **Indoor Air Quality or Home Ventilation Safety**: Telemetry measures outdoor ambient grid atmospheric air, not indoor air spaces.
- **Block-Level Hyperlocal Micro-Variations**: Open-Meteo uses $11\text{km}$ grid cell interpolation; local micro-climates near specific roads may vary.
- **Medical Diagnostic or Epidemiological Causality**: AQI values represent environmental risk metrics, not direct individual medical diagnoses.

---

## ⏳ Handling Slow & Failing Data Sources

To ensure resilience when interacting with third-party public APIs, the application gracefully handles non-200 HTTP statuses, network timeouts, and slow connection speeds.

### How a Reviewer Can Test Source Resilience Without Code Changes:
At the top of the interface, the **Reviewer Source Resilience Toolbar** provides direct one-click testing buttons:

1. **Test Normal Source Data (Tokyo)**:
   - Click **`🌸 Tokyo (Good AQI)`** to fetch live telemetry for a low-pollution city.
2. **Test High Pollution Data (New Delhi)**:
   - Click **`🏙️ New Delhi (High Pollution)`** to fetch live telemetry for a high-AQI city.
3. **Test Slow Network Source (Loading State)**:
   - Click **`⏳ Simulate Slow Network Source`**.
   - **Behavior**: Renders an animated loading spinner and text status *"Fetching Air Quality Telemetry..."* for 3 seconds before resolving.
4. **Test Source API Failure (Error State)**:
   - Click **`⚠️ Simulate Source API Failure`**.
   - **Behavior**: Displays a bold red error panel detailing **What Failed** (*"Simulated Source Failure: Open-Meteo Public API timeout (HTTP 503)"*) and **What To Do**, complete with an interactive **🔄 Retry Source Connection** button.

---

## 💻 How a Stranger Can Run It Locally

No build steps, node_modules, or complex compilers are required.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/thatikondaeaswarachary/DevConnect.git
   cd DevConnect
   ```

2. **Serve locally using Python's built-in HTTP server:**
   ```bash
   python -m http.server 8000
   ```

3. **Open in browser:**
   Navigate to `http://localhost:8000`.

---

## 🔍 Reviewer Checklist

- [x] **Repository with a history reflecting how it was built**: Clean git commit history on branch `main`.
- [x] **README lets a stranger run it locally**: Clear Python command provided above.
- [x] **Slow and failing responses from the source are handled**: Dedicated loading spinner, error alert box, and reviewer simulation buttons.
- [x] **Deployed URL or short recording**: Deployed live at [https://devconnect-task1.surge.sh](https://devconnect-task1.surge.sh).
- [x] **README states the limits of what the data supports**: Clear "DOES Establish" vs "DOES NOT Establish" section included.
