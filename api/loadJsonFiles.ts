import { lstatSync, readFileSync, readdirSync } from "fs";
import path from "path";

export const loadJsonFiles = (directory: string): Array<string> => {
  const jsonFiles: Array<string> = [];

  const getFilesRecursively = (dir: string) => {
    const files = readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = lstatSync(filePath);

      if (stat.isDirectory()) {
        // If the file is a directory, recursively call the function
        getFilesRecursively(filePath);
      } else if (stat.isFile() && path.extname(file) === ".json") {
        // If the file is a JSON file, read and parse it
        const fileContent = readFileSync(filePath, "utf-8");
        jsonFiles.push(JSON.parse(fileContent));
      }
    });
  };

  // Start the recursive search from the given directory
  getFilesRecursively(directory);

  return jsonFiles;
};
