import * as React from 'react'
import { Select, Tooltip } from 'antd'
import { Field as DescribeField } from 'jsforce'
import { onFieldChange } from '../../../store/queryResults/actions'
import BaseCell from './BaseCell'
import { useDispatch } from 'react-redux'

interface IPicklistCellProps {
  tabId: string
  value: string
  record: any
  fieldSchema: DescribeField
}

const PicklistCell: React.FC<IPicklistCellProps> = (props: IPicklistCellProps) => {
  const dispatch = useDispatch()
  const { tabId, fieldSchema, value, record } = props

  const [editMode, setEditMode] = React.useState(false)

  const handleChange = (value) => {
    record[fieldSchema.name] = value
    record.editFields = [...record.editFields, fieldSchema.name]
    dispatch(onFieldChange(tabId, record))
    setEditMode(false)
  }

  const handleCancelEditMode = () => {
    setEditMode(false)
  }

  const combineProps = { ...props, handleCancelEditMode, handleConfirmChange: handleChange, editMode, setEditMode }

  return (
    <BaseCell {...combineProps }>
      <Select
        defaultValue={value}
        style={{ width: '100%' }}
        onBlur={handleCancelEditMode}
        onChange={handleChange}
        size='small'
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

export default PicklistCell