import type { Message as MessageType } from '../../types'

interface Props {
  message: MessageType
}

export default function Message({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`} aria-label={isUser ? 'User message' : 'AI message'}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0 mt-1" aria-hidden="true">
          AI
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-sm'
            : 'bg-[var(--bg-input)] text-[var(--text-1)] border border-[var(--border)] rounded-tl-sm'
        }`}
      >
        {message.content}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center text-[var(--text-2)] text-xs font-bold ml-3 flex-shrink-0 mt-1" aria-hidden="true">
          U
        </div>
      )}
    </div>
  )
}
