import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const output = new URL("public/activity.json", root);
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "ksw-portfolio-activity",
};

// This script runs at build time. Nothing containing this token is published.
if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

async function request(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers,
    signal: AbortSignal.timeout(10000),
    redirect: "error",
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  return response.json();
}

function validItem(item, repositories) {
  return item && typeof item === "object" &&
    repositories.includes(item.repository) &&
    typeof item.sha === "string" && /^[a-f0-9]{40}$/.test(item.sha) &&
    typeof item.title === "string" && item.title.length > 0 && item.title.length <= 180 &&
    !/[\u0000-\u001f\u007f]/.test(item.title) &&
    item.url === `https://github.com/${item.repository}/commit/${item.sha}` &&
    typeof item.date === "string" && Number.isFinite(Date.parse(item.date));
}

function usefulCommit(title) {
  return !/^(merge\b|revert\b|chore\b|style\b|ci\b|build\b|bump\b|update (?:activity|dependencies|lockfile)\b|refresh (?:public )?activity\b)/i.test(title) &&
    !/\[skip ci\]|\[skip activity\]/i.test(title);
}

async function refresh() {
  const config = JSON.parse(await readFile(new URL("config/activity.json", root), "utf8"));
  if (!Array.isArray(config.repositories) || config.repositories.length > 10 ||
      !config.repositories.every(repo => typeof repo === "string" && /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) ||
      !Number.isInteger(config.limit) || config.limit < 1 || config.limit > 20) {
    throw new Error("Invalid activity allowlist or limit");
  }
  const repositories = [...new Set(config.repositories)];
  let previous = { version: 1, updatedAt: null, items: [] };
  try {
    const cached = JSON.parse(await readFile(output, "utf8"));
    if (cached.version === 1 && Array.isArray(cached.items)) {
      previous = {
        version: 1,
        updatedAt: typeof cached.updatedAt === "string" && Number.isFinite(Date.parse(cached.updatedAt)) ? cached.updatedAt : null,
        items: cached.items.filter(item => validItem(item, repositories) && usefulCommit(item.title)),
      };
    }
  } catch {
    // A missing or malformed cache is an empty feed, never invented activity.
  }

  const items = [];
  for (const repository of repositories) {
    try {
      const info = await request(`/repos/${repository}`);
      if (info.private !== false || info.visibility !== "public" || info.full_name.toLowerCase() !== repository.toLowerCase()) {
        console.warn(`Skipping ${repository}: not confirmed public.`);
        continue;
      }
    } catch {
      // Do not expose even cached commits when public visibility cannot be checked.
      console.warn(`Skipping ${repository}: could not verify public visibility.`);
      continue;
    }

    try {
      const commits = await request(`/repos/${repository}/commits?per_page=30`);
      if (!Array.isArray(commits)) throw new Error("Invalid commits response");
      for (const commit of commits) {
        if (commit.parents?.length > 1) continue;
        const title = String(commit.commit?.message || "").split("\n")[0].trim().slice(0, 180);
        const item = {
          repository,
          sha: commit.sha,
          title,
          url: `https://github.com/${repository}/commit/${commit.sha}`,
          date: commit.commit?.author?.date,
        };
        if (validItem(item, repositories) && usefulCommit(title)) items.push(item);
      }
    } catch {
      console.warn(`Using validated cache for ${repository}: commit fetch failed.`);
      items.push(...previous.items.filter(item => item.repository === repository));
    }
  }

  items.sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || a.sha.localeCompare(b.sha));
  const selected = items.filter((item, index) => items.findIndex(other => other.repository === item.repository && other.sha === item.sha) === index).slice(0, config.limit);
  const changed = JSON.stringify(selected) !== JSON.stringify(previous.items);
  const data = {
    version: 1,
    updatedAt: changed ? new Date().toISOString() : previous.updatedAt,
    items: selected,
  };
  await writeFile(output, JSON.stringify(data, null, 2) + "\n");
  console.log(`Public activity: ${selected.length} updates written to ${fileURLToPath(output)}.`);
}

refresh().catch(() => {
  console.error("Activity refresh failed. Check config/activity.json and try again.");
  process.exitCode = 1;
});
