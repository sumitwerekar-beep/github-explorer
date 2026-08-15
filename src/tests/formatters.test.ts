import { describe, expect, it } from 'vitest';
import {
  formatBytes,
  formatCompactNumber,
  formatDate,
  formatRelativeTime,
  processCommitActivity,
  processLanguageStats,
} from '../utils/formatters';
import type { GitHubCommitActivityWeek } from '../types/github';

describe('Data Transformations & Formatters', () => {
  describe('formatCompactNumber', () => {
    it('formats thousands to compact k string', () => {
      expect(formatCompactNumber(1000)).toBe('1k');
      expect(formatCompactNumber(1500)).toBe('1.5k');
      expect(formatCompactNumber(1400)).toBe('1.4k');
      expect(formatCompactNumber(42300)).toBe('42.3k');
    });

    it('formats millions to compact M string', () => {
      expect(formatCompactNumber(1000000)).toBe('1M');
      expect(formatCompactNumber(2500000)).toBe('2.5M');
      expect(formatCompactNumber(12400000)).toBe('12.4M');
    });

    it('formats numbers less than 1000 as localized string', () => {
      expect(formatCompactNumber(0)).toBe('0');
      expect(formatCompactNumber(42)).toBe('42');
      expect(formatCompactNumber(999)).toBe('999');
    });

    it('handles null, undefined and NaN values safely without crashing', () => {
      expect(formatCompactNumber(null)).toBe('0');
      expect(formatCompactNumber(undefined)).toBe('0');
      expect(formatCompactNumber(NaN)).toBe('0');
    });
  });

  describe('formatBytes', () => {
    it('formats bytes into KB and MB', () => {
      expect(formatBytes(500)).toBe('500 B');
      expect(formatBytes(1024)).toBe('1.0 KB');
      expect(formatBytes(1048576)).toBe('1.0 MB');
      expect(formatBytes(5242880)).toBe('5.0 MB');
    });

    it('handles 0 and negative bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(null)).toBe('0 B');
      expect(formatBytes(-100)).toBe('0 B');
    });
  });

  describe('formatDate', () => {
    it('formats valid ISO date strings', () => {
      const result = formatDate('2023-10-15T00:00:00Z');
      expect(result).toBe('Oct 15, 2023');
    });

    it('handles invalid dates and nulls safely', () => {
      expect(formatDate(null)).toBe('N/A');
      expect(formatDate('invalid-date-string')).toBe('Invalid date');
    });
  });

  describe('formatRelativeTime', () => {
    it('formats recent timestamps as relative time', () => {
      const now = new Date();
      const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
      const threeHoursAgo = new Date(now.getTime() - 3 * 3600 * 1000).toISOString();
      const fourDaysAgo = new Date(now.getTime() - 4 * 86400 * 1000).toISOString();

      expect(formatRelativeTime(fiveMinsAgo)).toBe('5 minutes ago');
      expect(formatRelativeTime(threeHoursAgo)).toBe('3 hours ago');
      expect(formatRelativeTime(fourDaysAgo)).toBe('4 days ago');
    });

    it('handles null/undefined timestamps gracefully', () => {
      expect(formatRelativeTime(null)).toBe('N/A');
      expect(formatRelativeTime('invalid-string')).toBe('Invalid date');
    });
  });

  describe('processLanguageStats', () => {
    it('transforms raw bytes object into sorted list with exact percentages', () => {
      const raw = {
        TypeScript: 7000,
        JavaScript: 2000,
        HTML: 1000,
      };

      const result = processLanguageStats(raw);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('TypeScript');
      expect(result[0].percentage).toBe(70);
      expect(result[0].bytes).toBe(7000);
      expect(result[0].color).toBe('#3178c6');

      expect(result[1].name).toBe('JavaScript');
      expect(result[1].percentage).toBe(20);

      expect(result[2].name).toBe('HTML');
      expect(result[2].percentage).toBe(10);
    });

    it('handles empty language stats or non-object inputs safely', () => {
      expect(processLanguageStats({})).toEqual([]);
      expect(processLanguageStats(null)).toEqual([]);
      expect(processLanguageStats(undefined)).toEqual([]);
    });

    it('filters out 0-byte languages', () => {
      const raw = { Rust: 5000, C: 0 };
      const result = processLanguageStats(raw);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Rust');
      expect(result[0].percentage).toBe(100);
    });
  });

  describe('processCommitActivity', () => {
    it('aggregates 52-week commits, detects peaks, and computes weekly averages', () => {
      const mockWeeks: GitHubCommitActivityWeek[] = [
        { week: 1700000000, total: 10, days: [1, 2, 3, 2, 1, 1, 0] },
        { week: 1700604800, total: 50, days: [5, 10, 15, 10, 5, 5, 0] }, // peak
        { week: 1701209600, total: 30, days: [4, 6, 8, 6, 4, 2, 0] },
      ];

      const stats = processCommitActivity(mockWeeks);

      expect(stats.totalCommitsYear).toBe(90);
      expect(stats.avgWeeklyCommits).toBe(30); // 90 / 3
      expect(stats.peakWeeklyCommits).toBe(50);
      expect(stats.weeks).toHaveLength(3);
      expect(stats.weeks[1].total).toBe(50);
    });

    it('handles empty or malformed commit activity gracefully', () => {
      const stats = processCommitActivity([]);
      expect(stats.totalCommitsYear).toBe(0);
      expect(stats.avgWeeklyCommits).toBe(0);
      expect(stats.peakWeeklyCommits).toBe(0);
      expect(stats.peakWeekDate).toBe('N/A');
      expect(stats.weeks).toEqual([]);

      const nullStats = processCommitActivity(null);
      expect(nullStats.totalCommitsYear).toBe(0);
    });
  });
});
