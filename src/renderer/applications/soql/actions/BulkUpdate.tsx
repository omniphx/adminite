import * as React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ApplicationState } from '../../../store/index'
import { Modal, Button, Select, Input, InputNumber, DatePicker, Checkbox } from 'antd'
import { onQueryResultDataChange } from '../../../store/queryResults/actions'

const { Option } = Select

interface IBulkUpdateProps {
  tabId: string
  showModal: boolean
  setShowModal(showModal: boolean)
}

const BulkUpdate: React.FC<IBulkUpdateProps> = React.memo((props: IBulkUpdateProps) => {
  const dispatch = useDispatch()
  const { tabId, showModal, setShowModal } = props

  const data: any = useSelector((state: ApplicationState) => state.queryResultsState.byTabId[tabId].data)
  const selectedIds: any = useSelector((state: ApplicationState) => state.queryResultsState.byTabId[tabId].selectedIds)
  const sobject: any = useSelector((state: ApplicationState) => state.resultSobjectsState.byTabId[tabId].sobject)
  const fieldSchema: any = useSelector((state: ApplicationState) => state.resultSobjectsState.byTabId[tabId].fieldSchema)

  const [field, setField] = React.useState('')
  const [editValue, setEditValue] = React.useState<any>()

  const fields = sobject ? sobject.fields : []
  const type = fieldSchema && fieldSchema[field] ? fieldSchema[field].type : ''

  React.useEffect(() => {
    if(type === 'boolean') {
      setEditValue(false)
    } else {
      setEditValue(null)
    }
  }, [field])

  React.useEffect(() => {
    setEditValue(null)
    setField('')
  }, [showModal])

  const fieldOptions = fields
    .filter(field => field.updateable)
    .sort((a, b) => {
      const textA = a.label.toLowerCase()
      const textB = b.label.toLowerCase()
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
    })
    .map(field => {
      return <Option key={field.name} value={field.name}>{field.label} ({field.name})</Option>
    })

  const handleApply = () => {
    Object.values(data).forEach((record: any) => {
      if(selectedIds.includes(record.Id)) {
        record[field] = editValue
        record.editFields = [...new Set([...record.editFields, field])]
      } else {
        //Sets property if it doesn't exist
        record[field] = record[field] 
      }
    })
    dispatch(onQueryResultDataChange(tabId, {...data}))
    setShowModal(false)
  }

  return (
    <Modal
      title={`${selectedIds.length} records selected`}
      onCancel={() => setShowModal(false)}
      visible={showModal}
      footer={[
        <Button key='apply' type='primary' onClick={handleApply}>
          Apply
        </Button>,
        <Button key='back' onClick={() => setShowModal(false)}>
          Close
        </Button>,
      ]}
    >
      <div>Which field would you like to update?</div>
      <Select
        showSearch
        value={field}
        style={{ width: '100%' }}
        onChange={(field: string) => setField(field)}
        placeholder='Select a field'
      >
        {fieldOptions}
      </Select>
      <div style={{marginTop:'.5em'}}>{renderInput()}</div>
    </Modal>
  )

  function renderTextInput() {
    return <Input
      value={editValue}
      style={{ width: '100%' }}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEditValue(event.target.value)}
      disabled={field.length <= 0}
    />
  }

  function renderNumberInput() {
    return <InputNumber
      value={editValue}
      style={{ width: '100%' }}
      step={1/(10**fieldSchema[field].scale)}
      onChange={(value:any) => setEditValue(value)}
      disabled={field.length <= 0}
    />
  }

  function renderDateInput(showTime: boolean) {
    return <DatePicker
      showTime={showTime}
      onChange={(value) => {
        const formattedValue = value ? value.format('YYYY-MM-DD') : value
        setEditValue(formattedValue)
      }}
      style={{ width: '100%' }}
      disabled={field.length <= 0}
      allowClear
      showToday
      renderExtraFooter={() => (
        <div style={{textAlign:'right'}}>
          <Button
            style={{padding:0}}
            type='link'
            onClick={() => setEditValue(null)}>
            Clear
          </Button>
        </div>
      )}
    />
  }

  function renderPicklistInput(multipleMode: boolean) {

    const props = multipleMode ? {mode: 'multiple'} : {}

    return <Select
      {...{props}}
      defaultValue={editValue}
      disabled={field.length <= 0}
      style={{ width: '100%' }}
      onChange={value => setEditValue(value)}
    >
    {fieldSchema[field].picklistValues
      .filter(picklistValue => picklistValue.active)
      .map(picklistValue =>
        <Select.Option key={picklistValue.value} value={picklistValue.value}>
          {picklistValue.label}
        </Select.Option>
      )}
    </Select>
  }

  function renderBooleanInput() {
    return <Checkbox
      disabled={field.length <= 0}
      defaultChecked={false}
      onChange={value => setEditValue(value.target.checked)}
    />
  }

  function renderInput() {
    switch (type) {
      case 'string':
        return renderTextInput()
      case 'textarea':
        return renderTextInput()
      case 'url':
        return renderTextInput()
      case 'double':
        return renderNumberInput()
      case 'currency':
        return renderNumberInput()
      case 'int':
        return renderNumberInput()
      case 'percent':
        return renderNumberInput()
      case 'date':
        return renderDateInput(false)
      case 'datetime':
        return renderDateInput(true)
      case 'picklist':
        return renderPicklistInput(false)
      case 'multipicklist':
        return renderPicklistInput(true)
      case 'phone':
        return renderTextInput()
      case 'boolean':
        return renderBooleanInput()
      default:
        return renderTextInput()
    }
  }
})

export default BulkUpdate