import * as React from 'react'
import { Input } from 'antd'
import { Field as DescribeField } from 'jsforce'
import { onFieldChange } from '../../../store/queryResults/actions'
import BaseCell from './BaseCell'
import { shell } from 'electron'
import { useDispatch } from 'react-redux'

interface ITextCellProps {
  tabId: string
  value: string
  record: any
  fieldSchema: DescribeField
}

const TextCell: React.FC<ITextCellProps> = (props: ITextCellProps) => {
  const dispatch = useDispatch()
  const [editMode, setEditMode] = React.useState(false)
  const { tabId, fieldSchema, value, record } = props
  const [editValue, setEditValue] = React.useState(value)

  const renderedValue = fieldSchema.type === 'url' ? <a href='#' onClick={() => shell.openExternal(value.indexOf('http') < 0 ? `https://${value}`: value)}>{value}</a> : value

  React.useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(event.target.value)
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
    dispatch(onFieldChange(tabId, record))
  }

  const combineProps = { ...props, handleCancelEditMode, handleConfirmChange, editMode, setEditMode, setEditValue, value: renderedValue}

  return (
    <BaseCell {...combineProps }>
      <Input
        {...{value: editValue}}
        onChange={handleEditChange}
        onBlur={handleConfirmChange}
        size='small'
        autoFocus
      />
    </BaseCell>
  )
}

export default TextCell