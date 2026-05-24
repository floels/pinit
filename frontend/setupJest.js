import { TextEncoder, TextDecoder } from "util";
import { enableMocks } from "jest-fetch-mock";

// react-router-dom v7 uses TextEncoder/TextDecoder which jsdom doesn't provide
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;
import Common from "./public/locales/en/Common.json";
import HeaderUnauthenticated from "./public/locales/en/HeaderUnauthenticated.json";
import HeaderAuthenticated from "./public/locales/en/HeaderAuthenticated.json";
import LandingPageContent from "./public/locales/en/LandingPageContent.json";
import HomePageContent from "./public/locales/en/HomePageContent.json";
import PinsSearch from "./public/locales/en/PinsSearch.json";
import PinsBoard from "./public/locales/en/PinsBoard.json";
import PinDetails from "./public/locales/en/PinDetails.json";
import AccountDetails from "./public/locales/en/AccountDetails.json";
import BoardDetails from "./public/locales/en/BoardDetails.json";
import PinCreation from "./public/locales/en/PinCreation.json";

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

const resolvePlural = (nsObj, key, count) => {
  const suffix = count === 1 ? "_one" : "_other";
  const pluralResult = lookupKey(nsObj, `${key}${suffix}`);
  return pluralResult !== `${key}${suffix}` ? pluralResult : lookupKey(nsObj, key);
};

const mockT = (defaultNsObj) => (key, opts) => {
  let nsObj = defaultNsObj || allNamespaces["Common"];

  if (typeof key === "string" && key.includes(":")) {
    const colonIdx = key.indexOf(":");
    const ns = key.slice(0, colonIdx);
    const rest = key.slice(colonIdx + 1);
    nsObj = allNamespaces[ns] || {};
    key = rest;
  } else if (opts && opts.ns) {
    nsObj = allNamespaces[opts.ns] || {};
  }

  if (opts && opts.count !== undefined) {
    return resolvePlural(nsObj, key, opts.count);
  }

  return lookupKey(nsObj, key);
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
