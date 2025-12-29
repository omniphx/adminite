import * as React from 'react'
import { Row, Col } from 'antd'
import Table from './QueryResultsTable'
import ErrorAlert from './ErrorAlert'
import { useQueryResultStore, selectTabErrors } from '../../../stores/useQueryResultStore'

interface IQueryResultProps {
  tabId: string
}

const QueryResult = React.memo((props: IQueryResultProps) => {
  const { tabId } = props
  // Zustand for query results errors (Phase 9) - memoize selector to avoid infinite loop
  const errorsSelector = React.useCallback(selectTabErrors(tabId), [tabId])
  const errors = useQueryResultStore(errorsSelector)

  return errors ? renderErrors() : renderResults()

  function renderErrors() {
    return (
      <Row style={{ margin: '0.25em 0', padding: '.5em 0' }}>
        <Col span={24}>
          <ErrorAlert {...props}/>
        </Col>
      </Row>
    )
  }

  function renderResults() {
    return (
      <Row style={{ margin: '0.25em 0' }}>
        <Col span={24}>
          <Table {...props}/>
        </Col>
      </Row>
    )
  }
})

export default QueryResult
