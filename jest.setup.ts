import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

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
