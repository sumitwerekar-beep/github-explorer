import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CommitActivityChart } from '../components/CommitActivityChart';
import { ContributorsList } from '../components/ContributorsList';
import { EmptyState, ErrorState, RateLimitBanner } from '../components/FeedbackStates';
import { LanguageStatsChart } from '../components/LanguageStatsChart';
import { RepoCard } from '../components/RepoCard';
import { SearchBar } from '../components/SearchBar';
import type { GitHubContributor, GitHubRepo, ProcessedCommitStats, ProcessedLanguage } from '../types/github';

describe('UI Component Integration & Resilience', () => {
  describe('SearchBar Component', () => {
    it('calls onQueryChange when user types, clear when X is clicked, and switches tabs', () => {
      const onQueryChange = vi.fn();
      const onClear = vi.fn();
      const onViewTabChange = vi.fn();

      const { rerender } = render(
        <SearchBar
          query=""
          onQueryChange={onQueryChange}
          language="all"
          onLanguageChange={vi.fn()}
          sort="stars"
          onSortChange={vi.fn()}
          order="desc"
          onOrderChange={vi.fn()}
          isLoading={false}
          onClear={onClear}
          viewTab="explore"
          onViewTabChange={onViewTabChange}
          bookmarksCount={3}
        />
      );

      const input = screen.getByPlaceholderText(/search repositories/i);
      fireEvent.change(input, { target: { value: 'rust' } });
      expect(onQueryChange).toHaveBeenCalledWith('rust');

      // Click Bookmarks tab
      const bookmarksTab = screen.getByRole('button', { name: /bookmarked/i });
      fireEvent.click(bookmarksTab);
      expect(onViewTabChange).toHaveBeenCalledWith('bookmarks');

      // Rerender with query populated
      rerender(
        <SearchBar
          query="rust"
          onQueryChange={onQueryChange}
          language="all"
          onLanguageChange={vi.fn()}
          sort="stars"
          onSortChange={vi.fn()}
          order="desc"
          onOrderChange={vi.fn()}
          isLoading={false}
          onClear={onClear}
          viewTab="explore"
          onViewTabChange={onViewTabChange}
          bookmarksCount={3}
        />
      );

      const clearBtn = screen.getByTitle('Clear search');
      fireEvent.click(clearBtn);
      expect(onClear).toHaveBeenCalled();
    });
  });

  describe('RepoCard Resilience & Bookmark Action', () => {
    const mockRepo: GitHubRepo = {
      id: 999,
      node_id: 'n999',
      name: 'minimal-repo',
      full_name: 'testuser/minimal-repo',
      private: false,
      owner: {
        login: 'testuser',
        id: 123,
        avatar_url: 'https://example.com/avatar.jpg',
        html_url: 'https://github.com/testuser',
        type: 'User',
      },
      html_url: 'https://github.com/testuser/minimal-repo',
      description: null, // Null description test
      fork: false,
      url: '',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
      pushed_at: '2023-01-02T00:00:00Z',
      homepage: null,
      size: 500,
      stargazers_count: 3200,
      watchers_count: 3200,
      language: null, // Null language test
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      has_wiki: true,
      has_pages: false,
      forks_count: 150,
      archived: false,
      disabled: false,
      open_issues_count: 0,
      license: null, // Null license test
      topics: [],
      visibility: 'public',
      default_branch: 'main',
    };

    it('renders safely when description, language, and license are null', () => {
      const onSelect = vi.fn();
      const onToggleBookmark = vi.fn();

      render(
        <RepoCard
          repo={mockRepo}
          onSelectRepo={onSelect}
          isBookmarked={false}
          onToggleBookmark={onToggleBookmark}
        />
      );

      expect(screen.getByText('minimal-repo')).toBeInTheDocument();
      expect(screen.getByText('No description provided.')).toBeInTheDocument();
      expect(screen.getByText('Plain text')).toBeInTheDocument();
      expect(screen.getByText('3.2k')).toBeInTheDocument();

      // Click bookmark button
      const bookmarkBtn = screen.getByLabelText('Toggle Bookmark');
      fireEvent.click(bookmarkBtn);
      expect(onToggleBookmark).toHaveBeenCalledWith(mockRepo);

      // Click card triggers onSelect
      fireEvent.click(screen.getByTestId('repo-card-999'));
      expect(onSelect).toHaveBeenCalledWith(mockRepo);
    });
  });

  describe('LanguageStatsChart', () => {
    it('renders visual progress bar and language items with percentages', () => {
      const languages: ProcessedLanguage[] = [
        { name: 'TypeScript', bytes: 8000, percentage: 80, color: '#3178c6' },
        { name: 'CSS', bytes: 2000, percentage: 20, color: '#563d7c' },
      ];

      render(<LanguageStatsChart languages={languages} />);

      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('CSS')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
      expect(screen.getByRole('meter')).toBeInTheDocument();
    });

    it('renders empty fallback message when languages array is empty', () => {
      render(<LanguageStatsChart languages={[]} />);
      expect(screen.getByText(/no language breakdown available/i)).toBeInTheDocument();
    });
  });

  describe('CommitActivityChart', () => {
    it('renders 52-week commit activity metrics, SVG chart, and switches to Day-of-Week heatmap', () => {
      const commitStats: ProcessedCommitStats = {
        totalCommitsYear: 450,
        avgWeeklyCommits: 9,
        peakWeeklyCommits: 45,
        peakWeekDate: 'Aug 12, 2024',
        weeks: [
          { weekTimestamp: 1700000000, formattedDate: 'Aug 12', total: 45, days: [5, 10, 15, 5, 5, 5, 0] },
          { weekTimestamp: 1700604800, formattedDate: 'Aug 19', total: 10, days: [2, 2, 2, 2, 2, 0, 0] },
        ],
      };

      render(<CommitActivityChart commitStats={commitStats} />);

      expect(screen.getByText('52-Week Commit Activity')).toBeInTheDocument();
      expect(screen.getByText('450')).toBeInTheDocument();
      expect(screen.getByText('45 commits')).toBeInTheDocument();

      // Switch to Day-of-Week heatmap view
      const heatmapBtn = screen.getByRole('button', { name: /day-of-week/i });
      fireEvent.click(heatmapBtn);

      expect(screen.getByTestId('weekday-heatmap')).toBeInTheDocument();
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
    });

    it('renders empty message when weeks are empty', () => {
      const emptyStats: ProcessedCommitStats = {
        totalCommitsYear: 0,
        avgWeeklyCommits: 0,
        peakWeeklyCommits: 0,
        peakWeekDate: 'N/A',
        weeks: [],
      };
      render(<CommitActivityChart commitStats={emptyStats} />);
      expect(screen.getByText(/commit activity data is currently compiling/i)).toBeInTheDocument();
    });
  });

  describe('ContributorsList', () => {
    it('renders ranked contributors with podium tags and contribution counts', () => {
      const contributors: GitHubContributor[] = [
        { id: 1, login: 'dan_abramov', contributions: 1200, avatar_url: '', html_url: 'https://github.com/dan', type: 'User' },
        { id: 2, login: 'sophie_bits', contributions: 950, avatar_url: '', html_url: 'https://github.com/sophie', type: 'User' },
      ];

      render(<ContributorsList contributors={contributors} />);

      expect(screen.getByText('dan_abramov')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('1.2k commits')).toBeInTheDocument();

      expect(screen.getByText('sophie_bits')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('950 commits')).toBeInTheDocument();
    });
  });

  describe('Feedback States', () => {
    it('handles empty state with suggestion chip clicks', () => {
      const onPick = vi.fn();
      render(<EmptyState query="xyz123abc" onReset={vi.fn()} onPickSuggestion={onPick} />);

      const reactChip = screen.getByRole('button', { name: /react/i });
      fireEvent.click(reactChip);
      expect(onPick).toHaveBeenCalledWith('react');
    });

    it('handles error state with retry button click', () => {
      const onRetry = vi.fn();
      render(<ErrorState error={new Error('Connection timed out')} onRetry={onRetry} />);

      expect(screen.getByText('Connection timed out')).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryBtn);
      expect(onRetry).toHaveBeenCalled();
    });

    it('renders rate limit banner with demo mode and token modal triggers', () => {
      const onSwitchToDemo = vi.fn();
      const onOpenToken = vi.fn();

      render(
        <RateLimitBanner
          rateLimit={{ limit: 60, remaining: 0, reset: Math.floor(Date.now() / 1000) + 1200, used: 60, resetDate: new Date() }}
          onSwitchToDemo={onSwitchToDemo}
          onOpenTokenModal={onOpenToken}
        />
      );

      expect(screen.getByText(/GitHub API Rate Limit Reached/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Switch to Demo Mode/i }));
      expect(onSwitchToDemo).toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: /Add Personal Access Token/i }));
      expect(onOpenToken).toHaveBeenCalled();
    });
  });
});
