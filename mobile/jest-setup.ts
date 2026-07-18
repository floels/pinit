// See https://callstack.github.io/react-native-testing-library/docs/getting-started#additional-jest-matchers:
import "@testing-library/react-native/extend-expect";
import fetchMock from "jest-fetch-mock";

import enTranslations from "@/translations/en.json";

// See https://react-native-async-storage.github.io/async-storage/docs/advanced/jest/#with-jest-setup-file:
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock `useTranslation` from react-i18next:
const mockUseTranslation = () => ({
  t: (key: string) => {
    const [namespace, translationKey] = key.split(".");

    const translation = (enTranslations as any)[namespace][translationKey];

    return (
      translation || `Missing translation for ${namespace}.${translationKey}`
    );
  },
});

jest.mock("react-i18next", () => ({
  ...jest.requireActual("react-i18next"),
  useTranslation: mockUseTranslation,
}));

fetchMock.enableMocks();
