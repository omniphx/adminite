import * as React from 'react'
import { Input } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { ApplicationState } from '../../../store/index'
import { onFilterChange } from '../../../store/queries/actions'

interface ISearchFilterProps {
  tabId: string
}

const SearchFilter: React.FC<ISearchFilterProps> = (props: ISearchFilterProps) => {
  const dispatch = useDispatch()
  const { tabId } = props

  const searchFilter: string = useSelector((state: ApplicationState) => state.queriesState.byTabId[tabId].searchFilter)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(onFilterChange(tabId, event.currentTarget.value))
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