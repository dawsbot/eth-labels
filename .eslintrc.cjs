module.exports = {
  ignorePatterns: ["lib/**", "**/*.js"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "prettier",
  ],
  parserOptions: {
    project: ["./tsconfig.json"],
  },
  env: {
    node: true,
  },
  rules: {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "variable",
        types: ["boolean"],
        format: ["PascalCase", "UPPER_CASE"],
        prefix: [
          "is",
          "should",
          "has",
          "can",
          "did",
          "will",
          "does",
          "IS",
          "SHOULD",
          "HAS",
        ],
      },
      {
        selector: "typeLike",
        format: ["PascalCase"],
      },
    ],
    "@typescript-eslint/array-type": ["error", { default: "generic" }],
    "new-cap": "error",
  },
};