// Mock implementation of react-i18next used in tests. Resolves keys against the
// actual namespace JSON files so assertions can match the real translated
// strings. Registered globally via `vi.mock("react-i18next", ...)` in
// setupTests.ts.
import type { ReactNode } from "react";
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
import CreatedPins from "./public/locales/en/CreatedPins.json";

type Namespace = Record<string, unknown>;

const allNamespaces: Record<string, Namespace> = {
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
  CreatedPins,
};

const lookupKey = (nsObj: Namespace, key: string): string => {
  const parts = key.split(".");
  let result: unknown = nsObj;
  for (const part of parts) {
    if (result && typeof result === "object") {
      result = (result as Namespace)[part];
    } else {
      return key;
    }
  }
  return typeof result === "string" ? result : key;
};

const resolvePlural = (nsObj: Namespace, key: string, count: number): string => {
  const suffix = count === 1 ? "_one" : "_other";
  const pluralResult = lookupKey(nsObj, `${key}${suffix}`);
  return pluralResult !== `${key}${suffix}` ? pluralResult : lookupKey(nsObj, key);
};

type TranslateOptions = { ns?: string; count?: number };

const mockT =
  (defaultNsObj: Namespace) =>
  (key: string, opts?: TranslateOptions): string => {
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

export const useTranslation = (ns?: string | string[]) => {
  const primary = Array.isArray(ns) ? ns[0] : ns;
  const nsObj = (primary && allNamespaces[primary]) || allNamespaces["Common"];
  return { t: mockT(nsObj), i18n: { language: "en" } };
};

export const Trans = ({ children }: { children: ReactNode }) => children;

export const initReactI18next = {
  type: "3rdParty",
  init: () => {},
};
