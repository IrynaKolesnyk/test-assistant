import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { addConversation, addMessage } from './chatSlice'
import { useSendMessageMutation } from './claudeApi'
import ChatInput from './ChatInput'
import MessageList from './MessageList'
import type { Conversation, Message } from '../../types'

export default function ChatPage() {
  const dispatch = useAppDispatch()
  const { conversations, activeConversationId, streaming } = useAppSelector(
    (s) => s.chat,
  )
  const settings = useAppSelector((s) => s.settings)
  const [sendMessage, { error }] = useSendMessageMutation()

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? null

  async function handleSend(text: string) {
    let convId = activeConversationId

    if (!convId) {
      const newConv: Conversation = {
        id: crypto.randomUUID(),
        title: text.slice(0, 60),
        messages: [],
        createdAt: Date.now(),
      }
      dispatch(addConversation(newConv))
      convId = newConv.id
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      createdAt: Date.now(),
    }
    dispatch(addMessage({ conversationId: convId, message: userMessage }))

    const conv = conversations.find((c) => c.id === convId)
    const history = conv
      ? conv.messages.map((m) => ({ role: m.role, content: m.content }))
      : []
    history.push({ role: 'user', content: text })

    await sendMessage({
      conversationId: convId,
      messages: history,
      model: settings.model,
      systemPrompt: settings.systemPrompt,
    })
  }

  const apiKeyMissing = !settings.apiKey

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      <header className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--bg-panel)] px-6 py-3 flex items-center justify-between">
        <h2 className="font-semibold text-[var(--text-1)] truncate">
          {activeConversation?.title ?? 'New conversation'}
        </h2>
        <span className="text-xs text-[var(--text-3)]">{settings.model}</span>
      </header>

      {apiKeyMissing && (
        <div className="flex-shrink-0 bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 text-sm text-amber-500">
          ⚠ No API key set.{' '}
          <a href="/settings" className="underline font-medium hover:text-amber-400">
            Go to Settings
          </a>{' '}
          to add your Anthropic API key.
        </div>
      )}

      {error && (
        <div className="flex-shrink-0 bg-red-500/10 border-b border-red-500/20 px-6 py-3 text-sm text-red-500">
          {'error' in error ? String(error.error) : 'An error occurred. Please try again.'}
        </div>
      )}

      <MessageList messages={activeConversation?.messages ?? []} streaming={streaming} />
      <ChatInput onSend={handleSend} disabled={streaming || apiKeyMissing} />
    </div>
  )
}
