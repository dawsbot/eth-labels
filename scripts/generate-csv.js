const path = require("path");
const fs = require("fs");

const folders = ["token-contract"];
const csv = [["address", "nameTag"]];

folders.forEach((folder) => {
  const srcFolder = path.join(__dirname, "..", "src/mainnet", folder);
  const src = require(path.join(srcFolder, "all.json"));
  src.forEach((v) => {
    csv.push([v.address, v.nameTag || " "]);
  });
  const csvContent = csv
    .map((v) => {
      return v.join(",");
    })
    .join("\n");
  fs.writeFileSync(path.join(srcFolder, "all.csv"), csvContent);
});
