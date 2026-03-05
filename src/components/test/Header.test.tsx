import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Header from '../Header'
import settingsReducer, { setTheme } from '../../features/settings/settingsSlice'
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

describe('Header', () => {
  it('renders search input', () => {
    render(
      <Provider store={makeStore()}>
        <Header />
      </Provider>,
    )
    expect(screen.getByPlaceholderText(/search anything/i)).toBeInTheDocument()
  })

  it('shows sun icon in dark mode (to switch to light)', () => {
    render(
      <Provider store={makeStore('dark')}>
        <Header />
      </Provider>,
    )
    expect(screen.getByTitle(/switch to light mode/i)).toBeInTheDocument()
  })

  it('shows moon icon in light mode (to switch to dark)', () => {
    render(
      <Provider store={makeStore('light')}>
        <Header />
      </Provider>,
    )
    expect(screen.getByTitle(/switch to dark mode/i)).toBeInTheDocument()
  })

  it('dispatches setTheme(light) when clicked in dark mode', async () => {
    const store = makeStore('dark')
    render(
      <Provider store={store}>
        <Header />
      </Provider>,
    )
    await userEvent.click(screen.getByRole('button', { name: /toggle theme/i }))
    expect((store.getState() as any).settings.theme).toBe('light')
  })

  it('dispatches setTheme(dark) when clicked in light mode', async () => {
    const store = makeStore('light')
    render(
      <Provider store={store}>
        <Header />
      </Provider>,
    )
    await userEvent.click(screen.getByRole('button', { name: /toggle theme/i }))
    expect((store.getState() as any).settings.theme).toBe('dark')
  })
})
