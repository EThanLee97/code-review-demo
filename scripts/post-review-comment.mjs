import { readFile } from "node:fs/promises";

const reviewFile =
  process.env.AI_REVIEW_OUTPUT_FILE || "/tmp/ai-review-findings.json";
const platform = process.env.AI_REVIEW_PLATFORM || detectPlatform();
const findings = JSON.parse(await readFile(reviewFile, "utf8"));

if (!Array.isArray(findings)) {
  throw new Error("AI review findings file must contain a JSON array.");
}

if (findings.length === 0) {
  console.log("No AI review findings to post.");
  process.exit(0);
}

if (platform === "github") {
  await postGithubComments(findings);
} else if (platform === "gitlab") {
  await postGitlabComments(findings);
} else {
  throw new Error(
    "Unable to detect platform. Set AI_REVIEW_PLATFORM to github or gitlab.",
  );
}

console.log(`Posted ${findings.length} AI review inline comments to ${platform}.`);

function detectPlatform() {
  if (process.env.GITHUB_ACTIONS) {
    return "github";
  }

  if (process.env.GITLAB_CI) {
    return "gitlab";
  }

  return "";
}

async function postGithubComments(comments) {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const pullNumber = process.env.GITHUB_PR_NUMBER;
  const commitId = process.env.GITHUB_COMMIT_ID;
  const apiUrl = process.env.GITHUB_API_URL || "https://api.github.com";

  if (!token || !repository || !pullNumber || !commitId) {
    throw new Error(
      "GitHub inline comments require GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_PR_NUMBER, and GITHUB_COMMIT_ID.",
    );
  }

  for (const comment of comments) {
    await postJson(`${apiUrl}/repos/${repository}/pulls/${pullNumber}/comments`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: {
        body: formatComment(comment),
        commit_id: commitId,
        path: comment.file,
        line: comment.line,
        side: "RIGHT",
      },
    });
  }
}

async function postGitlabComments(comments) {
  const token = process.env.GITLAB_TOKEN;
  const apiUrl = process.env.CI_API_V4_URL || "https://gitlab.com/api/v4";
  const projectId = process.env.CI_PROJECT_ID;
  const mergeRequestIid = process.env.CI_MERGE_REQUEST_IID;
  const baseSha = process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA;
  const startSha = process.env.CI_MERGE_REQUEST_TARGET_BRANCH_SHA || baseSha;
  const headSha = process.env.CI_COMMIT_SHA;

  if (
    !token ||
    !projectId ||
    !mergeRequestIid ||
    !baseSha ||
    !startSha ||
    !headSha
  ) {
    throw new Error(
      "GitLab inline comments require GITLAB_TOKEN, CI_PROJECT_ID, CI_MERGE_REQUEST_IID, CI_MERGE_REQUEST_DIFF_BASE_SHA, CI_MERGE_REQUEST_TARGET_BRANCH_SHA, and CI_COMMIT_SHA.",
    );
  }

  for (const comment of comments) {
    await postJson(
      `${apiUrl}/projects/${encodeURIComponent(
        projectId,
      )}/merge_requests/${mergeRequestIid}/discussions`,
      {
        headers: {
          "PRIVATE-TOKEN": token,
        },
        body: {
          body: formatComment(comment),
          position: {
            position_type: "text",
            base_sha: baseSha,
            start_sha: startSha,
            head_sha: headSha,
            old_path: comment.file,
            new_path: comment.file,
            new_line: comment.line,
          },
        },
      },
    );
  }
}

function formatComment(comment) {
  return `**${comment.severity}: ${comment.title}**\n\n${comment.body}`;
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
