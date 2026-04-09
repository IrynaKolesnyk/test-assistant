import { render, screen } from '@testing-library/react'
import ComingSoonPage from '../ComingSoonPage'

describe('ComingSoonPage', () => {
  it('renders the provided title', () => {
    render(<ComingSoonPage titleKey="nav.calendar" />)
    expect(screen.getByText('Calendar')).toBeInTheDocument()
  })

  it('renders the "Coming soon" message', () => {
    render(<ComingSoonPage titleKey="nav.calendar" />)
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
  })

  it('renders the construction emoji', () => {
    render(<ComingSoonPage titleKey="nav.notes" />)
    expect(screen.getByText('🚧')).toBeInTheDocument()
  })
})
