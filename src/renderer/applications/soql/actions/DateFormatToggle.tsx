import * as React from 'react'
import { Switch } from 'antd'
import { useTabStore, DateFormatMode } from '../../../stores/useTabStore'

interface IDateFormatToggleProps {
  tabId: string
}

const DateFormatToggle: React.FC<IDateFormatToggleProps> = (
  props: IDateFormatToggleProps
) => {
  const { tabId } = props

  const dateFormat = useTabStore((state) => state.queries[tabId]?.dateFormat) ?? 'human'
  const setDateFormat = useTabStore((state) => state.setDateFormat)

  const handleChange = (checked: boolean) => {
    const format: DateFormatMode = checked ? 'iso' : 'human'
    setDateFormat(tabId, format)
  }

  return (
    <div style={{ display: 'inline-block', marginRight: '1em' }}>
      <span style={{ marginRight: '0.5em' }}>ISO dates</span>
      <Switch
        size='small'
        checked={dateFormat === 'iso'}
        onChange={handleChange}
      />
    </div>
  )
}

export default DateFormatToggle
