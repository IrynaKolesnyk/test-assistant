import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../app/hooks'

export default function Sidebar() {
  const { t } = useTranslation()
  const conversations = useAppSelector((state) => state.chat.conversations)
  const chatBadge = conversations.length > 0 ? conversations.length : null

  const NAV_MAIN = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: '🏠' },
    { path: '/chat', label: t('nav.chat'), icon: '💬', showBadge: true },
    { path: '/tasks', label: t('nav.tasks'), icon: '✅' },
    { path: '/calendar', label: t('nav.calendar'), icon: '📅' },
  ]

  const NAV_TOOLS = [
    { path: '/translate', label: t('nav.translate'), icon: '🌐' },
    { path: '/recipes', label: t('nav.recipes'), icon: '🍳' },
    { path: '/notes', label: t('nav.notes'), icon: '📝' },
  ]

  const NAV_OTHER = [
    { path: '/history', label: t('nav.history'), icon: '📚' },
    { path: '/settings', label: t('nav.settings'), icon: '⚙️' },
  ]

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
          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-medium" aria-label={t('nav.conversations', { count: chatBadge })}>
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
            <h1 className="text-sm font-bold text-[var(--text-1)] leading-tight">{t('common.appName')}</h1>
            <p className="text-xs text-[var(--text-3)]">{t('common.appTagline')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-5" aria-label={t('nav.mainNavigation')}>
        <div>
          <p className="text-xs font-semibold text-[var(--text-4)] uppercase tracking-wider px-3 mb-2">
            {t('nav.main')}
          </p>
          <div className="space-y-0.5">
            {NAV_MAIN.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-[var(--text-4)] uppercase tracking-wider px-3 mb-2">
            {t('nav.tools')}
          </p>
          <div className="space-y-0.5">
            {NAV_TOOLS.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-[var(--text-4)] uppercase tracking-wider px-3 mb-2">
            {t('nav.other')}
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
            <p className="text-xs text-[#10b981]">● {t('common.online')}</p>
          </div>
          <button aria-label={t('nav.userMenu')} className="text-[var(--text-3)] hover:text-[var(--text-1)] text-lg leading-none">⋯</button>
        </div>
      </div>
    </aside>
  )
}
