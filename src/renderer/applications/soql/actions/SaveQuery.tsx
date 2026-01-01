import * as React from 'react';
import { Button, Modal, Input } from 'antd';
import { isQueryValid, parseQuery } from 'soql-parser-js';
import { useTabStore, SoqlQuery } from '../../../stores/useTabStore';
import { useSavedQueryStore } from '../../../stores/useSavedQueryStore';

interface ISaveQueryProps {
  tabId: string;
}

const SaveQuery: React.FC<ISaveQueryProps> = (props: ISaveQueryProps) => {
  const { tabId } = props;

  // Zustand stores
  const query: SoqlQuery = useTabStore((state) => state.queries[tabId]?.query) ?? { body: '' };
  const setQuery = useTabStore((state) => state.setQuery);
  const createQuery = useSavedQueryStore((state) => state.createQuery);
  const updateQuery = useSavedQueryStore((state) => state.updateQuery);

  const [visible, setVisible] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');

  const showModal = () => {
    setVisible(true);
  };

  const handleSave = () => {
    try {
      const { name, body } = query;
      const sobject = isQueryValid(body) ? parseQuery(body).sObject : 'Invalid';
      const result = createQuery({ name: name || '', body, sobject });
      setVisible(false);
      setQuery(tabId, { query: result });
      setSaveError('');
    } catch (error) {
      console.error(error);
      setSaveError(String(error));
    }
  };

  const handleUpdate = () => {
    try {
      const { id, name, body } = query;
      if (!id) return;
      const sobject = isQueryValid(body) ? parseQuery(body).sObject : 'Invalid';
      const result = updateQuery(id, { name: name || '', body, sobject });
      setVisible(false);
      setQuery(tabId, { query: result });
      setSaveError('');
    } catch (error) {
      console.error(error);
      setSaveError(String(error));
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(tabId, { query: { ...query, name: event.target.value } });
  };

  const saveActions = [
    <Button key='back' onClick={handleCancel}>
      Cancel
    </Button>,
  ];

  if (query.id) {
    saveActions.push(
      <Button key='save' type='primary' onClick={handleUpdate}>
        Update
      </Button>
    );
  }

  saveActions.push(
    <Button key='saveAs' type='primary' onClick={handleSave}>
      {query.id ? 'Save As' : 'Save'}
    </Button>
  );

  return (
    <div style={{ display: 'inline-block' }}>
      <Button type='link' onClick={showModal} disabled={query.body.length <= 0}>
        Save Query
      </Button>
      <Modal title='Save Query' open={visible} onCancel={handleCancel} footer={saveActions}>
        <Input value={query.name} onChange={handleNameChange} />
        {saveError}
      </Modal>
    </div>
  );
};

export default SaveQuery;
