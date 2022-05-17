import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
const plugins = [json(), typescript({ sourceMap: true })];
export default [
  {
    input: "./src/exchange/index.ts",
    output: [
      {
        file: "dist/cjs/exchange.js",
        format: "cjs",
        exports: "auto",
      },
      {
        file: "dist/esm/exchange.js",
        format: "esm",
      },
    ],
    plugins,
  },
  // {
  //   input: "./src/index.ts",
  //   output: [
  //     {
  //       file: "dist/cjs/index.js",
  //       format: "cjs",
  //       exports: "auto",
  //     },
  //     {
  //       file: "dist/esm/index.js",
  //       format: "esm",
  //     },
  //   ],
  //   plugins,
  // },
];
