import * as React from 'react';
import { Input } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { useTabStore } from '../../../stores/useTabStore';
import { useQueryResultStore, selectTabData } from '../../../stores/useQueryResultStore';
import { filterIds } from '../../../../helpers/utils';

interface ISearchFilterProps {
  tabId: string;
}

const SearchFilter: React.FC<ISearchFilterProps> = (props: ISearchFilterProps) => {
  const { tabId } = props;

  // Zustand store for query state
  const searchFilter = useTabStore((state) => state.queries[tabId]?.searchFilter ?? '');
  const setSearchFilter = useTabStore((state) => state.setSearchFilter);

  // Zustand for query result data (Phase 9) - memoize selector
  const dataSelector = React.useMemo(() => selectTabData(tabId), [tabId]);
  const data = useQueryResultStore(useShallow(dataSelector));
  const setFilteredIds = useQueryResultStore((state) => state.setFilteredIds);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filter = event.currentTarget.value;
    setSearchFilter(tabId, filter);
    // Apply filter to data and update filteredIds in query result store
    if (data) {
      const filteredIdsList = filterIds(data, filter);
      setFilteredIds(tabId, filteredIdsList);
    }
  };

  return (
    <Input.Search
      style={{ marginLeft: '.5em', width: 'auto' }}
      placeholder='Filter results'
      value={searchFilter}
      onChange={handleChange}
    />
  );
};

export default SearchFilter;
