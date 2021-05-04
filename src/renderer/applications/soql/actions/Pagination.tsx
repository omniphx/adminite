import * as React from 'react'
import { Pagination as AntdPagination, TablePaginationConfig } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { onQueryChange } from '../../../store/queries/actions'
import { ApplicationState } from '../../../store/index'

interface IPaginationProps {
  tabId: string
}

const Pagination: React.FC<IPaginationProps> = (props: IPaginationProps) => {
  const dispatch = useDispatch()
  const { tabId } = props
  const paginationConfig: TablePaginationConfig = useSelector(
    (state: ApplicationState) =>
      state.queriesState.byTabId[tabId].paginationConfig
  )
  const totalSize: any = useSelector(
    (state: ApplicationState) =>
      state.queryResultsState.byTabId[tabId].totalSize
  )
  const filteredIds: string[] = useSelector(
    (state: ApplicationState) =>
      state.queryResultsState.byTabId[tabId].filteredIds
  )

  const handleChange = (page: number, pageSize?: number) => {
    dispatch(
      onQueryChange({
        tabId,
        paginationConfig: {
          ...paginationConfig,
          current: page,
          pageSize: pageSize
        }
      })
    )
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
