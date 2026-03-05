import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// jsdom doesn't implement TextEncoder/TextDecoder
Object.assign(global, { TextEncoder, TextDecoder })

// jsdom doesn't implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn()
