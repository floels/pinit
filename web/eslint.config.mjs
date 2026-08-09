import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  { ignores: ["dist/"] },
  js.configs.recommended,
  ...tsPlugin.configs["flat/recommended"],
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { react: reactPlugin },
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2020 },
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    ...reactHooksPlugin.configs.flat["recommended-latest"],
  },
  {
    files: ["**/*.test.{ts,tsx}", "setupTests.ts", "reactI18nextMock.ts"],
    languageOptions: {
      sourceType: "module",
      globals: { ...globals.jest, vi: "readonly", fetchMock: "readonly" },
    },
    rules: { "no-global-assign": "off" },
  },
];
