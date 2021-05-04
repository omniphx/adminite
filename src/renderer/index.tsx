import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { remote } from 'electron'
import { DndProvider } from 'react-dnd-cjs'
import HTML5Backend from 'react-dnd-html5-backend-cjs'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'

import store from './store'
import App from './App'
import './styles/styles.less'
import ErrorBoundary from './ErrorBoundary'

Sentry.init({
  dsn:
    'https://455a40ec4aae44feb81220aee8105671@o398570.ingest.sentry.io/5254535',
  integrations: [new Integrations.BrowserTracing()],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
})

const { getCurrentWebContents, Menu, MenuItem } = remote

const rootElement = document.getElementById('app')
const devMode = process.env.NODE_ENV !== 'production'

ReactDOM.render(
  <ErrorBoundary>
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
    </Provider>
  </ErrorBoundary>,
  rootElement
)

if (devMode) {
  //Inspector
  let webContents = getCurrentWebContents()
  let rightClickPosition
  const contextMenu = new Menu()
  const menuItem = new MenuItem({
    label: 'Inspect Element',
    click: () => {
      webContents.inspectElement(rightClickPosition.x, rightClickPosition.y)
    }
  })

  contextMenu.append(menuItem)

  webContents.on('context-menu', (event, params) => {
    rightClickPosition = { x: params.x, y: params.y }
    contextMenu.popup()
  })

  // Auto-reloads app
  if (module.hot) {
    module.hot.accept()
  }
}
