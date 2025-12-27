import * as React from 'react'
import { CloseCircleOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { onQuery, onCancel } from '../../../store/queryResults/actions'

const { Group: ButtonGroup } = Button
import { useSelector, useDispatch } from 'react-redux'
import { ApplicationState } from '../../../store/index'
import { Query as ParsedQuery, isQueryValid, parseQuery } from 'soql-parser-js'
import {
  onResultSObjectChange,
  onQuerySObjectChange
} from '../../../store/sobject/actions'
import { useTabStore } from '../../../stores/useTabStore'
import { useQueryHistoryStore } from '../../../stores/useQueryHistoryStore'

interface IQueryProps {
  tabId: string
}

const Query: React.FC<IQueryProps> = (props: IQueryProps) => {
  //Global state
  const dispatch = useDispatch()
  const { tabId } = props

  // Zustand stores
  const queryState = useTabStore((state) => state.queries[tabId])
  const setParsedQuery = useTabStore((state) => state.setParsedQuery)
  const renameTab = useTabStore((state) => state.renameTab)
  const query = queryState?.query ?? { body: '' }
  const includeDeleted = queryState?.includeDeleted ?? false

  const previousQueries = useQueryHistoryStore((state) => state.queries)
  const addToHistory = useQueryHistoryStore((state) => state.addQuery)

  // Redux still needed for queryResults pending state (until Phase 9)
  const pending: boolean = useSelector(
    (state: ApplicationState) => state.queryResultsState.byTabId[tabId]?.pending ?? false
  )

  const handleQuery = () => {
    if (isQueryValid(query.body)) {
      const parsedQuery: ParsedQuery = parseQuery(query.body)
      setParsedQuery(tabId, parsedQuery)
      renameTab(tabId, parsedQuery.sObject)
      // Redux dispatch for sobject (until Phase 6)
      dispatch(onResultSObjectChange(tabId, parsedQuery.sObject))
      dispatch(onQuerySObjectChange(tabId, parsedQuery.sObject))
    }
    // Redux dispatch for query execution (until Phase 9)
    dispatch(onQuery(tabId, query.body, includeDeleted))
    if (previousQueries[previousQueries.length - 1] !== query.body)
      addToHistory(query.body)
  }

  return (
    <ButtonGroup className='button-style'>
      <Button
        type='primary'
        style={{ borderRadius: pending ? 0 : 4 }}
        loading={pending}
        disabled={!query.body || query.body.length <= 0}
        onClick={handleQuery}
      >
        Query
      </Button>
      <Button
        style={{ display: pending ? '' : 'none' }}
        onClick={() => dispatch(onCancel(tabId))}
        icon={<CloseCircleOutlined />}
      />
    </ButtonGroup>
  )
}

export default Query
