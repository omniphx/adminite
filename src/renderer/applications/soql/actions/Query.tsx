import * as React from 'react';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { Query as ParsedQuery, isQueryValid, parseQuery } from 'soql-parser-js';
import { useTabStore } from '../../../stores/useTabStore';
import { useQueryHistoryStore } from '../../../stores/useQueryHistoryStore';
import { useQueryResultStore, selectTabPending } from '../../../stores/useQueryResultStore';
import { useQueryExecution, useQueryCancel } from '../../../queries/useQueryExecution';

interface IQueryProps {
  tabId: string;
}

const Query: React.FC<IQueryProps> = (props: IQueryProps) => {
  const { tabId } = props;

  // Zustand stores
  const queryState = useTabStore((state) => state.queries[tabId]);
  const setParsedQuery = useTabStore((state) => state.setParsedQuery);
  const renameTab = useTabStore((state) => state.renameTab);
  const setQuerySObjectName = useTabStore((state) => state.setQuerySObjectName);
  const setResultSObjectName = useTabStore((state) => state.setResultSObjectName);
  const query = queryState?.query ?? { body: '' };
  const includeDeleted = queryState?.includeDeleted ?? false;

  const previousQueries = useQueryHistoryStore((state) => state.queries);
  const addToHistory = useQueryHistoryStore((state) => state.addQuery);

  // Zustand for query results pending state (Phase 9) - memoize selector to avoid infinite loop
  const pendingSelector = React.useCallback(selectTabPending(tabId), [tabId]);
  const pending = useQueryResultStore(pendingSelector);

  // TanStack Query mutation for query execution (Phase 9)
  const queryExecution = useQueryExecution();
  const { cancel } = useQueryCancel();

  const handleQuery = () => {
    if (isQueryValid(query.body)) {
      const parsedQuery: ParsedQuery = parseQuery(query.body);
      setParsedQuery(tabId, parsedQuery);
      renameTab(tabId, parsedQuery.sObject);
      // Zustand for sObject names (Phase 6)
      setResultSObjectName(tabId, parsedQuery.sObject);
      setQuerySObjectName(tabId, parsedQuery.sObject);
    }
    // TanStack Query mutation for query execution (Phase 9)
    queryExecution.mutate({ tabId, queryString: query.body, includeDeleted });
    if (previousQueries[previousQueries.length - 1] !== query.body) addToHistory(query.body);
  };

  return (
    <Space.Compact className='button-style'>
      <Button
        type='primary'
        style={{ borderRadius: pending ? 0 : 4 }}
        loading={pending}
        disabled={!query.body || query.body.length <= 0}
        onClick={handleQuery}
      >
        Query
      </Button>
      <Button
        style={{ display: pending ? '' : 'none' }}
        onClick={() => cancel(tabId)}
        icon={<CloseCircleOutlined />}
      />
    </Space.Compact>
  );
};

export default Query;
