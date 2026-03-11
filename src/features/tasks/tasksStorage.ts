export interface Task {
  id: string
  title: string
  done: boolean
  createdAt: number
  dueDate?: string // "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm"
}

export const TASKS_STORAGE_KEY = 'ai-assistant:tasks'

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Task[]) : []
  } catch {
    return []
  }
}

export function formatDueDate(dueDate: string): string {
  if (dueDate.length === 10) {
    // Date-only: compare parts to avoid UTC-offset issues
    const [y, m, d] = dueDate.split('-').map(Number)
    const now = new Date()
    const isToday = now.getFullYear() === y && now.getMonth() + 1 === m && now.getDate() === d
    if (isToday) return 'Today'
    // Use noon local time to avoid date-shifting when formatting
    return new Date(`${dueDate}T12:00`).toLocaleDateString([], { month: 'short', day: 'numeric' })
  }
  const date = new Date(dueDate)
  const isToday = date.toDateString() === new Date().toDateString()
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (isToday) return timeStr
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' · ' + timeStr
}
