import type { GitHubCommitActivityWeek, GitHubLanguageStats, ProcessedCommitStats, ProcessedLanguage } from '../types/github';
import { getLanguageColor } from './languageColors';

/**
 * Format numbers into compact strings (e.g. 1,420 -> 1.4k, 2,500,000 -> 2.5M)
 */
export function formatCompactNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  if (num === 0) return '0';

  if (Math.abs(num) >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(1);
    return formatted.endsWith('.0') ? `${Math.floor(num / 1_000_000)}M` : `${formatted}M`;
  }
  if (Math.abs(num) >= 1_000) {
    const formatted = (num / 1_000).toFixed(1);
    return formatted.endsWith('.0') ? `${Math.floor(num / 1_000)}k` : `${formatted}k`;
  }
  return num.toLocaleString();
}

/**
 * Format bytes into human-readable memory sizes (B, KB, MB, GB)
 */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const unitIndex = Math.min(i, units.length - 1);
  const size = bytes / Math.pow(1024, unitIndex);
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Format an ISO date string into a friendly localized date (e.g., "Jan 12, 2024")
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format date string as relative time ago (e.g. "3 hours ago", "5 days ago")
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    }
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
  } catch {
    return 'N/A';
  }
}

/**
 * Transforms raw GitHub language stats object into sorted list with percentages and colors
 */
export function processLanguageStats(stats: GitHubLanguageStats | null | undefined): ProcessedLanguage[] {
  if (!stats || typeof stats !== 'object' || Object.keys(stats).length === 0) {
    return [];
  }

  const entries = Object.entries(stats).filter(([, bytes]) => typeof bytes === 'number' && bytes > 0);
  const totalBytes = entries.reduce((sum, [, bytes]) => sum + bytes, 0);

  if (totalBytes === 0) return [];

  const processed = entries.map(([name, bytes]) => {
    const rawPercentage = (bytes / totalBytes) * 100;
    const percentage = Number(rawPercentage.toFixed(1));
    return {
      name,
      bytes,
      percentage: percentage < 0.1 && rawPercentage > 0 ? 0.1 : percentage,
      color: getLanguageColor(name),
    };
  });

  // Sort descending by bytes/percentage
  return processed.sort((a, b) => b.bytes - a.bytes);
}

/**
 * Transforms 52-week raw commit activity into aggregate metrics and chart-friendly data
 */
export function processCommitActivity(weeks: GitHubCommitActivityWeek[] | null | undefined): ProcessedCommitStats {
  if (!weeks || !Array.isArray(weeks) || weeks.length === 0) {
    return {
      totalCommitsYear: 0,
      avgWeeklyCommits: 0,
      peakWeeklyCommits: 0,
      peakWeekDate: 'N/A',
      weeks: [],
    };
  }

  let totalCommitsYear = 0;
  let peakWeeklyCommits = 0;
  let peakWeekTimestamp = 0;

  const processedWeeks = weeks.map((w) => {
    const total = typeof w.total === 'number' && !isNaN(w.total) ? w.total : 0;
    totalCommitsYear += total;

    if (total > peakWeeklyCommits) {
      peakWeeklyCommits = total;
      peakWeekTimestamp = w.week;
    }

    const date = new Date((w.week || 0) * 1000);
    const formattedDate = !isNaN(date.getTime())
      ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
      : 'Week';

    return {
      weekTimestamp: w.week,
      formattedDate,
      total,
      days: Array.isArray(w.days) ? w.days : [0, 0, 0, 0, 0, 0, 0],
    };
  });

  const avgWeeklyCommits = weeks.length > 0 ? Math.round(totalCommitsYear / weeks.length) : 0;

  let peakWeekDate = 'N/A';
  if (peakWeekTimestamp > 0) {
    const pDate = new Date(peakWeekTimestamp * 1000);
    if (!isNaN(pDate.getTime())) {
      peakWeekDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(pDate);
    }
  }

  return {
    totalCommitsYear,
    avgWeeklyCommits,
    peakWeeklyCommits,
    peakWeekDate,
    weeks: processedWeeks,
  };
}
