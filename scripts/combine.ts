import path from "path";
import { z } from "zod";
import { FileUtilities } from "./FileSystem/FileSystem";

const fileUtilities = new FileUtilities(import.meta.url);

function combineFiles(dataDir: string) {
  const OUTPUT_FILE_NAME = "combined.json";
  const files: ReadonlyArray<string> = fileUtilities.readDir(dataDir);
  let combined: ReadonlyArray<string> = [];
  if (files.length > 1) {
    files.forEach((file) => {
      if (file.endsWith(".json") && file !== OUTPUT_FILE_NAME) {
        const filePath: string = path.join(dataDir, file);
        const data: string = fileUtilities.readFile(filePath);
        const jsonData: ReadonlyArray<{ address: string }> = z
          .object({ data: z.array(z.object({ address: z.string() })) })
          .parse(JSON.parse(data)).data;
        const addresses: ReadonlyArray<string> = jsonData.map(
          (obj: { address: string }) => obj.address,
        );
        combined = [...combined, ...addresses];
      }
    });
    return fileUtilities.writeFile(
      path.join(dataDir, OUTPUT_FILE_NAME),
      combined,
    );
  }
}

async function runCombine() {
  const dataFolderPath: string = path.join("..", "data");
  const providers = fileUtilities.readDir(dataFolderPath);
  for (const provider of providers) {
    const providerPath: string = path.join(dataFolderPath, provider);
    console.log("Processing folder:", providerPath);
    const labels = fileUtilities.readDir(providerPath);
    for (const label of labels) {
      const labelPath: string = path.join(providerPath, label);
      await combineFiles(labelPath);
    }
  }
  console.log("combine.json file created successfully!");
}
export default runCombine;
