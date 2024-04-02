import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { FileFormatter } from "./FileFormatter";

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
    return fs.readdirSync(fullPath, "utf8") as ReadonlyArray<string>;
  }

  public async writeFile(
    file: string,
    data: string | ReadonlyArray<string>,
  ): Promise<void> {
    const fullPath = path.join(this.#__dirname, file);
    const fileFormatter = new FileFormatter();
    const stringData: string = (() => {
      if (Array.isArray(data)) {
        return JSON.stringify(data.sort());
      }
      return data as string;
    })();
    const formattedData = await fileFormatter.formatFile(file, stringData);
    return fs.writeFileSync(fullPath, formattedData);
  }
}
