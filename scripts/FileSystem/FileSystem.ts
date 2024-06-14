import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export class FileUtilities {
  #__dirname: string;

  /**
   * @example
   * const fileUtilies = new FileUtilities(import.meta.url);
   */
  public constructor(callerMetaUrl: string) {
    const callerFilePath = fileURLToPath(callerMetaUrl);
    this.#__dirname = path.dirname(callerFilePath);
  }

  public readFile(filePath: string): string {
    const fullPath = path.join(this.#__dirname, filePath);
    return fs.readFileSync(fullPath, "utf8");
  }
  public readDir(dirPath: string): ReadonlyArray<string> {
    const fullPath = path.join(this.#__dirname, dirPath);
    return fs.readdirSync(fullPath, "utf8");
  }
  public writeFile(file: string, data: string | ReadonlyArray<string>): void {
    const fullPath = path.join(this.#__dirname, file);
    const stringData: string = (() => {
      if (Array.isArray(data)) {
        return JSON.stringify(data.sort());
      }
      return data as string;
    })();
    return fs.writeFileSync(fullPath, stringData);
  }
}
