import * as React from 'react';
import { Button, Modal, Table } from 'antd';
import { formatQuery, isQueryValid } from 'soql-parser-js';
import { useTabStore } from '../../../stores/useTabStore';
import { useQueryHistoryStore } from '../../../stores/useQueryHistoryStore';

interface IHistoryProps {
  tabId: string;
}

const History: React.FC<IHistoryProps> = (props: IHistoryProps) => {
  const { tabId } = props;

  // Zustand stores
  const setQueryBody = useTabStore((state) => state.setQueryBody);
  const previousQueries = useQueryHistoryStore((state) => state.queries);

  const [visible, setVisible] = React.useState(false);
  const [queryPreview, setQueryPreview] = React.useState<string>(null);

  const showModal = () => {
    setVisible(true);
  };

  const handleSelect = () => {
    setQueryBody(tabId, queryPreview);
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const onQuerySelected = (index: any, selectedRows: any) => {
    if (selectedRows.length < 0) return;
    setQueryPreview(selectedRows[0].query);
  };

  const columns = [{ title: 'Query string', dataIndex: 'query', key: 'query', ellipsis: true }];
  const data = previousQueries
    .slice()
    .reverse()
    .map((previousQueries, index) => {
      return { query: previousQueries, key: index };
    });

  return (
    <div style={{ display: 'inline-block' }}>
      <Button type='link' onClick={showModal}>
        History
      </Button>
      <Modal
        title='Choose Query'
        width='800px'
        onCancel={handleCancel}
        open={visible}
        footer={[
          <Button key='back' onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key='submit' type='primary' onClick={handleSelect}>
            Select
          </Button>,
        ]}
      >
        <Table
          columns={columns}
          dataSource={data}
          rowSelection={{
            type: 'radio',
            onChange: onQuerySelected,
          }}
          pagination={{
            pageSize: 7,
          }}
          size='middle'
        />
        <h4>Preview</h4>
        {renderPreview()}
      </Modal>
    </div>
  );

  function renderPreview() {
    return queryPreview ? (
      <code className='code'>
        {isQueryValid(queryPreview) ? formatQuery(queryPreview) : queryPreview}
      </code>
    ) : (
      <div />
    );
  }
};

export default History;
