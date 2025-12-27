import * as React from 'react'
import { DatePicker, Button } from 'antd'
import { Field as DescribeField } from 'jsforce'
import BaseCell from './BaseCell'
import moment from 'moment'
import { useConnectionStore, getActiveConnection } from '../../../stores/useConnectionStore'
import { useFieldUpdate } from '../../../queries/useQueryExecution'

interface IDateCellProps {
  tabId: string
  value: string
  record: any
  fieldSchema: DescribeField
}

const DateCell: React.FC<IDateCellProps> = (props: IDateCellProps) => {
  const { updateField } = useFieldUpdate()
  const { tabId, fieldSchema, record } = props
  // Get locale from active connection identity (Phase 4)
  const activeConnection = useConnectionStore(getActiveConnection)
  const locale = activeConnection?.locale ? activeConnection.locale.substring(0,2) : 'us'
  moment.locale(locale)

  const [editMode, setEditMode] = React.useState(false)
  const value = props.value ? moment(props.value).format('MM/DD/YYYY') : ''
  const [editValue, setEditValue] = React.useState(value)

  const handleEditChange = (value) => {
    const formattedValue = value ? value.format('YYYY-MM-DD') : value
    setEditValue(formattedValue)
    setEditMode(false)
    if(moment(editValue).format() === moment(value).format()) return
    record[fieldSchema.name] = formattedValue
    record.editFields = [...record.editFields, fieldSchema.name]
    updateField(tabId, record)
  }

  const handleCancelEditMode = () => {
    setEditMode(false)
    setEditValue(value)
  }

  const handleConfirmChange = () => {
    setEditMode(false)
    if(editValue === value) return
    record[fieldSchema.name] = editValue
    record.editFields = [...record.editFields, fieldSchema.name]
    updateField(tabId, record)
  }

  const handleClear = () => {
    setEditMode(false)
    record[fieldSchema.name] = null
    record.editFields = [...record.editFields, fieldSchema.name]
    updateField(tabId, record)
  }

  const combineProps = { ...props, handleCancelEditMode, handleConfirmChange, editMode, setEditMode, setEditValue, value}

  return (
    <BaseCell {...combineProps }>
      <DatePicker
        onChange={handleEditChange}
        size='small'
        allowClear
        showToday
        autoFocus
        open
        renderExtraFooter={() => (
          <div style={{textAlign:'right'}}>
            <Button
              style={{padding:0}}
              type='link'
              onClick={handleClear}>
              Clear
            </Button>
          </div>
        )}
      />
    </BaseCell>
  )
}

export default DateCell
