import settingsReducer, { setApiKey, setModel, setSystemPrompt, setTheme } from '../settingsSlice'
import type { SettingsState } from '../../../types'

const defaultState: SettingsState = {
  apiKey: '',
  model: 'claude-sonnet-4-6',
  systemPrompt: 'You are a helpful AI assistant.',
  theme: 'dark',
}

describe('settingsSlice', () => {
  it('sets the API key', () => {
    const state = settingsReducer(defaultState, setApiKey('sk-ant-test'))
    expect(state.apiKey).toBe('sk-ant-test')
  })

  it('sets the model', () => {
    const state = settingsReducer(defaultState, setModel('claude-opus-4-6'))
    expect(state.model).toBe('claude-opus-4-6')
  })

  it('sets the system prompt', () => {
    const state = settingsReducer(defaultState, setSystemPrompt('Be concise.'))
    expect(state.systemPrompt).toBe('Be concise.')
  })

  it('sets the theme to light', () => {
    const state = settingsReducer(defaultState, setTheme('light'))
    expect(state.theme).toBe('light')
  })

  it('sets the theme to dark', () => {
    const lightState: SettingsState = { ...defaultState, theme: 'light' }
    const state = settingsReducer(lightState, setTheme('dark'))
    expect(state.theme).toBe('dark')
  })

  it('does not mutate other fields when updating apiKey', () => {
    const state = settingsReducer(defaultState, setApiKey('new-key'))
    expect(state.model).toBe(defaultState.model)
    expect(state.systemPrompt).toBe(defaultState.systemPrompt)
    expect(state.theme).toBe(defaultState.theme)
  })
})
