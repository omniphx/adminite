import * as React from 'react';
import { DeleteTwoTone } from '@ant-design/icons';
import { Button, Modal, Table, Input } from 'antd';
import { formatQuery, isQueryValid } from 'soql-parser-js';
import { useTabStore, SoqlQuery } from '../../../stores/useTabStore';
import { useSavedQueryStore, useSavedQueriesArray, SavedQuery } from '../../../stores/useSavedQueryStore';
const { confirm } = Modal;

interface ILoadQueryProps {
  tabId: string;
}

const LoadQueries: React.FC<ILoadQueryProps> = (props: ILoadQueryProps) => {
  const { tabId } = props;

  // Zustand stores
  const query: SoqlQuery = useTabStore((state) => state.queries[tabId]?.query) ?? { body: '' };
  const setQuery = useTabStore((state) => state.setQuery);
  const queries = useSavedQueriesArray();
  const deleteQuery = useSavedQueryStore((state) => state.deleteQuery);

  const [showModal, setShowModal] = React.useState(false);
  const [searchFilter, setSearchFilter] = React.useState('');
  const [queryPreview, setQueryPreview] = React.useState<SavedQuery | null>(null);

  React.useEffect(() => {
    setSearchFilter('');
  }, [showModal]);

  const onLoadQuery = () => {
    setShowModal(true);
  };

  const handleSelect = () => {
    if (queryPreview) {
      setQuery(tabId, { query: queryPreview });
    }
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const onChange = (_index: React.Key[], selectedRows: SavedQuery[]) => {
    if (selectedRows.length <= 0) return;
    setQueryPreview(selectedRows[0]);
  };

  const handleDelete = (queryRecordId: string) => {
    try {
      deleteQuery(queryRecordId);
      if (query.id === queryRecordId) {
        // Unset query Id
        setQuery(tabId, { query: { ...query, id: undefined, name: undefined } });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const showDeleteConfirm = (queryRecord: SavedQuery) => {
    confirm({
      title: `Are you sure you want to delete ${queryRecord.name}?`,
      okText: 'Yes',
      okButtonProps: { danger: true },
      cancelText: 'No',
      onOk() {
        handleDelete(queryRecord.id);
      },
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        } else if (nameA > nameB) {
          return 1;
        } else {
          return 0;
        }
      },
    },
    {
      title: 'SObject',
      dataIndex: 'sobject',
      key: 'sobject',
      sorter: (a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        } else if (nameA > nameB) {
          return 1;
        } else {
          return 0;
        }
      },
    },
    {
      title: '',
      dataIndex: '',
      key: 'action',
      render: (text, record, index) => {
        return (
          <span>
            <DeleteTwoTone
              style={{ float: 'right', fontSize: '1em' }}
              twoToneColor='#595959'
              onClick={() => showDeleteConfirm(record)}
            />
          </span>
        );
      },
    },
  ];

  return (
    <div style={{ display: 'inline-block' }}>
      <Button type='link' onClick={onLoadQuery}>
        Load Query
      </Button>
      <Modal
        title='Choose Query'
        width='800px'
        onCancel={handleCancel}
        open={showModal}
        footer={[
          <Button key='back' onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key='submit' type='primary' onClick={handleSelect}>
            Select
          </Button>,
        ]}
      >
        <Input.Search
          placeholder='Filter queries'
          style={{ marginBottom: 7 }}
          value={searchFilter}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSearchFilter(event.currentTarget.value)
          }
        />
        <Table
          columns={columns}
          dataSource={queries
            .filter((item) => {
              if (searchFilter.length <= 0) return true;
              const nameMatch = item.name.toLowerCase().indexOf(searchFilter.toLowerCase()) >= 0;
              const objectMatch =
                item.sobject.toLowerCase().indexOf(searchFilter.toLowerCase()) >= 0;
              return nameMatch || objectMatch;
            })
            .map((item) => {
              return { ...item, key: item.id };
            })}
          rowSelection={{
            type: 'radio',
            onChange,
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
        <pre>
          {isQueryValid(queryPreview.body) ? formatQuery(queryPreview.body) : queryPreview.body}
        </pre>
      </code>
    ) : (
      <div />
    );
  }
};

export default LoadQueries;
