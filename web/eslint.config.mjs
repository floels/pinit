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
    // 'src/lib/api/' owns every network call. Elsewhere, a bare 'fetch' is how a
    // request loses its access token without anybody noticing, so ban the
    // global and let the call site name what it needs instead. Tests are
    // exempt: they assert on the 'fetch' mock.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/api/**", "src/**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message:
            "Do not call fetch directly. Use useAPI() for an authenticated call, or fetchPublic / fetchWithRefreshCookie / fetchExternal from '@/lib/api/fetchers'.",
        },
      ],
    },
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
