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

// Debounced save — avoids hammering localStorage on every streaming chunk.
// Critical mutations (addConversation, deleteConversation) call saveNow instead.
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null

function saveConversations(conversations: Conversation[]) {
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer)
  saveDebounceTimer = setTimeout(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(conversations))
    } catch (err) {
      console.warn('[chatSlice] Failed to persist conversations:', err)
    }
  }, 300)
}

function saveConversationsNow(conversations: Conversation[]) {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer)
    saveDebounceTimer = null
  }
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(conversations))
  } catch (err) {
    console.warn('[chatSlice] Failed to persist conversations:', err)
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
      saveConversationsNow(state.conversations)
    },
    selectConversation(state, action: PayloadAction<string>) {
      state.activeConversationId = action.payload
    },
    deleteConversation(state, action: PayloadAction<string>) {
      state.conversations = state.conversations.filter(
        (conversation) => conversation.id !== action.payload,
      )
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = state.conversations[0]?.id ?? null
      }
      saveConversationsNow(state.conversations)
    },
    addMessage(
      state,
      action: PayloadAction<{ conversationId: string; message: Message }>,
    ) {
      const conversation = state.conversations.find(
        (conv) => conv.id === action.payload.conversationId,
      )
      if (!conversation) {
        console.warn('[chatSlice] addMessage: conversation not found:', action.payload.conversationId)
        return
      }
      conversation.messages.push(action.payload.message)
      if (conversation.messages.length === 1) {
        const raw = action.payload.message.content.slice(0, 60)
        conversation.title = raw.length < action.payload.message.content.length ? raw + '…' : raw
      }
      saveConversationsNow(state.conversations)
    },
    updateLastMessage(
      state,
      action: PayloadAction<{ conversationId: string; chunk: string }>,
    ) {
      const conversation = state.conversations.find(
        (conv) => conv.id === action.payload.conversationId,
      )
      if (!conversation) {
        console.warn('[chatSlice] updateLastMessage: conversation not found:', action.payload.conversationId)
        return
      }
      if (conversation.messages.length > 0) {
        const lastMessage = conversation.messages[conversation.messages.length - 1]
        lastMessage.content += action.payload.chunk
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
