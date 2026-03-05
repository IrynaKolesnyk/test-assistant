import { render, screen } from '@testing-library/react'
import ComingSoonPage from '../ComingSoonPage'

describe('ComingSoonPage', () => {
  it('renders the provided title', () => {
    render(<ComingSoonPage title="Tasks" />)
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  it('renders the "Coming soon" message', () => {
    render(<ComingSoonPage title="Calendar" />)
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
  })

  it('renders the construction emoji', () => {
    render(<ComingSoonPage title="Notes" />)
    expect(screen.getByText('🚧')).toBeInTheDocument()
  })
})
