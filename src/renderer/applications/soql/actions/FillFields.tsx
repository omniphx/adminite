import * as React from 'react'
import { Button, Modal, Table, Input } from 'antd'
import { Field } from 'jsforce'
import {
  isQueryValid,
  parseQuery,
  getField,
  composeQuery
} from 'soql-parser-js'
import { sort } from '../../../../helpers/utils'
import { useTabStore, SoqlQuery } from '../../../stores/useTabStore'
import { useQuerySObjectDescribe } from '../../../queries/useSObjectQuery'

const { confirm } = Modal

interface IFillFieldsProps {
  tabId: string
}

const FillFields = React.memo((props: IFillFieldsProps) => {
  const { tabId } = props

  // Zustand store
  const query: SoqlQuery = useTabStore((state) => state.queries[tabId]?.query) ?? { body: '' }
  const setQueryBody = useTabStore((state) => state.setQueryBody)
  const querySObjectName = useTabStore((state) => state.queries[tabId]?.querySObjectName)

  // TanStack Query for sObject describe (Phase 6)
  const { data: sobjectData } = useQuerySObjectDescribe(tabId, querySObjectName)
  const sobject = sobjectData?.sobject

  const [showModal, setShowModal] = React.useState(false)
  const [searchFilter, setSearchFilter] = React.useState('')
  const [selectedFields, setSelectedFields] = React.useState<string[]>([])
  const [parsedQuery, setParsedQuery] = React.useState<any>({})
  const [filteredFields, setFilteredFields] = React.useState<Field[]>([])

  const sobjectName: string = sobject ? sobject.name : ''
  const fields: Field[] = sobject
    ? sobject.fields
        .map(field => {
          return { ...field, key: field.name }
        })
        .sort((a, b) => {
          const nameA = a.name.toLowerCase()
          const nameB = b.name.toLowerCase()

          if (nameA < nameB) return -1
          if (nameA > nameB) return 1
          return 0
        })
    : []

  React.useEffect(() => {
    setSearchFilter('')
    setFilteredFields(fields)
    if (isQueryValid(query.body)) {
      const newParsedQuery: any = parseQuery(query.body)
      setParsedQuery(newParsedQuery)
      setSelectedFields(newParsedQuery.fields.map(field => field.field))
    } else {
      setParsedQuery({ sObject: sobjectName })
    }
  }, [showModal])

  React.useEffect(() => {
    setFilteredFields(
      fields.filter((field: Field) => {
        if (searchFilter.length <= 0) return true
        const nameMatch =
          field.name.toLowerCase().indexOf(searchFilter.toLowerCase()) >= 0
        const labelMatch =
          field.label.toLowerCase().indexOf(searchFilter.toLowerCase()) >= 0
        return nameMatch || labelMatch
      })
    )
  }, [searchFilter])

  const handleApply = () => {
    return isQueryValid(query.body) || query.body.length === 0
      ? buildQuery()
      : overwriteQueryConfirm()
  }

  const buildQuery = () => {
    const body: string = composeQuery(parsedQuery)
    setQueryBody(tabId, body)
    setShowModal(false)
  }

  const handleClose = () => {
    setShowModal(false)
  }

  const onSelectChange = (selectedRowKeys: string[]) => {
    setSelectedFields(selectedRowKeys)
    parsedQuery.fields = selectedRowKeys.map(fieldKey => getField(fieldKey))
    setParsedQuery(parsedQuery)
  }

  const onSelectAll = (
    selected: boolean,
    selectedRows: any[],
    changeRows: any[]
  ) => {
    if (selected) {
      const allFields = [
        ...selectedFields,
        ...filteredFields
          .map(field => field.name)
          .filter(fieldName => selectedFields.indexOf(fieldName) < 0)
      ]
      setSelectedFields(allFields)
      parsedQuery.fields = allFields.map(fieldName => getField(fieldName))
      setParsedQuery(parsedQuery)
    } else {
      //In case user is using a filter and unchecks
      const fieldsWithoutUnselected = selectedFields.filter(
        field => !filteredFields.map(field => field.name).includes(field)
      )
      if (fieldsWithoutUnselected.length <= 0) {
        fieldsWithoutUnselected.push('Id')
      }
      setSelectedFields(fieldsWithoutUnselected)
      parsedQuery.fields = fieldsWithoutUnselected.map(fieldName =>
        getField(fieldName)
      )
      setParsedQuery(parsedQuery)
    }
  }

  return (
    <div className='button-style'>
      <Button
        type='link'
        onClick={() => setShowModal(true)}
        disabled={!sobjectName}
      >
        Add fields
      </Button>
      <Modal
        title='Choose fields'
        width='800px'
        onCancel={handleClose}
        open={showModal}
        footer={[
          <Button key='apply' type='primary' onClick={handleApply}>
            Apply
          </Button>,
          <Button key='back' onClick={handleClose}>
            Close
          </Button>
        ]}
      >
        <Input.Search
          placeholder='Filter fields'
          style={{ marginBottom: 7 }}
          value={searchFilter}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSearchFilter(event.currentTarget.value)
          }
        />
        <Table
          columns={[
            {
              title: 'Name',
              dataIndex: 'name',
              key: 'name',
              sorter: (a: Field, b: Field) => sort(a, b, 'name')
            },
            {
              title: 'Label',
              dataIndex: 'label',
              key: 'label',
              sorter: (a: Field, b: Field) => sort(a, b, 'label')
            },
            {
              title: 'Type',
              dataIndex: 'type',
              key: 'type',
              sorter: (a: Field, b: Field) => sort(a, b, 'type')
            }
          ]}
          dataSource={filteredFields}
          rowSelection={{
            selectedRowKeys: selectedFields,
            onChange: onSelectChange,
            onSelectAll: onSelectAll
          }}
          size='small'
        />
      </Modal>
    </div>
  )

  function overwriteQueryConfirm() {
    confirm({
      title: `Since your query is not valid, this will overwrite your current query. Are you sure you want to proceed?`,
      okText: 'Yes',
      okButtonProps: { type: 'default' },
      cancelText: 'No',
      style: { top: 150 },
      onOk() {
        buildQuery()
      }
    })
  }
})

export default FillFields
