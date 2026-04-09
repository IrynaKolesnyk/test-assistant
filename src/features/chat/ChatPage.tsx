import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../../app/hooks'
import { useSendChat } from './useSendChat'
import ChatInput from './ChatInput'
import MessageList from './MessageList'

export default function ChatPage() {
  const { t } = useTranslation()
  const { conversations, activeConversationId } = useAppSelector((state) => state.chat)
  const settings = useAppSelector((state) => state.settings)
  const { sendChat, streaming, error } = useSendChat()

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeConversationId) ?? null

  async function handleSend(text: string) {
    await sendChat(text)
  }

  const apiKeyMissing = !settings.apiKey

  function renderError() {
    if (!error) return null
    const message =
      'error' in error
        ? String(error.error)
        : 'data' in error
        ? String(error.data)
        : t('chat.errorOccurred')
    return (
      <div role="alert" className="flex-shrink-0 bg-red-500/10 border-b border-red-500/20 px-6 py-3 text-sm text-red-500">
        {message}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      <header className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--bg-panel)] px-6 py-3 flex items-center justify-between">
        <h2 className="font-semibold text-[var(--text-1)] truncate">
          {activeConversation?.title ?? t('chat.newConversation')}
        </h2>
        <span className="text-xs text-[var(--text-3)]">{settings.model}</span>
      </header>

      {apiKeyMissing && (
        <div role="alert" className="flex-shrink-0 bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 text-sm text-amber-500">
          ⚠ {t('chat.noApiKey')}{' '}
          <a href="/settings" className="underline font-medium hover:text-amber-400">
            {t('chat.goToSettings')}
          </a>{' '}
          {t('chat.toAddApiKey')}
        </div>
      )}

      {renderError()}

      <MessageList messages={activeConversation?.messages ?? []} streaming={streaming} />
      <ChatInput onSend={handleSend} disabled={streaming || apiKeyMissing} />
    </div>
  )
}
