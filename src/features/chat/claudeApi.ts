import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import Anthropic from '@anthropic-ai/sdk'
import { addMessage, setStreaming, updateLastMessage } from './chatSlice'
import type { Message, ModelId } from '../../types'

// Minimal state shape to avoid circular import with store.ts
interface StateWithSettings {
  settings: { apiKey: string }
}

interface SendMessageArgs {
  conversationId: string
  messages: Anthropic.MessageParam[]
  model: ModelId
  systemPrompt: string
}

// NOTE: Calling the Anthropic API directly from the browser is only suitable
// for local development. In production, proxy requests through your own backend
// to keep your API key secret.
export const claudeApi = createApi({
  reducerPath: 'claudeApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.anthropic.com/v1' }),
  endpoints: (builder) => ({
    sendMessage: builder.mutation<void, SendMessageArgs>({
      queryFn: async (args, api) => {
        const state = api.getState() as StateWithSettings
        const apiKey = state.settings.apiKey

        if (!apiKey) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'API key not set. Go to Settings to add your Anthropic API key.',
            },
          }
        }

        const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '',
          createdAt: Date.now(),
        }
        api.dispatch(addMessage({ conversationId: args.conversationId, message: assistantMessage }))
        api.dispatch(setStreaming(true))

        try {
          const stream = client.messages.stream({
            model: args.model,
            max_tokens: 4096,
            system: args.systemPrompt,
            messages: args.messages,
          })

          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              api.dispatch(
                updateLastMessage({ conversationId: args.conversationId, chunk: event.delta.text }),
              )
            }
          }

          return { data: undefined as void }
        } catch (err) {
          if (err instanceof Anthropic.APIError) {
            return { error: { status: err.status, data: err.message } }
          }
          return { error: { status: 'FETCH_ERROR', error: String(err) } }
        } finally {
          api.dispatch(setStreaming(false))
        }
      },
    }),
  }),
})

export const { useSendMessageMutation } = claudeApi
