import { execSync } from "node:child_process";
import path from "path";

import markdownMagic from "markdown-magic";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const readmePath = path.join(__dirname, "..", "README.md");

const getLastModifiedDate = (folderName: string): string => {
  const directoryPath = path.join(__dirname, "..", "data", folderName);
  const gitCommand = `git log -1 --format=%cd --date=format:"%B %d, %Y" -- ${directoryPath}`;
  const lastModifiedDate = execSync(gitCommand).toString().trim();
  return lastModifiedDate;
};

const updateReadme = () => {
  const config = {
    transforms: {
      // @ts-expect-error bad types for markdown-magic
      lastEdited(_, options) {
        // eslint-disable-next-line
        const dataDirectory: string = z.string().parse(options?.dataDirectory);
        const lastModified = getLastModifiedDate(dataDirectory);
        return `Last edited: ${lastModified}`;
      },
    },
  };

  try {
    markdownMagic(readmePath, config);
    // fs.writeFileSync(readmeFilePath, readmeContent);
    console.log("README file updated successfully!");
  } catch (error) {
    console.error("Error updating README file:", error);
  }
};

updateReadme();
// TODO: Run prettier here
