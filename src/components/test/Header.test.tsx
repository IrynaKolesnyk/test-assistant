import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Header from '../Header'
import settingsReducer from '../../features/settings/settingsSlice'
import type { SettingsState } from '../../types'

function makeStore(theme: SettingsState['theme'] = 'dark') {
  return configureStore({
    reducer: { settings: settingsReducer },
    preloadedState: {
      settings: {
        apiKey: '',
        model: 'claude-sonnet-4-6' as const,
        systemPrompt: '',
        theme,
      },
    },
  })
}

function renderHeader(theme: SettingsState['theme'] = 'dark') {
  const store = makeStore(theme)
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </Provider>,
  )
  return store
}

describe('Header', () => {
  it('renders search input', () => {
    renderHeader()
    expect(screen.getByPlaceholderText(/search anything/i)).toBeInTheDocument()
  })

  it('shows sun icon in dark mode (to switch to light)', () => {
    renderHeader('dark')
    expect(screen.getByTitle(/switch to light mode/i)).toBeInTheDocument()
  })

  it('shows moon icon in light mode (to switch to dark)', () => {
    renderHeader('light')
    expect(screen.getByTitle(/switch to dark mode/i)).toBeInTheDocument()
  })

  it('dispatches setTheme(light) when clicked in dark mode', async () => {
    const store = renderHeader('dark')
    await userEvent.click(screen.getByRole('button', { name: /toggle theme/i }))
    expect(store.getState().settings.theme).toBe('light')
  })

  it('dispatches setTheme(dark) when clicked in light mode', async () => {
    const store = renderHeader('light')
    await userEvent.click(screen.getByRole('button', { name: /toggle theme/i }))
    expect(store.getState().settings.theme).toBe('dark')
  })

  it('renders home link pointing to /dashboard', () => {
    renderHeader()
    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink.getAttribute('href')).toBe('/dashboard')
  })
})
