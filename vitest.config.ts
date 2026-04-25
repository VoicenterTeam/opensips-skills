import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    globals: false,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["scripts/**/*.ts"],
      exclude: ["scripts/schemas/**", "scripts/types/**", "**/*.d.ts"],
    },
  },
});
