import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setTheme } from '../features/settings/settingsSlice'

export default function Header() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.settings.theme)
  const isDark = theme === 'dark'

  return (
    <header className="flex-shrink-0 h-14 bg-[var(--bg-base)] border-b border-[var(--border)] px-3 md:px-6 flex items-center gap-2 md:gap-4">
      <div className="flex-1 relative max-w-xl">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] text-sm" aria-hidden="true">🔍</span>
        <input
          type="text"
          placeholder={t('header.search')}
          aria-label={t('header.searchLabel')}
          className="w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl pl-9 pr-3 md:pr-14 py-2 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <span className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-3)] bg-[var(--border)] px-1.5 py-0.5 rounded font-mono" aria-hidden="true">
          AI
        </span>
      </div>

      <div className="flex items-center gap-0.5 md:gap-1">
        <button
          onClick={() => dispatch(setTheme(isDark ? 'light' : 'dark'))}
          className="w-9 h-9 rounded-lg hover:bg-[var(--bg-panel)] flex items-center justify-center text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
          aria-label={t('header.toggleTheme')}
          title={isDark ? t('header.switchToLight') : t('header.switchToDark')}
        >
          <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
        </button>
        <button
          disabled
          title={t('common.comingSoon')}
          aria-label={t('header.editComingSoon')}
          className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center text-[var(--text-2)] opacity-40 cursor-not-allowed"
        >
          <span aria-hidden="true">✏️</span>
        </button>
        <button
          disabled
          title={t('common.comingSoon')}
          aria-label={t('header.notificationsComingSoon')}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-2)] opacity-40 cursor-not-allowed"
        >
          <span aria-hidden="true">🔔</span>
        </button>
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
          title={t('nav.home')}
          aria-label={t('nav.home')}
        >
          <span aria-hidden="true">🏠</span>
        </NavLink>
      </div>
    </header>
  )
}
