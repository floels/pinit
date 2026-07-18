import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "@/translations/en.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslations,
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v3", // See https://stackoverflow.com/a/70521614
});

export default i18n;
