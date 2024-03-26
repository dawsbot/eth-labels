import path from "path";
import { FileUtilities } from "./FileSystem/FileSystem";

const fs = new FileUtilities(import.meta.url);

function combineFiles(dataDir: string) {
  const files: ReadonlyArray<string> = fs.readDir(dataDir);
  let combine: Array<string> = [];
  files.forEach((file) => {
    if (file.endsWith(".json") && file !== "combined.json") {
      const filePath: string = path.join(dataDir, file);
      const data: string = fs.readFile(filePath);
      const jsonData: ReadonlyArray<{ address: string }> = JSON.parse(
        data.toString(),
      ) as ReadonlyArray<{ address: string }>;
      const addresses: ReadonlyArray<string> = jsonData.map(
        (obj: { address: string }) => obj.address,
      );
      combine = combine.concat(addresses);
    }
  });
  fs.writeFile(
    path.join(dataDir, "combined.json"),
    JSON.stringify(combine, null, 2),
  );
}

function combineLabels(providerPath: string, labels: ReadonlyArray<string>) {
  let combine: Array<string> = [];
  labels.forEach((label) => {
    if (!label.includes(".")) {
      const labelPath: string = path.join(providerPath, label);
      const data: string = fs.readFile(path.join(labelPath, "combined.json"));
      const jsonData: ReadonlyArray<string> = JSON.parse(
        data.toString(),
      ) as ReadonlyArray<string>;
      combine = combine.concat(jsonData);
    }
  });
  fs.writeFile(
    path.join(providerPath, "combined.json"),
    JSON.stringify(combine, null, 2),
  );
}

function runCombine() {
  const dataFolderPath: string = path.join("..", "data");
  const providers = fs.readDir(dataFolderPath);
  providers.forEach((provider) => {
    const providerPath: string = path.join(dataFolderPath, provider);
    if (!provider.includes(".")) {
      console.log("Processing folder:", providerPath);
      const labels: Array<string> = fs.readDir(providerPath);
      labels.forEach((label) => {
        const labelPath: string = path.join(providerPath, label);
        if (!label.includes(".")) {
          combineFiles(labelPath);
        }
      });
      combineLabels(providerPath, labels);
    }
  });
  console.log("combine.json file created successfully!");
}
runCombine();
