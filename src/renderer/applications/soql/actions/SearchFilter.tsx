import * as React from 'react'
import { Input } from 'antd'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../store/index'
import { useTabStore } from '../../../stores/useTabStore'
import { filterIds } from '../../../../helpers/utils'

interface ISearchFilterProps {
  tabId: string
}

const SearchFilter: React.FC<ISearchFilterProps> = (props: ISearchFilterProps) => {
  const { tabId } = props

  // Zustand store
  const searchFilter = useTabStore((state) => state.queries[tabId]?.searchFilter ?? '')
  const setSearchFilter = useTabStore((state) => state.setSearchFilter)
  const setFilteredIds = useTabStore((state) => state.setFilteredIds)

  // Redux still needed for query result data (until Phase 9)
  const data = useSelector((state: ApplicationState) => state.queryResultsState.byTabId[tabId]?.data)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filter = event.currentTarget.value
    setSearchFilter(tabId, filter)
    // Apply filter to data and update filteredIds
    if (data) {
      const filteredIds = filterIds(data, filter)
      setFilteredIds(tabId, filteredIds)
    }
  }

  return (
    <Input.Search
      style={{ marginLeft: '.5em', width: 'auto' }}
      placeholder='Filter results'
      value={searchFilter}
      onChange={handleChange}
    />
  )
}

export default SearchFilter