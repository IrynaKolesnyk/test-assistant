import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './src/i18n/locales/en.json'

// Initialize i18n for tests with English translations
i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

// jsdom doesn't implement TextEncoder/TextDecoder
Object.assign(global, { TextEncoder, TextDecoder })

// jsdom doesn't implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn()

// RTK Query's fetchBaseQuery warns when `fetch` is absent at module-load time.
// Provide a no-op stub so the warning is suppressed; individual tests can
// override global.fetch with their own mock as needed.
if (!global.fetch) {
  global.fetch = jest.fn()
}
