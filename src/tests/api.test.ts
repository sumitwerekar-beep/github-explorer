import { describe, expect, it, vi } from 'vitest';
import {
  getCurrentRateLimit,
  GitHubApiError,
  GitHubNotFoundError,
  GitHubRateLimitError,
  parseRateLimitHeaders,
  searchRepositories,
  getRepoDetails,
  getRepoCommitActivity,
  getRepoContributors,
} from '../services/githubApi';

describe('GitHub API Service & Async Handling', () => {
  describe('Rate Limit Header Parsing', () => {
    it('correctly parses x-ratelimit headers and updates in-memory state', () => {
      const headers = new Headers();
      headers.set('x-ratelimit-limit', '60');
      headers.set('x-ratelimit-remaining', '42');
      headers.set('x-ratelimit-reset', '1750000000');
      headers.set('x-ratelimit-used', '18');

      const parsed = parseRateLimitHeaders(headers);

      expect(parsed).not.toBeNull();
      expect(parsed?.limit).toBe(60);
      expect(parsed?.remaining).toBe(42);
      expect(parsed?.reset).toBe(1750000000);
      expect(parsed?.used).toBe(18);
      expect(getCurrentRateLimit().remaining).toBe(42);
    });

    it('returns null if required rate limit headers are missing', () => {
      const emptyHeaders = new Headers();
      const parsed = parseRateLimitHeaders(emptyHeaders);
      expect(parsed).toBeNull();
    });
  });

  describe('searchRepositories API', () => {
    it('constructs correct query params for keywords, language, and sorting', async () => {
      const mockResponse = {
        total_count: 1,
        incomplete_results: false,
        items: [{ id: 1, name: 'react', full_name: 'facebook/react' }],
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'x-ratelimit-limit': '60',
          'x-ratelimit-remaining': '55',
          'x-ratelimit-reset': '1750000000',
        }),
        json: async () => mockResponse,
      } as unknown as Response);

      const result = await searchRepositories({
        query: 'react framework',
        language: 'TypeScript',
        sort: 'stars',
        order: 'desc',
        page: 2,
        perPage: 12,
      });

      expect(fetchSpy).toHaveBeenCalled();
      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('react%20framework');
      expect(calledUrl).toContain('language%3ATypeScript');
      expect(calledUrl).toContain('sort=stars');
      expect(calledUrl).toContain('order=desc');
      expect(calledUrl).toContain('page=2');
      expect(result.items[0].name).toBe('react');
    });

    it('throws GitHubRateLimitError on 403 when remaining is 0', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        headers: new Headers({
          'x-ratelimit-limit': '60',
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': '1750003600',
        }),
        json: async () => ({ message: 'API rate limit exceeded' }),
      } as unknown as Response);

      await expect(
        searchRepositories({ query: 'vue', sort: 'stars', order: 'desc', page: 1, perPage: 10 })
      ).rejects.toThrow(GitHubRateLimitError);
    });

    it('throws GitHubNotFoundError on 404 status', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        json: async () => ({ message: 'Not Found' }),
      } as unknown as Response);

      await expect(getRepoDetails('nonexistent-owner-999', 'nonexistent-repo')).rejects.toThrow(
        GitHubNotFoundError
      );
    });

    it('injects Authorization Bearer token header if token is supplied', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ id: 123, name: 'test-repo' }),
      } as unknown as Response);

      await getRepoDetails('owner', 'repo', { token: 'ghp_secret_token_123' });

      expect(fetchSpy).toHaveBeenCalled();
      const calledOptions = fetchSpy.mock.calls[0][1] as RequestInit;
      expect((calledOptions.headers as Record<string, string>)['Authorization']).toBe('Bearer ghp_secret_token_123');
    });

    it('handles network disconnection gracefully', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Failed to fetch'));

      await expect(getRepoDetails('owner', 'repo')).rejects.toThrow(GitHubApiError);
    });
  });

  describe('Mock Mode Fallbacks', () => {
    it('returns mock search results without network calls when useMock is true', async () => {
      const result = await searchRepositories(
        { query: 'react', sort: 'stars', order: 'desc', page: 1, perPage: 10 },
        { useMock: true }
      );

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0].name).toBe('react');
    });

    it('returns mock commit activity and contributors when useMock is true', async () => {
      const commits = await getRepoCommitActivity('facebook', 'react', { useMock: true });
      expect(commits.length).toBe(52);

      const contributors = await getRepoContributors('facebook', 'react', { useMock: true });
      expect(contributors.length).toBeGreaterThan(0);
    });
  });
});
