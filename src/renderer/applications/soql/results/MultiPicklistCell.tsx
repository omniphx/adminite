import * as React from 'react'
import { Select, Tooltip, Tag } from 'antd'
import { Field as DescribeField } from 'jsforce'
import { onFieldChange } from '../../../store/queryResults/actions'
import BaseCell from './BaseCell'
import { useDispatch } from 'react-redux'

interface IMultiPicklistCellProps {
  tabId: string
  value: string
  record: any
  fieldSchema: DescribeField
}

const MultiPicklistCell: React.FC<IMultiPicklistCellProps> = (props: IMultiPicklistCellProps) => {
  const dispatch = useDispatch()
  const { tabId, fieldSchema, value, record } = props

  const [editMode, setEditMode] = React.useState(false)
  const [editValue, setEditValue] = React.useState<string[]>([])

  React.useEffect(() => {
    setEditValue(value ? value.split(';') : [])
  }, [value])

  const tags = value ? value.split(';').map(picklist => <Tag color='#108ee9' key={picklist}>{picklist}</Tag>) : []
  const renderedValue = <span>{tags}</span>

  const handleChange = (value) => {
    setEditValue(value)
  }

  const handleConfirmChange = () => {
    record[fieldSchema.name] = editValue.join(';')
    record.editFields = [...record.editFields, fieldSchema.name]
    dispatch(onFieldChange(tabId, record))
    setEditMode(false)
  }

  const handleCancelEditMode = () => {
    setEditValue(value ? value.split(';') : [])
    setEditMode(false)
  }

  const combineProps = { ...props, handleCancelEditMode, handleConfirmChange, editMode, setEditMode, value:renderedValue}

  return (
    <BaseCell {...combineProps }>
      <Select
        defaultValue={editValue}
        mode='multiple'
        style={{ width: '100%' }}
        onBlur={handleConfirmChange}
        onChange={handleChange}
        size='small'
        open
        autoFocus
      >
        {renderOptions()}
      </Select>
    </BaseCell>
  )

  function renderOptions() {
    return fieldSchema.picklistValues
      .filter(picklistValue => picklistValue.active)
      .map(picklistValue =>
        <Select.Option key={picklistValue.value} value={picklistValue.value}>
          <Tooltip placement='topLeft' title={picklistValue.label}>
            <span>{picklistValue.value}</span>
          </Tooltip>
        </Select.Option>
      )
  }
}

export default MultiPicklistCell