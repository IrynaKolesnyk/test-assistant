import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import SettingsPage from '../SettingsPage'
import settingsReducer from '../settingsSlice'
import type { SettingsState } from '../../../types'

function makeStore(overrides: Partial<SettingsState> = {}) {
  return configureStore({
    reducer: { settings: settingsReducer },
    preloadedState: {
      settings: {
        apiKey: '',
        model: 'claude-sonnet-4-6' as const,
        systemPrompt: 'You are a helpful AI assistant.',
        theme: 'dark' as const,
        ...overrides,
      },
    },
  })
}

function renderSettings(overrides: Partial<SettingsState> = {}) {
  const store = makeStore(overrides)
  render(
    <Provider store={store}>
      <SettingsPage />
    </Provider>,
  )
  return store
}

describe('SettingsPage', () => {
  it('renders the settings heading', () => {
    renderSettings()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders all three sections', () => {
    renderSettings()
    expect(screen.getByText('Anthropic API Key')).toBeInTheDocument()
    expect(screen.getByText('Model')).toBeInTheDocument()
    expect(screen.getByText('System Prompt')).toBeInTheDocument()
  })

  it('renders the API key input', () => {
    renderSettings()
    expect(screen.getByPlaceholderText('sk-ant-...')).toBeInTheDocument()
  })

  it('renders the model selector', () => {
    renderSettings()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows all model options', () => {
    renderSettings()
    expect(screen.getByText(/sonnet 4\.6/i)).toBeInTheDocument()
    expect(screen.getByText(/opus 4\.6/i)).toBeInTheDocument()
    expect(screen.getByText(/haiku 4\.5/i)).toBeInTheDocument()
  })

  it('renders the localStorage warning', () => {
    renderSettings()
    expect(screen.getByText(/stored in browser localStorage/i)).toBeInTheDocument()
  })

  it('warning uses amber-700 class in light theme', () => {
    renderSettings({ theme: 'light' })
    const warning = screen.getByText(/stored in browser localStorage/i)
    expect(warning.className).toMatch(/amber-700/)
  })

  it('warning uses amber-400 class in dark theme', () => {
    renderSettings({ theme: 'dark' })
    const warning = screen.getByText(/stored in browser localStorage/i)
    expect(warning.className).toMatch(/amber-400/)
  })

  it('updates API key in store on input', async () => {
    const store = renderSettings()
    await userEvent.type(screen.getByPlaceholderText('sk-ant-...'), 'sk-test')
    expect(store.getState().settings.apiKey).toBe('sk-test')
  })

  it('updates system prompt in store on input', async () => {
    const store = renderSettings()
    const textarea = screen.getByRole('textbox')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'Be brief.')
    expect(store.getState().settings.systemPrompt).toBe('Be brief.')
  })
})
