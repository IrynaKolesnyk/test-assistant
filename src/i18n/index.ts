import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import uk from './locales/uk.json'
import es from './locales/es.json'

const LS_KEY = 'ai-assistant:settings'

function getSavedLanguage(): string {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return 'en'
    const parsed = JSON.parse(raw)
    return parsed.language ?? 'en'
  } catch {
    return 'en'
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    uk: { translation: uk },
    es: { translation: es },
  },
  lng: getSavedLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
