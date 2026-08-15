import { useEffect, useState } from 'react';
import type {
  GitHubContributor,
  GitHubRepo,
  ProcessedCommitStats,
  ProcessedLanguage,
} from '../types/github';
import {
  getRepoCommitActivity,
  getRepoContributors,
  getRepoDetails,
  getRepoLanguages,
} from '../services/githubApi';
import { processCommitActivity, processLanguageStats } from '../utils/formatters';

export interface RepoDetailsState {
  repo: GitHubRepo | null;
  languages: ProcessedLanguage[];
  commitStats: ProcessedCommitStats;
  contributors: GitHubContributor[];
  isLoading: boolean;
  error: Error | null;
}

export function useRepoDetails(
  owner: string | null,
  repoName: string | null,
  useMock = false
): RepoDetailsState & { refetch: () => void } {
  const [state, setState] = useState<RepoDetailsState>({
    repo: null,
    languages: [],
    commitStats: {
      totalCommitsYear: 0,
      avgWeeklyCommits: 0,
      peakWeeklyCommits: 0,
      peakWeekDate: 'N/A',
      weeks: [],
    },
    contributors: [],
    isLoading: false,
    error: null,
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!owner || !repoName) {
      setState({
        repo: null,
        languages: [],
        commitStats: {
          totalCommitsYear: 0,
          avgWeeklyCommits: 0,
          peakWeeklyCommits: 0,
          peakWeekDate: 'N/A',
          weeks: [],
        },
        contributors: [],
        isLoading: false,
        error: null,
      });
      return;
    }

    const controller = new AbortController();

    async function loadData() {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Fetch core repo info first (or in parallel)
        const repoPromise = getRepoDetails(owner!, repoName!, {
          signal: controller.signal,
          useMock,
        });

        const languagesPromise = getRepoLanguages(owner!, repoName!, {
          signal: controller.signal,
          useMock,
        }).catch(() => ({}));

        const commitsPromise = getRepoCommitActivity(owner!, repoName!, {
          signal: controller.signal,
          useMock,
        }).catch(() => []);

        const contributorsPromise = getRepoContributors(owner!, repoName!, {
          signal: controller.signal,
          useMock,
        }).catch(() => []);

        const [repoData, languagesRaw, commitsRaw, contributorsData] = await Promise.all([
          repoPromise,
          languagesPromise,
          commitsPromise,
          contributorsPromise,
        ]);

        if (!controller.signal.aborted) {
          const languages = processLanguageStats(languagesRaw);
          const commitStats = processCommitActivity(commitsRaw);

          setState({
            repo: repoData,
            languages,
            commitStats,
            contributors: contributorsData,
            isLoading: false,
            error: null,
          });
        }
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: err instanceof Error ? err : new Error('Failed to load repository details'),
          }));
        }
      }
    }

    loadData();

    return () => {
      controller.abort();
    };
  }, [owner, repoName, useMock, refreshTrigger]);

  const refetch = () => setRefreshTrigger((c) => c + 1);

  return { ...state, refetch };
}
