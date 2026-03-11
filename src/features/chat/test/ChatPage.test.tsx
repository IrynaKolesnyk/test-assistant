import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ChatPage from '../ChatPage'
import chatReducer, { addConversation, selectConversation } from '../chatSlice'
import settingsReducer from '../../settings/settingsSlice'
import type { Conversation } from '../../../types'

jest.mock('../claudeApi', () => ({
  useSendMessageMutation: () => [jest.fn().mockResolvedValue({}), { error: undefined }],
  claudeApi: {
    reducerPath: 'claudeApi',
    reducer: (s = {}) => s,
    middleware: () => (next: (a: unknown) => unknown) => next,
  },
}))

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

function renderChatPage(apiKey = '') {
  return render(
    <Provider store={makeStore(apiKey)}>
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>
    </Provider>,
  )
}

const testConv: Conversation = {
  id: 'c1',
  title: 'My conversation',
  messages: [{ id: 'm1', role: 'user', content: 'Hello', createdAt: 1000 }],
  createdAt: 1000,
}

describe('ChatPage', () => {
  it('shows "New conversation" when no active conversation', () => {
    renderChatPage()
    expect(screen.getByText('New conversation')).toBeInTheDocument()
  })

  it('shows API key warning when key is missing', () => {
    renderChatPage('')
    expect(screen.getByText(/no api key set/i)).toBeInTheDocument()
  })

  it('does not show API key warning when key is set', () => {
    renderChatPage('sk-ant-test')
    expect(screen.queryByText(/no api key set/i)).toBeNull()
  })

  it('shows active conversation title in header', () => {
    const store = makeStore('sk-ant-test')
    store.dispatch(addConversation(testConv))
    store.dispatch(selectConversation('c1'))
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ChatPage />
        </MemoryRouter>
      </Provider>,
    )
    expect(screen.getByText('My conversation')).toBeInTheDocument()
  })

  it('shows the current model name', () => {
    renderChatPage()
    expect(screen.getByText('claude-sonnet-4-6')).toBeInTheDocument()
  })

  it('disables input when API key is missing', () => {
    renderChatPage('')
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})
