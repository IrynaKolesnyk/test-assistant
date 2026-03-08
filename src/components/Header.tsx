import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setTheme } from '../features/settings/settingsSlice'

export default function Header() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((s) => s.settings.theme)
  const isDark = theme === 'dark'

  return (
    <header className="flex-shrink-0 h-14 bg-[var(--bg-base)] border-b border-[var(--border)] px-3 md:px-6 flex items-center gap-2 md:gap-4">
      {/* Search — full on md+, compact (icon only) on mobile */}
      <div className="flex-1 relative max-w-xl">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl pl-9 pr-3 md:pr-14 py-2 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <span className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-3)] bg-[var(--border)] px-1.5 py-0.5 rounded font-mono">
          AI
        </span>
      </div>

      <div className="flex items-center gap-0.5 md:gap-1">
        <button
          onClick={() => dispatch(setTheme(isDark ? 'light' : 'dark'))}
          className="w-9 h-9 rounded-lg hover:bg-[var(--bg-panel)] flex items-center justify-center text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
          aria-label="Toggle theme"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        <button className="hidden sm:flex w-9 h-9 rounded-lg hover:bg-[var(--bg-panel)] items-center justify-center text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
          ✏️
        </button>
        <button className="relative w-9 h-9 rounded-lg hover:bg-[var(--bg-panel)] flex items-center justify-center text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-400 rounded-full border-2 border-[var(--bg-base)]" />
        </button>
        {/* Home link — hidden on mobile (bottom nav handles it) */}
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `hidden md:flex w-9 h-9 rounded-lg items-center justify-center transition-colors ${
              isActive
                ? 'bg-[var(--nav-active)] text-[var(--nav-active-text)]'
                : 'hover:bg-[var(--bg-panel)] text-[var(--text-2)] hover:text-[var(--text-1)]'
            }`
          }
          title="Home"
          aria-label="Home"
        >
          🏠
        </NavLink>
      </div>
    </header>
  )
}
