import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
      {/* Skip link — keyboard users press Tab to reveal, then Enter to jump to content */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Sidebar — hidden on mobile, visible from md up */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main id="main-content" className="flex-1 overflow-hidden">
          <Outlet />
        </main>
        {/* Bottom nav — visible on mobile only */}
        <BottomNav />
      </div>
    </div>
  )
}
