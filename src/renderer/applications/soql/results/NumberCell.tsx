import * as React from 'react'
import { InputNumber } from 'antd'
import { Field as DescribeField } from 'jsforce'
import { onFieldChange } from '../../../store/queryResults/actions'
import { ApplicationState } from '../../../store/index'
import { useSelector, useDispatch } from 'react-redux'
import BaseCell from './BaseCell'

interface INumberCellProps {
  tabId: string
  value: any
  record: any
  fieldSchema: DescribeField
}

const NumberCell: React.FC<INumberCellProps> = (props: INumberCellProps) => {
  const dispatch = useDispatch()
  const { tabId, fieldSchema, value, record } = props
  const userInfo: any = useSelector((state: ApplicationState) => state.connectionState.userInfo)

  const [editMode, setEditMode] = React.useState(false)
  const [editValue, setEditValue] = React.useState(value)

  const locale = userInfo ? userInfo.userLocale : 'us_EN'
  const currencyLocale = userInfo ? userInfo.orgDefaultCurrencyLocale : 'us_EN'
  const currency = userInfo ? userInfo.orgDefaultCurrencyIsoCode : 'USD'

  React.useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleChange = (value: any) => {
    setEditValue(value)
  }

  const handleCancelEditMode = () => {
    setEditMode(false)
    setEditValue(value)
  }

  const handleConfirmChange = () => {
    const valueParsed = value
    const editValueParsed = editValue
    setEditMode(false)
    if(editValueParsed === valueParsed) return
    record[fieldSchema.name] = editValueParsed
    record.editFields = [...record.editFields, fieldSchema.name]
    dispatch(onFieldChange(tabId, record))
  }

  const combineProps = { ...props, handleCancelEditMode, handleConfirmChange, editMode, setEditMode, setEditValue, value: formatter(value)}

  return (
    <BaseCell {...combineProps }>
      <InputNumber
        {...{value: editValue}}
        onBlur={handleConfirmChange}
        step={1/(10**fieldSchema.scale)}
        onChange={handleChange}
        size='small'
        autoFocus
      />
    </BaseCell>
  )

  //International number format: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
  function formatter(number: any): string {
    const scaledValue: any = Number(number).toFixed(fieldSchema.scale)
    switch(fieldSchema.type) {
      case 'currency':
        return new Intl.NumberFormat(currencyLocale.replace('_','-'), { style: 'currency', currency }).format(scaledValue)
      case 'percent':
        return `${scaledValue}%`
      case 'int':
        return scaledValue
      default:
        return new Intl.NumberFormat(locale.replace('_','-')).format(scaledValue)
    }
  }
}

export default NumberCell