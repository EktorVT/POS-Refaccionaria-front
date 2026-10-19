import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import esCommon from "./es/common.json";
import esLogin from "./es/login.json";
import esSale from "./es/sale.json";

import enCommon from "./en/common.json";
import enLogin from "./en/login.json";
import enSale from "./en/sale.json";

i18n.use(initReactI18next).init({
  resources: {
    es: {
      common: esCommon,
      login: esLogin,
      sale: esSale
    },
    en: {
      common: enCommon,
      login: enLogin,
      sale: enSale
    }
  },

  lng: "es",
  fallbackLng: "es",

  defaultNS: "common",

  interpolation: {
    escapeValue: false
  }
});

export default i18n;
