import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TasksPage from '../TasksPage'

const STORAGE_KEY = 'ai-assistant:tasks'

function renderPage() {
  return render(
    <MemoryRouter>
      <TasksPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

// ── rendering ─────────────────────────────────────────────────────────────────
describe('TasksPage — rendering', () => {
  it('renders the page heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Tasks' })).toBeInTheDocument()
  })

  it('renders the add input and button', () => {
    renderPage()
    expect(screen.getByPlaceholderText('Add a new task…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument()
  })

  it('shows empty state when no tasks', () => {
    renderPage()
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('Add button is disabled when input is empty', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /add task/i })).toBeDisabled()
  })

  it('Add button is enabled when input has text', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk')
    expect(screen.getByRole('button', { name: /add task/i })).toBeEnabled()
  })
})

// ── add ───────────────────────────────────────────────────────────────────────
describe('TasksPage — add task', () => {
  it('adds a task via button click', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk')
    await userEvent.click(screen.getByRole('button', { name: /add task/i }))
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('adds a task via Enter key', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Walk the dog{Enter}')
    expect(screen.getByText('Walk the dog')).toBeInTheDocument()
  })

  it('clears the input after adding', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk{Enter}')
    expect(screen.getByPlaceholderText('Add a new task…')).toHaveValue('')
  })

  it('does not add a task when input is blank', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), '   {Enter}')
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('shows "To Do" section after adding a task', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk{Enter}')
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })
})

// ── toggle (done / not done) ──────────────────────────────────────────────────
describe('TasksPage — toggle task', () => {
  it('checking a task moves it to Completed', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk{Enter}')
    await userEvent.click(screen.getByRole('button', { name: /mark as done/i }))
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('unchecking a task moves it back to To Do', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk{Enter}')
    await userEvent.click(screen.getByRole('button', { name: /mark as done/i }))
    await userEvent.click(screen.getByRole('button', { name: /mark as not done/i }))
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.queryByText('Completed')).toBeNull()
  })

  it('done task title has line-through style', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk{Enter}')
    await userEvent.click(screen.getByRole('button', { name: /mark as done/i }))
    expect(screen.getByText('Buy milk').className).toContain('line-through')
  })
})

// ── edit ──────────────────────────────────────────────────────────────────────
describe('TasksPage — edit task', () => {
  it('clicking Edit shows an input pre-filled with task title', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk{Enter}')
    await userEvent.click(screen.getByRole('button', { name: /edit task/i }))
    expect(screen.getByDisplayValue('Buy milk')).toBeInTheDocument()
  })

  it('saving edit updates the task title', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk{Enter}')
    await userEvent.click(screen.getByRole('button', { name: /edit task/i }))
    const editInput = screen.getByDisplayValue('Buy milk')
    await userEvent.clear(editInput)
    await userEvent.type(editInput, 'Buy oat milk')
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(screen.getByText('Buy oat milk')).toBeInTheDocument()
  })

  it('pressing Enter saves the edit', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk{Enter}')
    await userEvent.click(screen.getByRole('button', { name: /edit task/i }))
    const editInput = screen.getByDisplayValue('Buy milk')
    await userEvent.clear(editInput)
    await userEvent.type(editInput, 'Buy oat milk{Enter}')
    expect(screen.getByText('Buy oat milk')).toBeInTheDocument()
  })

  it('pressing Escape cancels the edit', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk{Enter}')
    await userEvent.click(screen.getByRole('button', { name: /edit task/i }))
    const editInput = screen.getByDisplayValue('Buy milk')
    await userEvent.clear(editInput)
    await userEvent.type(editInput, 'Something else{Escape}')
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('clicking Cancel discards the edit', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk{Enter}')
    await userEvent.click(screen.getByRole('button', { name: /edit task/i }))
    const editInput = screen.getByDisplayValue('Buy milk')
    await userEvent.clear(editInput)
    await userEvent.type(editInput, 'Something else')
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })
})

// ── remove ────────────────────────────────────────────────────────────────────
describe('TasksPage — remove task', () => {
  it('clicking Delete removes the task', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk{Enter}')
    await userEvent.click(screen.getByRole('button', { name: /delete task/i }))
    expect(screen.queryByText('Buy milk')).toBeNull()
  })

  it('shows empty state after last task is removed', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk{Enter}')
    await userEvent.click(screen.getByRole('button', { name: /delete task/i }))
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })
})

// ── due date ──────────────────────────────────────────────────────────────────
describe('TasksPage — due date', () => {
  it('renders the due date/time input', () => {
    renderPage()
    expect(screen.getByLabelText('Due date and time')).toBeInTheDocument()
  })

  it('adds a task with a due date and shows it', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Doctor')
    await userEvent.type(screen.getByLabelText('Due date and time'), '2026-03-08T09:00')
    await userEvent.click(screen.getByRole('button', { name: /add task/i }))
    expect(screen.getByText('Doctor')).toBeInTheDocument()
    // due date is shown in the task row
    expect(screen.getByText(/📅/)).toBeInTheDocument()
  })

  it('clears due date input after adding', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Doctor')
    await userEvent.type(screen.getByLabelText('Due date and time'), '2026-03-08T09:00')
    await userEvent.click(screen.getByRole('button', { name: /add task/i }))
    // The first datetime-local input (add form) should be cleared
    const dateInputs = screen.getAllByLabelText('Due date and time')
    expect(dateInputs[0]).toHaveValue('')
  })

  it('saves due date to localStorage', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Doctor')
    await userEvent.type(screen.getByLabelText('Due date and time'), '2026-03-08T09:00')
    await userEvent.click(screen.getByRole('button', { name: /add task/i }))
    const stored = JSON.parse(localStorage.getItem('ai-assistant:tasks') ?? '[]')
    expect(stored[0].dueDate).toBe('2026-03-08T09:00')
  })

  it('edit shows due date pre-filled and allows changing it', async () => {
    const tasks = [
      { id: '1', title: 'Meeting', done: false, createdAt: Date.now(), dueDate: '2026-03-08T10:00' },
    ]
    localStorage.setItem('ai-assistant:tasks', JSON.stringify(tasks))
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /edit task/i }))
    expect(screen.getByDisplayValue('2026-03-08T10:00')).toBeInTheDocument()
  })

  it('task without due date shows no date badge', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Simple task{Enter}')
    expect(screen.queryByText(/📅/)).toBeNull()
  })
})

// ── localStorage persistence ──────────────────────────────────────────────────
describe('TasksPage — localStorage', () => {
  it('saves tasks to localStorage after adding', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk{Enter}')
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].title).toBe('Buy milk')
  })

  it('restores tasks from localStorage on mount', () => {
    const existing = [{ id: '1', title: 'Restored task', done: false, createdAt: Date.now() }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    renderPage()
    expect(screen.getByText('Restored task')).toBeInTheDocument()
  })

  it('restores a completed task under Completed section', () => {
    const existing = [{ id: '1', title: 'Done task', done: true, createdAt: Date.now() }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    renderPage()
    expect(screen.getByText('Done task')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('removes deleted task from localStorage', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk{Enter}')
    await userEvent.click(screen.getByRole('button', { name: /delete task/i }))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(0)
  })

  it('persists done state to localStorage', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Add a new task…'), 'Buy milk{Enter}')
    await userEvent.click(screen.getByRole('button', { name: /mark as done/i }))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored[0].done).toBe(true)
  })
})
