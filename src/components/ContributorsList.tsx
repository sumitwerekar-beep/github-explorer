import React, { useState } from 'react';
import type { GitHubContributor } from '../types/github';
import { formatCompactNumber } from '../utils/formatters';
import { Award, ExternalLink, GitCommit, Users } from 'lucide-react';

interface ContributorsListProps {
  contributors: GitHubContributor[];
}

export function ContributorsList({ contributors }: ContributorsListProps): React.JSX.Element {
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  if (!contributors || contributors.length === 0) {
    return (
      <div className="contributors-card empty-contrib-card" data-testid="contributors-empty">
        <div className="card-header-row">
          <div className="card-title-group">
            <Users size={18} className="text-accent" />
            <h3 className="card-title">Top Contributors</h3>
          </div>
        </div>
        <div className="empty-subtext">
          <span>No contributor information available or private repository.</span>
        </div>
      </div>
    );
  }

  // Sort descending by contributions
  const sortedContributors = [...contributors].sort((a, b) => b.contributions - a.contributions);

  return (
    <div className="contributors-card" data-testid="contributors-list">
      <div className="card-header-row">
        <div className="card-title-group">
          <Users size={18} className="text-accent" />
          <h3 className="card-title">Top Contributors</h3>
        </div>
        <span className="contrib-count-badge">{sortedContributors.length} Contributors</span>
      </div>

      <div className="contributors-grid">
        {sortedContributors.map((contrib, index) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;
          const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';

          return (
            <a
              key={contrib.id || contrib.login}
              href={contrib.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`contributor-item ${rankClass}`}
              title={`View ${contrib.login}'s GitHub profile (${contrib.contributions} contributions)`}
            >
              <div className="rank-badge-wrapper">
                {isTop3 ? (
                  <span className={`podium-badge ${rankClass}`}>
                    <Award size={13} /> #{rank}
                  </span>
                ) : (
                  <span className="normal-rank">#{rank}</span>
                )}
              </div>

              <div className="avatar-wrapper">
                {!imgErrors[contrib.id] ? (
                  <img
                    src={contrib.avatar_url}
                    alt={contrib.login}
                    className="contrib-avatar"
                    loading="lazy"
                    onError={() => setImgErrors((prev) => ({ ...prev, [contrib.id]: true }))}
                  />
                ) : (
                  <div className="contrib-avatar-fallback">
                    {contrib.login.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="contrib-info">
                <div className="contrib-login-row">
                  <span className="contrib-name">{contrib.login}</span>
                  <ExternalLink size={11} className="external-icon" />
                </div>
                <div className="contrib-commits-badge">
                  <GitCommit size={12} />
                  <span>{formatCompactNumber(contrib.contributions)} commits</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
