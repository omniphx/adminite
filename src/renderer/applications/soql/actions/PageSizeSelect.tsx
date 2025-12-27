import * as React from 'react'
import { Select } from 'antd'
import { useTabStore } from '../../../stores/useTabStore'

interface IPageSizeSelectProps {
  tabId: string
}

const PageSizeSelect: React.FC<IPageSizeSelectProps> = (
  props: IPageSizeSelectProps
) => {
  const { tabId } = props

  // Zustand store
  const paginationConfig = useTabStore((state) => state.queries[tabId]?.paginationConfig) ?? { current: 1, pageSize: 25 }
  const setPaginationConfig = useTabStore((state) => state.setPaginationConfig)

  const handleChange = (value: number) => {
    setPaginationConfig(tabId, { ...paginationConfig, pageSize: value })
  }

  return (
    <div>
      <span style={{ marginRight: '1em' }}>Page size</span>
      <Select value={paginationConfig.pageSize} onChange={handleChange}>
        <Select.Option value={25}>25</Select.Option>
        <Select.Option value={50}>50</Select.Option>
        <Select.Option value={100}>100</Select.Option>
        <Select.Option value={200}>200</Select.Option>
      </Select>
    </div>
  )
}

export default PageSizeSelect
