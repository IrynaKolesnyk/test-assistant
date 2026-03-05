export type Role = 'user' | 'assistant'

export type ModelId =
  | 'claude-sonnet-4-6'
  | 'claude-opus-4-6'
  | 'claude-haiku-4-5-20251001'

export interface Message {
  id: string
  role: Role
  content: string
  createdAt: number
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
}

export type Theme = 'dark' | 'light'

export interface SettingsState {
  apiKey: string
  model: ModelId
  systemPrompt: string
  theme: Theme
}

export interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  streaming: boolean
}
