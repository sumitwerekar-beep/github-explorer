import React, { useState } from 'react';
import type { ProcessedCommitStats } from '../types/github';
import { formatCompactNumber } from '../utils/formatters';
import { Activity, Flame, GitCommit, TrendingUp } from 'lucide-react';

interface CommitActivityChartProps {
  commitStats: ProcessedCommitStats;
}

export function CommitActivityChart({ commitStats }: CommitActivityChartProps): React.JSX.Element {
  const [hoveredWeekIndex, setHoveredWeekIndex] = useState<number | null>(null);

  const { weeks, totalCommitsYear, avgWeeklyCommits, peakWeeklyCommits, peakWeekDate } = commitStats;

  if (!weeks || weeks.length === 0) {
    return (
      <div className="commit-chart-card empty-chart-card" data-testid="commit-chart-empty">
        <div className="card-header-row">
          <div className="card-title-group">
            <Activity size={18} className="text-accent" />
            <h3 className="card-title">Commit Activity (Past 52 Weeks)</h3>
          </div>
        </div>
        <div className="empty-subtext">
          <GitCommit size={16} />
          <span>Commit activity data is currently compiling or not available for this repository.</span>
        </div>
      </div>
    );
  }

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 180;
  const paddingX = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(...weeks.map((w) => w.total), 10);
  const stepX = innerWidth / Math.max(weeks.length - 1, 1);

  // Generate SVG path for smoothed Area & Line
  const points = weeks.map((w, index) => {
    const x = paddingX + index * stepX;
    const y = paddingTop + innerHeight - (w.total / maxVal) * innerHeight;
    return { x, y, week: w };
  });

  const linePathD = points.reduce((path, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${path} L ${pt.x},${pt.y}`;
  }, '');

  const areaPathD = `${linePathD} L ${points[points.length - 1].x},${paddingTop + innerHeight} L ${points[0].x},${paddingTop + innerHeight} Z`;

  const hoveredWeek = hoveredWeekIndex !== null && weeks[hoveredWeekIndex] ? weeks[hoveredWeekIndex] : null;

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="commit-chart-card" data-testid="commit-activity-chart">
      <div className="card-header-row">
        <div className="card-title-group">
          <Activity size={18} className="text-accent" />
          <h3 className="card-title">52-Week Commit Activity</h3>
        </div>
        <span className="chart-subtitle">Weekly commits distribution over the past year</span>
      </div>

      {/* Summary KPI Badges */}
      <div className="chart-kpis-grid">
        <div className="kpi-box">
          <div className="kpi-label">
            <GitCommit size={14} className="text-muted" /> Total Commits (Year)
          </div>
          <div className="kpi-value">{formatCompactNumber(totalCommitsYear)}</div>
        </div>
        <div className="kpi-box">
          <div className="kpi-label">
            <TrendingUp size={14} className="text-muted" /> Weekly Average
          </div>
          <div className="kpi-value">{avgWeeklyCommits} / wk</div>
        </div>
        <div className="kpi-box">
          <div className="kpi-label">
            <Flame size={14} className="text-accent" /> Peak Week ({peakWeekDate})
          </div>
          <div className="kpi-value highlight-peak">{peakWeeklyCommits} commits</div>
        </div>
      </div>

      {/* Responsive Interactive SVG Chart */}
      <div className="svg-chart-wrapper">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="commit-svg-chart"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={svgWidth - paddingX}
            y2={paddingTop}
            className="chart-grid-line"
          />
          <line
            x1={paddingX}
            y1={paddingTop + innerHeight / 2}
            x2={svgWidth - paddingX}
            y2={paddingTop + innerHeight / 2}
            className="chart-grid-line"
          />
          <line
            x1={paddingX}
            y1={paddingTop + innerHeight}
            x2={svgWidth - paddingX}
            y2={paddingTop + innerHeight}
            className="chart-baseline"
          />

          {/* Area Fill */}
          <path d={areaPathD} fill="url(#commitGradient)" />

          {/* Main Stroke Line */}
          <path d={linePathD} fill="none" className="chart-line-stroke" />

          {/* Interactive Bars / Trigger columns for hover */}
          {points.map((pt, index) => {
            const barWidth = Math.max(stepX - 1.5, 4);
            const isHovered = hoveredWeekIndex === index;
            return (
              <g key={index}>
                {/* Vertical subtle bar */}
                <rect
                  x={pt.x - barWidth / 2}
                  y={pt.y}
                  width={barWidth}
                  height={paddingTop + innerHeight - pt.y}
                  className={`chart-bar-rect ${isHovered ? 'bar-highlighted' : ''}`}
                  rx={2}
                />
                {/* Transparent hit area for easy hover on mobile/desktop */}
                <rect
                  x={pt.x - stepX / 2}
                  y={0}
                  width={stepX}
                  height={svgHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredWeekIndex(index)}
                  onTouchStart={() => setHoveredWeekIndex(index)}
                />
                {/* Circle point if active */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={5}
                    className="chart-active-point"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip info */}
        {hoveredWeek && (
          <div className="chart-tooltip-panel">
            <div className="tooltip-header">
              <span className="tooltip-week-label">Week of {hoveredWeek.formattedDate}</span>
              <span className="tooltip-week-count">{hoveredWeek.total} commits</span>
            </div>
            <div className="tooltip-days-row">
              {hoveredWeek.days.map((d, dIdx) => (
                <div key={dIdx} className="tooltip-day-item" title={`${dayLabels[dIdx]}: ${d} commits`}>
                  <span className="tooltip-day-name">{dayLabels[dIdx]}</span>
                  <span className={`tooltip-day-bubble ${d > 0 ? 'bubble-active' : ''}`}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Axis Month Markers */}
      <div className="chart-x-labels">
        <span>52 weeks ago</span>
        <span>26 weeks ago</span>
        <span>Recent week</span>
      </div>
    </div>
  );
}
