import React, { useState } from 'react';
import type { GitHubRepo } from '../types/github';
import { useRepoDetails } from '../hooks/useRepoDetails';
import { CommitActivityChart } from './CommitActivityChart';
import { ContributorsList } from './ContributorsList';
import { DetailSkeleton, ErrorState } from './FeedbackStates';
import { LanguageStatsChart } from './LanguageStatsChart';
import { formatBytes, formatCompactNumber, formatDate, formatRelativeTime } from '../utils/formatters';
import { getLanguageColor } from '../utils/languageColors';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  GitBranch,
  GitFork,
  Globe,
  HardDrive,
  RefreshCw,
  Scale,
  Star,
  Terminal,
} from 'lucide-react';

interface RepoDetailsViewProps {
  repo: GitHubRepo;
  onBack: () => void;
  useMockMode?: boolean;
}

export function RepoDetailsView({ repo: initialRepo, onBack, useMockMode = false }: RepoDetailsViewProps): React.JSX.Element {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const {
    repo: detailedRepo,
    languages,
    commitStats,
    contributors,
    isLoading,
    error,
    refetch,
  } = useRepoDetails(initialRepo.owner.login, initialRepo.name, useMockMode);

  // Fallback to initialRepo metadata if detailedRepo is not yet resolved
  const repo = detailedRepo || initialRepo;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const httpsClone = `https://github.com/${repo.full_name}.git`;
  const sshClone = `git@github.com:${repo.full_name}.git`;
  const cliClone = `gh repo clone ${repo.full_name}`;

  const langColor = getLanguageColor(repo.language);

  return (
    <div className="repo-details-page" data-testid="repo-details-view">
      {/* Top Navigation Bar */}
      <div className="details-nav-bar">
        <button type="button" className="back-btn" onClick={onBack} aria-label="Back to search results">
          <ArrowLeft size={18} />
          <span>Back to results</span>
        </button>

        <div className="nav-actions">
          <button type="button" className="btn-refresh" onClick={refetch} title="Reload repository analytics">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-github-link"
            title="Open on GitHub in new tab"
          >
            <span>GitHub</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Main Repository Header Banner */}
      <header className="details-header-card">
        <div className="header-main-row">
          <div className="header-avatar-group">
            <img
              src={repo.owner.avatar_url}
              alt={repo.owner.login}
              className="details-owner-avatar"
            />
            <div className="header-title-column">
              <div className="breadcrumb-line">
                <a
                  href={repo.owner.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="owner-link"
                >
                  {repo.owner.login}
                </a>
                <span className="breadcrumb-slash">/</span>
                <h1 className="details-repo-name">{repo.name}</h1>
                <span className="visibility-pill">{repo.visibility || 'public'}</span>
                {repo.archived && <span className="archived-pill">Archived</span>}
              </div>

              <p className="details-description">
                {repo.description || <span className="text-muted">No description provided for this repository.</span>}
              </p>

              {/* Homepage Link */}
              {repo.homepage && (
                <div className="homepage-link-wrapper">
                  <Globe size={14} className="text-accent" />
                  <a
                    href={repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="homepage-anchor"
                  >
                    {repo.homepage}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Clone Box */}
          <div className="clone-box-container">
            <div className="clone-box-header">
              <Terminal size={14} />
              <span>Clone Repository</span>
            </div>
            <div className="clone-options">
              <div className="clone-item">
                <span className="clone-label">HTTPS</span>
                <input type="text" readOnly value={httpsClone} className="clone-input" />
                <button
                  type="button"
                  className="btn-copy"
                  onClick={() => copyToClipboard(httpsClone, 'https')}
                  title="Copy HTTPS URL"
                >
                  {copiedType === 'https' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="clone-item">
                <span className="clone-label">SSH</span>
                <input type="text" readOnly value={sshClone} className="clone-input" />
                <button
                  type="button"
                  className="btn-copy"
                  onClick={() => copyToClipboard(sshClone, 'ssh')}
                  title="Copy SSH clone URL"
                >
                  {copiedType === 'ssh' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="clone-item">
                <span className="clone-label">CLI</span>
                <input type="text" readOnly value={cliClone} className="clone-input" />
                <button
                  type="button"
                  className="btn-copy"
                  onClick={() => copyToClipboard(cliClone, 'cli')}
                  title="Copy GitHub CLI command"
                >
                  {copiedType === 'cli' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Topics Row */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="details-topics-row">
            {repo.topics.map((topic) => (
              <span key={topic} className="details-topic-badge">
                #{topic}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Key Metric Statistics Grid */}
      <section className="key-metrics-grid" aria-label="Repository Key Metrics">
        <div className="metric-box">
          <div className="metric-icon-wrap icon-stars">
            <Star size={20} />
          </div>
          <div className="metric-details">
            <span className="metric-title">Stars</span>
            <strong className="metric-value">{formatCompactNumber(repo.stargazers_count)}</strong>
            <span className="metric-sub">{repo.stargazers_count.toLocaleString()} stargazers</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap icon-forks">
            <GitFork size={20} />
          </div>
          <div className="metric-details">
            <span className="metric-title">Forks</span>
            <strong className="metric-value">{formatCompactNumber(repo.forks_count)}</strong>
            <span className="metric-sub">{repo.forks_count.toLocaleString()} forks</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap icon-issues">
            <AlertCircle size={20} />
          </div>
          <div className="metric-details">
            <span className="metric-title">Open Issues</span>
            <strong className="metric-value">{formatCompactNumber(repo.open_issues_count)}</strong>
            <span className="metric-sub">{repo.open_issues_count.toLocaleString()} issues</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap icon-watchers">
            <Eye size={20} />
          </div>
          <div className="metric-details">
            <span className="metric-title">Watchers</span>
            <strong className="metric-value">{formatCompactNumber(repo.watchers_count || repo.subscribers_count || 0)}</strong>
            <span className="metric-sub">Subscribers</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap icon-lang">
            <span className="lang-indicator-dot" style={{ backgroundColor: langColor }} />
          </div>
          <div className="metric-details">
            <span className="metric-title">Primary Language</span>
            <strong className="metric-value">{repo.language || 'None'}</strong>
            <span className="metric-sub">Main tech stack</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap icon-license">
            <Scale size={20} />
          </div>
          <div className="metric-details">
            <span className="metric-title">License</span>
            <strong className="metric-value">{repo.license?.spdx_id || 'No license'}</strong>
            <span className="metric-sub">{repo.license?.name || 'Custom / Unlicensed'}</span>
          </div>
        </div>
      </section>

      {/* Date & Repository Meta Card */}
      <div className="meta-dates-card">
        <div className="meta-date-item">
          <Calendar size={15} className="text-muted" />
          <span className="meta-date-label">Created on:</span>
          <strong>{formatDate(repo.created_at)}</strong>
        </div>
        <div className="meta-date-divider" />
        <div className="meta-date-item">
          <Clock size={15} className="text-muted" />
          <span className="meta-date-label">Last updated:</span>
          <strong>{formatDate(repo.updated_at)} ({formatRelativeTime(repo.updated_at)})</strong>
        </div>
        <div className="meta-date-divider" />
        <div className="meta-date-item">
          <GitBranch size={15} className="text-muted" />
          <span className="meta-date-label">Default branch:</span>
          <code className="branch-code">{repo.default_branch || 'main'}</code>
        </div>
        <div className="meta-date-divider" />
        <div className="meta-date-item">
          <HardDrive size={15} className="text-muted" />
          <span className="meta-date-label">Repository size:</span>
          <strong>{formatBytes(repo.size * 1024)}</strong>
        </div>
      </div>

      {/* Error state if detail queries fail */}
      {error && (
        <div className="details-error-container">
          <ErrorState error={error} onRetry={refetch} />
        </div>
      )}

      {/* Deep Analytics Section */}
      {isLoading && !detailedRepo ? (
        <DetailSkeleton />
      ) : (
        <div className="analytics-layout">
          {/* Visualized Language Breakdown */}
          <LanguageStatsChart languages={languages} totalRepoSize={repo.size * 1024} />

          {/* 52-Week Commit Activity Trend */}
          <CommitActivityChart commitStats={commitStats} />

          {/* Contributors Leaderboard */}
          <ContributorsList contributors={contributors} />
        </div>
      )}
    </div>
  );
}
