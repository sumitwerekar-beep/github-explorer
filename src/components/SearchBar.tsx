import React from 'react';
import type { OrderOption, SortOption } from '../types/github';
import {
  ArrowDownAZ,
  ArrowUpZA,
  Bookmark,
  Compass,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  order: OrderOption;
  onOrderChange: (order: OrderOption) => void;
  isLoading: boolean;
  onClear: () => void;
  viewTab: 'explore' | 'bookmarks';
  onViewTabChange: (tab: 'explore' | 'bookmarks') => void;
  bookmarksCount: number;
}

const POPULAR_LANGUAGES = [
  { label: 'All Languages', value: 'all' },
  { label: 'TypeScript', value: 'TypeScript' },
  { label: 'JavaScript', value: 'JavaScript' },
  { label: 'Python', value: 'Python' },
  { label: 'Rust', value: 'Rust' },
  { label: 'Go', value: 'Go' },
  { label: 'C++', value: 'C++' },
  { label: 'C', value: 'C' },
  { label: 'Java', value: 'Java' },
  { label: 'Swift', value: 'Swift' },
  { label: 'Kotlin', value: 'Kotlin' },
  { label: 'PHP', value: 'PHP' },
  { label: 'Ruby', value: 'Ruby' },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Most Stars', value: 'stars' },
  { label: 'Most Forks', value: 'forks' },
  { label: 'Recently Updated', value: 'updated' },
  { label: 'Best Match', value: 'best-match' },
];

const POPULAR_TOPICS = ['react', 'nextjs', 'fastapi', 'rust', 'linux', 'ai', 'vue'];

export function SearchBar({
  query,
  onQueryChange,
  language,
  onLanguageChange,
  sort,
  onSortChange,
  order,
  onOrderChange,
  isLoading,
  onClear,
  viewTab,
  onViewTabChange,
  bookmarksCount,
}: SearchBarProps): React.JSX.Element {
  return (
    <section className="search-section" aria-label="Repository Search Controls">
      {/* Top View Selector Bar (Explore vs Bookmarks) */}
      <div className="search-top-nav">
        <div className="nav-tab-group">
          <button
            type="button"
            className={`nav-tab-item ${viewTab === 'explore' ? 'nav-tab-active' : ''}`}
            onClick={() => onViewTabChange('explore')}
          >
            <Compass size={15} />
            <span>Explore Repos</span>
          </button>
          <button
            type="button"
            className={`nav-tab-item ${viewTab === 'bookmarks' ? 'nav-tab-active' : ''}`}
            onClick={() => onViewTabChange('bookmarks')}
          >
            <Bookmark size={15} className={bookmarksCount > 0 ? 'text-warning' : ''} />
            <span>Bookmarked</span>
            {bookmarksCount > 0 && <span className="nav-tab-count">{bookmarksCount}</span>}
          </button>
        </div>

        <div className="kbd-shortcut-pill" title="Press forward slash (/) anywhere to search">
          <span>Search</span>
          <kbd className="kbd-key">/</kbd>
        </div>
      </div>

      {/* Primary Input Container (shown in explore mode) */}
      {viewTab === 'explore' && (
        <>
          <div className="search-box-wrapper">
            <div className="search-input-container">
              <Search className="search-icon" size={20} />
              <input
                id="repo-search-input"
                type="text"
                className="search-input"
                placeholder="Search repositories by name, topic, or keyword (e.g. react, tensorflow, cli)..."
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                autoComplete="off"
                spellCheck="false"
              />

              {isLoading && (
                <div className="search-loading-spinner" title="Fetching repositories...">
                  <Loader2 size={18} className="animate-spin" />
                </div>
              )}

              {query && !isLoading && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={onClear}
                  title="Clear search"
                  aria-label="Clear search input"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Controls Row */}
            <div className="filters-bar">
              {/* Language Dropdown */}
              <div className="filter-group">
                <label htmlFor="filter-language" className="filter-label">
                  Language
                </label>
                <select
                  id="filter-language"
                  className="filter-select"
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value)}
                >
                  {POPULAR_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="filter-group">
                <label htmlFor="filter-sort" className="filter-label">
                  <SlidersHorizontal size={12} /> Sort
                </label>
                <select
                  id="filter-sort"
                  className="filter-select"
                  value={sort}
                  onChange={(e) => onSortChange(e.target.value as SortOption)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order Toggle */}
              {sort !== 'best-match' && (
                <button
                  type="button"
                  className="order-toggle-btn"
                  onClick={() => onOrderChange(order === 'desc' ? 'asc' : 'desc')}
                  title={`Sort order: ${order === 'desc' ? 'Descending' : 'Ascending'}`}
                  aria-label="Toggle sort order"
                >
                  {order === 'desc' ? <ArrowDownAZ size={16} /> : <ArrowUpZA size={16} />}
                  <span className="order-text">{order === 'desc' ? 'Desc' : 'Asc'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Search Chips */}
          <div className="quick-tags-container">
            <span className="quick-tags-label">Trending:</span>
            <div className="quick-tags-list">
              {POPULAR_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  className={`quick-tag-chip ${query.toLowerCase() === topic ? 'chip-active' : ''}`}
                  onClick={() => onQueryChange(topic)}
                >
                  <Sparkles size={11} />
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
