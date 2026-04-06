import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      STITCH_DAILY_GENERATION_LIMIT: "0",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "."),
    },
  },
});
