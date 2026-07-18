// See https://jestjs.io/docs/configuration
import type { Config } from "jest";

const config: Config = {
  // See https://docs.expo.dev/develop/unit-testing/#configuration:
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
  coveragePathIgnorePatterns: [
    "<rootDir>/src/lib/constants.ts",
    "<rootDir>/src/lib/customErrors.ts",
    "\\.styles\\.ts$",
  ],
};

export default config;
