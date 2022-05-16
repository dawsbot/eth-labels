const path = require("path");
const fs = require("fs");

const folders = ["exchange", "phish-hack"];
folders.forEach((folder) => {
  const srcFolder = path.join(__dirname, "..", "src", folder);
  const src = require(path.join(srcFolder, "all.json"));
  const addressOnly = src.map(({ address }) => address.toLowerCase());
  console.log({ addressOnly });
  fs.writeFileSync(
    path.join(srcFolder, "addresses.json"),
    JSON.stringify({ addresses: addressOnly }, null, 2)
  );
});
