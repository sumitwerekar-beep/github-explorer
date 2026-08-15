# 🚀 GitHub Repository Explorer & Analytics

A responsive web application to search, explore, and analyze GitHub repositories using the GitHub REST API.

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_App-2ea043?style=for-the-badge&logo=vercel)](https://your-live-demo-link.vercel.app)
[![Tests](https://img.shields.io/badge/Tests-41%20Passed-3fb950?style=for-the-badge&logo=vitest)](https://github.com/sumitwerekar-beep/github-explorer)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 📖 Project Overview

**GitHub Repository Explorer** is a developer tool designed to search public repositories and deeply inspect repository analytics. It provides visual insights into repository language distributions, 52-week commit activity patterns, and contributor rankings.

Built with performance, resilience, and user experience in mind, the application features debounced searching with request cancellation, real-time rate-limit tracking, fallback demo datasets, and a test suite covering API error handling and data transformations.

---

## 📸 Screenshots

<!-- Replace these placeholder images with your actual application screenshots -->

| Search & Explorer View | Repository Analytics View |
| :---: | :---: |
| ![Search Explorer Screenshot](https://via.placeholder.com/600x340/161b22/58a6ff?text=Search+and+Filters+View) | ![Repo Analytics Screenshot](https://via.placeholder.com/600x340/161b22/58a6ff?text=Language+and+Commit+Analytics) |

| 52-Week Commit Activity Trend | Architecture & Resilience Modal |
| :---: | :---: |
| ![Commit Trend Screenshot](https://via.placeholder.com/600x340/161b22/58a6ff?text=52-Week+Commit+Activity+Chart) | ![Architecture Modal Screenshot](https://via.placeholder.com/600x340/161b22/58a6ff?text=System+Architecture+Explainer) |

---

## ✨ Features Implemented

### 1. 🔍 Debounced Search & Smart Filtering
- **Debounced Input (450ms)**: Minimizes unnecessary API calls while typing.
- **In-Flight Cancellation (`AbortController`)**: Cancels pending HTTP requests when query or filter criteria change, ensuring stale responses never overwrite fresh searches.
- **Language Filter**: Quick filtering by programming languages (TypeScript, JavaScript, Python, Rust, Go, C++, Java, etc.).
- **Sort Options**: Sort by Stars, Forks, Recently Updated, or Best Match with Ascending/Descending toggles.
- **Trending Quick Tags**: 1-click query shortcuts (`react`, `nextjs`, `fastapi`, `rust`, `linux`, `ai`, `vue`).

### 2. 📊 Rich Repository Analytics Page
- **Metadata & Key Metric Cards**: Full metrics for Stars, Forks, Open Issues, Watchers, Default Branch, License, and formatted dates.
- **Visualized Language Distribution**: Multi-segment proportional meter bar with GitHub linguist colors, exact byte calculations, and percentage breakdown.
- **52-Week Commit Activity Trend**: Interactive responsive SVG line/area/bar chart with weekly totals, peak velocity week, weekly averages, and hover tooltips showing daily breakdowns (Sun–Sat).
- **Ranked Contributors Leaderboard**: Top contributors with podium rank badges (🥇 #1 Gold, 🥈 #2 Silver, 🥉 #3 Bronze), avatars with initials fallback, commit counts, and GitHub profile links.
- **1-Click Clone Commands**: HTTPS, SSH, and GitHub CLI copy actions with animated feedback.

### 3. 🛡️ API Resilience & Rate-Limit Handling
- **Real-Time Rate-Limit Tracker**: Header pill displaying remaining requests (`48 / 60 remaining`) with color-coded status.
- **Automatic Reset Timer**: Live countdown when GitHub rate limit (60 req/hr unauthenticated) is reached.
- **Demo Mode Switch**: Instant toggle to realistic offline demo datasets (`facebook/react`, `vercel/next.js`, `torvalds/linux`, `astral-sh/uv`, `vuejs/core`) for uninterrupted presentations.
- **Personal Access Token (PAT) Support**: Modal to save custom token in browser `localStorage` to unlock 5,000 requests/hr.
- **Complete Null Safety**: Handles missing descriptions, missing licenses, 0 languages, or 202 compiling statuses without crashing.

### 4. 🧠 "Explain App" Architecture Modal
- In-app interactive system diagram illustrating the end-to-end data flow:
  `UI View` ➔ `Custom Hooks` ➔ `API Client & Rate Tracker` ➔ `Data Transformations & SVG Generator`.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **API**: [GitHub REST API](https://docs.github.com/en/rest)
- **Styling**: Vanilla CSS (Custom Design System with dark theme tokens, responsive layouts, and animations)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [jsdom](https://github.com/jsdom/jsdom)

---

## 📁 Project Structure

```text
github-explorer/
├── public/
│   └── favicon.svg                  # Application favicon
├── src/
│   ├── components/
│   │   ├── ArchitectureModal.tsx     # System architecture explainer modal
│   │   ├── CommitActivityChart.tsx   # 52-week SVG commit activity chart & tooltips
│   │   ├── ContributorsList.tsx      # Ranked contributor leaderboard & avatars
│   │   ├── FeedbackStates.tsx        # Skeletons, empty states, rate-limit banner, errors
│   │   ├── Header.tsx                # Navigation header, rate limit pill, demo toggle
│   │   ├── LanguageStatsChart.tsx    # Visualized language distribution bar & legend
│   │   ├── RepoCard.tsx              # Repository card with null-safety & metrics
│   │   ├── RepoDetailsView.tsx       # Repository analytics detail page & clone snippets
│   │   ├── RepoList.tsx              # Results grid & pagination bar
│   │   ├── SearchBar.tsx             # Debounced search input, filters, trending tags
│   │   └── TokenModal.tsx            # GitHub PAT configuration dialog
│   ├── hooks/
│   │   ├── useDebounce.ts            # Custom debouncing hook
│   │   ├── useGitHubSearch.ts        # Search state manager (query, filters, pagination, abort)
│   │   └── useRepoDetails.ts         # Parallel multi-resource fetcher & cache
│   ├── services/
│   │   ├── githubApi.ts              # GitHub REST API client, rate limit parser, errors
│   │   └── mockData.ts               # Offline demo datasets & commit generators
│   ├── tests/
│   │   ├── api.test.ts               # API async mocking & rate limit tests
│   │   ├── components.test.tsx       # UI component & edge-case integration tests
│   │   ├── formatters.test.ts        # Data transformation unit tests
│   │   ├── setup.ts                  # Test setup & cleanup configuration
│   │   ├── useDebounce.test.ts       # Debounce timing unit tests
│   │   └── useGitHubSearch.test.ts   # State management hook tests
│   ├── types/
│   │   └── github.ts                 # TypeScript interfaces for API entities & state
│   ├── utils/
│   │   ├── formatters.ts             # Compact numbers, bytes, dates, stats transformers
│   │   └── languageColors.ts         # GitHub linguist color mapping & hash fallback
│   ├── App.tsx                       # Root application component
│   ├── index.css                     # Design system tokens & styles
│   └── main.tsx                      # Application entry point
├── index.html                        # HTML shell & SEO metadata
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript compiler configuration
└── vite.config.ts                    # Vite & Vitest configuration
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sumitwerekar-beep/github-explorer.git
   cd github-explorer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Tests

The automated test suite verifies API async handling, rate limit parsing, data transformations, custom hooks, and UI component edge cases:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

**Test Suite Coverage (41 tests passing across 5 suites):**
- `src/tests/formatters.test.ts`: Compact numbers (`1.4k`, `2.5M`), bytes formatting, dates, language percentages, 52-week commit activity aggregation.
- `src/tests/api.test.ts`: GitHub API parameters, rate limit headers extraction, 403 / 429 status handling, 404s, Bearer auth headers, mock fallbacks.
- `src/tests/useDebounce.test.ts`: Debounce timing with fake timers and rapid keystroke resets.
- `src/tests/useGitHubSearch.test.ts`: State management transitions, pagination, filter resets, error capture.
- `src/tests/components.test.tsx`: SearchBar user input, RepoCard null-safety, LanguageStatsChart, CommitActivityChart, ContributorsList, and feedback states.

---

## 📦 Production Build

To compile TypeScript and bundle the application for production:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
