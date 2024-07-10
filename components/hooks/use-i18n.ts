import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { languages } from 'components/constants/languages';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: languages,
    lng: 'en', // if you're using a language detector, do not define the lng option
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
