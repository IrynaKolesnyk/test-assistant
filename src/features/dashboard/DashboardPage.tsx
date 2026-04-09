import { useState, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../../app/hooks'
import { useSendChat } from '../chat/useSendChat'
import { loadTasks, type Task } from '../tasks/tasksStorage'

const MONTH_KEYS = [
  'months.january', 'months.february', 'months.march', 'months.april',
  'months.may', 'months.june', 'months.july', 'months.august',
  'months.september', 'months.october', 'months.november', 'months.december',
]

const WEEKDAY_KEYS = [
  'weekdays.su', 'weekdays.mo', 'weekdays.tu', 'weekdays.we',
  'weekdays.th', 'weekdays.fr', 'weekdays.sa',
]

function loadTodaysTasks(): Task[] {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  return loadTasks().filter((task) => task.dueDate?.slice(0, 10) === today)
}

function buildCalendarWeeks(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let day = 1; day <= daysInMonth; day++) days.push(day)
  while (days.length % 7 !== 0) days.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
  return weeks
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { conversations, activeConversationId } = useAppSelector((state) => state.chat)
  const { apiKey } = useAppSelector((state) => state.settings)
  const { sendChat } = useSendChat()
  const [chatInput, setChatInput] = useState('')

  const [todaysTasks] = useState<Task[]>(loadTodaysTasks)
  const today = useMemo(() => new Date(), [])
  const [calDate, setCalDate] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const calWeeks = useMemo(() => buildCalendarWeeks(calDate.year, calDate.month), [calDate])
  const calLabel = `${t(MONTH_KEYS[calDate.month])} ${calDate.year}`
  const todayDay =
    calDate.year === today.getFullYear() && calDate.month === today.getMonth()
      ? today.getDate()
      : null

  function prevMonth() {
    setCalDate(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    )
  }
  function nextMonth() {
    setCalDate(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    )
  }

  const QUICK_ACTIONS = [
    { icon: '📅', title: t('dashboard.planDay'), subtitle: t('dashboard.planDaySub'), bg: 'bg-red-500/20' },
    { icon: '🌐', title: t('dashboard.translateAction'), subtitle: t('dashboard.translateSub'), bg: 'bg-blue-500/20' },
    { icon: '🔍', title: t('dashboard.findRecipe'), subtitle: t('dashboard.findRecipeSub'), bg: 'bg-orange-500/20' },
    { icon: '⏰', title: t('dashboard.setReminder'), subtitle: t('dashboard.setReminderSub'), bg: 'bg-yellow-500/20' },
    { icon: '📋', title: t('dashboard.createList'), subtitle: t('dashboard.createListSub'), bg: 'bg-purple-500/20' },
    { icon: '📊', title: t('dashboard.analytics'), subtitle: t('dashboard.analyticsSub'), bg: 'bg-green-500/20' },
  ]

  const STATS = [
    { label: t('dashboard.tasksCompleted'), value: '24', badge: '+48%', badgeClass: 'bg-green-500/20 text-green-400' },
    { label: t('dashboard.activeConversations'), value: '8', badge: '+3', badgeClass: 'bg-blue-500/20 text-blue-400' },
    { label: t('dashboard.translations'), value: '156', badge: '+24%', badgeClass: 'bg-green-500/20 text-green-400' },
    { label: t('dashboard.recipesFound'), value: '42', badge: '🍳', badgeClass: 'bg-orange-500/20 text-orange-400' },
  ]

  const RECENT_ACTIVITY = [
    { icon: '✅', title: t('dashboard.taskCompleted'), desc: t('dashboard.taskCompletedDesc'), time: t('dashboard.minutesAgo', { count: 5 }) },
    { icon: '🌐', title: t('dashboard.translation'), desc: t('dashboard.translationDesc'), time: t('dashboard.minutesAgo', { count: 15 }) },
    { icon: '📅', title: t('dashboard.scheduleCreated'), desc: t('dashboard.scheduleCreatedDesc'), time: t('dashboard.hourAgo') },
    { icon: '🍳', title: t('dashboard.recipeFound'), desc: t('dashboard.recipeFoundDesc'), time: t('dashboard.hoursAgo', { count: 2 }) },
    { icon: '💬', title: t('dashboard.newConversation'), desc: t('dashboard.newConversationDesc'), time: t('dashboard.hoursAgo', { count: 3 }) },
  ]

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0] ?? null
  const displayMessages = activeConversation?.messages.slice(-3) ?? []

  async function handleChatSend() {
    const text = chatInput.trim()
    if (!text) return
    setChatInput('')
    await sendChat(text)
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-base)]">
      <div className="p-4 md:p-6 max-w-[1400px]">
        {/* Welcome */}
        <div className="mb-5 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text-1)]">{t('dashboard.welcome')}</h1>
          <p className="text-[var(--text-2)] text-sm mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Row 1: Quick Actions + Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-4 md:mb-5">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">⚡ {t('dashboard.quickActions')}</h2>
              <button className="text-[var(--text-3)] hover:text-[var(--text-1)] text-lg leading-none">⋯</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {QUICK_ACTIONS.map((action) => {
                const inner = (
                  <>
                    <span className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center text-xl mb-2`}>
                      {action.icon}
                    </span>
                    <span className="text-xs font-medium text-[var(--text-1)]">{action.title}</span>
                    <span className="text-xs text-[var(--text-3)] mt-0.5">{action.subtitle}</span>
                  </>
                )
                const cls = "flex flex-col items-center p-3 rounded-xl bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] border border-[var(--border)] hover:border-indigo-500/50 transition-all text-center"
                return action.title === t('dashboard.translateAction') ? (
                  <NavLink key={action.title} to="/translate" end className={cls}>
                    {inner}
                  </NavLink>
                ) : (
                  <button key={action.title} className={cls}>
                    {inner}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-4 md:p-5">
            <h2 className="text-sm font-semibold text-[var(--text-1)] mb-3">📊 {t('dashboard.statistics')}</h2>
            <div>
              {STATS.map((stat, index) => (
                <div key={stat.label}>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-xs text-[var(--text-3)]">{stat.label}</p>
                      <p className="text-2xl font-bold text-[var(--text-1)] mt-0.5">{stat.value}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${stat.badgeClass}`}>
                      {stat.badge}
                    </span>
                  </div>
                  {index < STATS.length - 1 && <div className="border-t border-[var(--border)]" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: AI Chat + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-4 md:mb-5">
          {/* AI Chat */}
          <div className="lg:col-span-2 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-4 md:p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">💬 {t('dashboard.aiChat')}</h2>
              <NavLink to="/chat" end className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                {t('common.viewAll')}
              </NavLink>
            </div>

            <div className="space-y-3 mb-4 min-h-[150px]">
              {displayMessages.length === 0 ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    AI
                  </div>
                  <div className="bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-[var(--text-1)] max-w-[80%]">
                    {t('dashboard.aiGreeting')}
                  </div>
                </div>
              ) : (
                displayMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        message.role === 'user' ? 'bg-[var(--border)]' : 'bg-indigo-600'
                      }`}
                    >
                      {message.role === 'user' ? 'U' : 'AI'}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm max-w-[75%] ${
                        message.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-sm'
                          : 'bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-1)] rounded-tl-sm'
                      }`}
                    >
                      <p className="line-clamp-2">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                aria-label={t('chat.messageLabel')}
                placeholder={t('dashboard.typeMessage')}
                disabled={!apiKey}
                className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                onClick={handleChatSend}
                disabled={!chatInput.trim() || !apiKey}
                aria-label={t('dashboard.sendMessage')}
                className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                ➤
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-4 md:p-5">
            <h2 className="text-sm font-semibold text-[var(--text-1)] mb-4">⏰ {t('dashboard.recentActivity')}</h2>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-base)] border border-[var(--border)] flex items-center justify-center text-sm flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-1)]">{item.title}</p>
                    <p className="text-xs text-[var(--text-3)] truncate">{item.desc}</p>
                    <p className="text-xs text-[var(--text-4)] mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Calendar + Today's Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {/* Calendar */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">📅 {t('dashboard.calendar')}</h2>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} aria-label={t('dashboard.previousMonth')} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">‹</button>
                <span className="text-xs text-[var(--text-2)]">{calLabel}</span>
                <button onClick={nextMonth} aria-label={t('dashboard.nextMonth')} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">›</button>
              </div>
            </div>
            <div role="grid" aria-label={calLabel} className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAY_KEYS.map((key) => (
                <div key={key} className="text-xs text-[var(--text-3)] py-1 font-medium">
                  {t(key)}
                </div>
              ))}
              {calWeeks.flat().map((day, index) => (
                <div
                  key={index}
                  aria-label={day ? `${t(MONTH_KEYS[calDate.month])} ${day}` : undefined}
                  {...(day === todayDay ? { 'aria-current': 'date' as const } : {})}
                  className={`text-xs py-1.5 rounded-lg transition-colors ${
                    !day
                      ? ''
                      : day === todayDay
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-[var(--text-2)] hover:bg-[var(--border)] hover:text-[var(--text-1)] cursor-pointer'
                  }`}
                >
                  {day ?? ''}
                </div>
              ))}
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">✓ {t('dashboard.todaysTasks')}</h2>
              <NavLink to="/tasks" end className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                {t('common.viewAll')}
              </NavLink>
            </div>
            {todaysTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-[var(--text-3)]">{t('dashboard.noTasksToday')}</p>
                <NavLink to="/tasks" end className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 transition-colors">
                  {t('common.addTasks')}
                </NavLink>
              </div>
            ) : (
              <div className="space-y-2">
                {todaysTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)]"
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 ${
                        task.done ? 'border-indigo-500 bg-indigo-600' : 'border-[var(--text-4)]'
                      }`}
                    >
                      {task.done && <span className="text-white text-xs leading-none">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          task.done ? 'line-through text-[var(--text-3)]' : 'text-[var(--text-1)]'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <p className="text-xs text-[var(--text-3)]">
                          {task.dueDate.length > 10
                            ? new Date(task.dueDate).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : t('common.allDay')}
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        task.done ? 'bg-indigo-500' : 'bg-yellow-500'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
