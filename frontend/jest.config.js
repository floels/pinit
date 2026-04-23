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
    "^.+\\.[jt]sx?$": ["ts-jest", { tsconfig: "./tsconfig.test.json" }],
  },
  moduleNameMapper: {
    "^.+\\.module\\.css$": "<rootDir>/__mocks__/styleMock.js",
    "^@/public/(.*)$": "<rootDir>/public/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

module.exports = config;
