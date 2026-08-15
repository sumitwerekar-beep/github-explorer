import React, { useEffect, useState } from 'react';
import type { GitHubRepo } from './types/github';
import { useGitHubSearch } from './hooks/useGitHubSearch';
import { ArchitectureModal } from './components/ArchitectureModal';
import { EmptyState, ErrorState, RateLimitBanner, RepoListSkeleton } from './components/FeedbackStates';
import { Header } from './components/Header';
import { RepoDetailsView } from './components/RepoDetailsView';
import { RepoList } from './components/RepoList';
import { SearchBar } from './components/SearchBar';
import { TokenModal } from './components/TokenModal';

export function App(): React.JSX.Element {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState<boolean>(false);

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

  // Scroll to top on page or view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, selectedRepo]);

  const handleSelectRepo = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
  };

  const handleBackToSearch = () => {
    setSelectedRepo(null);
  };

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
    setLanguage('all');
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
            />

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
              />
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
