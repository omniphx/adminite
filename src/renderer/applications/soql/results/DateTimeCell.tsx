import * as React from 'react'
import { DatePicker, Button } from 'antd'
import { Field as DescribeField } from 'jsforce'
import BaseCell from './BaseCell'
import moment from 'moment'
import { useConnectionStore } from '../../../stores/useConnectionStore'
import { useFieldUpdate } from '../../../queries/useQueryExecution'

interface IDateTimeCellProps {
  tabId: string
  value: string
  record: any
  fieldSchema: DescribeField
}

const DateTimeCell: React.FC<IDateTimeCellProps> = (props: IDateTimeCellProps) => {
  const { updateField } = useFieldUpdate()
  const {tabId, fieldSchema, record} = props

  // Get locale from active connection identity (using primitive selector to avoid reference instability)
  const locale = useConnectionStore((state) => {
    const conn = state.activeConnectionId ? state.connections[state.activeConnectionId] : null
    return conn?.locale ? conn.locale.substring(0, 2) : 'us'
  })
  moment.locale(locale)

  const [editMode, setEditMode] = React.useState(false)
  const value = props.value ? moment(props.value).format('MM/DD/YYYY h:mma') : ''
  const [editValue, setEditValue] = React.useState(value)

  React.useEffect(() => {
    setEditValue(moment(value).toISOString())
  }, [value])

  const handleEditChange = (value) => {
    setEditValue(moment(value).toISOString())
  }

  const handleCancelEditMode = () => {
    setEditMode(false)
    setEditValue(moment(value).toISOString())
  }

  const handleConfirmChange = () => {
    setEditMode(false)
    if(moment(editValue).format() === moment(value).format()) return
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
        showTime
        onChange={handleEditChange}
        onOk={handleConfirmChange}
        size='small'
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

export default DateTimeCell
