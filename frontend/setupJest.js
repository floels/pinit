const { TextEncoder, TextDecoder } = require("util");
const { enableMocks } = require("jest-fetch-mock");

// react-router-dom v7 uses TextEncoder/TextDecoder which jsdom doesn't provide
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;
const Common = require("./public/locales/en/Common.json");
const HeaderUnauthenticated = require("./public/locales/en/HeaderUnauthenticated.json");
const HeaderAuthenticated = require("./public/locales/en/HeaderAuthenticated.json");
const LandingPageContent = require("./public/locales/en/LandingPageContent.json");
const HomePageContent = require("./public/locales/en/HomePageContent.json");
const PinsSearch = require("./public/locales/en/PinsSearch.json");
const PinsBoard = require("./public/locales/en/PinsBoard.json");
const PinDetails = require("./public/locales/en/PinDetails.json");
const AccountDetails = require("./public/locales/en/AccountDetails.json");
const BoardDetails = require("./public/locales/en/BoardDetails.json");
const PinCreation = require("./public/locales/en/PinCreation.json");

// https://github.com/jefflau/jest-fetch-mock#to-setup-for-all-tests
enableMocks();

const allNamespaces = {
  Common,
  HeaderUnauthenticated,
  HeaderAuthenticated,
  LandingPageContent,
  HomePageContent,
  PinsSearch,
  PinsBoard,
  PinDetails,
  AccountDetails,
  BoardDetails,
  PinCreation,
};

const lookupKey = (nsObj, key) => {
  const parts = key.split(".");
  let result = nsObj;
  for (const part of parts) {
    if (result && typeof result === "object") {
      result = result[part];
    } else {
      return key;
    }
  }
  return typeof result === "string" ? result : key;
};

const mockT = (defaultNsObj) => (key, opts) => {
  if (typeof key === "string" && key.includes(":")) {
    const colonIdx = key.indexOf(":");
    const ns = key.slice(0, colonIdx);
    const rest = key.slice(colonIdx + 1);
    return lookupKey(allNamespaces[ns] || {}, rest);
  }
  if (opts && opts.ns) {
    return lookupKey(allNamespaces[opts.ns] || {}, key);
  }
  return lookupKey(defaultNsObj || allNamespaces["Common"], key);
};

// Mock react-i18next — resolves keys against the actual namespace JSON files
// so that test assertions can match the real translated strings.
jest.mock("react-i18next", () => ({
  useTranslation: (ns) => {
    const primary = Array.isArray(ns) ? ns[0] : ns;
    const nsObj = allNamespaces[primary] || allNamespaces["Common"];
    return { t: mockT(nsObj), i18n: { language: "en" } };
  },
  Trans: ({ children }) => children,
  initReactI18next: { type: "3rdParty", init: () => {} },
}));
