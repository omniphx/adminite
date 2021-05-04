import * as React from 'react'
import { CloseCircleOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { onQuery, onCancel } from '../../../store/queryResults/actions'
import ButtonGroup from 'antd/lib/button/button-group'
import { useSelector, useDispatch } from 'react-redux'
import { ApplicationState } from '../../../store/index'
import { add as addToHistory } from '../../../store/queryHistory/actions'
import { Query as ParsedQuery, isQueryValid, parseQuery } from 'soql-parser-js'
import {
  onResultSObjectChange,
  onQuerySObjectChange
} from '../../../store/sobject/actions'
import { SoqlQuery } from '../../../store/queries/types'
import { onQueryTabChange } from '../../../store/queryTabs/actions'
import { onQueryChange } from '../../../store/queries/actions'

interface IQueryProps {
  tabId: string
}

const Query: React.FC<IQueryProps> = (props: IQueryProps) => {
  //Global state
  const dispatch = useDispatch()
  const { tabId } = props

  const previousQueries: string[] = useSelector(
    (state: ApplicationState) => state.queryHistoryState.queries
  )
  const pending: boolean = useSelector(
    (state: ApplicationState) => state.queryResultsState.byTabId[tabId].pending
  )
  const query: SoqlQuery = useSelector(
    (state: ApplicationState) => state.queriesState.byTabId[tabId].query
  )
  const includeDeleted: boolean = useSelector(
    (state: ApplicationState) =>
      state.queriesState.byTabId[tabId].includeDeleted
  )

  const handleQuery = () => {
    if (isQueryValid(query.body)) {
      const parsedQuery: ParsedQuery = parseQuery(query.body)
      dispatch(onQueryChange({ tabId, parsedQuery }))
      dispatch(onResultSObjectChange(tabId, parsedQuery.sObject))
      dispatch(onQueryTabChange({ id: tabId, title: parsedQuery.sObject }))
      dispatch(onQuerySObjectChange(tabId, parsedQuery.sObject))
    }
    dispatch(onQuery(tabId, query.body, includeDeleted))
    if (previousQueries[previousQueries.length - 1] !== query.body)
      dispatch(addToHistory(query.body))
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
