// import pluginTypescript from "@rollup/plugin-typescript";
import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
const plugins = [json(), typescript()];
export default [
  {
    input: "./src/exchange/index.ts",
    output: {
      file: "dist/cjs/exchange.js",
      format: "cjs",
    },
    output: {
      file: "dist/esm/exchange.js",
      format: "esm",
    },
    plugins,
  },
  {
    input: "./src/phish-hack/index.ts",
    output: [
      {
        file: "dist/cjs/phish-hack.js",
        format: "cjs",
        exports: "auto",
      },
      {
        file: "dist/esm/phish-hack.js",
        format: "esm",
      },
    ],
    plugins,
  },
];
