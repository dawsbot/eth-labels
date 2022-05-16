// import pluginTypescript from "@rollup/plugin-typescript";
import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
const plugins = [json(), typescript()];
export default [
  {
    input: "./src/index.ts",
    output: [
      {
        file: "dist/cjs/index.js",
        format: "cjs",
        exports: "auto",
      },
      {
        file: "dist/esm/index.js",
        format: "esm",
      },
    ],
    plugins,
  },
];
