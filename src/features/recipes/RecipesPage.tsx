import { useState, useRef, useEffect } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { useAppSelector } from '../../app/hooks'

// ─── TheMealDB types ──────────────────────────────────────────────────────────

interface MealSummary {
  idMeal: string
  strMeal: string
  strMealThumb: string
  strCategory?: string
  strArea?: string
}

interface MealDetail extends MealSummary {
  strInstructions: string
  strCategory: string
  strArea: string
  strYoutube: string
  [key: string]: string | null | undefined
}

function extractIngredients(meal: MealDetail): string[] {
  const result: string[] = []
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]
    const measure = meal[`strMeasure${i}`]
    if (ingredient?.trim()) {
      result.push(`${measure?.trim() ?? ''} ${ingredient.trim()}`.trim())
    }
  }
  return result
}

// ─── TheMealDB API ────────────────────────────────────────────────────────────

async function searchByName(query: string): Promise<MealDetail[]> {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`,
  )
  if (!res.ok) throw new Error(`TheMealDB error: ${res.status}`)
  const data = await res.json()
  return (data.meals as MealDetail[] | null) ?? []
}

async function filterByIngredient(ingredient: string): Promise<MealSummary[]> {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`,
  )
  if (!res.ok) throw new Error(`TheMealDB error: ${res.status}`)
  const data = await res.json()
  return (data.meals as MealSummary[] | null) ?? []
}

async function getMealById(id: string): Promise<MealDetail | null> {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
  if (!res.ok) throw new Error(`TheMealDB error: ${res.status}`)
  const data = await res.json()
  return (data.meals as MealDetail[] | null)?.[0] ?? null
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecipesPage() {
  const { apiKey, model } = useAppSelector((state) => state.settings)
  const usingFreeApi = !apiKey

  // Abort any in-flight Claude stream on new search or unmount
  const streamAbortRef = useRef<AbortController | null>(null)
  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort()
    }
  }, [])

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  // Free API state
  const [meals, setMeals] = useState<(MealSummary | MealDetail)[]>([])
  const [selectedMeal, setSelectedMeal] = useState<MealDetail | null>(null)

  // Claude state
  const [aiRecipe, setAiRecipe] = useState('')

  function isMealDetail(meal: MealSummary | MealDetail): meal is MealDetail {
    return 'strInstructions' in meal && typeof meal.strInstructions === 'string'
  }

  async function handleSearch() {
    const q = query.trim()
    if (!q) return

    // Abort any previous in-flight stream
    streamAbortRef.current?.abort()
    const abortController = new AbortController()
    streamAbortRef.current = abortController

    setLoading(true)
    setError(null)
    setSearched(true)
    setSelectedMeal(null)
    setAiRecipe('')
    setMeals([])

    try {
      if (apiKey) {
        // ── Claude mode ──────────────────────────────────────────────────────
        const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
        const prompt = `You are a professional chef. Provide a complete recipe for "${q}".
Format your response exactly like this:
**[Recipe Name]**

⏱ Prep: [time] | Cook: [time] | Serves: [number]

**Ingredients:**
- [ingredient with quantity]
(list all ingredients)

**Instructions:**
1. [step]
(list all steps)

**Tips:**
[1-2 helpful tips]

Keep it concise and practical.`

        setAiRecipe('')
        const stream = client.messages.stream(
          {
            model,
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
          },
          { signal: abortController.signal },
        )

        for await (const event of stream) {
          if (event.type === 'content_block_delta') {
            const delta = event.delta
            if (delta.type === 'text_delta') {
              setAiRecipe((prev) => prev + delta.text)
            }
          }
        }
      } else {
        // ── TheMealDB mode ───────────────────────────────────────────────────
        // Try name search first
        let results: (MealSummary | MealDetail)[] = await searchByName(q)

        // Fall back to ingredient filter if no results
        if (results.length === 0) {
          results = await filterByIngredient(q)
        }

        setMeals(results)
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
  }

  async function handleSelectMeal(meal: MealSummary | MealDetail) {
    if (isMealDetail(meal)) {
      setSelectedMeal(meal)
      return
    }
    // Summary only (from ingredient filter) — fetch full details
    setLoadingDetail(true)
    setError(null)
    try {
      const detail = await getMealById(meal.idMeal)
      setSelectedMeal(detail)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoadingDetail(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch()
  }

  function clearAll() {
    setQuery('')
    setMeals([])
    setSelectedMeal(null)
    setAiRecipe('')
    setSearched(false)
    setError(null)
  }

  // ── Render detail view (free API) ──────────────────────────────────────────
  function renderDetail() {
    if (loadingDetail) {
      return (
        <div className="flex items-center justify-center py-16 text-[var(--text-3)]">
          <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin mr-3" />
          Loading recipe…
        </div>
      )
    }
    if (!selectedMeal) return null

    const ingredients = extractIngredients(selectedMeal)
    const youtubeId = selectedMeal.strYoutube?.split('v=')?.[1]

    return (
      <div className="flex flex-col gap-5">
        {/* Back */}
        <button
          onClick={() => setSelectedMeal(null)}
          className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors w-fit"
        >
          ← Back to results
        </button>

        {/* Hero */}
        <div className="flex flex-col sm:flex-row gap-5 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-5">
          <img
            src={selectedMeal.strMealThumb}
            alt={selectedMeal.strMeal}
            className="w-full sm:w-48 h-48 object-cover rounded-xl flex-shrink-0"
          />
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[var(--text-1)]">{selectedMeal.strMeal}</h2>
            <div className="flex flex-wrap gap-2">
              {selectedMeal.strCategory && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                  {selectedMeal.strCategory}
                </span>
              )}
              {selectedMeal.strArea && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300">
                  {selectedMeal.strArea}
                </span>
              )}
            </div>
            {youtubeId && (
              <a
                href={selectedMeal.strYoutube ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors mt-1 w-fit"
              >
                ▶ Watch on YouTube
              </a>
            )}
          </div>
        </div>

        {/* Ingredients + Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ingredients */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-[var(--text-1)] mb-3">🧂 Ingredients</h3>
            <ul className="space-y-1.5">
              {ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-2)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="md:col-span-2 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-[var(--text-1)] mb-3">📋 Instructions</h3>
            <div className="space-y-3">
              {selectedMeal.strInstructions
                .split(/\r?\n/)
                .map((s) => s.trim())
                .filter(Boolean)
                .map((step, i) => (
                  <p key={i} className="text-sm text-[var(--text-2)] leading-relaxed">
                    {step}
                  </p>
                ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Render meal card grid (free API) ───────────────────────────────────────
  function renderCards() {
    if (meals.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text-3)]">
          <span className="text-4xl mb-3">🍽️</span>
          <p className="text-sm">No recipes found for "{query}". Try a different name or ingredient.</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {meals.map((meal) => (
          <button
            key={meal.idMeal}
            onClick={() => handleSelectMeal(meal)}
            className="flex flex-col bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-lg transition-all text-left"
          >
            <img
              src={meal.strMealThumb}
              alt={meal.strMeal}
              className="w-full h-40 object-cover"
            />
            <div className="p-3 flex flex-col gap-1">
              <p className="text-sm font-medium text-[var(--text-1)] line-clamp-2">{meal.strMeal}</p>
              {(meal.strCategory || meal.strArea) && (
                <p className="text-xs text-[var(--text-3)]">
                  {[meal.strCategory, meal.strArea].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    )
  }

  // ── Render AI recipe (Claude mode) ────────────────────────────────────────
  function renderAiRecipe() {
    if (!aiRecipe && !loading) return null

    return (
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            AI
          </div>
          <span className="text-sm font-medium text-[var(--text-1)]">AI Recipe</span>
          {loading && (
            <span className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin ml-1" />
          )}
        </div>
        <div className="text-sm text-[var(--text-1)] leading-relaxed whitespace-pre-wrap">
          {aiRecipe || <span className="text-[var(--text-3)]">Generating recipe…</span>}
        </div>
      </div>
    )
  }

  const showResults = searched && !loading
  const showEmpty = showResults && !usingFreeApi && !aiRecipe && !error
  const showFreeResults = showResults && usingFreeApi && !selectedMeal && !loadingDetail

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--bg-panel)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <h2 className="font-semibold text-[var(--text-1)]">Find Recipe</h2>
        </div>
        <span className="text-xs text-[var(--text-3)]">
          {usingFreeApi ? 'TheMealDB (free)' : model}
        </span>
      </header>

      {/* Free API notice */}
      {usingFreeApi && (
        <div className="flex-shrink-0 bg-blue-500/10 border-b border-blue-500/20 px-6 py-3 text-sm text-blue-400">
          Using <span className="font-medium">TheMealDB free API</span> — no key required.{' '}
          <a href="/settings" className="underline hover:text-blue-300">
            Add an Anthropic key
          </a>{' '}
          for AI-generated recipes from any ingredient combination.
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex-shrink-0 bg-red-500/10 border-b border-red-500/20 px-6 py-3 text-sm text-red-400">
          ⚠ {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5">
        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                usingFreeApi
                  ? 'Search by dish name or ingredient (e.g. "pasta", "chicken")'
                  : 'Enter dish name or ingredients (e.g. "chicken and broccoli stir-fry")'
              }
              className="w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl px-4 py-3 pr-10 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {query && (
              <button
                onClick={clearAll}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex-shrink-0"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {usingFreeApi ? 'Searching…' : 'Generating…'}
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Loading spinner (free API) */}
        {loading && usingFreeApi && (
          <div className="flex items-center justify-center py-16 text-[var(--text-3)]">
            <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin mr-3" />
            Searching recipes…
          </div>
        )}

        {/* Idle empty state */}
        {!searched && (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
            <span className="text-6xl mb-4">🍳</span>
            <h3 className="text-base font-semibold text-[var(--text-1)] mb-2">
              {usingFreeApi ? 'Search thousands of recipes' : 'AI-powered recipe generation'}
            </h3>
            <p className="text-sm text-[var(--text-3)] max-w-sm">
              {usingFreeApi
                ? 'Type a dish name like "pasta carbonara" or an ingredient like "chicken" to find matching recipes.'
                : 'Describe what you want to cook and Claude will generate a complete recipe with ingredients and step-by-step instructions.'}
            </p>
          </div>
        )}

        {/* AI recipe (Claude mode) */}
        {!usingFreeApi && renderAiRecipe()}

        {/* Empty AI result */}
        {showEmpty && (
          <div className="text-center text-sm text-[var(--text-3)] py-8">No result returned.</div>
        )}

        {/* Detail view (free API) */}
        {usingFreeApi && (selectedMeal || loadingDetail) && renderDetail()}

        {/* Cards grid (free API) */}
        {showFreeResults && renderCards()}
      </div>
    </div>
  )
}
