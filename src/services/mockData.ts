import type {
  GitHubCommitActivityWeek,
  GitHubContributor,
  GitHubLanguageStats,
  GitHubRepo,
  GitHubSearchResponse,
} from '../types/github';

export const MOCK_REPOSITORIES: GitHubRepo[] = [
  {
    id: 10270250,
    node_id: 'MDEwOlJlcG9zaXRvcnkxMDI3MDI1MA==',
    name: 'react',
    full_name: 'facebook/react',
    private: false,
    owner: {
      login: 'facebook',
      id: 69631,
      avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
      html_url: 'https://github.com/facebook',
      type: 'Organization',
    },
    html_url: 'https://github.com/facebook/react',
    description: 'The library for web and native user interfaces.',
    fork: false,
    url: 'https://api.github.com/repos/facebook/react',
    created_at: '2013-05-24T16:15:54Z',
    updated_at: '2025-01-20T14:20:00Z',
    pushed_at: '2025-01-20T12:00:00Z',
    homepage: 'https://react.dev',
    size: 420800,
    stargazers_count: 231500,
    watchers_count: 231500,
    language: 'JavaScript',
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: true,
    has_pages: true,
    forks_count: 46200,
    archived: false,
    disabled: false,
    open_issues_count: 1420,
    license: {
      key: 'mit',
      name: 'MIT License',
      spdx_id: 'MIT',
      url: 'https://api.github.com/licenses/mit',
    },
    topics: ['declarative', 'frontend', 'javascript', 'library', 'react', 'ui'],
    visibility: 'public',
    default_branch: 'main',
  },
  {
    id: 70107786,
    node_id: 'MDEwOlJlcG9zaXRvcnk3MDEwNzc4Ng==',
    name: 'next.js',
    full_name: 'vercel/next.js',
    private: false,
    owner: {
      login: 'vercel',
      id: 14985020,
      avatar_url: 'https://avatars.githubusercontent.com/u/14985020?v=4',
      html_url: 'https://github.com/vercel',
      type: 'Organization',
    },
    html_url: 'https://github.com/vercel/next.js',
    description: 'The React Framework for the Web.',
    fork: false,
    url: 'https://api.github.com/repos/vercel/next.js',
    created_at: '2016-10-05T23:32:51Z',
    updated_at: '2025-01-20T15:10:00Z',
    pushed_at: '2025-01-20T15:05:00Z',
    homepage: 'https://nextjs.org',
    size: 610000,
    stargazers_count: 128400,
    watchers_count: 128400,
    language: 'TypeScript',
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: false,
    has_pages: false,
    forks_count: 26800,
    archived: false,
    disabled: false,
    open_issues_count: 2480,
    license: {
      key: 'mit',
      name: 'MIT License',
      spdx_id: 'MIT',
      url: 'https://api.github.com/licenses/mit',
    },
    topics: ['react', 'ssr', 'framework', 'hybrid', 'serverless', 'typescript', 'vercel'],
    visibility: 'public',
    default_branch: 'canary',
  },
  {
    id: 2325298,
    node_id: 'MDEwOlJlcG9zaXRvcnkyMzI1Mjk4',
    name: 'linux',
    full_name: 'torvalds/linux',
    private: false,
    owner: {
      login: 'torvalds',
      id: 1024025,
      avatar_url: 'https://avatars.githubusercontent.com/u/1024025?v=4',
      html_url: 'https://github.com/torvalds',
      type: 'User',
    },
    html_url: 'https://github.com/torvalds/linux',
    description: 'Linux kernel source tree',
    fork: false,
    url: 'https://api.github.com/repos/torvalds/linux',
    created_at: '2011-09-04T22:48:12Z',
    updated_at: '2025-01-20T16:00:00Z',
    pushed_at: '2025-01-20T15:50:00Z',
    homepage: 'https://kernel.org',
    size: 5120000,
    stargazers_count: 182000,
    watchers_count: 182000,
    language: 'C',
    has_issues: false,
    has_projects: true,
    has_downloads: true,
    has_wiki: false,
    has_pages: false,
    forks_count: 54100,
    archived: false,
    disabled: false,
    open_issues_count: 350,
    license: {
      key: 'gpl-2.0',
      name: 'GNU General Public License v2.0',
      spdx_id: 'GPL-2.0',
      url: 'https://api.github.com/licenses/gpl-2.0',
    },
    topics: ['c', 'kernel', 'linux', 'operating-system', 'systems'],
    visibility: 'public',
    default_branch: 'master',
  },
  {
    id: 741639352,
    node_id: 'R_kgDOLDFy-A',
    name: 'uv',
    full_name: 'astral-sh/uv',
    private: false,
    owner: {
      login: 'astral-sh',
      id: 115962839,
      avatar_url: 'https://avatars.githubusercontent.com/u/115962839?v=4',
      html_url: 'https://github.com/astral-sh',
      type: 'Organization',
    },
    html_url: 'https://github.com/astral-sh/uv',
    description: 'An extremely fast Python package and project manager, written in Rust.',
    fork: false,
    url: 'https://api.github.com/repos/astral-sh/uv',
    created_at: '2024-01-11T02:30:19Z',
    updated_at: '2025-01-20T17:00:00Z',
    pushed_at: '2025-01-20T16:45:00Z',
    homepage: 'https://docs.astral.sh/uv/',
    size: 98000,
    stargazers_count: 43200,
    watchers_count: 43200,
    language: 'Rust',
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: false,
    has_pages: true,
    forks_count: 1420,
    archived: false,
    disabled: false,
    open_issues_count: 510,
    license: {
      key: 'mit',
      name: 'MIT License',
      spdx_id: 'MIT',
      url: 'https://api.github.com/licenses/mit',
    },
    topics: ['cli', 'package-manager', 'python', 'rust', 'tooling'],
    visibility: 'public',
    default_branch: 'main',
  },
  {
    id: 11730342,
    node_id: 'MDEwOlJlcG9zaXRvcnkxMTczMDM0Mg==',
    name: 'core',
    full_name: 'vuejs/core',
    private: false,
    owner: {
      login: 'vuejs',
      id: 6128107,
      avatar_url: 'https://avatars.githubusercontent.com/u/6128107?v=4',
      html_url: 'https://github.com/vuejs',
      type: 'Organization',
    },
    html_url: 'https://github.com/vuejs/core',
    description: '🖖 Vue.js is a progressive, incrementally-adoptable framework for building UI on the web.',
    fork: false,
    url: 'https://api.github.com/repos/vuejs/core',
    created_at: '2013-07-28T21:48:47Z',
    updated_at: '2025-01-20T13:00:00Z',
    pushed_at: '2025-01-20T11:30:00Z',
    homepage: 'https://vuejs.org',
    size: 210000,
    stargazers_count: 48900,
    watchers_count: 48900,
    language: 'TypeScript',
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: false,
    has_pages: false,
    forks_count: 8100,
    archived: false,
    disabled: false,
    open_issues_count: 490,
    license: {
      key: 'mit',
      name: 'MIT License',
      spdx_id: 'MIT',
      url: 'https://api.github.com/licenses/mit',
    },
    topics: ['framework', 'frontend', 'javascript', 'typescript', 'vue'],
    visibility: 'public',
    default_branch: 'main',
  },
];

export const MOCK_LANGUAGES: Record<string, GitHubLanguageStats> = {
  'facebook/react': {
    JavaScript: 6840000,
    TypeScript: 2120000,
    HTML: 320000,
    CSS: 180000,
    C: 75000,
    'C++': 62000,
  },
  'vercel/next.js': {
    TypeScript: 9450000,
    Rust: 3820000,
    JavaScript: 1120000,
    CSS: 240000,
    HTML: 95000,
  },
  'torvalds/linux': {
    C: 385000000,
    Assembly: 5200000,
    Makefile: 2900000,
    Rust: 1600000,
    Shell: 1200000,
    Python: 800000,
  },
  'astral-sh/uv': {
    Rust: 12800000,
    Python: 950000,
    Markdown: 240000,
    Shell: 85000,
  },
  'vuejs/core': {
    TypeScript: 4920000,
    HTML: 140000,
    CSS: 80000,
    JavaScript: 45000,
  },
};

export const MOCK_CONTRIBUTORS: Record<string, GitHubContributor[]> = {
  'facebook/react': [
    { login: 'zpao', id: 8445, avatar_url: 'https://avatars.githubusercontent.com/u/8445?v=4', html_url: 'https://github.com/zpao', contributions: 1824, type: 'User' },
    { login: 'gaearon', id: 810438, avatar_url: 'https://avatars.githubusercontent.com/u/810438?v=4', html_url: 'https://github.com/gaearon', contributions: 1658, type: 'User' },
    { login: 'sebmarkbage', id: 63648, avatar_url: 'https://avatars.githubusercontent.com/u/63648?v=4', html_url: 'https://github.com/sebmarkbage', contributions: 1412, type: 'User' },
    { login: 'sophiebits', id: 6820, avatar_url: 'https://avatars.githubusercontent.com/u/6820?v=4', html_url: 'https://github.com/sophiebits', contributions: 1180, type: 'User' },
    { login: 'acdlite', id: 3624098, avatar_url: 'https://avatars.githubusercontent.com/u/3624098?v=4', html_url: 'https://github.com/acdlite', contributions: 1145, type: 'User' },
    { login: 'brianvaughn', id: 197597, avatar_url: 'https://avatars.githubusercontent.com/u/197597?v=4', html_url: 'https://github.com/brianvaughn', contributions: 890, type: 'User' },
    { login: 'trueadm', id: 1519870, avatar_url: 'https://avatars.githubusercontent.com/u/1519870?v=4', html_url: 'https://github.com/trueadm', contributions: 720, type: 'User' },
    { login: 'rickhanlonii', id: 2440089, avatar_url: 'https://avatars.githubusercontent.com/u/2440089?v=4', html_url: 'https://github.com/rickhanlonii', contributions: 654, type: 'User' },
    { login: 'chenglou', id: 1909539, avatar_url: 'https://avatars.githubusercontent.com/u/1909539?v=4', html_url: 'https://github.com/chenglou', contributions: 590, type: 'User' },
  ],
  'vercel/next.js': [
    { login: 'timneutkens', id: 6324199, avatar_url: 'https://avatars.githubusercontent.com/u/6324199?v=4', html_url: 'https://github.com/timneutkens', contributions: 3950, type: 'User' },
    { login: 'ijjk', id: 22380829, avatar_url: 'https://avatars.githubusercontent.com/u/22380829?v=4', html_url: 'https://github.com/ijjk', contributions: 3410, type: 'User' },
    { login: 'sokra', id: 1365881, avatar_url: 'https://avatars.githubusercontent.com/u/1365881?v=4', html_url: 'https://github.com/sokra', contributions: 2180, type: 'User' },
    { login: 'feedthejim', id: 11060936, avatar_url: 'https://avatars.githubusercontent.com/u/11060936?v=4', html_url: 'https://github.com/feedthejim', contributions: 1450, type: 'User' },
    { login: 'leerob', id: 9113740, avatar_url: 'https://avatars.githubusercontent.com/u/9113740?v=4', html_url: 'https://github.com/leerob', contributions: 1210, type: 'User' },
  ],
};

export function generateMockCommitActivity(): GitHubCommitActivityWeek[] {
  const weeks: GitHubCommitActivityWeek[] = [];
  const now = Math.floor(Date.now() / 1000);
  const secondsInWeek = 7 * 24 * 60 * 60;

  for (let i = 51; i >= 0; i--) {
    const weekTime = now - i * secondsInWeek;
    // Generate realistic variance with seasonal peaks
    const base = Math.floor(15 + Math.sin(i / 4) * 12 + Math.random() * 25);
    const days = Array.from({ length: 7 }, () => Math.max(0, Math.floor((base / 7) + (Math.random() * 5 - 2))));
    const total = days.reduce((a, b) => a + b, 0);
    weeks.push({
      total,
      week: weekTime,
      days,
    });
  }

  return weeks;
}

export function searchMockRepositories(query: string, language?: string): GitHubSearchResponse {
  const q = query.toLowerCase().trim();
  let results = MOCK_REPOSITORIES.filter((r) => {
    const matchName = r.name.toLowerCase().includes(q) || r.full_name.toLowerCase().includes(q);
    const matchDesc = (r.description || '').toLowerCase().includes(q);
    const matchTopic = r.topics.some((t) => t.toLowerCase().includes(q));
    return q === '' || matchName || matchDesc || matchTopic;
  });

  if (language && language !== 'all') {
    results = results.filter((r) => (r.language || '').toLowerCase() === language.toLowerCase());
  }

  return {
    total_count: results.length,
    incomplete_results: false,
    items: results,
  };
}
