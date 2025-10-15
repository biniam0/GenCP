import AdmZip from "adm-zip";
import path from "path";

export async function zipResult(projectPath: string): Promise<string> {
  const zip = new AdmZip();
  zip.addLocalFolder(projectPath);

  const zipPath = path.join("./output", path.basename(projectPath) + ".zip");
  zip.writeZip(zipPath);
  return zipPath;
}
