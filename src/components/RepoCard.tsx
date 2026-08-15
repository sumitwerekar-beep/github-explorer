import React, { useState } from 'react';
import type { GitHubRepo } from '../types/github';
import { formatCompactNumber, formatRelativeTime } from '../utils/formatters';
import { getLanguageColor } from '../utils/languageColors';
import {
  AlertCircle,
  Bookmark,
  Check,
  ChevronRight,
  Copy,
  GitFork,
  Scale,
  Star,
} from 'lucide-react';

interface RepoCardProps {
  repo: GitHubRepo;
  onSelectRepo: (repo: GitHubRepo) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (repo: GitHubRepo) => void;
}

export function RepoCard({
  repo,
  onSelectRepo,
  isBookmarked = false,
  onToggleBookmark,
}: RepoCardProps): React.JSX.Element {
  const [avatarError, setAvatarError] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);

  const langColor = getLanguageColor(repo.language);

  const handleCopyClone = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://github.com/${repo.full_name}.git`);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 1800);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(repo);
    }
  };

  return (
    <article
      className={`repo-card ${isBookmarked ? 'card-bookmarked' : ''}`}
      data-testid={`repo-card-${repo.id}`}
      onClick={() => onSelectRepo(repo)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectRepo(repo);
        }
      }}
    >
      {/* Top Header: Owner Avatar + Repo Names + Quick Actions */}
      <div className="card-top">
        <div className="owner-avatar-container">
          {!avatarError && repo.owner?.avatar_url ? (
            <img
              src={repo.owner.avatar_url}
              alt={repo.owner.login || 'Owner'}
              className="owner-avatar"
              loading="lazy"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="owner-avatar-fallback">
              {(repo.owner?.login || repo.name || 'GH').slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="card-title-meta">
          <span className="owner-name" title={repo.owner?.login}>
            {repo.owner?.login || 'unknown'}
          </span>
          <h3 className="repo-title" title={repo.name}>
            {repo.name}
          </h3>
        </div>

        {/* Quick Action Buttons */}
        <div className="card-actions-row">
          {onToggleBookmark && (
            <button
              type="button"
              className={`card-action-btn ${isBookmarked ? 'btn-bookmarked' : ''}`}
              onClick={handleBookmarkClick}
              title={isBookmarked ? 'Remove from Bookmarks' : 'Save to Bookmarks'}
              aria-label="Toggle Bookmark"
            >
              <Bookmark size={15} className={isBookmarked ? 'fill-current' : ''} />
            </button>
          )}

          <button
            type="button"
            className="card-action-btn"
            onClick={handleCopyClone}
            title={copiedClone ? 'Copied git clone URL!' : 'Copy Clone URL'}
            aria-label="Copy clone URL"
          >
            {copiedClone ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </button>

          <div className="card-arrow-btn" aria-hidden="true">
            <ChevronRight size={18} />
          </div>
        </div>
      </div>

      {/* Description with fallback for null/empty */}
      <p className="repo-description" title={repo.description || undefined}>
        {repo.description || <span className="no-description">No description provided.</span>}
      </p>

      {/* Topics / Tags */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="topics-container">
          {repo.topics.slice(0, 3).map((topic) => (
            <span key={topic} className="topic-badge">
              #{topic}
            </span>
          ))}
          {repo.topics.length > 3 && (
            <span className="topic-badge topic-more">+{repo.topics.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer Stats Row */}
      <div className="card-footer">
        {/* Language Indicator */}
        <div className="meta-item language-meta">
          {repo.language ? (
            <>
              <span className="lang-dot" style={{ backgroundColor: langColor }} />
              <span className="lang-text">{repo.language}</span>
            </>
          ) : (
            <span className="lang-text text-muted">Plain text</span>
          )}
        </div>

        {/* Stars */}
        <div className="meta-item stars-meta" title={`${repo.stargazers_count.toLocaleString()} stars`}>
          <Star size={14} className="star-icon" />
          <span>{formatCompactNumber(repo.stargazers_count)}</span>
        </div>

        {/* Forks */}
        <div className="meta-item forks-meta" title={`${repo.forks_count.toLocaleString()} forks`}>
          <GitFork size={14} />
          <span>{formatCompactNumber(repo.forks_count)}</span>
        </div>

        {/* Issues (if open) */}
        {repo.open_issues_count > 0 && (
          <div className="meta-item issues-meta" title={`${repo.open_issues_count} open issues`}>
            <AlertCircle size={13} />
            <span>{formatCompactNumber(repo.open_issues_count)}</span>
          </div>
        )}

        {/* License */}
        {repo.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION' && (
          <div className="meta-item license-meta" title={`License: ${repo.license.name}`}>
            <Scale size={13} />
            <span>{repo.license.spdx_id}</span>
          </div>
        )}

        {/* Updated Relative Date */}
        <div className="meta-item updated-meta">
          <span>{formatRelativeTime(repo.updated_at || repo.pushed_at)}</span>
        </div>
      </div>
    </article>
  );
}
