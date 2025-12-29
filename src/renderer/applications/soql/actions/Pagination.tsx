import * as React from 'react'
import { Pagination as AntdPagination, TablePaginationConfig } from 'antd'
import { useShallow } from 'zustand/react/shallow'
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

  // Zustand for query results (Phase 9) - memoize selectors to avoid infinite loop
  const filteredIdsSelector = React.useCallback(selectTabFilteredIds(tabId), [tabId])
  const totalSizeSelector = React.useCallback(selectTabTotalSize(tabId), [tabId])
  const filteredIds = useQueryResultStore(useShallow(filteredIdsSelector))
  const totalSize = useQueryResultStore(totalSizeSelector)

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
