// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["lib", "**/node_modules/**"], // Exclude all test files in the 'lib' directory
  },
});
