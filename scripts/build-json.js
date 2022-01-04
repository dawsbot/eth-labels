const fs = require("fs");
const { parse } = require("csv-parse/sync");
const path = require("path");

const csvPath = path.join(__dirname, "..", "src", "all-addresses.csv");
const jsonOutputPath = path.join(__dirname, "..", "src", "all-addresses.json");

const csvContents = fs.readFileSync(csvPath);

const parseOptions = {
  columns: true,
  skip_empty_lines: true,
};

const parsedJson = parse(csvContents, parseOptions);
fs.writeFileSync(jsonOutputPath, JSON.stringify(parsedJson, null, 2));
