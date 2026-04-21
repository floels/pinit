import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Common from "../public/locales/en/Common.json";
import HeaderUnauthenticated from "../public/locales/en/HeaderUnauthenticated.json";
import HeaderAuthenticated from "../public/locales/en/HeaderAuthenticated.json";
import LandingPageContent from "../public/locales/en/LandingPageContent.json";
import HomePageContent from "../public/locales/en/HomePageContent.json";
import PinsSearch from "../public/locales/en/PinsSearch.json";
import PinsBoard from "../public/locales/en/PinsBoard.json";
import PinDetails from "../public/locales/en/PinDetails.json";
import AccountDetails from "../public/locales/en/AccountDetails.json";
import BoardDetails from "../public/locales/en/BoardDetails.json";
import PinCreation from "../public/locales/en/PinCreation.json";

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  ns: [
    "Common",
    "HeaderUnauthenticated",
    "HeaderAuthenticated",
    "LandingPageContent",
    "HomePageContent",
    "PinsSearch",
    "PinsBoard",
    "PinDetails",
    "AccountDetails",
    "BoardDetails",
    "PinCreation",
  ],
  defaultNS: "Common",
  resources: {
    en: {
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
    },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
