/** @type {import('jest').Config} */
const config = {
  setupFiles: ["./setupJest.js"],
  setupFilesAfterEnv: ["./setupJestAfterEnv.js"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["<rootDir>/e2e-tests/"],
  coveragePathIgnorePatterns: [
    "<rootDir>/src/lib/constants.ts",
    "<rootDir>/src/lib/customErrors.ts",
    "<rootDir>/src/lib/testing-utils/",
  ],
  transform: {
    // react-router v8 and its cookie-es dep are ESM-only; transpile them (and
    // neutralize react-router's lone `import.meta`) with a dedicated
    // transformer. Must precede the ts-jest rule so these .js/.mjs files match
    // here first.
    "/node_modules/.*(?:react-router|cookie-es).*\\.(?:jsx?|mjs)$":
      "./esmDepTransformer.js",
    "^.+\\.[jt]sx?$": ["ts-jest", { tsconfig: "./tsconfig.test.json" }],
  },
  // By default node_modules is never transformed. react-router (and its
  // cookie-es dep) must be, since they ship ESM only. The negative lookahead
  // keeps every other dependency ignored, including under pnpm's nested layout.
  transformIgnorePatterns: ["/node_modules/(?!.*(?:react-router|cookie-es))"],
  moduleNameMapper: {
    "^.+\\.module\\.css$": "identity-obj-proxy",
    "^@/public/(.*)$": "<rootDir>/public/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

module.exports = config;
