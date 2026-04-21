// See https://nextjs.org/docs/pages/building-your-application/testing/jest
import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  // https://github.com/jefflau/jest-fetch-mock#to-setup-for-all-tests
  setupFiles: ["./setupJest.js"],
  setupFilesAfterEnv: ["./setupJestAfterEnv.js"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["<rootDir>/e2e-tests/"],
  coveragePathIgnorePatterns: [
    "<rootDir>/lib/constants.ts",
    "<rootDir>/lib/customErrors.ts",
    "<rootDir>/lib/testing-utils/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(config);
