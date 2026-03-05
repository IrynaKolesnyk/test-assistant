import { useEffect, useRef } from 'react'
import type { Message as MessageType } from '../../types'
import Message from './Message'

interface Props {
  messages: MessageType[]
  streaming: boolean
}

export default function MessageList({ messages, streaming }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-3)] select-none">
        <div className="text-6xl mb-4">💬</div>
        <p className="text-lg font-medium text-[var(--text-2)]">Start a conversation</p>
        <p className="text-sm mt-1">Type a message below to chat with Claude</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}
      {streaming && (
        <div className="flex justify-start mb-4">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0 mt-1">
            AI
          </div>
          <div className="bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-4 py-3">
            <span className="inline-flex gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--text-3)] animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-[var(--text-3)] animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-[var(--text-3)] animate-bounce [animation-delay:300ms]" />
            </span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
