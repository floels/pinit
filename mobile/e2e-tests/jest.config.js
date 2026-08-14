// Jest config for the Detox E2E suite. The unit tests use `../jest.config.ts`
// with the `jest-expo` preset. The two configs stay separate, because Detox
// needs its own test environment and a single worker.
/** @type {import('jest').Config} */
module.exports = {
  rootDir: "..",
  testMatch: ["<rootDir>/e2e-tests/**/*.test.ts"],
  testTimeout: 120_000,
  maxWorkers: 1,
  globalSetup: "detox/runners/jest/globalSetup",
  globalTeardown: "detox/runners/jest/globalTeardown",
  reporters: ["detox/runners/jest/reporter"],
  testEnvironment: "detox/runners/jest/testEnvironment",
  verbose: true,
};
