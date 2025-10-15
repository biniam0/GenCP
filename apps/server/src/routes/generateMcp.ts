import express from "express";
import { ingestRepo } from "../services/gitService.js";
import { generateMcpServer } from "../services/llmService.js";
import { zipResult } from "../services/zipService.js";
import path from "path";

const router: express.Router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("Hi, this is from generate mcp");
    const { repoUrl, language = "typescript-node" } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "repoUrl is required" });
    }

    console.log(`🔍 Ingesting repo: ${repoUrl}`);
    const repoContext = await ingestRepo(repoUrl);

    console.log("🧠 Generating MCP server...");
    const project = await generateMcpServer(repoContext, language);

    console.log("📦 Packaging result...");
    const zipPath = await zipResult(project);
    console.log("📦 ZIP created at:", zipPath); // <-- add this

    res.download(zipPath, path.basename(zipPath), (err) => {
      if (err) console.error("❌ Error sending ZIP:", err);
      else console.log("✅ ZIP sent successfully");
    }); 
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
