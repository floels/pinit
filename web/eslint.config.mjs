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
    // Adoption ramp: the rules below still have known violations, listed in
    // doc/react-rules-adoption.md. They are warnings so that the plugin can be
    // introduced without a red pipeline. Restore them to "error" once the
    // corresponding fix lands.
    files: ["**/*.{ts,tsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "setupTests.ts", "reactI18nextMock.ts"],
    languageOptions: {
      sourceType: "module",
      globals: { ...globals.jest, vi: "readonly", fetchMock: "readonly" },
    },
    rules: {
      "no-global-assign": "off",
      // Test harnesses capture hook output in a module-level variable on
      // purpose. That is impure by design and is safe inside a test.
      "react-hooks/globals": "off",
    },
  },
];
