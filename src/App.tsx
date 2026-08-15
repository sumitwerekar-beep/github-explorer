import React, { useEffect, useState } from 'react';
import type { GitHubRepo } from './types/github';
import { useGitHubSearch } from './hooks/useGitHubSearch';
import { ArchitectureModal } from './components/ArchitectureModal';
import { EmptyState, ErrorState, RateLimitBanner, RepoListSkeleton } from './components/FeedbackStates';
import { Header } from './components/Header';
import { RepoDetailsView } from './components/RepoDetailsView';
import { RepoList } from './components/RepoList';
import { RepoCard } from './components/RepoCard';
import { SearchBar } from './components/SearchBar';
import { TokenModal } from './components/TokenModal';
import { Bookmark, Sparkles } from 'lucide-react';

export function App(): React.JSX.Element {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState<boolean>(false);
  const [viewTab, setViewTab] = useState<'explore' | 'bookmarks'>('explore');

  // Bookmarks saved in local storage
  const [bookmarkedRepos, setBookmarkedRepos] = useState<GitHubRepo[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('gh_explorer_bookmarks');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const {
    query,
    setQuery,
    debouncedQuery,
    language,
    setLanguage,
    sort,
    setSort,
    order,
    setOrder,
    page,
    setPage,
    repos,
    totalCount,
    totalPages,
    isLoading,
    error,
    rateLimit,
    useMockMode,
    setUseMockMode,
    retry,
    clearSearch,
  } = useGitHubSearch();

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gh_explorer_bookmarks', JSON.stringify(bookmarkedRepos));
    } catch {
      // ignore storage errors
    }
  }, [bookmarkedRepos]);

  // Global Keyboard Shortcuts: '/' to focus search, 'Esc' to exit modal/details
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user types '/' and is not already in an input/textarea
      if (
        e.key === '/' &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        setViewTab('explore');
        const searchInput = document.getElementById('repo-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }

      // 'Escape' key closes open modals or returns from details view
      if (e.key === 'Escape') {
        if (isTokenModalOpen) setIsTokenModalOpen(false);
        else if (isArchModalOpen) setIsArchModalOpen(false);
        else if (selectedRepo) setSelectedRepo(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTokenModalOpen, isArchModalOpen, selectedRepo]);

  // Scroll to top on page or view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, selectedRepo, viewTab]);

  const handleToggleBookmark = (repo: GitHubRepo) => {
    setBookmarkedRepos((prev) => {
      const exists = prev.some((r) => r.id === repo.id);
      if (exists) {
        return prev.filter((r) => r.id !== repo.id);
      } else {
        return [repo, ...prev];
      }
    });
  };

  const bookmarkedIds = new Set(bookmarkedRepos.map((r) => r.id));

  const handleSelectRepo = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
  };

  const handleBackToSearch = () => {
    setSelectedRepo(null);
  };

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
    setLanguage('all');
    setViewTab('explore');
  };

  const isRateLimited =
    rateLimit.remaining === 0 ||
    (error &&
      (error.name === 'GitHubRateLimitError' ||
        error.message.toLowerCase().includes('rate limit') ||
        error.message.includes('403')));

  return (
    <div className="app-layout">
      {/* Header */}
      <Header
        rateLimit={rateLimit}
        useMockMode={useMockMode}
        onToggleMockMode={setUseMockMode}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
        onOpenArchitectureModal={() => setIsArchModalOpen(true)}
        onHomeClick={handleBackToSearch}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {selectedRepo ? (
          /* Detailed Repository View */
          <RepoDetailsView
            repo={selectedRepo}
            onBack={handleBackToSearch}
            useMockMode={useMockMode}
            isBookmarked={bookmarkedIds.has(selectedRepo.id)}
            onToggleBookmark={handleToggleBookmark}
          />
        ) : (
          /* Search & Explorer List View */
          <div className="explorer-view">
            {/* Search Bar & Controls */}
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              language={language}
              onLanguageChange={setLanguage}
              sort={sort}
              onSortChange={setSort}
              order={order}
              onOrderChange={setOrder}
              isLoading={isLoading}
              onClear={clearSearch}
              viewTab={viewTab}
              onViewTabChange={setViewTab}
              bookmarksCount={bookmarkedRepos.length}
            />

            {/* Bookmarks Tab View */}
            {viewTab === 'bookmarks' && (
              <div className="bookmarks-view-container">
                {bookmarkedRepos.length === 0 ? (
                  <div className="empty-bookmarks-card" data-testid="empty-bookmarks">
                    <div className="empty-icon-wrapper">
                      <Bookmark size={32} className="text-warning" />
                    </div>
                    <h3>No Bookmarked Repositories Yet</h3>
                    <p>
                      Click the bookmark icon on any repository card to save it here for quick access.
                    </p>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setViewTab('explore')}
                    >
                      <Sparkles size={14} /> Explore Trending Repos
                    </button>
                  </div>
                ) : (
                  <div className="repo-list-container">
                    <div className="results-header">
                      <div className="results-count-text">
                        <span>Showing </span>
                        <strong className="results-count-number">{bookmarkedRepos.length}</strong>
                        <span> saved repositories</span>
                      </div>
                    </div>
                    <div className="repo-grid">
                      {bookmarkedRepos.map((repo) => (
                        <RepoCard
                          key={repo.id}
                          repo={repo}
                          onSelectRepo={handleSelectRepo}
                          isBookmarked={true}
                          onToggleBookmark={handleToggleBookmark}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Explore Tab View */}
            {viewTab === 'explore' && (
              <>
                {/* Rate limit warning banner if rate limited */}
                {isRateLimited && !useMockMode && (
                  <RateLimitBanner
                    rateLimit={rateLimit}
                    onSwitchToDemo={() => {
                      setUseMockMode(true);
                      retry();
                    }}
                    onOpenTokenModal={() => setIsTokenModalOpen(true)}
                  />
                )}

                {/* Error Display */}
                {error && !isLoading && (
                  <ErrorState
                    error={error}
                    onRetry={retry}
                    onSwitchToDemo={() => {
                      setUseMockMode(true);
                      retry();
                    }}
                  />
                )}

                {/* Loading Skeleton */}
                {isLoading && <RepoListSkeleton count={6} />}

                {/* Empty State */}
                {!isLoading && !error && repos.length === 0 && (
                  <EmptyState
                    query={debouncedQuery}
                    onReset={clearSearch}
                    onPickSuggestion={handleSuggestionClick}
                  />
                )}

                {/* Repository Cards Grid */}
                {!isLoading && !error && repos.length > 0 && (
                  <RepoList
                    repos={repos}
                    totalCount={totalCount}
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onSelectRepo={handleSelectRepo}
                    query={debouncedQuery}
                    language={language}
                    bookmarkedIds={bookmarkedIds}
                    onToggleBookmark={handleToggleBookmark}
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <TokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onTokenSaved={() => retry()}
      />

      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <p>
            GitHub Repository Explorer • Built with React, TypeScript, and the GitHub REST API.
          </p>
          <div className="footer-links">
            <button type="button" className="footer-link-btn" onClick={() => setIsArchModalOpen(true)}>
              System Architecture
            </button>
            <span className="footer-dot">•</span>
            <button type="button" className="footer-link-btn" onClick={() => setIsTokenModalOpen(true)}>
              API Token Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
