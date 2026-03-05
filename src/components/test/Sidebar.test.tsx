import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Sidebar from '../Sidebar'
import chatReducer, { addConversation } from '../../features/chat/chatSlice'
import settingsReducer from '../../features/settings/settingsSlice'
import type { Conversation } from '../../types'

function makeStore(conversations: Conversation[] = []) {
  const store = configureStore({
    reducer: { chat: chatReducer, settings: settingsReducer },
  })
  conversations.forEach((c) => store.dispatch(addConversation(c)))
  return store
}

function makeConversation(id: string): Conversation {
  return { id, title: `Conv ${id}`, messages: [], createdAt: Date.now() }
}

function renderSidebar(path = '/', conversations: Conversation[] = []) {
  return render(
    <Provider store={makeStore(conversations)}>
      <MemoryRouter initialEntries={[path]}>
        <Sidebar />
      </MemoryRouter>
    </Provider>,
  )
}

describe('Sidebar', () => {
  it('renders the app title', () => {
    renderSidebar()
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
  })

  it('renders MAIN, TOOLS, OTHER section labels', () => {
    renderSidebar()
    expect(screen.getByText('Main')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument()
    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('renders all nav items', () => {
    renderSidebar()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Chat')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Translate')).toBeInTheDocument()
  })

  it('renders user profile', () => {
    renderSidebar()
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument()
  })

  it('does not show chat badge when no conversations', () => {
    renderSidebar('/', [])
    const badge = screen.queryByText(/^\d+$/)
    expect(badge).toBeNull()
  })

  it('shows chat badge count when conversations exist', () => {
    renderSidebar('/', [makeConversation('1'), makeConversation('2')])
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows 9+ badge when more than 9 conversations exist', () => {
    const convs = Array.from({ length: 10 }, (_, i) => makeConversation(String(i)))
    renderSidebar('/', convs)
    expect(screen.getByText('9+')).toBeInTheDocument()
  })

  it('chat nav link points to /chat', () => {
    renderSidebar()
    const links = screen.getAllByRole('link')
    const chatLink = links.find((l) => l.getAttribute('href') === '/chat')
    expect(chatLink).toBeTruthy()
  })
})
