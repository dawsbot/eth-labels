import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export class FileUtilities {
  private __dirname: string;

  /**
   * @example
   * const fileUtilies = new FileUtilities(import.meta.url);
   */
  constructor(callerMetaUrl: string) {
    const callerFilePath = fileURLToPath(callerMetaUrl);
    this.__dirname = path.dirname(callerFilePath);
  }

  readFile(filePath: string): string {
    const fullPath = path.join(this.__dirname, filePath);
    return fs.readFileSync(fullPath, "utf8");
  }
  readDir(dirPath: string): Array<string> {
    const fullPath = path.join(this.__dirname, dirPath);
    return fs.readdirSync(fullPath, "utf8");
  }
  writeFile(filePath: string, data: string): void {
    const fullPath = path.join(this.__dirname, filePath);
    fs.writeFileSync(fullPath, data);
  }
}
