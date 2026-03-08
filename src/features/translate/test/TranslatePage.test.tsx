import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import TranslatePage from '../TranslatePage'
import chatReducer from '../../chat/chatSlice'
import settingsReducer from '../../settings/settingsSlice'

// ── Anthropic mock ────────────────────────────────────────────────────────────
// `mockStream` is prefixed with "mock" so Jest hoisting keeps it accessible
// inside the jest.mock factory. APIError is defined inside the factory so that
// the same class reference is attached to the default export (as in the real SDK).
const mockStream = jest.fn()

jest.mock('@anthropic-ai/sdk', () => {
  class APIError extends Error {}
  const sdk = jest.fn().mockImplementation(() => ({
    messages: { stream: mockStream },
  })) as jest.Mock & { APIError: typeof APIError }
  sdk.APIError = APIError
  return { __esModule: true, default: sdk, APIError }
})

// ── fetch mock (MyMemory) ─────────────────────────────────────────────────────
const mockFetch = jest.fn()
global.fetch = mockFetch

// ── clipboard mock ────────────────────────────────────────────────────────────
Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
})

// ── helpers ───────────────────────────────────────────────────────────────────
function makeStore(apiKey = '') {
  return configureStore({
    reducer: { chat: chatReducer, settings: settingsReducer },
    preloadedState: {
      settings: {
        apiKey,
        model: 'claude-sonnet-4-6' as const,
        systemPrompt: '',
        theme: 'dark' as const,
      },
    },
  })
}

function renderPage(apiKey = '') {
  return render(
    <Provider store={makeStore(apiKey)}>
      <MemoryRouter>
        <TranslatePage />
      </MemoryRouter>
    </Provider>,
  )
}

function myMemoryOk(text: string) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ responseStatus: 200, responseData: { translatedText: text } }),
  })
}

function myMemoryError(details: string) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ responseStatus: 429, responseDetails: details, responseData: { translatedText: '' } }),
  })
}

beforeEach(() => {
  mockFetch.mockReset()
  mockStream.mockReset()
  ;(navigator.clipboard.writeText as jest.Mock).mockClear()
})

// ── rendering ─────────────────────────────────────────────────────────────────
describe('TranslatePage — rendering', () => {
  it('renders the page heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Translate' })).toBeInTheDocument()
  })

  it('shows "MyMemory (free)" in header when no API key', () => {
    renderPage('')
    expect(screen.getByText('MyMemory (free)')).toBeInTheDocument()
  })

  it('shows model name in header when API key is set', () => {
    renderPage('sk-ant-test')
    expect(screen.getByText('claude-sonnet-4-6')).toBeInTheDocument()
  })

  it('shows free-API info banner when no API key', () => {
    renderPage('')
    expect(screen.getByText(/mymemory free api/i)).toBeInTheDocument()
  })

  it('does not show free-API banner when API key is set', () => {
    renderPage('sk-ant-test')
    expect(screen.queryByText(/mymemory free api/i)).toBeNull()
  })

  it('renders pinned source language buttons', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Detect language' })).toBeInTheDocument()
    // Both source and target have English; at least two should exist
    expect(screen.getAllByRole('button', { name: 'English' }).length).toBeGreaterThanOrEqual(2)
  })

  it('renders source textarea with placeholder', () => {
    renderPage()
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders "Translation" placeholder in the output panel', () => {
    renderPage()
    expect(screen.getByText('Translation')).toBeInTheDocument()
  })

  it('shows 500 char limit when no API key', () => {
    renderPage('')
    expect(screen.getByText('0 / 500')).toBeInTheDocument()
  })

  it('shows 5000 char limit when API key is set', () => {
    renderPage('sk-ant-test')
    expect(screen.getByText('0 / 5000')).toBeInTheDocument()
  })

  it('Translate button is disabled when textarea is empty', () => {
    renderPage()
    // The translate submit button lives in the bottom bar of the source panel
    const btns = screen.getAllByRole('button').filter((b) =>
      b.textContent?.startsWith('Translate'),
    )
    expect(btns[0]).toBeDisabled()
  })

  it('swap button is disabled when source is "Detect language"', () => {
    renderPage()
    expect(screen.getByTitle('Swap languages')).toBeDisabled()
  })
})

// ── language selection ─────────────────────────────────────────────────────────
describe('TranslatePage — language selection', () => {
  it('clicking a source language button selects it', async () => {
    renderPage()
    // getAllByRole returns [source-French, target-French]; click the first (source)
    const frenchBtns = screen.getAllByRole('button', { name: 'French' })
    await userEvent.click(frenchBtns[0])
    // Panel label updates to "FRENCH"
    expect(screen.getAllByText(/french/i).length).toBeGreaterThanOrEqual(1)
  })

  it('clicking a target language button selects it', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Japanese' }))
    expect(screen.getAllByText(/japanese/i).length).toBeGreaterThanOrEqual(1)
  })

  it('selecting an extra source language via More dropdown shows highlighted chip', async () => {
    renderPage()
    const [sourceSelect] = screen.getAllByRole('combobox')
    await userEvent.selectOptions(sourceSelect, 'uk')
    expect(screen.getByRole('button', { name: 'Ukrainian' })).toBeInTheDocument()
  })

  it('selecting an extra target language via More dropdown shows highlighted chip', async () => {
    renderPage()
    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[1], 'uk')
    expect(screen.getByRole('button', { name: 'Ukrainian' })).toBeInTheDocument()
  })
})

// ── char count & clear ─────────────────────────────────────────────────────────
describe('TranslatePage — char count & clear', () => {
  it('updates char count as user types', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Enter text'), 'Hello')
    expect(screen.getByText('5 / 500')).toBeInTheDocument()
  })

  it('clear button appears after typing and removes text when clicked', async () => {
    renderPage()
    const textarea = screen.getByPlaceholderText('Enter text')
    await userEvent.type(textarea, 'Hello')
    const clearBtn = screen.getByTitle('Clear')
    await userEvent.click(clearBtn)
    expect(textarea).toHaveValue('')
    expect(screen.queryByTitle('Clear')).toBeNull()
  })

  it('Translate button becomes enabled after typing text', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Enter text'), 'Hello')
    const btns = screen.getAllByRole('button').filter((b) =>
      b.textContent?.startsWith('Translate'),
    )
    expect(btns[0]).toBeEnabled()
  })
})

// ── swap languages ─────────────────────────────────────────────────────────────
describe('TranslatePage — swap languages', () => {
  it('swap button is enabled when a non-auto source language is selected', async () => {
    renderPage()
    // Click the source-side English button (first English button in the DOM)
    const englishBtns = screen.getAllByRole('button', { name: 'English' })
    await userEvent.click(englishBtns[0])
    expect(screen.getByTitle('Swap languages')).toBeEnabled()
  })

  it('swapping exchanges source and target languages', async () => {
    renderPage()
    // Select English as source (first occurrence)
    await userEvent.click(screen.getAllByRole('button', { name: 'English' })[0])
    // Swap (English ↔ Spanish)
    await userEvent.click(screen.getByTitle('Swap languages'))
    // Spanish is now source — its panel label should appear
    expect(screen.getAllByText(/spanish/i).length).toBeGreaterThanOrEqual(1)
  })

  it('swap does nothing when source is "Detect language"', async () => {
    renderPage()
    const swap = screen.getByTitle('Swap languages')
    expect(swap).toBeDisabled()
  })
})

// ── free API (MyMemory) ────────────────────────────────────────────────────────
describe('TranslatePage — free API translation (MyMemory)', () => {
  it('calls MyMemory and shows the translated text', async () => {
    myMemoryOk('Hola mundo')
    renderPage('')
    await userEvent.type(screen.getByPlaceholderText('Enter text'), 'Hello world')
    await userEvent.click(
      screen.getAllByRole('button').find((b) => b.textContent?.startsWith('Translate'))!,
    )
    await waitFor(() => expect(screen.getByText('Hola mundo')).toBeInTheDocument())
  })

  it('builds the correct MyMemory URL', async () => {
    myMemoryOk('Hola')
    renderPage('')
    await userEvent.type(screen.getByPlaceholderText('Enter text'), 'Hello')
    await userEvent.click(
      screen.getAllByRole('button').find((b) => b.textContent?.startsWith('Translate'))!,
    )
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1))
    const url: string = mockFetch.mock.calls[0][0]
    expect(url).toContain('api.mymemory.translated.net')
    expect(url).toContain('Hello')
  })

  it('uses "autodetect" in langpair when source is auto', async () => {
    myMemoryOk('Hola')
    renderPage('')
    await userEvent.type(screen.getByPlaceholderText('Enter text'), 'Hello')
    await userEvent.click(
      screen.getAllByRole('button').find((b) => b.textContent?.startsWith('Translate'))!,
    )
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1))
    expect(mockFetch.mock.calls[0][0]).toContain('autodetect')
  })

  it('shows error banner when MyMemory returns a non-200 status', async () => {
    myMemoryError('Quota exceeded')
    renderPage('')
    await userEvent.type(screen.getByPlaceholderText('Enter text'), 'Hello')
    await userEvent.click(
      screen.getAllByRole('button').find((b) => b.textContent?.startsWith('Translate'))!,
    )
    await waitFor(() => expect(screen.getByText(/quota exceeded/i)).toBeInTheDocument())
  })

  it('shows error banner when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    renderPage('')
    await userEvent.type(screen.getByPlaceholderText('Enter text'), 'Hello')
    await userEvent.click(
      screen.getAllByRole('button').find((b) => b.textContent?.startsWith('Translate'))!,
    )
    await waitFor(() => expect(screen.getByText(/network error/i)).toBeInTheDocument())
  })
})

// ── Claude API translation ─────────────────────────────────────────────────────
describe('TranslatePage — Claude API translation', () => {
  it('calls the Anthropic stream when API key is set', async () => {
    async function* fakeStream() {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hola ' } }
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'mundo' } }
    }
    mockStream.mockReturnValue(fakeStream())

    renderPage('sk-ant-test')
    await userEvent.type(screen.getByPlaceholderText('Enter text'), 'Hello world')
    await userEvent.click(
      screen.getAllByRole('button').find((b) => b.textContent?.startsWith('Translate'))!,
    )
    await waitFor(() => expect(screen.getByText('Hola mundo')).toBeInTheDocument())
    expect(mockStream).toHaveBeenCalledTimes(1)
  })

  it('does NOT call fetch (MyMemory) when API key is set', async () => {
    async function* fakeStream() {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hola' } }
    }
    mockStream.mockReturnValue(fakeStream())

    renderPage('sk-ant-test')
    await userEvent.type(screen.getByPlaceholderText('Enter text'), 'Hello')
    await userEvent.click(
      screen.getAllByRole('button').find((b) => b.textContent?.startsWith('Translate'))!,
    )
    await waitFor(() => expect(screen.getByText('Hola')).toBeInTheDocument())
    expect(mockFetch).not.toHaveBeenCalled()
  })
})

// ── copy ───────────────────────────────────────────────────────────────────────
describe('TranslatePage — copy', () => {
  it('shows Copy button after translation and copies text on click', async () => {
    myMemoryOk('Hola mundo')
    renderPage('')
    await userEvent.type(screen.getByPlaceholderText('Enter text'), 'Hello world')
    await userEvent.click(
      screen.getAllByRole('button').find((b) => b.textContent?.startsWith('Translate'))!,
    )
    await waitFor(() => expect(screen.getByText('Hola mundo')).toBeInTheDocument())

    const copyBtns = screen.getAllByText(/⎘ copy/i)
    expect(copyBtns.length).toBeGreaterThanOrEqual(1)
    await userEvent.click(copyBtns[0])
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hola mundo')
  })

  it('shows "✓ Copied" feedback after copying', async () => {
    myMemoryOk('Hola mundo')
    renderPage('')
    await userEvent.type(screen.getByPlaceholderText('Enter text'), 'Hello world')
    await userEvent.click(
      screen.getAllByRole('button').find((b) => b.textContent?.startsWith('Translate'))!,
    )
    await waitFor(() => expect(screen.getByText('Hola mundo')).toBeInTheDocument())
    await userEvent.click(screen.getAllByText(/⎘ copy/i)[0])
    await waitFor(() =>
      expect(screen.getAllByText(/✓ copied/i).length).toBeGreaterThanOrEqual(1),
    )
  })
})
