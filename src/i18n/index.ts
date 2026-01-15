import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import cs from './cs.json';

const LANGUAGE_KEY = 'product-margins-language';

function getStoredLanguage(): string {
  if (typeof window === 'undefined') return 'cs';
  return localStorage.getItem(LANGUAGE_KEY) || 'cs';
}

export function setStoredLanguage(lang: string): void {
  localStorage.setItem(LANGUAGE_KEY, lang);
  i18n.changeLanguage(lang);
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      cs: { translation: cs },
    },
    lng: getStoredLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
export { getStoredLanguage };
