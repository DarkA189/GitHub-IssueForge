// src/lib/github.ts
import { Octokit } from 'octokit';

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url?: string;
  };
};

export type GitHubIssue = {
  number: number;
  title: string;
  body?: string;
  user?: {
    login: string;
    avatar_url?: string;
  };
  state: string;
  html_url: string;
  created_at?: string;
  updated_at?: string;
  labels?: Array<{ name: string }>;
};

export type GitHubFile = {
  name: string;
  path: string;
  content?: string;
  type: 'file' | 'dir';
};

export async function createOctokitInstance(
  token: string
): Promise<Octokit> {
  return new Octokit({ auth: token });
}

export async function getUserRepositories(
  octokit: Octokit
): Promise<GitHubRepo[]> {
  try {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'updated',
    });
    return data as GitHubRepo[];
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw new Error('Failed to fetch repositories');
  }
}

export async function getRepositoryIssues(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<GitHubIssue[]> {
  try {
    const { data } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      per_page: 50,
      sort: 'updated',
    });
    return data as GitHubIssue[];
  } catch (error) {
    console.error('Error fetching issues:', error);
    throw new Error('Failed to fetch issues');
  }
}

export async function getIssueDetail(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<GitHubIssue> {
  try {
    const { data } = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });
    return data as GitHubIssue;
  } catch (error) {
    console.error('Error fetching issue:', error);
    throw new Error('Failed to fetch issue');
  }
}

export async function getRepositoryFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string = ''
): Promise<GitHubFile[]> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: path || '',
    });

    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        name: item.name,
        path: item.path,
        type: item.type,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
}

export async function getFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if (!Array.isArray(data) && 'content' in data) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }

    return null;
  } catch (error) {
    console.error('Error fetching file content:', error);
    return null;
  }
}

export async function searchRepositoryCode(
  octokit: Octokit,
  owner: string,
  repo: string,
  query: string
): Promise<any[]> {
  try {
    const { data } = await octokit.rest.search.code({
      q: `${query} repo:${owner}/${repo}`,
      per_page: 10,
    });
    return data.items || [];
  } catch (error) {
    console.error('Error searching code:', error);
    return [];
  }
}