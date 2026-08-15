# 🚀 GitHub Repository Explorer & Analytics

A responsive web application to search, explore, and analyze GitHub repositories using the GitHub REST API.

Built with **React 19**, **TypeScript**, **Vite**, **Vanilla CSS Design System**, and **Vitest**.

---

## ✨ Features

- 🔍 **Debounced Search Bar**:
  - 450ms debounce window prevents excessive API requests.
  - Active `AbortController` cancellation discards obsolete in-flight requests on new keystrokes.
  - Multi-criteria filtering by programming language (TypeScript, JavaScript, Python, Rust, Go, etc.).
  - Sort by Most Stars, Most Forks, Recently Updated, or Best Match.
  - Trending quick-search tags (`react`, `nextjs`, `fastapi`, `rust`, `linux`, `ai`, `vue`).

- 📊 **Repository Analytics & Deep Drill-down**:
  - **Metadata & Key Metrics**: Stars, Forks, Open Issues, Watchers, Default Branch, License, Creation/Push dates, Repository Size.
  - **Visualized Language Breakdown**: Proportional multi-segment meter bar with GitHub linguist color coding, percentage distribution, and exact byte counts.
  - **52-Week Commit Activity Trend**: Interactive responsive SVG line/area/bar chart with weekly totals, peak velocity week, average weekly commits, and hover crosshair tooltips with daily breakdowns (Sun–Sat).
  - **Contributors Leaderboard**: Ranked contributors with podium badges (🥇 #1 Gold, 🥈 #2 Silver, 🥉 #3 Bronze), avatars, contribution counts, and direct profile links.
  - **1-Click Clone Commands**: HTTPS, SSH, and GitHub CLI copy snippets with animated feedback.

- 🛡️ **Error Resilience & Rate-Limit Handling**:
  - Real-time rate limit tracking via response headers (`x-ratelimit-remaining`, `x-ratelimit-reset`).
  - Live countdown timer when rate limited (60 req/hr unauthenticated).
  - **Demo Mode Toggle**: Instant offline mock datasets for uninterrupted presentations and testing.
  - **Personal Access Token (PAT) Support**: Modal to save custom token in `localStorage` to unlock 5,000 requests/hr.
  - Skeletons, empty search states, and error retry handlers.

- 🧪 **Comprehensive Test Suite (41 Tests across 5 Suites)**:
  - API & async error handling (403 rate limits, 404s, network failures, Bearer auth tokens).
  - Data transformations (language percentages, 52-week commit activity aggregation, compact number formatting, relative dates).
  - Custom hooks state management (`useDebounce`, `useGitHubSearch`, `useRepoDetails`).
  - Component integration and missing field resilience.

---

## 🛠️ Tech Stack & Architecture

```
src/
├── types/
│   └── github.ts                # TypeScript interfaces for API entities & state
├── utils/
│   ├── formatters.ts            # Compact numbers (1.5k), bytes, dates, stats transformers
│   └── languageColors.ts        # GitHub linguist color map & hash fallback
├── services/
│   ├── githubApi.ts             # GitHub REST API client, rate limit parser, errors
│   └── mockData.ts              # Rich offline datasets & commit generators
├── hooks/
│   ├── useDebounce.ts           # Configurable debouncing hook
│   ├── useGitHubSearch.ts       # Search state manager (query, filters, pagination, abort)
│   └── useRepoDetails.ts        # Parallel multi-resource fetcher & cache
├── components/
│   ├── Header.tsx               # Header, rate limit pill, demo toggle, modals
│   ├── SearchBar.tsx            # Debounced search input, filters, trending tags
│   ├── RepoCard.tsx             # Repository card with null-safety
│   ├── RepoList.tsx             # Results grid & smart pagination
│   ├── RepoDetailsView.tsx      # Comprehensive repository analytics page
│   ├── LanguageStatsChart.tsx   # Visualized language distribution bar & legend
│   ├── CommitActivityChart.tsx  # 52-week SVG commit activity chart & tooltips
│   ├── ContributorsList.tsx     # Ranked contributor leaderboard
│   ├── FeedbackStates.tsx       # Skeletons, empty states, rate-limit banner, errors
│   ├── TokenModal.tsx           # GitHub PAT settings dialog
│   └── ArchitectureModal.tsx    # "Explain App" interactive system design diagram
├── tests/
│   ├── setup.ts                 # Test environment setup
│   ├── formatters.test.ts       # Data transformation unit tests
│   ├── api.test.ts              # API async mocking & rate limit tests
│   ├── useDebounce.test.ts      # Debounce timing unit tests
│   ├── useGitHubSearch.test.ts  # State management & filter tests
│   └── components.test.tsx      # UI & edge-case integration tests
├── App.tsx                      # Root application
├── index.css                    # Modern CSS design system
└── main.tsx                     # React entry point
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Run Automated Test Suite
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```
