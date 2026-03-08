import { useState, type KeyboardEvent } from 'react'

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled = false }: Props) {
  const [value, setValue] = useState('')

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-[var(--border)] bg-[var(--bg-panel)] px-4 py-4 md:py-3">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Message Claude... (Enter to send, Shift+Enter for newline)"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-4 py-4 md:py-3 text-base md:text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed max-h-40 overflow-y-auto"
          style={{ minHeight: '60px' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="flex-shrink-0 w-12 h-12 md:w-10 md:h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-[var(--border)] disabled:text-[var(--text-3)] text-white flex items-center justify-center transition-colors"
        >
          ➤
        </button>
      </div>
      <p className="text-xs text-center text-[var(--text-3)] mt-2">
        AI can make mistakes. Verify important information.
      </p>
    </div>
  )
}
