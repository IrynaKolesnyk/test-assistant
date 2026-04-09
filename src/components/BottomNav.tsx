import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../app/hooks'

export default function BottomNav() {
  const { t } = useTranslation()
  const conversations = useAppSelector((state) => state.chat.conversations)
  const chatBadge = conversations.length > 0 ? conversations.length : null

  const TABS = [
    { path: '/dashboard', label: t('nav.home'), icon: '🏠' },
    { path: '/chat', label: t('nav.chat'), icon: '💬', showBadge: true },
    { path: '/tasks', label: t('nav.tasks'), icon: '✅' },
    { path: '/calendar', label: t('nav.calendar'), icon: '📅' },
    { path: '/settings', label: t('nav.more'), icon: '⚙️' },
  ]

  return (
    <nav className="md:hidden flex-shrink-0 bg-[var(--bg-panel)] border-t border-[var(--border)] flex items-stretch h-16 safe-area-bottom" aria-label={t('nav.mobileNavigation')}>
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
            <span className="sr-only">({t('nav.conversations', { count: chatBadge })})</span>
          )}
          <span className="text-[10px] font-medium leading-none">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
