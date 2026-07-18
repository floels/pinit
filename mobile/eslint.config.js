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
    // Node-based config files run in CommonJS and use Node globals (`__dirname`, etc.).
    files: ["*.js"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
