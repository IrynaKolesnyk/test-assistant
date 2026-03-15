import { useState, useCallback, useEffect, useRef } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { useAppSelector } from '../../app/hooks'

const LANGUAGES = [
  { code: 'auto', label: 'Detect language' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'zh', label: 'Chinese (Simplified)' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'nl', label: 'Dutch' },
  { code: 'pl', label: 'Polish' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'tr', label: 'Turkish' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'th', label: 'Thai' },
  { code: 'id', label: 'Indonesian' },
]

const TARGET_LANGUAGES = LANGUAGES.filter((language) => language.code !== 'auto')

const MAX_CHARS_CLAUDE = 5000
const MAX_CHARS_FREE = 500

// MyMemory free translation API — no key required, 500 chars/request, ~5000 words/day
async function translateWithMyMemory(text: string, source: string, target: string): Promise<string> {
  const langpair = `${source === 'auto' ? 'autodetect' : source}|${target}`
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`MyMemory API error: ${res.status}`)
  const data = await res.json()
  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails ?? 'Translation failed')
  }
  return data.responseData.translatedText as string
}

export default function TranslatePage() {
  const { apiKey, model } = useAppSelector((state) => state.settings)

  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('es')
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const usingFreeApi = !apiKey
  const maxChars = usingFreeApi ? MAX_CHARS_FREE : MAX_CHARS_CLAUDE

  const sourceLangLabel =
    LANGUAGES.find((language) => language.code === sourceLang)?.label ?? 'Detect language'
  const targetLangLabel =
    TARGET_LANGUAGES.find((language) => language.code === targetLang)?.label ?? 'English'

  // Ref to abort any in-flight Claude stream when a new one starts or on unmount
  const streamAbortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort()
    }
  }, [])

  function swapLanguages() {
    if (sourceLang === 'auto') return
    const prevSource = sourceLang
    const prevTarget = targetLang
    setSourceLang(prevTarget)
    setTargetLang(prevSource)
    setSourceText(translatedText)
    setTranslatedText(sourceText)
  }

  const translate = useCallback(async () => {
    if (!sourceText.trim()) return

    // Abort any previous in-flight stream
    streamAbortRef.current?.abort()
    const abortController = new AbortController()
    streamAbortRef.current = abortController

    setLoading(true)
    setError(null)
    setTranslatedText('')

    try {
      if (apiKey) {
        // Use Claude (streaming)
        const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
        const sourceName = sourceLang === 'auto' ? 'the detected language' : sourceLangLabel
        const prompt = `Translate the following text from ${sourceName} to ${targetLangLabel}. Output only the translated text with no explanations, notes, or extra content.\n\n${sourceText}`

        const stream = client.messages.stream(
          {
            model,
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
          },
          { signal: abortController.signal },
        )

        for await (const event of stream) {
          if (event.type === 'content_block_delta') {
            const delta = event.delta
            if (delta.type === 'text_delta') {
              setTranslatedText((prev) => prev + delta.text)
            }
          }
        }
      } else {
        // Use MyMemory free API
        const result = await translateWithMyMemory(sourceText, sourceLang, targetLang)
        setTranslatedText(result)
      }
    } catch (err) {
      if (abortController.signal.aborted) return
      if (err instanceof Anthropic.APIError) {
        setError(err.message)
      } else {
        setError(String(err))
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false)
      }
    }
  }, [sourceText, sourceLang, targetLang, sourceLangLabel, targetLangLabel, apiKey, model])

  // Auto-translate 800 ms after the user stops typing
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!sourceText.trim() || overLimit) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { translate() }, 800)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [sourceText, sourceLang, targetLang, translate])

  async function copyTranslation() {
    if (!translatedText) return
    await navigator.clipboard.writeText(translatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function clearSource() {
    setSourceText('')
    setTranslatedText('')
    setError(null)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      translate()
    }
  }

  const charCount = sourceText.length
  const overLimit = charCount > maxChars

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--bg-panel)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌐</span>
          <h2 className="font-semibold text-[var(--text-1)]">Translate</h2>
        </div>
        <span className="text-xs text-[var(--text-3)]">
          {usingFreeApi ? 'MyMemory (free)' : model}
        </span>
      </header>

      {usingFreeApi && (
        <div className="flex-shrink-0 bg-blue-500/10 border-b border-blue-500/20 px-6 py-3 text-sm text-blue-400">
          Using <span className="font-medium">MyMemory free API</span> — no key required (500 char limit, ~5 000 words/day).{' '}
          <a href="/settings" className="underline hover:text-blue-300">
            Add an Anthropic key
          </a>{' '}
          for longer texts &amp; AI-quality translations.
        </div>
      )}

      {error && (
        <div role="alert" className="flex-shrink-0 bg-red-500/10 border-b border-red-500/20 px-6 py-3 text-sm text-red-400">
          ⚠ {error}
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
        {/* Language selector bar */}
        <div className="flex items-center gap-2 bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl px-3 py-2">

          {/* ── Source side ── */}
          <div className="flex-1 flex items-center">
            <div className="relative">
              <span className="block px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white whitespace-nowrap pointer-events-none">
                {sourceLangLabel}
              </span>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                aria-label="Source language"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                {LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>{language.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap button */}
          <button
            onClick={swapLanguages}
            disabled={sourceLang === 'auto'}
            aria-label="Swap languages"
            title="Swap languages"
            className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-2)] hover:bg-[var(--bg-base)] hover:text-[var(--text-1)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            ⇄
          </button>

          {/* ── Target side ── */}
          <div className="flex-1 flex items-center justify-end">
            <div className="relative">
              <span className="block px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white whitespace-nowrap pointer-events-none">
                {targetLangLabel}
              </span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                aria-label="Target language"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                {TARGET_LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>{language.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Translation panels */}
        <div className="flex flex-col md:flex-row gap-3 md:h-[280px]">
          {/* Source panel */}
          <div className="flex-1 flex flex-col bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl overflow-hidden min-h-[220px]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
              <span className="text-xs font-medium text-[var(--text-3)] uppercase tracking-wider">
                {sourceLangLabel}
              </span>
              {sourceText && (
                <button
                  onClick={clearSource}
                  className="text-[var(--text-3)] hover:text-[var(--text-1)] text-sm transition-colors"
                  aria-label="Clear source text"
                  title="Clear"
                >
                  ✕
                </button>
              )}
            </div>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value.slice(0, maxChars))}
              onKeyDown={handleKeyDown}
              aria-label="Source text"
              placeholder="Enter text"
              className="flex-1 resize-none bg-transparent text-[var(--text-1)] placeholder-[var(--text-4)] px-4 py-3 text-sm outline-none"
            />
            <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border)]">
              <span className={`text-xs ${overLimit ? 'text-red-400' : 'text-[var(--text-4)]'}`}>
                {charCount} / {maxChars}
              </span>
              <button
                onClick={translate}
                disabled={loading || !sourceText.trim() || overLimit}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Translating…
                  </>
                ) : (
                  <>Translate<span className="text-white/50 text-xs ml-1">⌘↵</span></>
                )}
              </button>
            </div>
          </div>

          {/* Target panel */}
          <div className="flex-1 flex flex-col bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl overflow-hidden min-h-[180px]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
              <span className="text-xs font-medium text-[var(--text-3)] uppercase tracking-wider">
                {targetLangLabel}
              </span>
              {translatedText && (
                <button
                  onClick={copyTranslation}
                  className="text-xs text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors flex items-center gap-1"
                  title="Copy translation"
                >
                  {copied ? '✓ Copied' : '⎘ Copy'}
                </button>
              )}
            </div>
            <div className="flex-1 px-4 py-3 overflow-y-auto" aria-live="polite" aria-busy={loading} aria-label="Translation result">
              {loading && !translatedText ? (
                <div className="flex items-center gap-2 text-[var(--text-3)] text-sm">
                  <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Translating…
                </div>
              ) : translatedText ? (
                <p className="text-sm text-[var(--text-1)] whitespace-pre-wrap leading-relaxed">
                  {translatedText}
                </p>
              ) : (
                <p className="text-base text-[var(--text-4)]">Translation</p>
              )}
            </div>
            {translatedText && (
              <div className="flex items-center justify-end px-4 py-2 border-t border-[var(--border)] gap-2">
                <button
                  onClick={copyTranslation}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--text-2)] hover:bg-[var(--bg-base)] hover:text-[var(--text-1)] transition-colors"
                >
                  {copied ? '✓ Copied' : '⎘ Copy'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
