import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { addConversation, addMessage } from '../chat/chatSlice'
import { useSendMessageMutation } from '../chat/claudeApi'
import type { Conversation, Message } from '../../types'

const QUICK_ACTIONS = [
  { icon: '📅', title: 'Plan Day', subtitle: 'Create a schedule', bg: 'bg-red-500/20' },
  { icon: '🌐', title: 'Translate', subtitle: 'Convert text', bg: 'bg-blue-500/20' },
  { icon: '🔍', title: 'Find Recipe', subtitle: 'By ingredients', bg: 'bg-orange-500/20' },
  { icon: '⏰', title: 'Set Reminder', subtitle: 'Never forget', bg: 'bg-yellow-500/20' },
  { icon: '📋', title: 'Create List', subtitle: 'Organize tasks', bg: 'bg-purple-500/20' },
  { icon: '📊', title: 'Analytics', subtitle: 'View insights', bg: 'bg-green-500/20' },
]

const STATS = [
  { label: 'Tasks Completed', value: '24', badge: '+48%', badgeClass: 'bg-green-500/20 text-green-400' },
  { label: 'Active Conversations', value: '8', badge: '+3', badgeClass: 'bg-blue-500/20 text-blue-400' },
  { label: 'Translations', value: '156', badge: '+24%', badgeClass: 'bg-green-500/20 text-green-400' },
  { label: 'Recipes Found', value: '42', badge: '🍳', badgeClass: 'bg-orange-500/20 text-orange-400' },
]

const RECENT_ACTIVITY = [
  { icon: '✅', title: 'Task Completed', desc: "Finished 'Review project proposal'", time: '5 minutes ago' },
  { icon: '🌐', title: 'Translation', desc: 'Translated document to English', time: '15 minutes ago' },
  { icon: '📅', title: 'Schedule Created', desc: 'Daily plan for tomorrow', time: '1 hour ago' },
  { icon: '🍳', title: 'Recipe Found', desc: 'Stir-fry with rice and broccoli', time: '2 hours ago' },
  { icon: '💬', title: 'New Conversation', desc: 'Started new AI chat activity', time: '3 hours ago' },
]

const TASKS = [
  { title: 'Morning workout', time: '09:00 AM', dot: 'bg-green-500', done: true },
  { title: 'Team meeting', time: '10:30 AM', dot: 'bg-yellow-500', done: false },
  { title: 'Review documents', time: '02:00 PM', dot: 'bg-blue-500', done: false },
  { title: 'Prepare presentation', time: '04:00 PM', dot: 'bg-red-500', done: false },
]

const CAL_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
// December 2024 starts on Sunday
const CAL_DAYS = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, null, null, null, null],
]

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { conversations, activeConversationId } = useAppSelector((s) => s.chat)
  const settings = useAppSelector((s) => s.settings)
  const [sendMessage] = useSendMessageMutation()
  const [chatInput, setChatInput] = useState('')

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? conversations[0] ?? null
  const displayMessages = activeConversation?.messages.slice(-3) ?? []

  async function handleChatSend() {
    const text = chatInput.trim()
    if (!text) return
    setChatInput('')

    let convId = activeConversationId
    if (!convId) {
      const newConv: Conversation = {
        id: crypto.randomUUID(),
        title: text.slice(0, 60),
        messages: [],
        createdAt: Date.now(),
      }
      dispatch(addConversation(newConv))
      convId = newConv.id
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      createdAt: Date.now(),
    }
    dispatch(addMessage({ conversationId: convId, message: userMsg }))

    const conv = conversations.find((c) => c.id === convId)
    const history = conv ? conv.messages.map((m) => ({ role: m.role, content: m.content })) : []
    history.push({ role: 'user', content: text })

    await sendMessage({
      conversationId: convId,
      messages: history,
      model: settings.model,
      systemPrompt: settings.systemPrompt,
    })
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-base)]">
      <div className="p-4 md:p-6 max-w-[1400px]">
        {/* Welcome */}
        <div className="mb-5 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text-1)]">Welcome back, Alex! 👋</h1>
          <p className="text-[var(--text-2)] text-sm mt-1">
            Here's what's happening with your AI assistant today
          </p>
        </div>

        {/* Row 1: Quick Actions + Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-4 md:mb-5">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">⚡ Quick Actions</h2>
              <button className="text-[var(--text-3)] hover:text-[var(--text-1)] text-lg leading-none">⋯</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {QUICK_ACTIONS.map((a) => {
                const inner = (
                  <>
                    <span className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center text-xl mb-2`}>
                      {a.icon}
                    </span>
                    <span className="text-xs font-medium text-[var(--text-1)]">{a.title}</span>
                    <span className="text-xs text-[var(--text-3)] mt-0.5">{a.subtitle}</span>
                  </>
                )
                const cls = "flex flex-col items-center p-3 rounded-xl bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] border border-[var(--border)] hover:border-indigo-500/50 transition-all text-center"
                return a.title === 'Translate' ? (
                  <NavLink key={a.title} to="/translate" end className={cls}>
                    {inner}
                  </NavLink>
                ) : (
                  <button key={a.title} className={cls}>
                    {inner}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-4 md:p-5">
            <h2 className="text-sm font-semibold text-[var(--text-1)] mb-3">📊 Statistics</h2>
            <div>
              {STATS.map((s, i) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-xs text-[var(--text-3)]">{s.label}</p>
                      <p className="text-2xl font-bold text-[var(--text-1)] mt-0.5">{s.value}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.badgeClass}`}>
                      {s.badge}
                    </span>
                  </div>
                  {i < STATS.length - 1 && <div className="border-t border-[var(--border)]" />}
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
              <h2 className="text-sm font-semibold text-[var(--text-1)]">💬 AI Chat</h2>
              <NavLink to="/chat" end className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                View all →
              </NavLink>
            </div>

            <div className="space-y-3 mb-4 min-h-[150px]">
              {displayMessages.length === 0 ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    AI
                  </div>
                  <div className="bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-[var(--text-1)] max-w-[80%]">
                    Hello! I'm your AI assistant. How can I help you today?
                  </div>
                </div>
              ) : (
                displayMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        msg.role === 'user' ? 'bg-[var(--border)]' : 'bg-indigo-600'
                      }`}
                    >
                      {msg.role === 'user' ? 'U' : 'AI'}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm max-w-[75%] ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-sm'
                          : 'bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-1)] rounded-tl-sm'
                      }`}
                    >
                      <p className="line-clamp-2">{msg.content}</p>
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
                placeholder="Type your message..."
                disabled={!settings.apiKey}
                className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                onClick={handleChatSend}
                disabled={!chatInput.trim() || !settings.apiKey}
                className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                ➤
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-4 md:p-5">
            <h2 className="text-sm font-semibold text-[var(--text-1)] mb-4">⏰ Recent Activity</h2>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
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
              <h2 className="text-sm font-semibold text-[var(--text-1)]">📅 Calendar</h2>
              <div className="flex items-center gap-2">
                <button className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">‹</button>
                <span className="text-xs text-[var(--text-2)]">December 2024</span>
                <button className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">›</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {CAL_HEADERS.map((d) => (
                <div key={d} className="text-xs text-[var(--text-3)] py-1 font-medium">
                  {d}
                </div>
              ))}
              {CAL_DAYS.flat().map((day, i) => (
                <div
                  key={i}
                  className={`text-xs py-1.5 rounded-lg transition-colors ${
                    !day
                      ? ''
                      : day === 18
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
            <h2 className="text-sm font-semibold text-[var(--text-1)] mb-4">✓ Today's Tasks</h2>
            <div className="space-y-2">
              {TASKS.map((task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)]"
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 ${
                      task.done
                        ? 'border-indigo-500 bg-indigo-600'
                        : 'border-[var(--text-4)]'
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
                    <p className="text-xs text-[var(--text-3)]">{task.time}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.dot}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
