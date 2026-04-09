import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { setApiKey, setModel, setSystemPrompt, setLanguage } from './settingsSlice'
import type { Language, ModelId } from '../../types'

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'uk', label: 'Українська' },
  { id: 'es', label: 'Español' },
]

export default function SettingsPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)
  const isLight = settings.theme === 'light'

  const MODELS: { id: ModelId; label: string }[] = [
    { id: 'claude-sonnet-4-6', label: `Claude Sonnet 4.6 (${t('settings.recommended')})` },
    { id: 'claude-opus-4-6', label: `Claude Opus 4.6 (${t('settings.mostCapable')})` },
    { id: 'claude-haiku-4-5-20251001', label: `Claude Haiku 4.5 (${t('settings.fastest')})` },
  ]

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[var(--bg-base)]">
      <header className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--bg-panel)] px-6 py-3">
        <h2 className="font-semibold text-[var(--text-1)]">{t('settings.title')}</h2>
      </header>

      <div className="max-w-2xl mx-auto w-full p-6 space-y-8">
        {/* Language */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-wide mb-3">
            {t('settings.languageSection')}
          </h3>
          <select
            value={settings.language}
            onChange={(e) => dispatch(setLanguage(e.target.value as Language))}
            aria-label={t('settings.languageLabel')}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-4 py-2.5 text-sm text-[var(--text-1)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {LANGUAGES.map((language) => (
              <option key={language.id} value={language.id} className="bg-[var(--bg-input)]">
                {language.label}
              </option>
            ))}
          </select>
        </section>

        {/* API Key */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-wide mb-3">
            {t('settings.apiKeySection')}
          </h3>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => dispatch(setApiKey(e.target.value))}
            aria-label={t('settings.apiKeyLabel')}
            placeholder={t('settings.apiKeyPlaceholder')}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-4 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className={`mt-2 text-xs rounded-lg px-3 py-2 border ${
            isLight
              ? 'text-amber-700 bg-amber-50 border-amber-200'
              : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          }`}>
            ⚠ {t('settings.apiKeyWarning')}
          </p>
          <p className="mt-2 text-xs text-[var(--text-3)]">
            {t('settings.getApiKey')}{' '}
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 underline hover:text-indigo-300"
            >
              console.anthropic.com
            </a>
          </p>
        </section>

        {/* Model */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-wide mb-3">
            {t('settings.modelSection')}
          </h3>
          <select
            value={settings.model}
            onChange={(e) => dispatch(setModel(e.target.value as ModelId))}
            aria-label={t('settings.modelLabel')}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-4 py-2.5 text-sm text-[var(--text-1)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {MODELS.map((model) => (
              <option key={model.id} value={model.id} className="bg-[var(--bg-input)]">
                {model.label}
              </option>
            ))}
          </select>
        </section>

        {/* System Prompt */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-wide mb-3">
            {t('settings.systemPromptSection')}
          </h3>
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => dispatch(setSystemPrompt(e.target.value))}
            aria-label={t('settings.systemPromptLabel')}
            rows={5}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-4 py-2.5 text-sm text-[var(--text-1)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
          <p className="mt-1 text-xs text-[var(--text-3)]">
            {t('settings.systemPromptHint')}
          </p>
        </section>
      </div>
    </div>
  )
}
