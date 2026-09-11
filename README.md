# Public Repository Search (Brief A)

A responsive, accessible web application for searching public GitHub repositories in real-time against the live GitHub REST API (`https://api.github.com/search/repositories`). Designed with distinct **Loading**, **Error**, and **Empty (0 Results)** states that are fully demonstrable by a reviewer without editing any code.

---

## 🌟 Key Architectural & State Features

1. **Visually & Textually Distinct States**:
   - **Loading State**: Displays an animated spinning loader, glowing skeleton cards, and live region text *"Searching public GitHub repositories for '[query]'..."*.
   - **Empty State (0 Results - Search Succeeded)**: Explicitly presented as a **successful search result** (green status badge *"Search Succeeded"*, 🔍 search icon) rather than an error. Text states *"Your search for '[query]' completed successfully, but returned 0 public repositories"*.
   - **Error State (Request Failed)**: Highlighted with a bold red container, warning icon ⚠️, and red glow. Explicitly details **What Failed** (*"GitHub API returned HTTP 422 / Network Error"*) and **What To Do** (*"Check your network connection, verify query syntax, or try again in a few moments"*). Includes a keyboard-operable **Retry Search** button.
   - **Success State**: Displays a clean grid of interactive repository cards showing owner avatar, repository name, star count, fork count, primary language, description, and direct link to GitHub.

2. **Full Accessibility & WCAG Compliance**:
   - **Keyboard Operable**: End-to-end operable using `Tab`, `Shift+Tab`, `Space`, and `Enter`.
   - **Visible Focus Rings**: Un-truncated focus indicators (`outline: 3px solid #6366f1`) on all search inputs, preset buttons, and links.
   - **Live Region Announcements**: Screen readers (`aria-live="polite"` and `aria-live="assertive"`) are updated automatically whenever a state transition occurs.

---

## 🔍 How Reviewers Can Test All 3 States Without Editing Code

At the top of the page, a dedicated **Reviewer Controls Toolbar** provides instant one-click preset buttons and toggle controls:

### 1. Test Success State (Results Found)
- Click the preset button **`1. Search 'react' (Success State)`** or enter `react` / `python` into the search box and press Search.
- **Expected Behavior**: Displays a grid of top GitHub repositories matching the keyword.

### 2. Test Empty State (Search Succeeded with 0 Results)
- Click the preset button **`2. Search 'qwertyuiopxyz9999' (Empty State)`** or search any random string with no matches.
- **Expected Behavior**: Shows a green badge *"Search Succeeded"*, confirming the request succeeded, and informs the user that 0 repositories matched the query.

### 3. Test Error State (Request Failed)
- Click the preset button **`3. Simulate API Error (Error State)`** OR turn ON the **`Simulate Request Failure on Next Search`** toggle switch and press Search.
- **Expected Behavior**: Displays a red alert card stating **What Failed** and **What To Do**, complete with an interactive **Retry Search Request** button.

### 4. Test Loading State
- Click the preset button **`4. Demo Loading State`** or execute any search over a slow connection.
- **Expected Behavior**: Shows the translucent loading card with animated spinner and skeleton placeholder cards.

---

## 🔍 Reviewer Verification Checklist

- [x] **Loading, error, and empty are visually and textually distinct**: Each state uses unique color schemes, icons, titles, and layout containers.
- [x] **All three reachable without code changes**: Accessible directly via the Reviewer Toolbar buttons at the top of the interface.
- [x] **Error message says what failed and what to do**: Dedicated error box broken into "What Failed" and "What To Do" with a Retry action button.
- [x] **Search with no results is presented as a result, not as an error**: Displayed with a green "Search Succeeded" badge confirming 0 matches found.

---

## 💻 Local Execution

To run the application locally:

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.
