import { createStore, applyMiddleware, Store } from 'redux'
import { rootReducer, rootSaga } from './store/index'
// import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import throttle from 'lodash/throttle'
import { saveState, loadState } from './utils/localStorage'
import * as Sentry from '@sentry/electron'

// const composeEnhancers = composeWithDevTools({})
const sagaMiddleware = createSagaMiddleware({
  onError: (error: any) => {
    Sentry.withScope(scope => {
      scope.setExtras(error)
      Sentry.captureException(error.message)
    })
    console.error(error)
  }
})

const persistedStore = loadState()

const store: Store = createStore(
  rootReducer,
  persistedStore,
  // composeEnhancers(applyMiddleware(...[sagaMiddleware]))
  applyMiddleware(...[sagaMiddleware])
)

store.subscribe(
  throttle(() => {
    saveState({
      queryHistoryState: store.getState().queryHistoryState,
      queryTabsState: store.getState().queryTabsState,
      querySobjectsState: store.getState().querySobjectsState,
      resultSobjectsState: store.getState().resultSobjectsState,
      queryResultsState: store.getState().queryResultsState,
      queriesState: store.getState().queriesState,
      userState: store.getState().userState
    })
  }, 1000)
)

sagaMiddleware.run(rootSaga)

export default store
