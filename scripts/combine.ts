import path from "path";
import { z } from "zod";
import { FileUtilities } from "./FileSystem/FileSystem";

const fileUtilities = new FileUtilities(import.meta.url);

function combineFiles(dataDir: string) {
  const files: ReadonlyArray<string> = fileUtilities.readDir(dataDir);
  let combined: ReadonlyArray<string> = [];
  files.forEach((file) => {
    if (file.endsWith(".json") && file !== "combined.json") {
      const filePath: string = path.join(dataDir, file);
      const data: string = fileUtilities.readFile(filePath);
      const jsonData: ReadonlyArray<{ address: string }> = z
        .array(z.object({ address: z.string() }))
        .parse(JSON.parse(data));
      const addresses: ReadonlyArray<string> = jsonData.map(
        (obj: { address: string }) => obj.address,
      );
      combined = [...combined, ...addresses];
    }
  });
  return fileUtilities.writeFile(path.join(dataDir, "combined.json"), combined);
}

function combineLabels(
  providerPath: string,
  labels: ReadonlyArray<string>,
): Promise<void> {
  let combined: ReadonlyArray<string> = [];
  labels.forEach((label) => {
    if (!label.includes(".")) {
      const labelPath: string = path.join(providerPath, label);
      const data: string = fileUtilities.readFile(
        path.join(labelPath, "combined.json"),
      );
      const jsonData: ReadonlyArray<string> = z
        .array(z.string())
        .parse(JSON.parse(data));
      combined = [...combined, ...jsonData];
    }
  });
  return fileUtilities.writeFile(
    path.join(providerPath, "combined.json"),
    combined,
  );
}

function runCombine() {
  const dataFolderPath: string = path.join("..", "data");
  const providers = fileUtilities.readDir(dataFolderPath);
  providers.forEach((provider) => {
    const providerPath: string = path.join(dataFolderPath, provider);
    if (!provider.includes(".")) {
      console.log("Processing folder:", providerPath);
      const labels = fileUtilities.readDir(providerPath);
      labels.forEach((label) => {
        const labelPath: string = path.join(providerPath, label);
        if (!label.includes(".")) {
          void combineFiles(labelPath);
        }
      });
      void combineLabels(providerPath, labels);
    }
  });
  console.log("combine.json file created successfully!");
}
runCombine();
