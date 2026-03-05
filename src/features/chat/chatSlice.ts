import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ChatState, Conversation, Message } from '../../types'

const LS_KEY = 'ai-assistant:conversations'

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Conversation[]) : []
  } catch {
    return []
  }
}

function saveConversations(conversations: Conversation[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(conversations))
  } catch {
    // ignore
  }
}

const initialState: ChatState = {
  conversations: loadConversations(),
  activeConversationId: null,
  streaming: false,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addConversation(state, action: PayloadAction<Conversation>) {
      state.conversations.unshift(action.payload)
      state.activeConversationId = action.payload.id
      saveConversations(state.conversations)
    },
    selectConversation(state, action: PayloadAction<string>) {
      state.activeConversationId = action.payload
    },
    deleteConversation(state, action: PayloadAction<string>) {
      state.conversations = state.conversations.filter(
        (c) => c.id !== action.payload,
      )
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = state.conversations[0]?.id ?? null
      }
      saveConversations(state.conversations)
    },
    addMessage(
      state,
      action: PayloadAction<{ conversationId: string; message: Message }>,
    ) {
      const conv = state.conversations.find(
        (c) => c.id === action.payload.conversationId,
      )
      if (conv) {
        conv.messages.push(action.payload.message)
        if (conv.messages.length === 1) {
          conv.title = action.payload.message.content.slice(0, 60)
        }
        saveConversations(state.conversations)
      }
    },
    updateLastMessage(
      state,
      action: PayloadAction<{ conversationId: string; chunk: string }>,
    ) {
      const conv = state.conversations.find(
        (c) => c.id === action.payload.conversationId,
      )
      if (conv && conv.messages.length > 0) {
        const last = conv.messages[conv.messages.length - 1]
        last.content += action.payload.chunk
        saveConversations(state.conversations)
      }
    },
    setStreaming(state, action: PayloadAction<boolean>) {
      state.streaming = action.payload
    },
  },
})

export const {
  addConversation,
  selectConversation,
  deleteConversation,
  addMessage,
  updateLastMessage,
  setStreaming,
} = chatSlice.actions
export default chatSlice.reducer
