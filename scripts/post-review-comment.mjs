import { readFile } from "node:fs/promises";

const reviewFile = process.env.AI_REVIEW_OUTPUT_FILE || "/tmp/ai-review.md";
const platform = process.env.AI_REVIEW_PLATFORM || detectPlatform();
const body = await readFile(reviewFile, "utf8");

if (platform === "github") {
  await postGithubComment(body);
} else if (platform === "gitlab") {
  await postGitlabComment(body);
} else {
  throw new Error(
    "Unable to detect platform. Set AI_REVIEW_PLATFORM to github or gitlab.",
  );
}

console.log(`AI review comment posted to ${platform}.`);

function detectPlatform() {
  if (process.env.GITHUB_ACTIONS) {
    return "github";
  }

  if (process.env.GITLAB_CI) {
    return "gitlab";
  }

  return "";
}

async function postGithubComment(commentBody) {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const issueNumber = process.env.GITHUB_PR_NUMBER;
  const apiUrl = process.env.GITHUB_API_URL || "https://api.github.com";

  if (!token || !repository || !issueNumber) {
    throw new Error(
      "GitHub comments require GITHUB_TOKEN, GITHUB_REPOSITORY, and GITHUB_PR_NUMBER.",
    );
  }

  await postJson(`${apiUrl}/repos/${repository}/issues/${issueNumber}/comments`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: {
      body: commentBody,
    },
  });
}

async function postGitlabComment(commentBody) {
  const token = process.env.GITLAB_TOKEN;
  const apiUrl = process.env.CI_API_V4_URL || "https://gitlab.com/api/v4";
  const projectId = process.env.CI_PROJECT_ID;
  const mergeRequestIid = process.env.CI_MERGE_REQUEST_IID;

  if (!token || !projectId || !mergeRequestIid) {
    throw new Error(
      "GitLab comments require GITLAB_TOKEN, CI_PROJECT_ID, and CI_MERGE_REQUEST_IID.",
    );
  }

  await postJson(
    `${apiUrl}/projects/${encodeURIComponent(
      projectId,
    )}/merge_requests/${mergeRequestIid}/notes`,
    {
      headers: {
        "PRIVATE-TOKEN": token,
      },
      body: {
        body: commentBody,
      },
    },
  );
}

async function postJson(url, { headers, body }) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`);
  }
}
