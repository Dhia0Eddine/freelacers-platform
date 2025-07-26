import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;

// To fix "Cannot find module 'react-i18next' or its corresponding type declarations."
// Run the following commands in your project root:
//   npm install react-i18next i18next
//   npm install --save-dev @types/react-i18next

// Add this at the top of your project (e.g., src/global.d.ts or src/types/json.d.ts):
// declare module "*.json" {
//   const value: any;
//   export default value;
// }
