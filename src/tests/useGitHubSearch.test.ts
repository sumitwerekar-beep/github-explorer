import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGitHubSearch } from '../hooks/useGitHubSearch';
import * as githubApi from '../services/githubApi';

describe('useGitHubSearch State Management Hook', () => {
  it('initializes with default query, page 1, and default filters', () => {
    const { result } = renderHook(() => useGitHubSearch('', 0));

    expect(result.current.query).toBe('');
    expect(result.current.page).toBe(1);
    expect(result.current.language).toBe('all');
    expect(result.current.sort).toBe('stars');
    expect(result.current.order).toBe('desc');
  });

  it('updates query and triggers search fetch', async () => {
    const mockRepo = {
      id: 101,
      name: 'svelte',
      full_name: 'sveltejs/svelte',
      private: false,
      stargazers_count: 75000,
      forks_count: 4000,
      open_issues_count: 300,
      size: 15000,
      language: 'TypeScript',
      description: 'Cybernetically enhanced web apps',
      topics: ['compiler', 'ui'],
      owner: { login: 'sveltejs', id: 1, avatar_url: '', html_url: '', type: 'Organization' },
      html_url: 'https://github.com/sveltejs/svelte',
      fork: false,
      url: '',
      created_at: '2016-11-20T00:00:00Z',
      updated_at: '2025-01-20T00:00:00Z',
      pushed_at: '2025-01-20T00:00:00Z',
      homepage: 'https://svelte.dev',
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      has_wiki: false,
      has_pages: false,
      archived: false,
      disabled: false,
      license: null,
      visibility: 'public',
      default_branch: 'main',
      node_id: 'n1',
      watchers_count: 75000,
    };

    const mockSearch = vi.spyOn(githubApi, 'searchRepositories').mockImplementation(async (filters) => {
      if (filters.query === 'svelte') {
        return { total_count: 1, incomplete_results: false, items: [mockRepo] };
      }
      return { total_count: 0, incomplete_results: false, items: [] };
    });

    const { result } = renderHook(() => useGitHubSearch('', 0));

    act(() => {
      result.current.setQuery('svelte');
    });

    await waitFor(() => {
      expect(result.current.repos).toHaveLength(1);
      expect(result.current.repos[0].name).toBe('svelte');
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockSearch).toHaveBeenCalled();
  });

  it('resets page to 1 when language or sort is changed', () => {
    const { result } = renderHook(() => useGitHubSearch('', 0));

    act(() => {
      result.current.setPage(4);
    });
    expect(result.current.page).toBe(4);

    act(() => {
      result.current.setLanguage('Python');
    });
    expect(result.current.page).toBe(1);
    expect(result.current.language).toBe('Python');

    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.page).toBe(3);

    act(() => {
      result.current.setSort('forks');
    });
    expect(result.current.page).toBe(1);
    expect(result.current.sort).toBe('forks');
  });

  it('captures API error states cleanly', async () => {
    vi.spyOn(githubApi, 'searchRepositories').mockRejectedValueOnce(
      new githubApi.GitHubApiError('Server 500 error', 500, 'Internal Server Error')
    );

    const { result } = renderHook(() => useGitHubSearch('fail-test', 0));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toContain('Server 500');
      expect(result.current.isLoading).toBe(false);
    });
  });
});
