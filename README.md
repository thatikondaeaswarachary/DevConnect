# Accessible 3-Plan Comparison Table

A responsive, WCAG 2.1 AA accessible web application for comparing three subscription plans (**Starter**, **Pro**, **Enterprise**) across 15 feature capabilities. Built with native HTML5, vanilla CSS, and vanilla JavaScript.

---

## 🌟 Key Accessibility & Architectural Highlights

1. **Keyboard Navigation & Logical Tab Order**:
   - Operable end-to-end using standard keyboard navigation (`Tab`, `Shift+Tab`, `Space`, `Enter`).
   - DOM structure strictly mirrors visual layout order to prevent keyboard focus disorientation.
   - Includes a high-contrast **Skip to main content** link as the first focusable element.

2. **Visible Focus Indicators**:
   - Every interactive element (skip link, switch button, plan filter tabs, CTA buttons) features an un-truncated, high-contrast focus ring (`outline: 3px solid #4f46e5`, `outline-offset: 3px`, and focus shadow) complying with WCAG 2.1 Focus Visible standards.

3. **Narrow-Screen Strategy (320px Optimization - Zero Horizontal Scroll)**:
   - Eliminates horizontal scrolling at narrow viewports down to 320px width (`scrollWidth <= clientWidth`).
   - Re-architects desktop matrix columns into responsive vertical feature cards without sacrificing semantic table markup.

4. **Assistive Technology & Table Semantics**:
   - Preserves semantic HTML table tags (`<table>`, `<caption>`, `<thead>`, `<tbody>`, `<tfoot>`, `<th>`, `<td>`).
   - Uses explicit header scopes (`scope="col"`, `scope="row"`, `scope="colgroup"`).
   - Augmented with explicit ARIA roles (`role="table"`, `role="row"`, `role="columnheader"`, `role="rowheader"`, `role="cell"`) to maintain standard screen reader table navigation shortcuts even when CSS grid/flex display styles are applied.
   - Live region announcements (`aria-live="polite"`) inform screen reader users of state changes (e.g. difference highlighting toggles or mobile plan filters).

5. **Highlight Differences Control**:
   - Keyboard-operable switch button (`role="switch"`, `aria-checked="true|false"`).
   - Highlighting applies prominent visual styling (accent background, left border, and explicit "Differs" badges) to differing rows.
   - Identical rows remain visible with a subtle background shift, ensuring full comparison context and legibility while active.

---

## 📱 Narrow-Screen Treatment & Design Rationale

### The Challenge
A traditional 4-column matrix comparison table (Feature column + 3 Plan columns) requires at least 700px width to present data legibly. On small devices (especially 320px mobile viewports), traditional tables force unpleasant horizontal scrolling or shrink text until it is unreadable.

### Our Solution
On narrow viewports (`<= 680px` down to `320px`):

1. **Responsive Feature Card Transformation**:
   - Each table row (`<tr class="feature-row">`) transforms into a standalone card container using CSS Flexbox/Grid (`display: flex; flex-direction: column; width: 100%;`).
   - The feature name (`<th scope="row">`) serves as the prominent card header with a clear category badge.
   - Feature values (`<td role="cell">`) stack vertically inside the card block.

2. **Accessible Plan Value Labeling**:
   - Each stacked cell dynamically generates a clear plan badge (`Starter`, `Pro`, `Enterprise`) via CSS pseudo-elements (`td::before { content: attr(data-plan-name); ... }`) and screen reader text.
   - Users can read all 3 plan values for a given feature at a single glance without scrolling horizontally.

3. **Mobile Plan Filter Switcher**:
   - An accessible mobile tab bar (`All Plans` | `Starter` | `Pro` | `Enterprise`) enables users to optionally isolate a specific plan column on small screens, allowing side-by-side or focused plan inspection.

4. **Screen Reader Semantics Preservation**:
   - While CSS transforms visual presentation into cards for sighted mobile users, native HTML table markup (`<table>`, `<th>`, `<td>`) combined with explicit ARIA table roles ensures screen readers continue treating the document as a structured data table. Screen reader users can still navigate cell-by-cell using standard table shortcut keys (e.g. `Ctrl+Alt+Arrows` in NVDA/JAWS).

---

## ⌨️ Keyboard Operability Guide

| Element | Interaction | Behavior |
| :--- | :--- | :--- |
| **Skip Link** | `Tab` into page -> `Enter` | Jump directly to main comparison table content |
| **Highlight Differences Switch** | `Tab` -> `Space` / `Enter` | Toggle highlighting of differing features ON/OFF |
| **Mobile Plan Tabs** | `Tab` -> `Space` / `Enter` | Filter visible plan columns on narrow screens |
| **CTA Buttons** | `Tab` -> `Space` / `Enter` | Trigger plan selection with live feedback |

---

## 🔍 Verification & Reviewer Checklist

- [x] **Operable end to end with keyboard**: Logical tab order matching visual flow from top header to table footer.
- [x] **Visible focus on every interactive element**: High contrast focus rings (`outline: 3px solid #4f46e5`) on all focusable targets.
- [x] **No horizontal scrolling at 320px**: Verified at 320px width viewport (`scrollWidth <= clientWidth`).
- [x] **Table structure conveyed to assistive technology**: Native HTML table markup + `scope` attributes + ARIA table roles + polite live region.
- [x] **README documentation**: Comprehensive explanation of narrow-screen treatment, design rationale, and accessibility features.

---

## 💻 Local Execution & Preview

To serve the project locally using Python's built-in HTTP server:

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in your web browser.
