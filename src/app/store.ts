import { configureStore } from '@reduxjs/toolkit'
import chatReducer from '../features/chat/chatSlice'
import settingsReducer from '../features/settings/settingsSlice'
import { claudeApi } from '../features/chat/claudeApi'

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    settings: settingsReducer,
    [claudeApi.reducerPath]: claudeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(claudeApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
