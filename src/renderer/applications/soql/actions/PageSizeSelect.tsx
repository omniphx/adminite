import * as React from 'react'
import { Select, TablePaginationConfig } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { onQueryChange } from '../../../store/queries/actions'
import { ApplicationState } from '../../../store/index'

interface IPageSizeSelectProps {
  tabId: string
}

const PageSizeSelect: React.FC<IPageSizeSelectProps> = (
  props: IPageSizeSelectProps
) => {
  const dispatch = useDispatch()
  const { tabId } = props
  const paginationConfig: TablePaginationConfig = useSelector(
    (state: ApplicationState) =>
      state.queriesState.byTabId[tabId].paginationConfig
  )

  const handleChange = (value: number) => {
    dispatch(
      onQueryChange({
        tabId,
        paginationConfig: { ...paginationConfig, pageSize: value }
      })
    )
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
