import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import RecipesPage from '../RecipesPage'
import settingsReducer from '../../settings/settingsSlice'

// ─── Mocks ────────────────────────────────────────────────────────────────────

// mockAnthropicStream must start with "mock" — Jest hoist rule for factory closures.
const mockAnthropicStream = jest.fn()

jest.mock('@anthropic-ai/sdk', () => {
  class APIError extends Error {}
  const sdk = jest.fn().mockImplementation(() => ({
    messages: { stream: mockAnthropicStream },
  })) as jest.Mock & { APIError: typeof APIError }
  sdk.APIError = APIError
  return { __esModule: true, default: sdk, APIError }
})

const MOCK_MEALS = [
  {
    idMeal: '52772',
    strMeal: 'Teriyaki Chicken Casserole',
    strMealThumb: 'https://example.com/thumb.jpg',
    strCategory: 'Chicken',
    strArea: 'Japanese',
    strInstructions: 'Mix soy sauce and mirin. Cook chicken. Combine.',
    strYoutube: 'https://www.youtube.com/watch?v=4aZr5hZXP_s',
    strIngredient1: 'Soy Sauce',
    strMeasure1: '3/4 cup',
    strIngredient2: 'Mirin',
    strMeasure2: '1/2 cup',
    strIngredient3: '',
    strMeasure3: '',
  },
]

global.fetch = jest.fn()

function mockFetchSuccess(data: unknown) {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  })
}

function mockFetchEmpty() {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ meals: null }),
  })
}

// ─── Store helpers ────────────────────────────────────────────────────────────

function makeStore(apiKey = '') {
  return configureStore({
    reducer: { settings: settingsReducer },
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
        <RecipesPage />
      </MemoryRouter>
    </Provider>,
  )
}

beforeEach(() => {
  ;(global.fetch as jest.Mock).mockReset()
  mockAnthropicStream.mockReset()
})

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('RecipesPage — rendering', () => {
  it('renders the page heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /find recipe/i })).toBeInTheDocument()
  })

  it('renders the search input', () => {
    renderPage()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders the Search button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('Search button is disabled when input is empty', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /search/i })).toBeDisabled()
  })

  it('Search button is enabled when input has text', async () => {
    renderPage()
    await userEvent.type(screen.getByRole('textbox'), 'pasta')
    expect(screen.getByRole('button', { name: /search/i })).toBeEnabled()
  })

  it('shows free API banner when no API key', () => {
    renderPage()
    expect(screen.getByText(/TheMealDB free API/i)).toBeInTheDocument()
  })

  it('does not show free API banner when API key is set', () => {
    renderPage('sk-test-key')
    expect(screen.queryByText(/TheMealDB free API/i)).toBeNull()
  })

  it('shows idle empty state initially', () => {
    renderPage()
    expect(screen.getByText(/search thousands of recipes/i)).toBeInTheDocument()
  })

  it('shows AI-oriented idle state when API key is set', () => {
    renderPage('sk-test-key')
    expect(screen.getByText(/AI-powered recipe generation/i)).toBeInTheDocument()
  })
})

// ─── Free API — search by name ────────────────────────────────────────────────

describe('RecipesPage — free API search', () => {
  it('calls TheMealDB search endpoint on submit', async () => {
    mockFetchSuccess({ meals: MOCK_MEALS })
    renderPage()
    await userEvent.type(screen.getByRole('textbox'), 'teriyaki')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search.php?s=teriyaki'),
      )
    })
  })

  it('renders meal cards after a successful search', async () => {
    mockFetchSuccess({ meals: MOCK_MEALS })
    renderPage()
    await userEvent.type(screen.getByRole('textbox'), 'teriyaki')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => {
      expect(screen.getByText('Teriyaki Chicken Casserole')).toBeInTheDocument()
    })
  })

  it('shows category and area on meal card', async () => {
    mockFetchSuccess({ meals: MOCK_MEALS })
    renderPage()
    await userEvent.type(screen.getByRole('textbox'), 'teriyaki')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => {
      expect(screen.getByText(/Chicken · Japanese/i)).toBeInTheDocument()
    })
  })

  it('falls back to ingredient filter when name search returns no results', async () => {
    mockFetchEmpty()
    mockFetchSuccess({ meals: MOCK_MEALS })
    renderPage()
    await userEvent.type(screen.getByRole('textbox'), 'chicken')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('filter.php?i=chicken'),
      )
    })
  })

  it('shows empty state message when both searches return no results', async () => {
    mockFetchEmpty()
    mockFetchEmpty()
    renderPage()
    await userEvent.type(screen.getByRole('textbox'), 'xyz123')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => {
      expect(screen.getByText(/no recipes found/i)).toBeInTheDocument()
    })
  })

  it('shows error banner on fetch failure', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    renderPage()
    await userEvent.type(screen.getByRole('textbox'), 'pasta')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => {
      // String(err) → "Error: Network error"; the banner renders "⚠ Error: Network error"
      expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument()
    })
  })
})

// ─── Free API — meal detail ───────────────────────────────────────────────────

describe('RecipesPage — meal detail', () => {
  it('clicking a meal card shows detail view with ingredients', async () => {
    mockFetchSuccess({ meals: MOCK_MEALS })
    renderPage()
    await userEvent.type(screen.getByRole('textbox'), 'teriyaki')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => screen.getByText('Teriyaki Chicken Casserole'))

    await userEvent.click(screen.getByText('Teriyaki Chicken Casserole'))
    expect(screen.getByText('🧂 Ingredients')).toBeInTheDocument()
    expect(screen.getByText(/Soy Sauce/)).toBeInTheDocument()
  })

  it('clicking a meal card shows instructions', async () => {
    mockFetchSuccess({ meals: MOCK_MEALS })
    renderPage()
    await userEvent.type(screen.getByRole('textbox'), 'teriyaki')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => screen.getByText('Teriyaki Chicken Casserole'))

    await userEvent.click(screen.getByText('Teriyaki Chicken Casserole'))
    expect(screen.getByText('📋 Instructions')).toBeInTheDocument()
    expect(screen.getByText(/Cook chicken/)).toBeInTheDocument()
  })

  it('"Back to results" button returns to card grid', async () => {
    mockFetchSuccess({ meals: MOCK_MEALS })
    renderPage()
    await userEvent.type(screen.getByRole('textbox'), 'teriyaki')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => screen.getByText('Teriyaki Chicken Casserole'))

    await userEvent.click(screen.getByText('Teriyaki Chicken Casserole'))
    await userEvent.click(screen.getByRole('button', { name: /back to results/i }))
    expect(screen.getByText('Teriyaki Chicken Casserole')).toBeInTheDocument()
    expect(screen.queryByText('🧂 Ingredients')).toBeNull()
  })
})

// ─── Clear / reset ────────────────────────────────────────────────────────────

describe('RecipesPage — clear', () => {
  it('clear button (✕) resets the search', async () => {
    mockFetchSuccess({ meals: MOCK_MEALS })
    renderPage()
    await userEvent.type(screen.getByRole('textbox'), 'teriyaki')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => screen.getByText('Teriyaki Chicken Casserole'))

    await userEvent.click(screen.getByText('✕'))
    expect(screen.getByRole('textbox')).toHaveValue('')
    expect(screen.queryByText('Teriyaki Chicken Casserole')).toBeNull()
  })
})

// ─── Claude mode ──────────────────────────────────────────────────────────────

describe('RecipesPage — Claude mode', () => {
  it('does not call fetch when API key is set', async () => {
    async function* fakeStream() {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: '**Pasta Carbonara**' } }
    }
    mockAnthropicStream.mockReturnValue(fakeStream())
    renderPage('sk-test-key')
    await userEvent.type(screen.getByRole('textbox'), 'pasta carbonara')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => screen.getByText(/Pasta Carbonara/))
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('streams AI recipe text into the panel', async () => {
    async function* fakeStream() {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: '**Pasta' } }
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: ' Carbonara**' } }
    }
    mockAnthropicStream.mockReturnValue(fakeStream())
    renderPage('sk-test-key')
    await userEvent.type(screen.getByRole('textbox'), 'pasta carbonara')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => {
      expect(screen.getByText(/Pasta Carbonara/)).toBeInTheDocument()
    })
  })

  it('shows AI Recipe panel header', async () => {
    async function* fakeStream() {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'A recipe for you' } }
    }
    mockAnthropicStream.mockReturnValue(fakeStream())
    renderPage('sk-test-key')
    await userEvent.type(screen.getByRole('textbox'), 'pasta')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => screen.getByText('AI Recipe'))
    expect(screen.getByText('AI Recipe')).toBeInTheDocument()
  })
})
