import { render, screen } from '@testing-library/react'
import MessageList from '../MessageList'
import type { Message } from '../../../types'

const userMsg: Message = { id: '1', role: 'user', content: 'Hello there', createdAt: 1000 }
const assistantMsg: Message = { id: '2', role: 'assistant', content: 'Hi! How can I help?', createdAt: 2000 }

describe('MessageList', () => {
  it('shows empty state when no messages', () => {
    render(<MessageList messages={[]} streaming={false} />)
    expect(screen.getByText(/start a conversation/i)).toBeInTheDocument()
  })

  it('renders user and assistant messages', () => {
    render(<MessageList messages={[userMsg, assistantMsg]} streaming={false} />)
    expect(screen.getByText('Hello there')).toBeInTheDocument()
    expect(screen.getByText('Hi! How can I help?')).toBeInTheDocument()
  })

  it('shows loading indicator when streaming', () => {
    render(<MessageList messages={[userMsg]} streaming={true} />)
    // Animated dots rendered as spans
    const dots = document.querySelectorAll('.animate-bounce')
    expect(dots.length).toBeGreaterThan(0)
  })

  it('does not show loading indicator when not streaming', () => {
    render(<MessageList messages={[userMsg]} streaming={false} />)
    const dots = document.querySelectorAll('.animate-bounce')
    expect(dots.length).toBe(0)
  })
})
