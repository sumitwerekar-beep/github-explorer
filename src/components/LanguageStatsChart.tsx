import React, { useState } from 'react';
import type { ProcessedLanguage } from '../types/github';
import { formatBytes } from '../utils/formatters';
import { Code2, Info } from 'lucide-react';

interface LanguageStatsChartProps {
  languages: ProcessedLanguage[];
  totalRepoSize?: number;
}

export function LanguageStatsChart({ languages }: LanguageStatsChartProps): React.JSX.Element {
  const [activeLang, setActiveLang] = useState<string | null>(null);

  if (!languages || languages.length === 0) {
    return (
      <div className="language-stats-card empty-lang-card" data-testid="language-stats-empty">
        <div className="card-header-row">
          <div className="card-title-group">
            <Code2 size={18} className="text-accent" />
            <h3 className="card-title">Language Distribution</h3>
          </div>
        </div>
        <div className="empty-subtext">
          <Info size={16} />
          <span>No language breakdown available for this repository.</span>
        </div>
      </div>
    );
  }

  const totalBytes = languages.reduce((sum, l) => sum + l.bytes, 0);

  return (
    <div className="language-stats-card" data-testid="language-stats-chart">
      <div className="card-header-row">
        <div className="card-title-group">
          <Code2 size={18} className="text-accent" />
          <h3 className="card-title">Language Distribution</h3>
        </div>
        <span className="lang-total-badge">{languages.length} {languages.length === 1 ? 'Language' : 'Languages'} ({formatBytes(totalBytes)})</span>
      </div>

      {/* Multi-segment proportional visual meter bar */}
      <div className="language-bar-container">
        <div className="language-bar" role="meter" aria-label="Repository language distribution">
          {languages.map((lang) => (
            <div
              key={lang.name}
              className={`language-bar-segment ${activeLang === lang.name ? 'segment-highlighted' : ''}`}
              style={{
                width: `${Math.max(lang.percentage, 1)}%`,
                backgroundColor: lang.color,
              }}
              title={`${lang.name}: ${lang.percentage}% (${formatBytes(lang.bytes)})`}
              onMouseEnter={() => setActiveLang(lang.name)}
              onMouseLeave={() => setActiveLang(null)}
            />
          ))}
        </div>
      </div>

      {/* Language Breakdown Cards / Legend */}
      <div className="language-grid">
        {languages.map((lang) => {
          const isHighlighted = activeLang === lang.name;
          return (
            <div
              key={lang.name}
              className={`language-pill-item ${isHighlighted ? 'pill-active' : ''}`}
              onMouseEnter={() => setActiveLang(lang.name)}
              onMouseLeave={() => setActiveLang(null)}
            >
              <span className="lang-color-dot" style={{ backgroundColor: lang.color }} />
              <div className="lang-info">
                <span className="lang-name">{lang.name}</span>
                <span className="lang-bytes">{formatBytes(lang.bytes)}</span>
              </div>
              <span className="lang-percentage">{lang.percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
