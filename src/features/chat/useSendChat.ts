import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { addConversation, addMessage } from './chatSlice'
import { useSendMessageMutation } from './claudeApi'
import type { Conversation, Message } from '../../types'

/**
 * Shared hook that encapsulates the send-a-chat-message flow used by both
 * ChatPage and DashboardPage: create conversation if needed, dispatch the
 * user message, build history, and call the Claude API.
 */
export function useSendChat() {
  const dispatch = useAppDispatch()
  const { conversations, activeConversationId, streaming } = useAppSelector(
    (state) => state.chat,
  )
  const settings = useAppSelector((state) => state.settings)
  const [sendMessageMutation, { error }] = useSendMessageMutation()

  async function sendChat(text: string): Promise<string> {
    let conversationId = activeConversationId

    if (!conversationId) {
      const newConversation: Conversation = {
        id: crypto.randomUUID(),
        title: text.slice(0, 60) + (text.length > 60 ? '…' : ''),
        messages: [],
        createdAt: Date.now(),
      }
      dispatch(addConversation(newConversation))
      conversationId = newConversation.id
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      createdAt: Date.now(),
    }
    dispatch(addMessage({ conversationId, message: userMessage }))

    // Build history from the snapshot before this dispatch (new message is
    // appended manually below so the API receives the full context).
    const existingConversation = conversations.find(
      (conversation) => conversation.id === conversationId,
    )
    const history = existingConversation
      ? existingConversation.messages.map((message) => ({
          role: message.role,
          content: message.content,
        }))
      : []
    history.push({ role: 'user', content: text })

    await sendMessageMutation({
      conversationId,
      messages: history,
      model: settings.model,
      systemPrompt: settings.systemPrompt,
    })

    return conversationId
  }

  return { sendChat, streaming, error }
}
