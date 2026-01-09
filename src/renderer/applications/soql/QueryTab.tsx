import * as React from 'react';
import { Button, Row, Col, Flex } from 'antd';
import QueryEditor from './QueryEditor';
import SearchFilter from './actions/SearchFilter';
import SaveQuery from './actions/SaveQuery';
import LoadQueries from './actions/LoadQueries';
import Export from './actions/Export';
import PageSizeSelect from './actions/PageSizeSelect';
import DateFormatToggle from './actions/DateFormatToggle';
import Pagination from './actions/Pagination';
import QueryOptions from './actions/QueryOptions';
import QueryResult from './results/QueryResult';
import Query from './actions/Query';
import SelectContext from '../SelectContext';
import { DescribeGlobalSObjectResult } from '../../queries/useSchemaQuery';
import History from './actions/History';
import QueryValidator from './QueryValidator';
import { formatQuery } from 'soql-parser-js';
import SaveEdits from './actions/SaveEdits';
import FillFields from './actions/FillFields';
import BulkActions from './actions/BulkActions';
import { useTabStore } from '../../stores/useTabStore';
import { useSObjectList } from '../../queries/useSchemaQuery';

interface IQueryTabProps {
  tabId: string;
}

const QueryTab = React.memo((props: IQueryTabProps) => {
  const { tabId } = props;

  // Zustand store for query state
  const queryState = useTabStore((state) => state.queries[tabId]);
  const setQuery = useTabStore((state) => state.setQuery);
  const setQuerySObjectName = useTabStore((state) => state.setQuerySObjectName);
  const toolingMode = queryState?.toolingMode ?? false;
  const query = queryState?.query ?? { body: '' };
  const querySObjectName = queryState?.querySObjectName ?? '';

  // TanStack Query for schema (Phase 5)
  const { sobjects: sObjectList } = useSObjectList(toolingMode);

  const sobjects: DescribeGlobalSObjectResult[] = getQueryableSObjects(sObjectList ?? []);

  //Props
  const childProps = { tabId };

  const handleChange = (sObjectName: string) => {
    setQuerySObjectName(tabId, sObjectName);
  };

  const formatConfig = {
    fieldMaxLineLength: 1000000,
    numIndent: 1,
    fieldSubqueryParensOnOwnLine: true,
    whereClauseOperatorsIndented: false,
  };

  const handleFormat = () => {
    setQuery(tabId, {
      query: { ...query, body: formatQuery(query.body, formatConfig) },
    });
  };

  return (
    <Flex vertical={true} gap={5}>
      <Flex align='middle'>
        <SelectContext {...{ sobjects, handleChange }} sobject={querySObjectName} loading={false} />
        <Button type='link' onClick={handleFormat} disabled={query.body.length <= 0}>
          Format
        </Button>
        <FillFields {...childProps} />
        <SaveQuery {...childProps} />
        <LoadQueries {...childProps} />
        <History {...childProps} />
      </Flex>
      <Row>
        <Col span={24}>
          <QueryValidator {...childProps} />
          <QueryEditor {...childProps} />
        </Col>
      </Row>
      <Flex justify='space-between' align='center'>
        <Flex align='center'>
          <Query {...childProps} />
          <QueryOptions {...childProps} />
          <SaveEdits {...childProps} />
          <Export {...childProps} />
        </Flex>
        <Flex justify='end' align='center'>
          <DateFormatToggle {...childProps} />
          <PageSizeSelect {...childProps} />
        </Flex>
      </Flex>
      <Flex justify='space-between' align='center'>
        <Flex align='center'>
          <BulkActions {...childProps} />
          <SearchFilter {...childProps} />
        </Flex>
        <Pagination {...childProps} />
      </Flex>
      <QueryResult {...childProps} />
    </Flex>
  );

  function getQueryableSObjects(sobjects: DescribeGlobalSObjectResult[]) {
    return sobjects.filter((sobject) => {
      return sobject.queryable;
    });
  }
});

export default QueryTab;
