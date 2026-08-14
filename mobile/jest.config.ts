// See https://jestjs.io/docs/configuration
import type { Config } from "jest";

const config: Config = {
  // See https://docs.expo.dev/develop/unit-testing/#configuration:
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
  // The Detox E2E flows in `e2e-tests/` need a simulator and their own runner.
  // They use `e2e-tests/jest.config.js` instead.
  testPathIgnorePatterns: [
    "<rootDir>/e2e-tests/",
    "<rootDir>/ios/",
    "<rootDir>/android/",
  ],
  coveragePathIgnorePatterns: [
    "<rootDir>/src/lib/constants.ts",
    "<rootDir>/src/lib/customErrors.ts",
    "\\.styles\\.ts$",
  ],
};

export default config;
