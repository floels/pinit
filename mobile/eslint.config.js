// Flat config (ESLint 9+). `eslint-config-universe` still ships legacy shareable
// configs, so we consume it through `FlatCompat`.
// See https://eslint.org/docs/latest/use/configure/migration-guide
const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const globals = require("globals");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  {
    ignores: [
      "node_modules/",
      "ios/",
      "android/",
      ".expo/",
      "coverage/",
      "dist/",
      "web-build/",
    ],
  },
  ...compat.extends("universe/native"),
  {
    // `eslint-config-universe` still wires in the abandoned `eslint-plugin-node`
    // (superseded by `eslint-plugin-n`), whose rules call APIs removed in ESLint 9.
    // Disable them so the deprecated plugin's rule bodies never run.
    rules: {
      "node/handle-callback-err": "off",
      "node/no-new-require": "off",
    },
  },
  {
    // 'src/lib/api/' owns every network call. Elsewhere, a bare 'fetch' is how a
    // request loses its access token without anybody noticing, so ban the global
    // and let the call site name what it needs instead. Tests are exempt: they
    // assert on the 'fetch' mock. Mirrors the rule in 'web/eslint.config.mjs'.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/api/**", "src/**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message:
            "Do not call fetch directly. Use useAPI() for an authenticated call, or fetchPublic from '@/src/lib/api/fetchers'.",
        },
      ],
    },
  },
  {
    rules: {
      // A component declared inside another component is a new type on every
      // render, so React destroys and rebuilds that subtree, losing its state.
      // `eslint-config-universe` does not enable this rule.
      // `allowAsProps` stays on for `ToastAnchor`, whose `config` entries are
      // called as plain functions by `react-native-toast-message` and are
      // therefore never reconciled as component types.
      "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
    },
  },
  {
    // Node-based config files run in CommonJS and use Node globals (`__dirname`, etc.).
    files: ["*.js", "e2e/*.js"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
