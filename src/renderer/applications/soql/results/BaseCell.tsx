import * as React from 'react';
import { EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { Field as DescribeField } from 'jsforce';
import { useKeyboardShortcut } from '../../../hooks/useKeyboardShortcut';

interface IBaseCellProps {
  value: any;
  record: any;
  fieldSchema: DescribeField;
  handleCancelEditMode: any;
  handleConfirmChange: any;
  editMode: boolean;
  setEditMode: any;
  children: any;
}

const BaseCell: React.FC<IBaseCellProps> = (props: IBaseCellProps) => {
  const {
    fieldSchema,
    value,
    record,
    handleCancelEditMode,
    handleConfirmChange,
    editMode,
    setEditMode,
  } = props;

  const showEditMode = () => {
    setEditMode(true);
  };

  const onKeyPress = (key: string, _event: KeyboardEvent) => {
    switch (key) {
      case 'enter':
        handleConfirmChange();
        break;
      case 'tab':
        handleConfirmChange();
        break;
      case 'esc':
        handleCancelEditMode();
        break;
    }
  };

  useKeyboardShortcut({
    keys: ['enter', 'esc', 'tab'],
    onKeyEvent: onKeyPress,
    enabled: editMode,
  });

  return editMode ? props.children : renderNonEditMode();

  function renderNonEditMode() {
    return fieldSchema && fieldSchema.updateable ? (
      <>
        {renderError()}
        &nbsp;{value}&nbsp;
        <a onClick={showEditMode}>
          <EditOutlined className='edit-icon' style={{ fontSize: '.8em' }} />
        </a>
      </>
    ) : (
      <>{value}</>
    );
  }

  function renderError() {
    return record.errorMessage &&
      record.errorMessage.length > 0 &&
      record.editFields.includes(fieldSchema.name) ? (
      <Tooltip title={record.errorMessage}>
        <ExclamationCircleOutlined style={{ fontSize: '.8em', color: '#f5222d' }} />
      </Tooltip>
    ) : (
      <span />
    );
  }
};

export default BaseCell;
