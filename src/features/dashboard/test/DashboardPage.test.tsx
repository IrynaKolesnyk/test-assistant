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

  it('renders Calendar widget', () => {
    renderDashboard()
    expect(screen.getByText(/calendar/i)).toBeInTheDocument()
    expect(screen.getByText('December 2024')).toBeInTheDocument()
  })

  it('renders Today\'s Tasks widget', () => {
    renderDashboard()
    expect(screen.getByText(/today.s tasks/i)).toBeInTheDocument()
    expect(screen.getByText('Morning workout')).toBeInTheDocument()
  })

  it('renders "View all" link to /chat', () => {
    renderDashboard()
    const viewAll = screen.getByRole('link', { name: /view all/i })
    expect(viewAll.getAttribute('href')).toBe('/chat')
  })

  it('Translate quick-action is a link to /translate', () => {
    renderDashboard()
    const translateLink = screen.getByRole('link', { name: /translate/i })
    expect(translateLink.getAttribute('href')).toBe('/translate')
  })
})
