import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const canGoBack = window.history.length > 1

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
      <div className="text-[120px] leading-none select-none" aria-hidden="true">🤖</div>

      <div>
        <h1 className="text-6xl font-bold text-indigo-500 mb-2">{t('notFound.title')}</h1>
        <p className="text-xl font-semibold text-[var(--text-1)] mb-1">{t('notFound.subtitle')}</p>
        <p className="text-sm text-[var(--text-3)] max-w-xs">
          {t('notFound.description')}
        </p>
      </div>

      <button
        onClick={() => canGoBack ? navigate(-1) : navigate('/dashboard')}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
      >
        {t('notFound.goBack')}
      </button>
    </div>
  )
}
