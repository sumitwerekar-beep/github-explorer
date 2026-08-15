export interface GitHubOwner {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
}

export interface GitHubLicense {
  key: string;
  name: string;
  spdx_id: string | null;
  url: string | null;
}

export interface GitHubRepo {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: GitHubOwner;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: GitHubLicense | null;
  topics: string[];
  visibility: string;
  default_branch: string;
  subscribers_count?: number;
  network_count?: number;
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepo[];
}

export interface GitHubLanguageStats {
  [language: string]: number; // Bytes of code
}

export interface ProcessedLanguage {
  name: string;
  bytes: number;
  percentage: number;
  color: string;
}

export interface GitHubCommitActivityWeek {
  total: number;
  week: number; // Unix timestamp for the start of the week (Sunday)
  days: number[]; // Array of 7 integers (commits per day)
}

export interface ProcessedCommitStats {
  totalCommitsYear: number;
  avgWeeklyCommits: number;
  peakWeeklyCommits: number;
  peakWeekDate: string;
  weeks: {
    weekTimestamp: number;
    formattedDate: string;
    total: number;
    days: number[];
  }[];
}

export interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
  used: number;
  resetDate: Date;
}

export type SortOption = 'stars' | 'forks' | 'updated' | 'best-match';
export type OrderOption = 'desc' | 'asc';

export interface SearchFilters {
  query: string;
  language?: string;
  sort: SortOption;
  order: OrderOption;
  page: number;
  perPage: number;
}
