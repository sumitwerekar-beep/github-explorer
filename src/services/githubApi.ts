import type {
  GitHubCommitActivityWeek,
  GitHubContributor,
  GitHubLanguageStats,
  GitHubRepo,
  GitHubSearchResponse,
  RateLimitInfo,
  SearchFilters,
} from '../types/github';
import {
  generateMockCommitActivity,
  MOCK_CONTRIBUTORS,
  MOCK_LANGUAGES,
  MOCK_REPOSITORIES,
  searchMockRepositories,
} from './mockData';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubApiError extends Error {
  status: number;
  statusText: string;
  responseBody?: unknown;

  constructor(message: string, status: number, statusText: string, responseBody?: unknown) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
    this.statusText = statusText;
    this.responseBody = responseBody;
  }
}

export class GitHubRateLimitError extends GitHubApiError {
  resetDate: Date;
  resetTimestamp: number;

  constructor(message: string, resetTimestamp: number) {
    super(message, 403, 'Rate Limit Exceeded');
    this.name = 'GitHubRateLimitError';
    this.resetTimestamp = resetTimestamp;
    this.resetDate = new Date(resetTimestamp * 1000);
  }
}

export class GitHubNotFoundError extends GitHubApiError {
  constructor(message: string) {
    super(message, 404, 'Not Found');
    this.name = 'GitHubNotFoundError';
  }
}

// In-memory rate limit tracking and listener registration
let currentRateLimit: RateLimitInfo = {
  limit: 60,
  remaining: 60,
  reset: Math.floor(Date.now() / 1000) + 3600,
  used: 0,
  resetDate: new Date(Date.now() + 3600 * 1000),
};

type RateLimitListener = (info: RateLimitInfo) => void;
const rateLimitListeners = new Set<RateLimitListener>();

export function subscribeRateLimit(listener: RateLimitListener): () => void {
  rateLimitListeners.add(listener);
  listener(currentRateLimit);
  return () => {
    rateLimitListeners.delete(listener);
  };
}

export function getCurrentRateLimit(): RateLimitInfo {
  return currentRateLimit;
}

export function parseRateLimitHeaders(headers: Headers): RateLimitInfo | null {
  const limitStr = headers.get('x-ratelimit-limit');
  const remainingStr = headers.get('x-ratelimit-remaining');
  const resetStr = headers.get('x-ratelimit-reset');
  const usedStr = headers.get('x-ratelimit-used');

  if (limitStr && remainingStr && resetStr) {
    const limit = parseInt(limitStr, 10);
    const remaining = parseInt(remainingStr, 10);
    const reset = parseInt(resetStr, 10);
    const used = usedStr ? parseInt(usedStr, 10) : limit - remaining;

    currentRateLimit = {
      limit,
      remaining,
      reset,
      used,
      resetDate: new Date(reset * 1000),
    };

    rateLimitListeners.forEach((fn) => fn(currentRateLimit));
    return currentRateLimit;
  }
  return null;
}

export interface RequestOptions {
  token?: string | null;
  signal?: AbortSignal;
  useMock?: boolean;
}

/**
 * Core HTTP fetch wrapper with headers, authentication, error decoding, and rate limit inspection
 */
async function fetchGitHub<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('gh_explorer_token') : null;
  const token = options.token || storedToken;

  if (token && token.trim()) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: options.signal,
    });

    parseRateLimitHeaders(response.headers);

    if (!response.ok) {
      const remaining = response.headers.get('x-ratelimit-remaining');
      const reset = response.headers.get('x-ratelimit-reset');

      if ((response.status === 403 || response.status === 429) && remaining === '0') {
        const resetTs = reset ? parseInt(reset, 10) : Math.floor(Date.now() / 1000) + 3600;
        throw new GitHubRateLimitError(
          'GitHub API rate limit reached (60 req/hr for unauthenticated requests). Please provide a Personal Access Token or try again after the reset time.',
          resetTs
        );
      }

      if (response.status === 404) {
        throw new GitHubNotFoundError(`Resource not found at ${endpoint}`);
      }

      let errorJson: { message?: string } | null = null;
      try {
        errorJson = await response.json();
      } catch {
        // ignore non-json response body
      }

      throw new GitHubApiError(
        errorJson?.message || `GitHub API error: ${response.status} ${response.statusText}`,
        response.status,
        response.statusText,
        errorJson
      );
    }

    // 202 Accepted (Stats are being cached/compiled by GitHub)
    if (response.status === 202) {
      return [] as unknown as T;
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw err; // allow abort to propagate cleanly
    }
    if (err instanceof GitHubApiError) {
      throw err;
    }
    throw new GitHubApiError(
      err instanceof Error ? err.message : 'Network request failed. Please check your connection.',
      0,
      'NetworkError'
    );
  }
}

/**
 * Searches repositories using GitHub REST API with search query, language filter, and sort options
 */
export async function searchRepositories(
  filters: SearchFilters,
  options: RequestOptions = {}
): Promise<GitHubSearchResponse> {
  if (options.useMock) {
    return searchMockRepositories(filters.query, filters.language);
  }

  const queryParts: string[] = [];
  const trimmedQuery = filters.query.trim();

  if (trimmedQuery) {
    queryParts.push(trimmedQuery);
  } else {
    // Default search for top repos if no keyword given
    queryParts.push('stars:>1000');
  }

  if (filters.language && filters.language !== 'all') {
    queryParts.push(`language:${filters.language}`);
  }

  const qParam = encodeURIComponent(queryParts.join(' '));
  const sortParam = filters.sort !== 'best-match' ? `&sort=${filters.sort}&order=${filters.order}` : '';
  const pageParam = `&page=${filters.page || 1}&per_page=${filters.perPage || 12}`;

  const endpoint = `/search/repositories?q=${qParam}${sortParam}${pageParam}`;
  return fetchGitHub<GitHubSearchResponse>(endpoint, options);
}

/**
 * Fetch detailed repository information
 */
export async function getRepoDetails(
  owner: string,
  repo: string,
  options: RequestOptions = {}
): Promise<GitHubRepo> {
  if (options.useMock) {
    const found = MOCK_REPOSITORIES.find(
      (r) => r.full_name.toLowerCase() === `${owner}/${repo}`.toLowerCase() || r.name.toLowerCase() === repo.toLowerCase()
    );
    if (found) return found;
    return MOCK_REPOSITORIES[0];
  }

  return fetchGitHub<GitHubRepo>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, options);
}

/**
 * Fetch languages breakdown for a repository
 */
export async function getRepoLanguages(
  owner: string,
  repo: string,
  options: RequestOptions = {}
): Promise<GitHubLanguageStats> {
  const fullName = `${owner}/${repo}`.toLowerCase();
  if (options.useMock) {
    return MOCK_LANGUAGES[fullName] || { TypeScript: 800000, JavaScript: 200000 };
  }

  try {
    return await fetchGitHub<GitHubLanguageStats>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
      options
    );
  } catch (err) {
    if (err instanceof GitHubRateLimitError) throw err;
    // Non-fatal fallback to empty object if languages are missing or disabled
    return {};
  }
}

/**
 * Fetch 52-week commit activity for a repository
 */
export async function getRepoCommitActivity(
  owner: string,
  repo: string,
  options: RequestOptions = {}
): Promise<GitHubCommitActivityWeek[]> {
  if (options.useMock) {
    return generateMockCommitActivity();
  }

  try {
    const stats = await fetchGitHub<GitHubCommitActivityWeek[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stats/commit_activity`,
      options
    );
    if (Array.isArray(stats) && stats.length > 0) {
      return stats;
    }
    // If stats are generating (202 response), return fallback generated trend
    return generateMockCommitActivity();
  } catch (err) {
    if (err instanceof GitHubRateLimitError) throw err;
    // Return sample curve to prevent UI crash
    return generateMockCommitActivity();
  }
}

/**
 * Fetch top contributors for a repository
 */
export async function getRepoContributors(
  owner: string,
  repo: string,
  options: RequestOptions = {}
): Promise<GitHubContributor[]> {
  const fullName = `${owner}/${repo}`.toLowerCase();
  if (options.useMock) {
    return MOCK_CONTRIBUTORS[fullName] || MOCK_CONTRIBUTORS['facebook/react'];
  }

  try {
    const contributors = await fetchGitHub<GitHubContributor[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors?per_page=20`,
      options
    );
    return Array.isArray(contributors) ? contributors : [];
  } catch (err) {
    if (err instanceof GitHubRateLimitError) throw err;
    return [];
  }
}
