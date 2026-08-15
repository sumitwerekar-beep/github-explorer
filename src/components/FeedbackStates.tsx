import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, Clock, RefreshCw, Search, ShieldAlert, Sparkles } from 'lucide-react';
import type { RateLimitInfo } from '../types/github';

export function CardSkeleton(): React.JSX.Element {
  return (
    <div className="repo-card skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-avatar" />
        <div className="skeleton-title-group">
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-subtitle" />
        </div>
      </div>
      <div className="skeleton-line skeleton-desc" />
      <div className="skeleton-line skeleton-desc-short" />
      <div className="skeleton-footer">
        <div className="skeleton-badge" />
        <div className="skeleton-badge" />
        <div className="skeleton-badge" />
      </div>
    </div>
  );
}

export function RepoListSkeleton({ count = 6 }: { count?: number }): React.JSX.Element {
  return (
    <div className="repo-grid">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton(): React.JSX.Element {
  return (
    <div className="details-skeleton">
      <div className="skeleton-detail-header">
        <div className="skeleton-line skeleton-title-large" />
        <div className="skeleton-line skeleton-desc" />
      </div>
      <div className="skeleton-stats-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-stat-box" />
        ))}
      </div>
      <div className="skeleton-chart-box" />
    </div>
  );
}

export function EmptyState({
  query,
  onReset,
  onPickSuggestion,
}: {
  query: string;
  onReset: () => void;
  onPickSuggestion: (term: string) => void;
}): React.JSX.Element {
  const suggestions = ['react', 'nextjs', 'fastapi', 'rust', 'tailwind', 'vue'];

  return (
    <div className="empty-state-card" data-testid="empty-state">
      <div className="empty-icon-wrapper">
        <Search className="empty-icon" size={36} />
      </div>
      <h3 className="empty-title">No repositories found</h3>
      <p className="empty-message">
        We couldn't find any repositories matching <strong className="query-highlight">"{query}"</strong>. Try checking
        for typos or using broader keywords.
      </p>
      <div className="empty-suggestions">
        <span className="suggestions-label">Try searching for:</span>
        <div className="suggestions-tags">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              className="suggestion-tag"
              onClick={() => onPickSuggestion(item)}
            >
              <Sparkles size={13} />
              {item}
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="btn-secondary" onClick={onReset}>
        Reset Filters & Search
      </button>
    </div>
  );
}

export function RateLimitBanner({
  rateLimit,
  onSwitchToDemo,
  onOpenTokenModal,
}: {
  rateLimit: RateLimitInfo;
  onSwitchToDemo: () => void;
  onOpenTokenModal: () => void;
}): React.JSX.Element {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    function updateCountdown() {
      const now = Math.floor(Date.now() / 1000);
      const diff = Math.max(0, rateLimit.reset - now);
      if (diff <= 0) {
        setTimeLeft('Resetting now...');
        return;
      }
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [rateLimit.reset]);

  return (
    <div className="rate-limit-banner" data-testid="rate-limit-banner">
      <div className="rate-limit-banner-content">
        <div className="rate-limit-icon-box">
          <ShieldAlert size={24} className="rate-limit-icon" />
        </div>
        <div className="rate-limit-text">
          <h4>GitHub API Rate Limit Reached</h4>
          <p>
            Unauthenticated requests are limited to 60/hour by GitHub. Limit resets in{' '}
            <span className="countdown-badge">
              <Clock size={12} /> {timeLeft || 'calculating...'}
            </span>
          </p>
        </div>
      </div>
      <div className="rate-limit-actions">
        <button type="button" className="btn-accent-sm" onClick={onSwitchToDemo}>
          <Sparkles size={14} /> Switch to Demo Mode
        </button>
        <button type="button" className="btn-outline-sm" onClick={onOpenTokenModal}>
          Add Personal Access Token
        </button>
      </div>
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  onSwitchToDemo,
}: {
  error: Error;
  onRetry: () => void;
  onSwitchToDemo?: () => void;
}): React.JSX.Element {
  const isRateLimit =
    error.name === 'GitHubRateLimitError' ||
    error.message.toLowerCase().includes('rate limit') ||
    error.message.includes('403');

  return (
    <div className="error-card" data-testid="error-state">
      <div className="error-icon-box">
        {isRateLimit ? <AlertTriangle size={32} /> : <AlertCircle size={32} />}
      </div>
      <h3 className="error-title">{isRateLimit ? 'API Rate Limit Encountered' : 'Unable to Load Repositories'}</h3>
      <p className="error-message">{error.message || 'An unexpected error occurred while communicating with GitHub.'}</p>
      <div className="error-btn-group">
        <button type="button" className="btn-primary" onClick={onRetry}>
          <RefreshCw size={15} /> Try Again
        </button>
        {onSwitchToDemo && (
          <button type="button" className="btn-secondary" onClick={onSwitchToDemo}>
            <Sparkles size={15} /> Switch to Demo Mode
          </button>
        )}
      </div>
    </div>
  );
}
