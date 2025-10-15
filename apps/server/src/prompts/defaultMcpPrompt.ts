export const defaultMcpPrompt = `
You are an expert engineer. Generate a complete, runnable MCP server for the target repository.

Repository: <user-input>
Language target: {{language}}

Entrypoints & important files:
<CONTEXT>
{{retrieved_context}}
</CONTEXT>

REQUIREMENTS:
1. Produce a JSON response: { "project_name": "...", "files": { "filename": "content" } }
2. Include minimal runnable server with:
   - /mcp/query route (dummy response)
   - /mcp/schema route
   - package.json, Dockerfile, README
3. Keep code minimal, secure, and typed.
4. Add TODO comments for unknown repo details.
5. Output only valid JSON.
`;
