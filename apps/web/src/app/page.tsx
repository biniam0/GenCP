"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Page() {
  const [repoUrl, setRepoUrl] = useState("");
  const [language, setLanguage] = useState("typescript-node");
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/generate-mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, language }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.log("Error: " + JSON.stringify(err));
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      setZipBlob(blob);
      setShowDialog(true); // show confirmation modal
    } catch (err) {
      console.log(String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcp_build.zip";
    a.click();
    URL.revokeObjectURL(url);
    setShowDialog(false);
    setZipBlob(null);
  }

  return (
    <main className="container mx-auto max-w-lg py-10">
      <h1 className="text-2xl font-semibold mb-6">Generate MCP Server</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="repoUrl">GitHub Repo URL</Label>
          <Input
            id="repoUrl"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/user/repo"
          />
        </div>

        <div className="space-y-2">
          <Label>Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="typescript-node">
                TypeScript (Node/Express)
              </SelectItem>
              <SelectItem value="python-fastapi">Python (FastAPI)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Generating..." : "Generate"}
        </Button>
      </form>

      {/* Confirmation Modal */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Ready</DialogTitle>
            <DialogDescription>
              Your MCP server ZIP is ready. Do you want to download it now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDownload}>Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
