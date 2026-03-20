import type { GithubData } from "../sample-data";

interface RawCommit {
  sha: string;
  message: string;
  date: string;
}

export async function fetchGithubData(
  repoUrl: string
): Promise<{ data: GithubData; commits: RawCommit[] }> {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
  if (!match) throw new Error("Invalid GitHub URL");
  const [, owner, repo] = match;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const api = (path: string) =>
    fetch(`https://api.github.com${path}`, { headers }).then((r) => {
      if (!r.ok) throw new Error(`GitHub API ${r.status}: ${path}`);
      return r.json();
    });

  const [repoData, commits, contributors, issues] = await Promise.all([
    api(`/repos/${owner}/${repo}`),
    api(
      `/repos/${owner}/${repo}/commits?per_page=100&since=${new Date(Date.now() - 90 * 86400000).toISOString()}`
    ),
    api(`/repos/${owner}/${repo}/contributors?per_page=10`),
    api(`/repos/${owner}/${repo}/issues?state=open&per_page=100`),
  ]);

  const totalCommits = (commits as unknown[]).length;
  const contribs = contributors as { contributions: number }[];
  const topContribPct =
    contribs.length > 0
      ? (contribs[0].contributions /
          contribs.reduce(
            (s: number, c: { contributions: number }) => s + c.contributions,
            0
          )) *
        100
      : 100;

  const issueList = issues as { created_at: string; comments: number }[];
  const avgResponse =
    issueList.length > 0
      ? issueList.reduce(
          (s: number, i: { created_at: string }) =>
            s + (Date.now() - new Date(i.created_at).getTime()) / 3600000,
          0
        ) / issueList.length
      : 0;

  const lastCommit = (commits as { commit: { committer: { date: string } } }[])[0];
  const lastCommitDays = lastCommit
    ? (Date.now() - new Date(lastCommit.commit.committer.date).getTime()) / 86400000
    : 999;

  const rawCommits: RawCommit[] = (commits as { sha: string; commit: { message: string; committer: { date: string } } }[]).map((c) => ({
    sha: c.sha,
    message: c.commit.message,
    date: c.commit.committer.date,
  }));

  return {
    data: {
      repoName: repoData.name,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      commitsLast90Days: totalCommits,
      contributors: contribs.length,
      topContributorPercent: Math.round(topContribPct),
      openIssues: repoData.open_issues_count,
      avgIssueResponseHours: Math.round(avgResponse),
      lastCommitDaysAgo: Math.round(lastCommitDays),
    },
    commits: rawCommits,
  };
}
