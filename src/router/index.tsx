import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ChatPage from '../features/chat/ChatPage'
import SettingsPage from '../features/settings/SettingsPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import ComingSoonPage from '../features/placeholder/ComingSoonPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'tasks', element: <ComingSoonPage title="Tasks" /> },
      { path: 'calendar', element: <ComingSoonPage title="Calendar" /> },
      { path: 'translate', element: <ComingSoonPage title="Translate" /> },
      { path: 'recipes', element: <ComingSoonPage title="Recipes" /> },
      { path: 'notes', element: <ComingSoonPage title="Notes" /> },
      { path: 'history', element: <ComingSoonPage title="History" /> },
    ],
  },
])

export default router
