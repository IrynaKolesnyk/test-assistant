import chatReducer, {
  addConversation,
  addMessage,
  deleteConversation,
  selectConversation,
  setStreaming,
  updateLastMessage,
} from '../chatSlice'
import type { ChatState, Conversation, Message } from '../../../types'

const makeConversation = (id = '1'): Conversation => ({
  id,
  title: 'Test conversation',
  messages: [],
  createdAt: 1000,
})

const makeMessage = (id = 'm1', content = 'Hello'): Message => ({
  id,
  role: 'user',
  content,
  createdAt: 2000,
})

const emptyState: ChatState = {
  conversations: [],
  activeConversationId: null,
  streaming: false,
}

describe('chatSlice', () => {
  it('adds a conversation and sets it as active', () => {
    const conv = makeConversation('c1')
    const state = chatReducer(emptyState, addConversation(conv))
    expect(state.conversations).toHaveLength(1)
    expect(state.activeConversationId).toBe('c1')
  })

  it('selects a conversation', () => {
    const conv = makeConversation('c1')
    const withConv = chatReducer(emptyState, addConversation(conv))
    const state = chatReducer(withConv, selectConversation('c1'))
    expect(state.activeConversationId).toBe('c1')
  })

  it('deletes a conversation', () => {
    const conv = makeConversation('c1')
    const withConv = chatReducer(emptyState, addConversation(conv))
    const state = chatReducer(withConv, deleteConversation('c1'))
    expect(state.conversations).toHaveLength(0)
    expect(state.activeConversationId).toBeNull()
  })

  it('adds a message to a conversation', () => {
    const conv = makeConversation('c1')
    const msg = makeMessage('m1', 'Hello')
    const withConv = chatReducer(emptyState, addConversation(conv))
    const state = chatReducer(withConv, addMessage({ conversationId: 'c1', message: msg }))
    expect(state.conversations[0].messages).toHaveLength(1)
    expect(state.conversations[0].messages[0].content).toBe('Hello')
  })

  it('updates the first message as title', () => {
    const conv = makeConversation('c1')
    const msg = makeMessage('m1', 'This is my first message')
    const withConv = chatReducer(emptyState, addConversation(conv))
    const state = chatReducer(withConv, addMessage({ conversationId: 'c1', message: msg }))
    expect(state.conversations[0].title).toBe('This is my first message')
  })

  it('appends a chunk to the last message', () => {
    const conv = makeConversation('c1')
    const msg = makeMessage('m1', 'Hello')
    const withConv = chatReducer(emptyState, addConversation(conv))
    const withMsg = chatReducer(withConv, addMessage({ conversationId: 'c1', message: msg }))
    const state = chatReducer(withMsg, updateLastMessage({ conversationId: 'c1', chunk: ' world' }))
    expect(state.conversations[0].messages[0].content).toBe('Hello world')
  })

  it('sets streaming flag', () => {
    expect(chatReducer(emptyState, setStreaming(true)).streaming).toBe(true)
    expect(chatReducer(emptyState, setStreaming(false)).streaming).toBe(false)
  })
})
