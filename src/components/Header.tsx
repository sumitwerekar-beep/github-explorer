import type { RateLimitInfo } from '../types/github';
import { BookOpen, KeyRound, Zap, ZapOff } from 'lucide-react';

interface HeaderProps {
  rateLimit: RateLimitInfo;
  useMockMode: boolean;
  onToggleMockMode: (val: boolean) => void;
  onOpenTokenModal: () => void;
  onOpenArchitectureModal: () => void;
  onHomeClick: () => void;
}

export function Header({
  rateLimit,
  useMockMode,
  onToggleMockMode,
  onOpenTokenModal,
  onOpenArchitectureModal,
  onHomeClick,
}: HeaderProps): React.JSX.Element {
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('gh_explorer_token');

  // Rate limit status indicator color
  const remaining = rateLimit.remaining;
  const isLow = remaining <= 15 && remaining > 0;
  const isExhausted = remaining === 0;

  const rateLimitStatusClass = isExhausted
    ? 'rate-pill-danger'
    : isLow
    ? 'rate-pill-warning'
    : 'rate-pill-success';

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand / Logo */}
        <div className="header-brand" onClick={onHomeClick} role="button" tabIndex={0}>
          <div className="brand-logo-box">
            <svg
              className="brand-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </div>
          <div className="brand-text-column">
            <h1 className="brand-title">
              GitHub <span className="brand-highlight">Explorer</span>
            </h1>
            <span className="brand-badge">API Analytics & Insights</span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="header-actions">
          {/* Rate Limit Indicator Pill */}
          <div
            className={`rate-limit-pill ${rateLimitStatusClass}`}
            title={`Rate Limit: ${rateLimit.remaining}/${rateLimit.limit} remaining. Resets at ${rateLimit.resetDate.toLocaleTimeString()}`}
          >
            <span className="rate-pulse-dot" />
            <span className="rate-pill-text">
              API: <strong>{useMockMode ? 'Mock' : `${rateLimit.remaining}/${rateLimit.limit}`}</strong>
            </span>
          </div>

          {/* Demo Mode Toggle */}
          <button
            type="button"
            className={`demo-toggle-btn ${useMockMode ? 'demo-active' : ''}`}
            onClick={() => onToggleMockMode(!useMockMode)}
            title={useMockMode ? 'Switch to Live GitHub API' : 'Switch to Offline/Demo Datasets'}
            aria-label="Toggle Demo Mode"
          >
            {useMockMode ? <Zap size={14} className="text-accent" /> : <ZapOff size={14} />}
            <span>{useMockMode ? 'Demo Mode ON' : 'Live API'}</span>
          </button>

          {/* Token Settings Button */}
          <button
            type="button"
            className={`header-btn ${hasToken ? 'token-active-btn' : ''}`}
            onClick={onOpenTokenModal}
            title={hasToken ? 'Custom GitHub Token Configured' : 'Configure GitHub Token'}
            aria-label="Configure GitHub Token"
          >
            <KeyRound size={15} />
            <span className="btn-label">{hasToken ? 'Token Active' : 'Set Token'}</span>
          </button>

          {/* Architecture Explainer Button */}
          <button
            type="button"
            className="header-btn btn-highlight"
            onClick={onOpenArchitectureModal}
            title="View Architecture & Technical Design"
            aria-label="View Architecture"
          >
            <BookOpen size={15} />
            <span className="btn-label">Explain App</span>
          </button>
        </div>
      </div>
    </header>
  );
}
