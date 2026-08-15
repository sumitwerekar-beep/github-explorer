import React, { useState } from 'react';
import type { ProcessedCommitStats } from '../types/github';
import { formatCompactNumber } from '../utils/formatters';
import { Activity, CalendarDays, Flame, GitCommit, LayoutGrid, TrendingUp } from 'lucide-react';

interface CommitActivityChartProps {
  commitStats: ProcessedCommitStats;
}

/**
 * Generate a smooth cubic bezier SVG path from a series of points
 */
function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;

  let path = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const prev = points[Math.max(i - 1, 0)];
    const nextNext = points[Math.min(i + 2, points.length - 1)];

    // Cubic bezier control points
    const cp1x = current.x + (next.x - prev.x) / 6;
    const cp1y = current.y + (next.y - prev.y) / 6;
    const cp2x = next.x - (nextNext.x - current.x) / 6;
    const cp2y = next.y - (nextNext.y - current.y) / 6;

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)}`;
  }

  return path;
}

export function CommitActivityChart({ commitStats }: CommitActivityChartProps): React.JSX.Element {
  const [hoveredWeekIndex, setHoveredWeekIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'heatmap'>('timeline');

  const { weeks, totalCommitsYear, avgWeeklyCommits, peakWeeklyCommits, peakWeekDate } = commitStats;

  if (!weeks || weeks.length === 0) {
    return (
      <div className="commit-chart-card empty-chart-card" data-testid="commit-chart-empty">
        <div className="card-header-row">
          <div className="card-title-group">
            <Activity size={18} className="text-accent" />
            <h3 className="card-title">52-Week Commit Activity</h3>
          </div>
        </div>
        <div className="empty-subtext">
          <GitCommit size={16} />
          <span>Commit activity data is currently compiling or not available for this repository.</span>
        </div>
      </div>
    );
  }

  // Aggregate day-of-week stats across all 52 weeks (0 = Sunday, 6 = Saturday)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  weeks.forEach((w) => {
    if (Array.isArray(w.days)) {
      w.days.forEach((cnt, dayIdx) => {
        if (dayIdx < 7) {
          dayTotals[dayIdx] += cnt || 0;
        }
      });
    }
  });

  const maxDayTotal = Math.max(...dayTotals, 1);
  const mostActiveDayIndex = dayTotals.indexOf(Math.max(...dayTotals));
  const mostActiveDayName = dayNames[mostActiveDayIndex];

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 200;
  const paddingX = 24;
  const paddingTop = 24;
  const paddingBottom = 34;

  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(...weeks.map((w) => w.total), 10);
  const stepX = innerWidth / Math.max(weeks.length - 1, 1);

  // Generate smooth cubic bezier line & area paths
  const points = weeks.map((w, index) => {
    const x = paddingX + index * stepX;
    const y = paddingTop + innerHeight - (w.total / maxVal) * innerHeight;
    return { x, y, week: w };
  });

  const linePathD = createSmoothPath(points);
  const areaPathD = `${linePathD} L ${points[points.length - 1].x},${paddingTop + innerHeight} L ${points[0].x},${paddingTop + innerHeight} Z`;

  const hoveredWeek = hoveredWeekIndex !== null && weeks[hoveredWeekIndex] ? weeks[hoveredWeekIndex] : null;

  return (
    <div className="commit-chart-card" data-testid="commit-activity-chart">
      {/* Top Header Row with View Toggles */}
      <div className="card-header-row">
        <div className="card-title-group">
          <Activity size={18} className="text-accent" />
          <div>
            <h3 className="card-title">52-Week Commit Activity</h3>
            <span className="chart-subtitle">Interactive velocity and contribution patterns</span>
          </div>
        </div>

        <div className="chart-view-tabs">
          <button
            type="button"
            className={`chart-tab-btn ${activeTab === 'timeline' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('timeline')}
            title="View 52-week activity trend line"
          >
            <Activity size={14} />
            <span>Timeline</span>
          </button>
          <button
            type="button"
            className={`chart-tab-btn ${activeTab === 'heatmap' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('heatmap')}
            title="View day-of-week contribution heatmap"
          >
            <LayoutGrid size={14} />
            <span>Day-of-Week</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="chart-kpis-grid">
        <div className="kpi-box">
          <div className="kpi-label">
            <GitCommit size={14} className="text-muted" /> Total Commits (Year)
          </div>
          <div className="kpi-value">{formatCompactNumber(totalCommitsYear)}</div>
          <span className="kpi-subtext">Across past 52 weeks</span>
        </div>
        <div className="kpi-box">
          <div className="kpi-label">
            <TrendingUp size={14} className="text-muted" /> Weekly Average
          </div>
          <div className="kpi-value">{avgWeeklyCommits} <span className="unit-label">/ wk</span></div>
          <span className="kpi-subtext">Consistent release pace</span>
        </div>
        <div className="kpi-box">
          <div className="kpi-label">
            <Flame size={14} className="text-accent" /> Peak Velocity ({peakWeekDate})
          </div>
          <div className="kpi-value highlight-peak">{peakWeeklyCommits} commits</div>
          <span className="kpi-subtext">Highest weekly output</span>
        </div>
        <div className="kpi-box">
          <div className="kpi-label">
            <CalendarDays size={14} className="text-muted" /> Peak Weekday
          </div>
          <div className="kpi-value highlight-day">{mostActiveDayName}</div>
          <span className="kpi-subtext">{formatCompactNumber(dayTotals[mostActiveDayIndex])} commits on {mostActiveDayName}s</span>
        </div>
      </div>

      {/* View 1: 52-Week Smooth SVG Timeline Chart */}
      {activeTab === 'timeline' && (
        <div className="svg-chart-wrapper">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="commit-svg-chart"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="commitGlowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.5" />
                <stop offset="60%" stopColor="var(--accent-primary)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
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

            {/* Area Gradient Fill */}
            <path d={areaPathD} fill="url(#commitGlowGradient)" />

            {/* Smooth Bezier Line Stroke */}
            <path d={linePathD} fill="none" className="chart-line-stroke" filter="url(#glow)" />

            {/* Interactive Bars / Trigger columns for hover */}
            {points.map((pt, index) => {
              const barWidth = Math.max(stepX - 1.5, 4);
              const isHovered = hoveredWeekIndex === index;
              return (
                <g key={index}>
                  {/* Vertical bar on hover */}
                  <rect
                    x={pt.x - barWidth / 2}
                    y={pt.y}
                    width={barWidth}
                    height={paddingTop + innerHeight - pt.y}
                    className={`chart-bar-rect ${isHovered ? 'bar-highlighted' : ''}`}
                    rx={2}
                  />
                  {/* Invisible Hit Area */}
                  <rect
                    x={pt.x - stepX / 2}
                    y={0}
                    width={stepX}
                    height={svgHeight}
                    fill="transparent"
                    onMouseEnter={() => setHoveredWeekIndex(index)}
                    onTouchStart={() => setHoveredWeekIndex(index)}
                  />
                  {/* Glowing active point */}
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
                  <div key={dIdx} className="tooltip-day-item" title={`${dayNames[dIdx]}: ${d} commits`}>
                    <span className="tooltip-day-name">{dayNames[dIdx]}</span>
                    <span className={`tooltip-day-bubble ${d > 0 ? 'bubble-active' : ''}`}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Axis Labels */}
          <div className="chart-x-labels">
            <span>52 weeks ago</span>
            <span>26 weeks ago</span>
            <span>Latest week</span>
          </div>
        </div>
      )}

      {/* View 2: Day of Week Activity Matrix Heatmap */}
      {activeTab === 'heatmap' && (
        <div className="weekday-heatmap-container" data-testid="weekday-heatmap">
          <div className="weekday-heatmap-grid">
            {dayNames.map((name, idx) => {
              const count = dayTotals[idx];
              const percent = Math.round((count / maxDayTotal) * 100);
              const isPeak = idx === mostActiveDayIndex;

              return (
                <div key={name} className={`weekday-heatmap-col ${isPeak ? 'col-peak' : ''}`}>
                  <span className="weekday-col-name">{name}</span>
                  <div className="weekday-bar-track">
                    <div
                      className="weekday-bar-fill"
                      style={{ height: `${Math.max(percent, 4)}%` }}
                    />
                  </div>
                  <strong className="weekday-col-count">{formatCompactNumber(count)}</strong>
                  <span className="weekday-col-percent">{percent}%</span>
                </div>
              );
            })}
          </div>
          <div className="heatmap-legend-row">
            <span>Distribution of all {formatCompactNumber(totalCommitsYear)} commits by day of week</span>
            <span className="heatmap-peak-badge">
              <Flame size={12} /> {mostActiveDayName} is most active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
