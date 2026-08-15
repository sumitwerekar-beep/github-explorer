import React from 'react';
import type { GitHubRepo } from '../types/github';
import { RepoCard } from './RepoCard';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface RepoListProps {
  repos: GitHubRepo[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectRepo: (repo: GitHubRepo) => void;
  query: string;
  language: string;
  bookmarkedIds?: Set<number>;
  onToggleBookmark?: (repo: GitHubRepo) => void;
}

export function RepoList({
  repos,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onSelectRepo,
  query,
  language,
  bookmarkedIds = new Set(),
  onToggleBookmark,
}: RepoListProps): React.JSX.Element {
  // Generate smart pagination page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        start = 1;
        end = 5;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages;
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="repo-list-container" data-testid="repo-list">
      {/* Results Header Info */}
      <div className="results-header">
        <div className="results-count-text">
          <span>Found </span>
          <strong className="results-count-number">{totalCount.toLocaleString()}+</strong>
          <span> repositories {query ? `for "${query}"` : 'trending globally'}</span>
          {language !== 'all' && <span className="active-filter-tag">in {language}</span>}
        </div>
        <div className="pagination-quick-info">
          Page {currentPage} of {totalPages || 1}
        </div>
      </div>

      {/* Grid of Repositories */}
      <div className="repo-grid">
        {repos.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            onSelectRepo={onSelectRepo}
            isBookmarked={bookmarkedIds.has(repo.id)}
            onToggleBookmark={onToggleBookmark}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="pagination-container" aria-label="Repository search results pagination">
          <button
            type="button"
            className="pagination-nav-btn"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="First Page"
            aria-label="Go to first page"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            type="button"
            className="pagination-nav-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Previous Page"
            aria-label="Go to previous page"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="pagination-numbers">
            {getPageNumbers().map((num, idx) =>
              typeof num === 'number' ? (
                <button
                  key={idx}
                  type="button"
                  className={`page-num-btn ${num === currentPage ? 'page-active' : ''}`}
                  onClick={() => onPageChange(num)}
                  aria-current={num === currentPage ? 'page' : undefined}
                >
                  {num}
                </button>
              ) : (
                <span key={idx} className="pagination-ellipsis">
                  {num}
                </span>
              )
            )}
          </div>

          <button
            type="button"
            className="pagination-nav-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Next Page"
            aria-label="Go to next page"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            className="pagination-nav-btn"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Last Page"
            aria-label="Go to last page"
          >
            <ChevronsRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
