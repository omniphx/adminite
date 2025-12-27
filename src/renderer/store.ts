import { createStore, applyMiddleware, Store } from 'redux'
import { rootReducer } from './store/index'
// import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import throttle from 'lodash/throttle'
import { saveState, loadState } from './utils/localStorage'

// const composeEnhancers = composeWithDevTools({})
const sagaMiddleware = createSagaMiddleware({
  onError: (error: any) => {
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
      // queriesState and queryResultsState removed - now managed by Zustand with its own persistence (Phase 9)
      // userState is now managed by Zustand with its own persistence
    })
  }, 1000)
)

// rootSaga removed - all sagas have been migrated to TanStack Query/Zustand (Phase 9)

export default store
