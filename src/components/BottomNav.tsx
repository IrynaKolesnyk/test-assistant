import { NavLink } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'

const TABS = [
  { path: '/dashboard', label: 'Home', icon: '🏠' },
  { path: '/chat', label: 'Chat', icon: '💬', showBadge: true },
  { path: '/tasks', label: 'Tasks', icon: '✅' },
  { path: '/calendar', label: 'Calendar', icon: '📅' },
  { path: '/settings', label: 'More', icon: '⚙️' },
]

export default function BottomNav() {
  const conversations = useAppSelector((state) => state.chat.conversations)
  const chatBadge = conversations.length > 0 ? conversations.length : null

  return (
    <nav className="md:hidden flex-shrink-0 bg-[var(--bg-panel)] border-t border-[var(--border)] flex items-stretch h-16 safe-area-bottom" aria-label="Mobile navigation">
      {TABS.map(({ path, label, icon, showBadge }) => (
        <NavLink
          key={path}
          to={path}
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset focus-visible:outline-none ${
              isActive
                ? 'text-indigo-400'
                : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
            }`
          }
        >
          <span className="relative text-xl leading-none" aria-hidden="true">
            {icon}
            {showBadge && chatBadge && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-medium px-0.5">
                {chatBadge > 9 ? '9+' : chatBadge}
              </span>
            )}
          </span>
          {showBadge && chatBadge && (
            <span className="sr-only">({chatBadge} conversations)</span>
          )}
          <span className="text-[10px] font-medium leading-none">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
