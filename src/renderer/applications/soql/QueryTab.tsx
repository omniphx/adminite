import * as React from 'react'
import { Button, Row, Col } from 'antd'
import QueryEditor from './QueryEditor'
import SearchFilter from './actions/SearchFilter'
import SaveQuery from './actions/SaveQuery'
import LoadQueries from './actions/LoadQueries'
import Export from './actions/Export'
import PageSizeSelect from './actions/PageSizeSelect'
import Pagination from './actions/Pagination'
import QueryOptions from './actions/QueryOptions'
import QueryResult from './results/QueryResult'
import Query from './actions/Query'
import SelectContext from '../SelectContext'
import { DescribeGlobalSObjectResult, DescribeSObjectResult } from 'jsforce'
import { ApplicationState } from '../../store/index'
import { onQuerySObjectChange } from '../../store/sobject/actions'
import { useSelector, useDispatch } from 'react-redux'
import History from './actions/History'
import QueryValidator from './QueryValidator'
import { formatQuery } from 'soql-parser-js'
import SaveEdits from './actions/SaveEdits'
import { onQueryChange } from '../../store/queries/actions'
import { SoqlQuery } from '../../store/queries/types'
import FillFields from './actions/FillFields'
import BulkActions from './actions/BulkActions'
import { SchemaState } from '../../store/schema/types'

interface IQueryTabProps {
  tabId: string
}

const QueryTab = React.memo((props: IQueryTabProps) => {
  const dispatch = useDispatch()
  const { tabId } = props

  const toolingMode: boolean = useSelector(
    (state: ApplicationState) => state.queriesState.byTabId[tabId].toolingMode
  )
  const schemaState: SchemaState = useSelector(
    (state: ApplicationState) => state.schemaState
  )
  const sobject: DescribeSObjectResult = useSelector(
    (state: ApplicationState) => state.querySobjectsState.byTabId[tabId].sobject
  )
  const query: SoqlQuery = useSelector(
    (state: ApplicationState) => state.queriesState.byTabId[tabId].query
  )

  const sobjects: DescribeGlobalSObjectResult[] = getQueryableSObjects(
    toolingMode ? schemaState.toolingObjects : schemaState.sobjects
  )
  const sobjectName: string = sobject ? sobject.name : ''

  //Props
  const childProps = { tabId }

  const handleChange = (sobjectName: string) => {
    //Pick up from here
    dispatch(onQuerySObjectChange(tabId, sobjectName))
  }

  const formatConfig = {
    fieldMaxLineLength: 1000000,
    numIndent: 1,
    fieldSubqueryParensOnOwnLine: true,
    whereClauseOperatorsIndented: false
  }

  const handleFormat = () => {
    dispatch(
      onQueryChange({
        tabId,
        query: { ...query, body: formatQuery(query.body, formatConfig) }
      })
    )
  }

  return (
    <div className='query-editor'>
      <Row align='middle'>
        <Col span={12}>
          <SelectContext
            {...{ sobjects, handleChange }}
            sobject={sobjectName}
            loading={false}
          />
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button
            type='link'
            onClick={handleFormat}
            disabled={query.body.length <= 0}
          >
            Format
          </Button>
          <FillFields {...childProps} />
          <SaveQuery {...childProps} />
          <LoadQueries {...childProps} />
          <History {...childProps} />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <QueryValidator {...childProps} />
          <QueryEditor {...childProps} />
        </Col>
      </Row>
      <Row gutter={32} justify='space-between' align='middle'>
        <Col xs={24} sm={24} lg={12}>
          <Query {...childProps} />
          <QueryOptions {...childProps} />
          <SaveEdits {...childProps} />
          <Export {...childProps} />
        </Col>
        <Col
          className='bump-left'
          xs={24}
          sm={24}
          lg={12}
          style={{ textAlign: 'right' }}
        >
          <PageSizeSelect {...childProps} />
        </Col>
      </Row>
      <Row gutter={16} justify='space-between' align='middle'>
        <Col xs={24} sm={24} md={24} lg={12}>
          <BulkActions {...childProps} />
          <SearchFilter {...childProps} />
        </Col>
        <Col
          className='bump-left'
          xs={24}
          sm={24}
          md={24}
          lg={12}
          style={{ textAlign: 'right' }}
        >
          <Pagination {...childProps} />
        </Col>
      </Row>
      <QueryResult {...childProps} />
    </div>
  )

  function getQueryableSObjects(sobjects: DescribeGlobalSObjectResult[]) {
    return sobjects.filter(sobject => {
      return sobject.queryable
    })
  }
})

export default QueryTab
