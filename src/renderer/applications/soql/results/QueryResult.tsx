import * as React from 'react'
import { Row, Col } from 'antd'
import Table from './QueryResultsTable'
import ErrorAlert from './ErrorAlert'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../store/index'

interface IQueryResultProps {
  tabId: string
}

const QueryResult = React.memo((props: IQueryResultProps) => {
  const { tabId } = props
  const errors: any = useSelector((state: ApplicationState) => state.queryResultsState.byTabId[tabId].errors)

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
