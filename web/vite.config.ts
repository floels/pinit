/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    // `@/public/*` must come before `@/*` so it wins for public assets
    // (mirrors the tsconfig `paths` mapping).
    alias: [
      {
        find: /^@\/public\/(.*)$/,
        replacement: path.resolve(__dirname, "./public/$1"),
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  // Only inline these for the browser build/dev. Under test (Node), leave
  // `process.env` intact so runtime values (and the `??` fallbacks in
  // constants.ts) resolve as they do under Node — matching the pre-Vitest setup.
  define:
    mode === "test"
      ? {}
      : {
          "process.env.ENVIRONMENT": JSON.stringify(process.env.ENVIRONMENT),
          "process.env.BACKEND_URL": JSON.stringify(process.env.BACKEND_URL),
        },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./setupTests.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Replicate jest's identity-obj-proxy: CSS module class names resolve to
    // their own name, so assertions on class names keep working.
    css: { modules: { classNameStrategy: "non-scoped" } },
    coverage: {
      provider: "v8",
      exclude: [
        "src/lib/constants.ts",
        "src/lib/customErrors.ts",
        "src/lib/testing-utils/**",
      ],
    },
  },
}));
