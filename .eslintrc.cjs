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
    //   tsconfigRootDir: __dirname,
    //   project: ['./tsconfig.base.json', './packages/*/tsconfig.json'], // Specify it only for TypeScript files
  },
  env: {
    node: true,
  },
};
