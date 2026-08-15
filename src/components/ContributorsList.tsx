import React, { useState } from 'react';
import type { GitHubContributor } from '../types/github';
import { formatCompactNumber } from '../utils/formatters';
import { Award, ExternalLink, GitCommit, Search, Users } from 'lucide-react';

interface ContributorsListProps {
  contributors: GitHubContributor[];
}

export function ContributorsList({ contributors }: ContributorsListProps): React.JSX.Element {
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [searchFilter, setSearchFilter] = useState<string>('');

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
  const maxContribs = sortedContributors[0]?.contributions || 1;
  const totalTopContribs = sortedContributors.reduce((acc, c) => acc + c.contributions, 0);

  const filteredContributors = sortedContributors.filter((c) =>
    c.login.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  return (
    <div className="contributors-card" data-testid="contributors-list">
      <div className="card-header-row">
        <div className="card-title-group">
          <Users size={18} className="text-accent" />
          <div>
            <h3 className="card-title">Top Contributors Leaderboard</h3>
            <span className="chart-subtitle">Ranked by total code contributions</span>
          </div>
        </div>
        <span className="contrib-count-badge">{sortedContributors.length} Contributors</span>
      </div>

      {/* Contributor Search Filter if > 6 */}
      {sortedContributors.length > 6 && (
        <div className="contrib-filter-bar">
          <Search size={14} className="text-muted" />
          <input
            type="text"
            className="contrib-search-input"
            placeholder="Search contributor username..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      )}

      <div className="contributors-grid">
        {filteredContributors.map((contrib) => {
          // Original rank based on sorted list
          const rank = sortedContributors.findIndex((c) => c.login === contrib.login) + 1;
          const isTop3 = rank <= 3;
          const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';
          const percentOfTop = Math.round((contrib.contributions / maxContribs) * 100);

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
                {!imgErrors[contrib.id] && contrib.avatar_url ? (
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
                  {totalTopContribs > 0 && (
                    <span className="contrib-share-tag">
                      {Math.max(1, Math.round((contrib.contributions / totalTopContribs) * 100))}% share
                    </span>
                  )}
                </div>
                {/* Visual contribution bar */}
                <div className="contrib-progress-track">
                  <div className="contrib-progress-fill" style={{ width: `${percentOfTop}%` }} />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
