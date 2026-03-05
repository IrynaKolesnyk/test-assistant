import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Layout from '../Layout'
import chatReducer from '../../features/chat/chatSlice'
import settingsReducer from '../../features/settings/settingsSlice'
import { claudeApi } from '../../features/chat/claudeApi'

function makeStore() {
  return configureStore({
    reducer: {
      chat: chatReducer,
      settings: settingsReducer,
      [claudeApi.reducerPath]: claudeApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(claudeApi.middleware),
  })
}

function renderLayout(initialPath = '/') {
  return render(
    <Provider store={makeStore()}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/*" element={<Layout />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('Layout', () => {
  it('renders the sidebar with app title', () => {
    renderLayout()
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
  })

  it('renders the theme toggle button', () => {
    renderLayout()
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })

  it('renders the settings nav link', () => {
    renderLayout()
    const links = screen.getAllByRole('link')
    const settingsLink = links.find((l) => l.getAttribute('href') === '/settings')
    expect(settingsLink).toBeTruthy()
  })

  it('renders the search input in the header', () => {
    renderLayout()
    expect(screen.getByPlaceholderText(/search anything/i)).toBeInTheDocument()
  })
})
