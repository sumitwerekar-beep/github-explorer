import { useCallback, useEffect, useRef, useState } from 'react';
import type { GitHubRepo, OrderOption, RateLimitInfo, SortOption } from '../types/github';
import {
  getCurrentRateLimit,
  GitHubApiError,
  GitHubRateLimitError,
  searchRepositories,
  subscribeRateLimit,
} from '../services/githubApi';
import { useDebounce } from './useDebounce';

export interface UseGitHubSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  debouncedQuery: string;
  language: string;
  setLanguage: (lang: string) => void;
  sort: SortOption;
  setSort: (s: SortOption) => void;
  order: OrderOption;
  setOrder: (o: OrderOption) => void;
  page: number;
  setPage: (p: number) => void;
  perPage: number;
  repos: GitHubRepo[];
  totalCount: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  rateLimit: RateLimitInfo;
  useMockMode: boolean;
  setUseMockMode: (val: boolean) => void;
  retry: () => void;
  clearSearch: () => void;
}

export function useGitHubSearch(initialQuery = '', debounceDelay = 450): UseGitHubSearchReturn {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, debounceDelay);
  const [language, setLanguageState] = useState<string>('all');
  const [sort, setSortState] = useState<SortOption>('stars');
  const [order, setOrderState] = useState<OrderOption>('desc');
  const [page, setPageState] = useState<number>(1);
  const perPage = 12;

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo>(getCurrentRateLimit());
  const [useMockMode, setUseMockMode] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Subscribe to rate limit updates
  useEffect(() => {
    return subscribeRateLimit((info) => {
      setRateLimit(info);
    });
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    setPageState(1);
  }, []);

  const setSort = useCallback((newSort: SortOption) => {
    setSortState(newSort);
    setPageState(1);
  }, []);

  const setOrder = useCallback((newOrder: OrderOption) => {
    setOrderState(newOrder);
    setPageState(1);
  }, []);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setPageState(1);
    setLanguageState('all');
  }, []);

  const retry = useCallback(() => {
    setRetryTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // Cancel in-flight request if query or params change
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function executeSearch() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await searchRepositories(
          {
            query: debouncedQuery,
            language: language !== 'all' ? language : undefined,
            sort,
            order,
            page,
            perPage,
          },
          {
            signal: controller.signal,
            useMock: useMockMode,
          }
        );

        if (!controller.signal.aborted) {
          setRepos(response.items || []);
          // GitHub caps search results at 1000 items
          setTotalCount(Math.min(response.total_count || 0, 1000));
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        setIsLoading(false);
        if (err instanceof GitHubRateLimitError) {
          setError(err);
        } else if (err instanceof GitHubApiError) {
          setError(err);
        } else if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
      }
    }

    executeSearch();

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, language, sort, order, page, useMockMode, retryTrigger]);

  const totalPages = Math.min(Math.ceil(totalCount / perPage), 100); // 1000 / 10 = 100 max

  return {
    query,
    setQuery,
    debouncedQuery,
    language,
    setLanguage,
    sort,
    setSort,
    order,
    setOrder,
    page,
    setPage,
    perPage,
    repos,
    totalCount,
    totalPages,
    isLoading,
    error,
    rateLimit,
    useMockMode,
    setUseMockMode,
    retry,
    clearSearch,
  };
}
