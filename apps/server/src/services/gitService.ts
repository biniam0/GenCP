import simpleGit from "simple-git";
import fs from "fs-extra";
import path from "path";
import { glob } from "glob";

const TMP_DIR = "./tmp/repos";

export async function ingestRepo(repoUrl: string): Promise<string> {
  const repoName = repoUrl.split("/").pop()?.replace(".git", "") || "repo";
  const localPath = path.join(TMP_DIR, repoName);

  await fs.ensureDir(TMP_DIR);

  // If already exists, skip clone
  if (!fs.existsSync(localPath)) {
    const git = simpleGit();
    await git.clone(repoUrl, localPath);
}

  const files = await glob("**/*.{md,js,ts,py,go,json}", {
    cwd: localPath,
    ignore: ["node_modules/**", "dist/**", "build/**"],
  });

  let context = "";
  for (const file of files.slice(0, 20)) {
    const filePath = path.join(localPath, file);
    const content = await fs.readFile(filePath, "utf-8");
    context += `\n\n--- FILE: ${file} ---\n${content}`;
  }

  return context;
}
