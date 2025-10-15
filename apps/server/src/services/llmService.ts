import fs from "fs-extra";
import path from "path";
import { jsonrepair } from "jsonrepair";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { defaultMcpPrompt } from "@/prompts/defaultMcpPrompt";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateMcpServer(repoContext: string, language: string) {
  const systemPrompt = `
          You are a precise code generator. 
          Return ONLY valid JSON, no markdown, no explanations.
          Escape all string values properly for JSON.parse().
          Structure exactly like this:
          {
            "project_name": "string",
            "files": {
              "path/to/file.ext": "file content as string"
            }
          }
          Always wrap file contents in JSON-safe double-quoted strings.
          Escape newlines as \\n, tabs as \\t, and backslashes as \\\\.
          Never insert raw newlines inside strings.
          `;

  const prompt = `${systemPrompt}\n\n${defaultMcpPrompt
    .replace("{{language}}", language)
    .replace("{{retrieved_context}}", repoContext.slice(0, 8000))}`;

  const modelName = "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  let result;
  try {
    result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a precise, structured code generator.\n\n${prompt}`,
            },
          ],
        },
      ],
    });
  } catch (err) {
    console.error("Failed with model", modelName, err);
    throw err;
  }

  let content = result.response
    .text()
    .replace(/```(json)?/gi, "")
    .trim();

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response.");

  let jsonText = jsonMatch[0];

  let project;
  try {
    project = JSON.parse(jsonText);
  } catch (err) {
    console.warn("⚠️ JSON.parse failed, attempting repair…");
    try {
      project = JSON.parse(jsonrepair(jsonText));
    } catch (err2) {
      console.error(
        "❌ JSON repair also failed. Raw snippet:\n",
        jsonText.slice(0, 1000)
      );
      throw new Error(
        "Gemini returned malformed JSON that could not be repaired."
      );
    }
  }

  const outDir = path.join("./output", project.project_name);
  await fs.ensureDir(outDir);

  for (const [filename, fileContent] of Object.entries(project.files)) {
    const fullPath = path.join(outDir, filename);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, fileContent as string);
  }

  return outDir;
}
