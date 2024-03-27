module.exports = {
  ignorePatterns: ["lib/**", "**/*.js"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "tsdoc"],
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
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      {
        accessibility: "explicit",
        overrides: {
          accessors: "explicit",
          constructors: "explicit",
          methods: "explicit",
          properties: "explicit",
          parameterProperties: "explicit",
        },
      },
    ],
    "no-shadow": "error",
    "@typescript-eslint/consistent-type-imports": "error",
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
    "tsdoc/syntax": "error",
  },
};
