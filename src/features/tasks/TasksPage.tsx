import { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { loadTasks, formatDueDate, TASKS_STORAGE_KEY, type Task } from './tasksStorage'

function buildDueDate(date: string, time: string): string | undefined {
  if (!date) return undefined
  return time ? `${date}T${time}` : date
}

function splitDueDate(dueDate: string | undefined): { date: string; time: string } {
  if (!dueDate) return { date: '', time: '' }
  const [date = '', time = ''] = dueDate.split('T')
  return { date, time }
}

export default function TasksPage() {
  const { t } = useTranslation()
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
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)))
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id))
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
      prev.map((task) =>
        task.id === id ? { ...task, title, dueDate: buildDueDate(editDate, editTime) } : task,
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

  const active = tasks.filter((task) => !task.done)
  const done = tasks.filter((task) => task.done)

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-base)]">
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text-1)]">{t('tasks.title')}</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">
            {t('tasks.remaining', { count: active.length })} · {t('tasks.completed', { count: done.length })}
          </p>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleAddKeyDown}
            placeholder={t('tasks.addPlaceholder')}
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
              aria-label={t('tasks.dueDate')}
              className="flex-1 bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-2)] focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
            />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              aria-label={t('tasks.dueTime')}
              disabled={!newDate}
              className="w-32 bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-2)] focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 [color-scheme:dark]"
            />
            <button
              onClick={addTask}
              disabled={!newTitle.trim()}
              aria-label={t('tasks.addTask')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium transition-colors"
            >
              {t('common.add')}
            </button>
          </div>
        </div>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-[var(--text-2)] font-medium">{t('tasks.noTasks')}</p>
            <p className="text-sm text-[var(--text-3)] mt-1">{t('tasks.addFirstTask')}</p>
          </div>
        )}

        {active.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2 px-1">
              {t('tasks.toDo')}
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

        {done.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2 px-1">
              {t('tasks.completedSection')}
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
  const { t } = useTranslation()

  return (
    <li className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border)] group">
      <button
        onClick={onToggle}
        aria-label={task.done ? t('tasks.markNotDone') : t('tasks.markDone')}
        className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-colors ${
          task.done
            ? 'border-indigo-500 bg-indigo-600'
            : 'border-[var(--text-4)] hover:border-indigo-400'
        }`}
      >
        {task.done && <span className="text-white text-xs leading-none">✓</span>}
      </button>

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
              aria-label={t('tasks.editDueDate')}
              className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-2 py-1 text-sm text-[var(--text-2)] focus:outline-none [color-scheme:dark]"
            />
            <input
              type="time"
              value={editTime}
              onChange={(e) => onEditTimeChange(e.target.value)}
              aria-label={t('tasks.editDueTime')}
              disabled={!editDate}
              className="w-28 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-2 py-1 text-sm text-[var(--text-2)] focus:outline-none disabled:opacity-40 [color-scheme:dark]"
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={onSave}
              aria-label={t('common.save')}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
            >
              {t('common.save')}
            </button>
            <button
              onClick={onCancel}
              aria-label={t('common.cancel')}
              className="px-3 py-1 rounded-lg bg-[var(--bg-base)] hover:bg-[var(--border)] text-[var(--text-2)] text-xs transition-colors"
            >
              {t('common.cancel')}
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

      {!isEditing && (
        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            aria-label={t('tasks.editTask')}
            className="w-7 h-7 rounded-lg hover:bg-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-1)] flex items-center justify-center text-sm transition-colors"
          >
            ✎
          </button>
          <button
            onClick={onRemove}
            aria-label={t('tasks.deleteTask')}
            className="w-7 h-7 rounded-lg hover:bg-red-500/20 text-[var(--text-3)] hover:text-red-400 flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </li>
  )
}
