import { readFile, writeFile } from "node:fs/promises";

const diffFile = process.env.AI_REVIEW_DIFF_FILE || "/tmp/pr.diff";
const outputFile = process.env.AI_REVIEW_OUTPUT_FILE || "/tmp/ai-review.md";
const provider = process.env.AI_REVIEW_PROVIDER || "openai";

const diff = await readDiff();

const prompt = `
你是一名前端项目的资深 Code Reviewer，正在审查一个 Pull Request / Merge Request。

项目背景：
- 技术栈：Next.js、React、TypeScript、Tailwind CSS。
- AI Review 的定位：第一轮自动审查，帮助人类 Reviewer 提前发现通用风险。

请重点关注：
- React / Next.js 代码正确性。
- TypeScript 类型安全，尤其是不必要的 any、类型逃逸和空值风险。
- 数据请求、loading、empty、error 状态是否完整。
- 可访问性问题，例如表单 label、按钮语义、图片 alt、键盘操作。
- 性能问题，例如 render 中的昂贵计算、不稳定 key、无意义重复渲染。
- 安全问题，例如 XSS、泄漏 secret、信任未校验输入。
- 测试缺口，尤其是业务分支、边界状态和错误状态。

输出要求：
- 使用中文 Markdown。
- 保持简洁，优先指出真实风险。
- 不要为了评论而评论。
- 如果没有明显问题，请明确说明。
- 按下面结构输出：
  1. 总体结论
  2. 阻塞问题
  3. 建议优化
  4. 测试建议

代码 diff：

${diff || "(empty diff)"}
`;

const review =
  provider === "anthropic"
    ? await reviewWithAnthropic(prompt)
    : await reviewWithOpenAI(prompt);

await writeFile(outputFile, review);
console.log(`AI review written to ${outputFile}`);

async function readDiff() {
  const diffFromEnv = process.env.PR_DIFF;

  if (diffFromEnv) {
    return diffFromEnv;
  }

  try {
    return await readFile(diffFile, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(
        `Diff file not found: ${diffFile}. Set PR_DIFF or AI_REVIEW_DIFF_FILE.`,
      );
      process.exit(1);
    }

    throw error;
  }
}

async function reviewWithOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || process.env.AI_REVIEW_MODEL || "gpt-5-mini";
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

  if (!apiKey) {
    console.error("OPENAI_API_KEY is required when AI_REVIEW_PROVIDER=openai.");
    process.exit(1);
  }

  const response = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: prompt,
    }),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`);
  }

  const data = await response.json();

  return (
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      .map((content) => content.text || "")
      .join("\n") ||
    "AI review did not return text."
  );
}

async function reviewWithAnthropic(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model =
    process.env.ANTHROPIC_MODEL ||
    process.env.AI_REVIEW_MODEL ||
    "claude-sonnet-4-5";
  const baseUrl = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com/v1";

  if (!apiKey) {
    console.error(
      "ANTHROPIC_API_KEY is required when AI_REVIEW_PROVIDER=anthropic.",
    );
    process.exit(1);
  }

  const response = await fetch(`${baseUrl}/messages`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`);
  }

  const data = await response.json();

  return (
    data.content
      ?.map((content) => content.text || "")
      .join("\n") ||
    "AI review did not return text."
  );
}
