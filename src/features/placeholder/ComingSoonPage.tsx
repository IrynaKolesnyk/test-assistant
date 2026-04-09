import { useTranslation } from 'react-i18next'

interface Props {
  titleKey: string
}

export default function ComingSoonPage({ titleKey }: Props) {
  const { t } = useTranslation()

  return (
    <div className="h-full flex flex-col items-center justify-center text-[var(--text-3)] bg-[var(--bg-base)]">
      <div className="text-5xl mb-4" aria-hidden="true">🚧</div>
      <h2 className="text-xl font-semibold text-[var(--text-2)]">{t(titleKey)}</h2>
      <p className="text-sm mt-2">{t('common.comingSoon')}</p>
    </div>
  )
}
