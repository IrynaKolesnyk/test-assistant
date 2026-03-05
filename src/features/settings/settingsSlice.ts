import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ModelId, SettingsState, Theme } from '../../types'

const LS_KEY = 'ai-assistant:settings'

function loadFromStorage(): Partial<SettingsState> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Partial<SettingsState>) : {}
  } catch {
    return {}
  }
}

const defaults: SettingsState = {
  apiKey: '',
  model: 'claude-sonnet-4-6',
  systemPrompt: 'You are a helpful AI assistant.',
  theme: 'dark',
}

const initialState: SettingsState = { ...defaults, ...loadFromStorage() }

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setApiKey(state, action: PayloadAction<string>) {
      state.apiKey = action.payload
      saveToStorage(state)
    },
    setModel(state, action: PayloadAction<ModelId>) {
      state.model = action.payload
      saveToStorage(state)
    },
    setSystemPrompt(state, action: PayloadAction<string>) {
      state.systemPrompt = action.payload
      saveToStorage(state)
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload
      saveToStorage(state)
    },
  },
})

function saveToStorage(state: SettingsState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

export const { setApiKey, setModel, setSystemPrompt, setTheme } = settingsSlice.actions
export default settingsSlice.reducer
