import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store'
import router from './router'

// Apply theme from store to <html> immediately and on every change
function applyTheme() {
  document.documentElement.setAttribute('data-theme', store.getState().settings.theme)
}
applyTheme()
store.subscribe(applyTheme)

export default function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  )
}
