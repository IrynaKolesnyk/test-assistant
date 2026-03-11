import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import DashboardPage from '../DashboardPage'
import chatReducer from '../../chat/chatSlice'
import settingsReducer from '../../settings/settingsSlice'

jest.mock('../../chat/claudeApi', () => ({
  useSendMessageMutation: () => [jest.fn().mockResolvedValue({}), { error: undefined }],
  claudeApi: {
    reducerPath: 'claudeApi',
    reducer: (s = {}) => s,
    middleware: (_: any) => (next: any) => next,
  },
}))

beforeEach(() => {
  localStorage.clear()
})

function makeStore() {
  return configureStore({
    reducer: { chat: chatReducer, settings: settingsReducer },
  })
}

function renderDashboard() {
  return render(
    <Provider store={makeStore()}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </Provider>,
  )
}

describe('DashboardPage', () => {
  it('renders welcome message', () => {
    renderDashboard()
    expect(screen.getByText(/welcome back, alex/i)).toBeInTheDocument()
  })

  it('renders Quick Actions widget', () => {
    renderDashboard()
    expect(screen.getByText(/quick actions/i)).toBeInTheDocument()
  })

  it('renders all 6 quick action buttons', () => {
    renderDashboard()
    expect(screen.getByText('Plan Day')).toBeInTheDocument()
    expect(screen.getByText('Translate')).toBeInTheDocument()
    expect(screen.getByText('Find Recipe')).toBeInTheDocument()
    expect(screen.getByText('Set Reminder')).toBeInTheDocument()
    expect(screen.getByText('Create List')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('renders Statistics widget', () => {
    renderDashboard()
    expect(screen.getByText(/statistics/i)).toBeInTheDocument()
    expect(screen.getByText('Tasks Completed')).toBeInTheDocument()
  })

  it('renders AI Chat widget with default message', () => {
    renderDashboard()
    expect(screen.getByText(/how can i help you today/i)).toBeInTheDocument()
  })

  it('renders Recent Activity widget', () => {
    renderDashboard()
    expect(screen.getByText(/recent activity/i)).toBeInTheDocument()
    expect(screen.getByText('Task Completed')).toBeInTheDocument()
  })

  it('renders Calendar widget showing current month and year', () => {
    const MONTH_NAMES = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ]
    const now = new Date()
    const expectedLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`
    renderDashboard()
    expect(screen.getByText(/calendar/i)).toBeInTheDocument()
    expect(screen.getByText(expectedLabel)).toBeInTheDocument()
  })

  it('renders Today\'s Tasks widget with empty state when no tasks scheduled', () => {
    renderDashboard()
    expect(screen.getByText(/today.s tasks/i)).toBeInTheDocument()
    expect(screen.getByText(/no tasks scheduled for today/i)).toBeInTheDocument()
  })

  it('shows tasks from localStorage scheduled for today', () => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T09:00`
    localStorage.setItem(
      'ai-assistant:tasks',
      JSON.stringify([{ id: '1', title: 'Doctor appointment', done: false, createdAt: Date.now(), dueDate: todayStr }]),
    )
    renderDashboard()
    expect(screen.getByText('Doctor appointment')).toBeInTheDocument()
  })

  it('shows date-only task (no time) for today and displays "All day"', () => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const todayDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    localStorage.setItem(
      'ai-assistant:tasks',
      JSON.stringify([{ id: '2', title: 'All day event', done: false, createdAt: Date.now(), dueDate: todayDate }]),
    )
    renderDashboard()
    expect(screen.getByText('All day event')).toBeInTheDocument()
    expect(screen.getByText('All day')).toBeInTheDocument()
  })

  it('does not show tasks scheduled for a different day', () => {
    localStorage.setItem(
      'ai-assistant:tasks',
      JSON.stringify([{ id: '1', title: 'Future task', done: false, createdAt: Date.now(), dueDate: '2099-12-31T09:00' }]),
    )
    renderDashboard()
    expect(screen.queryByText('Future task')).toBeNull()
  })

  it('renders "View all" link to /chat', () => {
    renderDashboard()
    const viewAllLinks = screen.getAllByRole('link', { name: /view all/i })
    const chatLink = viewAllLinks.find((l) => l.getAttribute('href') === '/chat')
    expect(chatLink).toBeDefined()
  })

  it('Translate quick-action is a link to /translate', () => {
    renderDashboard()
    const translateLink = screen.getByRole('link', { name: /translate/i })
    expect(translateLink.getAttribute('href')).toBe('/translate')
  })
})
