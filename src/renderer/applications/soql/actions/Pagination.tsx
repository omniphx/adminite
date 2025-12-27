import * as React from 'react'
import { Pagination as AntdPagination, TablePaginationConfig } from 'antd'
import { useTabStore } from '../../../stores/useTabStore'
import { useQueryResultStore, selectTabFilteredIds, selectTabTotalSize } from '../../../stores/useQueryResultStore'

interface IPaginationProps {
  tabId: string
}

const Pagination: React.FC<IPaginationProps> = (props: IPaginationProps) => {
  const { tabId } = props

  // Zustand store for query state
  const paginationConfig = useTabStore((state) => state.queries[tabId]?.paginationConfig) ?? { current: 1, pageSize: 25 }
  const setPaginationConfig = useTabStore((state) => state.setPaginationConfig)

  // Zustand for query results (Phase 9)
  const filteredIds = useQueryResultStore(selectTabFilteredIds(tabId))
  const totalSize = useQueryResultStore(selectTabTotalSize(tabId))

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
