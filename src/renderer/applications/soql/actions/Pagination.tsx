import * as React from 'react'
import { Pagination as AntdPagination, TablePaginationConfig } from 'antd'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../store/index'
import { useTabStore } from '../../../stores/useTabStore'

interface IPaginationProps {
  tabId: string
}

const Pagination: React.FC<IPaginationProps> = (props: IPaginationProps) => {
  const { tabId } = props

  // Zustand store
  const paginationConfig = useTabStore((state) => state.queries[tabId]?.paginationConfig) ?? { current: 1, pageSize: 25 }
  const setPaginationConfig = useTabStore((state) => state.setPaginationConfig)
  const filteredIds = useTabStore((state) => state.resultUIState[tabId]?.filteredIds) ?? []

  // Redux still needed for queryResults totalSize (until Phase 9)
  const totalSize: any = useSelector(
    (state: ApplicationState) =>
      state.queryResultsState.byTabId[tabId]?.totalSize ?? 0
  )

  const handleChange = (page: number, pageSize?: number) => {
    setPaginationConfig(tabId, {
      ...paginationConfig,
      current: page,
      pageSize: pageSize
    })
  }

  return (
    <AntdPagination
      size='small'
      current={paginationConfig.current}
      total={filteredIds.length}
      onChange={handleChange}
      showTotal={total => `${total} of ${totalSize}`}
      showSizeChanger={false}
      pageSize={paginationConfig.pageSize}
    />
  )
}

export default Pagination
