import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import NotFoundPage from '../NotFoundPage'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockNavigate.mockReset()
})

describe('NotFoundPage — rendering', () => {
  it('renders the 404 heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
  })

  it('renders the robot emoji', () => {
    renderPage()
    expect(screen.getByText('🤖')).toBeInTheDocument()
  })

  it('renders the "Lost in space" subtitle', () => {
    renderPage()
    expect(screen.getByText('Lost in space')).toBeInTheDocument()
  })

  it('renders the Go back button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
  })
})

describe('NotFoundPage — navigation', () => {
  it('calls navigate(-1) when there is browser history', async () => {
    Object.defineProperty(window, 'history', {
      value: { ...window.history, length: 3 },
      writable: true,
    })
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /go back/i }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('navigates to /dashboard when there is no browser history', async () => {
    Object.defineProperty(window, 'history', {
      value: { ...window.history, length: 1 },
      writable: true,
    })
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /go back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })
})
