import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import es from '../locales/es.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

const isEnglish = window.location.pathname.startsWith('/en');

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: isEnglish ? "en" : "es",
    fallbackLng: "es",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
