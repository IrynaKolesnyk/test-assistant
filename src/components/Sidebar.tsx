import { NavLink } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'

const NAV_MAIN = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/chat', label: 'Chat', icon: '💬', showBadge: true },
  { path: '/tasks', label: 'Tasks', icon: '✅' },
  { path: '/calendar', label: 'Calendar', icon: '📅' },
]

const NAV_TOOLS = [
  { path: '/translate', label: 'Translate', icon: '🌐' },
  { path: '/recipes', label: 'Recipes', icon: '🍳' },
  { path: '/notes', label: 'Notes', icon: '📝' },
]

const NAV_OTHER = [
  { path: '/history', label: 'History', icon: '📚' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar() {
  const conversations = useAppSelector((state) => state.chat.conversations)
  const chatBadge = conversations.length > 0 ? conversations.length : null

  function NavItem({
    path,
    label,
    icon,
    showBadge,
  }: {
    path: string
    label: string
    icon: string
    showBadge?: boolean
  }) {
    return (
      <NavLink
        to={path}
        end
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
            isActive
              ? 'bg-[var(--nav-active)] text-[var(--nav-active-text)] font-medium'
              : 'text-[var(--text-2)] hover:bg-[var(--nav-hover)] hover:text-[var(--text-1)]'
          }`
        }
      >
        <span className="text-base leading-none" aria-hidden="true">{icon}</span>
        <span className="flex-1">{label}</span>
        {showBadge && chatBadge && (
          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-medium" aria-label={`${chatBadge} conversations`}>
            {chatBadge > 9 ? '9+' : chatBadge}
          </span>
        )}
      </NavLink>
    )
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-[var(--bg-base)] border-r border-[var(--border)] flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            AI
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--text-1)] leading-tight">AI Assistant</h1>
            <p className="text-xs text-[var(--text-3)]">Your intelligent companion</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-5" aria-label="Main navigation">
        <div>
          <p className="text-xs font-semibold text-[var(--text-4)] uppercase tracking-wider px-3 mb-2">
            Main
          </p>
          <div className="space-y-0.5">
            {NAV_MAIN.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-[var(--text-4)] uppercase tracking-wider px-3 mb-2">
            Tools
          </p>
          <div className="space-y-0.5">
            {NAV_TOOLS.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-[var(--text-4)] uppercase tracking-wider px-3 mb-2">
            Other
          </p>
          <div className="space-y-0.5">
            {NAV_OTHER.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>
        </div>
      </nav>

      {/* User profile */}
      <div className="p-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[var(--bg-panel)] transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            AJ
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-1)] truncate">Iryna Kolesnyk</p>
            <p className="text-xs text-[#10b981]">● Online</p>
          </div>
          <button aria-label="User menu" className="text-[var(--text-3)] hover:text-[var(--text-1)] text-lg leading-none">⋯</button>
        </div>
      </div>
    </aside>
  )
}
