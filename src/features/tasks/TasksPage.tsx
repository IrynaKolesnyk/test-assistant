import { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { loadTasks, formatDueDate, TASKS_STORAGE_KEY, type Task } from './tasksStorage'

// Combine separate date / time strings into a single dueDate value.
// Returns undefined if date is empty, "YYYY-MM-DD" if time is empty,
// or "YYYY-MM-DDTHH:mm" when both are provided.
function buildDueDate(date: string, time: string): string | undefined {
  if (!date) return undefined
  return time ? `${date}T${time}` : date
}

// Split an existing dueDate string into its date and time parts.
function splitDueDate(dueDate: string | undefined): { date: string; time: string } {
  if (!dueDate) return { date: '', time: '' }
  const [date = '', time = ''] = dueDate.split('T')
  return { date, time }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    if (editingId) editInputRef.current?.focus()
  }, [editingId])

  function addTask() {
    const title = newTitle.trim()
    if (!title) return
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        done: false,
        createdAt: Date.now(),
        dueDate: buildDueDate(newDate, newTime),
      },
    ])
    setNewTitle('')
    setNewDate('')
    setNewTime('')
  }

  function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function startEdit(task: Task) {
    setEditingId(task.id)
    setEditValue(task.title)
    const { date, time } = splitDueDate(task.dueDate)
    setEditDate(date)
    setEditTime(time)
  }

  function saveEdit(id: string) {
    const title = editValue.trim()
    if (!title) return
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, title, dueDate: buildDueDate(editDate, editTime) } : t,
      ),
    )
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function handleAddKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') addTask()
  }

  function handleEditKeyDown(e: KeyboardEvent<HTMLInputElement>, id: string) {
    if (e.key === 'Enter') saveEdit(id)
    if (e.key === 'Escape') cancelEdit()
  }

  const active = tasks.filter((t) => !t.done)
  const done = tasks.filter((t) => t.done)

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-base)]">
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text-1)]">Tasks</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">
            {active.length} remaining · {done.length} completed
          </p>
        </div>

        {/* Add task */}
        <div className="flex flex-col gap-2 mb-6">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleAddKeyDown}
            placeholder="Add a new task…"
            className="flex-1 bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => {
                setNewDate(e.target.value)
                if (!e.target.value) setNewTime('')
              }}
              aria-label="Due date"
              className="flex-1 bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-2)] focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
            />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              aria-label="Due time"
              disabled={!newDate}
              className="w-32 bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-2)] focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 [color-scheme:dark]"
            />
            <button
              onClick={addTask}
              disabled={!newTitle.trim()}
              aria-label="Add task"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-[var(--text-2)] font-medium">No tasks yet</p>
            <p className="text-sm text-[var(--text-3)] mt-1">Add your first task above</p>
          </div>
        )}

        {/* Active tasks */}
        {active.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2 px-1">
              To Do
            </p>
            <ul className="space-y-2">
              {active.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isEditing={editingId === task.id}
                  editValue={editValue}
                  editDate={editDate}
                  editTime={editTime}
                  editInputRef={editingId === task.id ? editInputRef : undefined}
                  onToggle={() => toggleTask(task.id)}
                  onEdit={() => startEdit(task)}
                  onSave={() => saveEdit(task.id)}
                  onCancel={cancelEdit}
                  onRemove={() => removeTask(task.id)}
                  onEditValueChange={setEditValue}
                  onEditDateChange={(v) => { setEditDate(v); if (!v) setEditTime('') }}
                  onEditTimeChange={setEditTime}
                  onEditKeyDown={(e) => handleEditKeyDown(e, task.id)}
                />
              ))}
            </ul>
          </div>
        )}

        {/* Done tasks */}
        {done.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2 px-1">
              Completed
            </p>
            <ul className="space-y-2">
              {done.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isEditing={editingId === task.id}
                  editValue={editValue}
                  editDate={editDate}
                  editTime={editTime}
                  editInputRef={editingId === task.id ? editInputRef : undefined}
                  onToggle={() => toggleTask(task.id)}
                  onEdit={() => startEdit(task)}
                  onSave={() => saveEdit(task.id)}
                  onCancel={cancelEdit}
                  onRemove={() => removeTask(task.id)}
                  onEditValueChange={setEditValue}
                  onEditDateChange={(v) => { setEditDate(v); if (!v) setEditTime('') }}
                  onEditTimeChange={setEditTime}
                  onEditKeyDown={(e) => handleEditKeyDown(e, task.id)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

interface TaskRowProps {
  task: Task
  isEditing: boolean
  editValue: string
  editDate: string
  editTime: string
  editInputRef?: React.RefObject<HTMLInputElement | null>
  onToggle: () => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onRemove: () => void
  onEditValueChange: (v: string) => void
  onEditDateChange: (v: string) => void
  onEditTimeChange: (v: string) => void
  onEditKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
}

function TaskRow({
  task,
  isEditing,
  editValue,
  editDate,
  editTime,
  editInputRef,
  onToggle,
  onEdit,
  onSave,
  onCancel,
  onRemove,
  onEditValueChange,
  onEditDateChange,
  onEditTimeChange,
  onEditKeyDown,
}: TaskRowProps) {
  return (
    <li className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border)] group">
      {/* Checkbox */}
      <button
        onClick={onToggle}
        aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
        className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-colors ${
          task.done
            ? 'border-indigo-500 bg-indigo-600'
            : 'border-[var(--text-4)] hover:border-indigo-400'
        }`}
      >
        {task.done && <span className="text-white text-xs leading-none">✓</span>}
      </button>

      {/* Content */}
      {isEditing ? (
        <div className="flex-1 flex flex-col gap-2">
          <input
            ref={editInputRef}
            type="text"
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onKeyDown={onEditKeyDown}
            className="w-full bg-[var(--bg-input)] border border-indigo-500 rounded-lg px-2 py-1 text-sm text-[var(--text-1)] focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={editDate}
              onChange={(e) => onEditDateChange(e.target.value)}
              aria-label="Edit due date"
              className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-2 py-1 text-sm text-[var(--text-2)] focus:outline-none [color-scheme:dark]"
            />
            <input
              type="time"
              value={editTime}
              onChange={(e) => onEditTimeChange(e.target.value)}
              aria-label="Edit due time"
              disabled={!editDate}
              className="w-28 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-2 py-1 text-sm text-[var(--text-2)] focus:outline-none disabled:opacity-40 [color-scheme:dark]"
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={onSave}
              aria-label="Save"
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              aria-label="Cancel"
              className="px-3 py-1 rounded-lg bg-[var(--bg-base)] hover:bg-[var(--border)] text-[var(--text-2)] text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-w-0">
          <span
            className={`text-sm ${
              task.done ? 'line-through text-[var(--text-3)]' : 'text-[var(--text-1)]'
            }`}
          >
            {task.title}
          </span>
          {task.dueDate && (
            <p className="text-xs text-[var(--text-3)] mt-0.5">
              📅 {formatDueDate(task.dueDate)}
            </p>
          )}
        </div>
      )}

      {/* Actions (view mode only) */}
      {!isEditing && (
        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            aria-label="Edit task"
            className="w-7 h-7 rounded-lg hover:bg-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-1)] flex items-center justify-center text-sm transition-colors"
          >
            ✎
          </button>
          <button
            onClick={onRemove}
            aria-label="Delete task"
            className="w-7 h-7 rounded-lg hover:bg-red-500/20 text-[var(--text-3)] hover:text-red-400 flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </li>
  )
}
