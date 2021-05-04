import * as React from 'react'
import { LinkOutlined } from '@ant-design/icons'
import { Table as AntTable, TablePaginationConfig } from 'antd'
import { ApplicationState } from '../../../store/index'
import {
  isSalesforceId,
  isDate,
  isDatetime,
  getRecordId
} from '../../../../helpers/utils'
import { shell } from 'electron'
import moment from 'moment'
import { useSelector, useDispatch } from 'react-redux'
import TextCell from './TextCell'
import NumberCell from './NumberCell'
import PicklistCell from './PicklistCell'
import DateCell from './DateCell'
import DateTimeCell from './DateTimeCell'
import MultiPicklistCell from './MultiPicklistCell'
import BooleanCell from './BooleanCell'
import { onQueryChange } from '../../../store/queries/actions'
import { onQueryResultChange } from '../../../store/queryResults/actions'
import { flattenData } from '../../../utils/queryResultsHandler'

interface IQueryResultsTableProps {
  tabId: string
}

const QueryResultsTable: React.FC<IQueryResultsTableProps> = React.memo(
  (props: IQueryResultsTableProps) => {
    const dispatch = useDispatch()
    const { tabId } = props

    //Global state
    const connection: any = useSelector(
      (state: ApplicationState) => state.connectionState.connection
    )
    const data: any = useSelector(
      (state: ApplicationState) => state.queryResultsState.byTabId[tabId].data
    )
    const filteredIds: any = useSelector(
      (state: ApplicationState) =>
        state.queryResultsState.byTabId[tabId].filteredIds
    )
    const selectedIds: any = useSelector(
      (state: ApplicationState) =>
        state.queryResultsState.byTabId[tabId].selectedIds
    )
    const queryResultsData: any = useSelector(
      (state: ApplicationState) => state.queryResultsState.byTabId[tabId].data
    )
    const paginationConfig: TablePaginationConfig = useSelector(
      (state: ApplicationState) =>
        state.queriesState.byTabId[tabId].paginationConfig
    )
    const parsedQuery: any = useSelector(
      (state: ApplicationState) => state.queriesState.byTabId[tabId].parsedQuery
    )
    const fieldSchema: any = useSelector(
      (state: ApplicationState) =>
        state.resultSobjectsState.byTabId[tabId].fieldSchema
    )

    const instanceUrl: string = connection ? connection.instanceUrl : ''
    const dataSource: any[] = filteredIds
      .filter(id => data.hasOwnProperty(id))
      .map(id => flattenData(data[id]))

    //Hooks
    const [sortedInfo, setSortedInfo] = React.useState({
      columnKey: null,
      order: null
    })
    const [selectedRowKeys, setSelectedRowKeys] = React.useState<any[]>([])

    //Reset selection after a query
    React.useEffect(() => {
      setSelectedRowKeys([])
    }, [queryResultsData])

    const handleChange = (
      pagination: TablePaginationConfig,
      filters: any,
      sorter: any
    ) => {
      dispatch(onQueryChange({ tabId, paginationConfig: pagination }))
      setSortedInfo(sorter)
    }

    const expandedRowRender = (record: any) => {
      const tables: any[] = []

      for (const key in record) {
        if (record.hasOwnProperty(key)) {
          if (typeof record[key] !== 'object') continue
          const recordObject = record[key]
          if (!recordObject) continue
          if (
            !Array.isArray(recordObject.records) ||
            !recordObject.records.length
          )
            continue

          const table = {
            key,
            data: getData(recordObject.records),
            columns: getColumns(recordObject.records, true).map(column => {
              //Diable sorting in child tables
              delete column.sorter
              return column
            })
          }

          tables.push(table)
        }
      }

      return tables.map(table => {
        return (
          <div key={table.key}>
            <h3>{table.key}</h3>
            <AntTable
              key={table.key}
              columns={table.columns}
              dataSource={table.data}
              scroll={{ x: 'max-content' }}
              pagination={{ position: ['bottomRight'] }}
              size='small'
            />
          </div>
        )
      })
    }

    const onIdClick = recordId => {
      shell.openExternal(`${instanceUrl}/${recordId}`)
    }

    const getRecordKeys = record => {
      let recordKeys = []

      for (const key in record) {
        if (key === 'attributes') continue
        if (key === 'key') continue
        if (key === 'editFields') continue
        if (key === 'errorMessage') continue
        //Null is fine, but records are bad... very weird/hacky guard clause
        if (record[key]) {
          if (record[key].records) continue
        }

        //Nulls are also objects
        if (record[key] !== null && typeof record[key] === 'object') continue

        recordKeys.push(key)
      }

      return recordKeys
    }

    const getProperty = (propertyName, property) => {
      if (!property) return property

      let propertyNames = propertyName.split('.')
      let firstProperty = propertyNames.splice(0, 1)

      if (propertyNames.length > 0) {
        return getProperty(propertyNames.join('.'), property[firstProperty])
      } else {
        return property[firstProperty]
      }
    }

    const tableProps = hasChildRecords()
      ? {
          expandedRowRender: expandedRowRender,
          rowClassName: rowClassName
        }
      : {}

    const onSelect = (selectedRow: any, selected: boolean) => {
      dispatch(
        onQueryResultChange({
          tabId,
          selectedIds: selected
            ? [...selectedIds, selectedRow.Id]
            : selectedIds.filter(id => id !== selectedRow.Id)
        })
      )
    }

    const onSelectAll = (selected: boolean) => {
      dispatch(
        onQueryResultChange({
          tabId,
          selectedIds: selected
            ? filteredIds
            : selectedIds.filter(id => !filteredIds.includes(id))
        })
      )
    }

    return (
      <AntTable
        {...tableProps}
        dataSource={dataSource}
        columns={getColumns(dataSource, false)}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onSelect: onSelect,
          onSelectAll: onSelectAll
          // hideDefaultSelections: true
        }}
        onChange={handleChange}
        scroll={{ x: 'max-content' }}
        pagination={paginationConfig}
        size='middle'
      />
    )

    function rowClassName(record: any) {
      for (const key in record) {
        if (typeof record[key] !== 'object') continue
        if (!record[key]) continue
        if (!record[key].records) continue

        return ''
      }

      return 'table_hide-expandable-icon'
    }

    function hasChildRecords() {
      if (!parsedQuery) return false
      if (!parsedQuery.fields) return false
      return parsedQuery.fields.some(field => field.type === 'FieldSubquery')
    }

    function getData(data) {
      return data.map((record: any, index: any) => {
        record.key =
          record.attributes.type === 'AggregateResult'
            ? index
            : getRecordId(record)

        return record
      })
    }

    function getColumns(records, isChild) {
      let columns = []
      if (!records) return columns

      let record = records[0]
      return getRecordKeys(record).map(field => {
        const fieldDescription =
          isChild || !fieldSchema ? null : fieldSchema[field]
        return {
          title: field,
          dataIndex: field,
          key: field,
          sorter: (a, b) => {
            let propA = getProperty(field, a)
            let propB = getProperty(field, b)
            if (!propA) return -1
            if (!propB) return 1

            if (typeof propA === 'string') propA = propA.toLowerCase()
            if (typeof propB === 'string') propB = propB.toLowerCase()

            if (propA < propB) return -1
            if (propA > propB) return 1
            return 0
          },
          sortOrder: sortedInfo.columnKey === field && sortedInfo.order,
          render: (value, record) => {
            const childProps = {
              ...{ tabId, value, record, fieldSchema: fieldDescription }
            }
            return {
              props: {
                className: 'table-cell',
                style: {
                  backgroundColor:
                    record.editFields && record.editFields.indexOf(field) >= 0
                      ? '#fff7e6'
                      : '#fff'
                }
              },
              children:
                record.attributes.type === 'AggregateResult'
                  ? formatValue(value)
                  : renderCell(childProps)
            }
          }
        }
      })
    }

    function renderCell(childProps) {
      const { fieldSchema, value } = childProps
      const type = fieldSchema ? fieldSchema.type : ''
      switch (type) {
        case 'string':
          return <TextCell {...childProps} />
        case 'textarea':
          return <TextCell {...childProps} />
        case 'url':
          return <TextCell {...childProps} />
        case 'double':
          return <NumberCell {...childProps} />
        case 'currency':
          return <NumberCell {...childProps} />
        case 'int':
          return <NumberCell {...childProps} />
        case 'percent':
          return <NumberCell {...childProps} />
        case 'date':
          return <DateCell {...childProps} />
        case 'datetime':
          return <DateTimeCell {...childProps} />
        case 'picklist':
          return <PicklistCell {...childProps} />
        case 'multipicklist':
          return <MultiPicklistCell {...childProps} />
        case 'phone':
          return <TextCell {...childProps} />
        case 'boolean':
          return <BooleanCell {...childProps} />
        default:
          return formatValue(value)
      }
    }

    function formatValue(value) {
      if (isSalesforceId(value)) {
        return (
          <span>
            <a onClick={() => onIdClick(value)}>
              <LinkOutlined />
            </a>{' '}
            {value}
          </span>
        )
      } else if (isDate(value)) {
        return moment(value).format('MM/DD/YYYY')
      } else if (isDatetime(value)) {
        return moment(value).format('MM/DD/YYYY h:mma')
      } else if (typeof value === 'boolean') {
        return `${value}`
      } else if (!value) {
        return ''
      } else {
        return `${value}`
      }
    }
  }
)

export default QueryResultsTable
