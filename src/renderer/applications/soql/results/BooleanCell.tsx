import * as React from 'react';
import { Checkbox } from 'antd';
import { Field as DescribeField } from 'jsforce';
import BaseCell from './BaseCell';
import { useFieldUpdate } from '../../../queries/useQueryExecution';

interface IBooleanCellProps {
  tabId: string;
  value: boolean;
  record: any;
  fieldSchema: DescribeField;
}

const BooleanCell: React.FC<IBooleanCellProps> = (props: IBooleanCellProps) => {
  const { updateField } = useFieldUpdate();
  const [editMode, setEditMode] = React.useState(false);
  const { tabId, fieldSchema, value, record } = props;

  const handleChange = (value) => {
    record[fieldSchema.name] = value.target.checked;
    record.editFields = [...new Set([...record.editFields, fieldSchema.name])];
    updateField(tabId, record);
    setEditMode(false);
  };

  const handleCancelEditMode = () => {
    setEditMode(false);
  };

  const combineProps = {
    ...props,
    handleCancelEditMode,
    handleConfirmChange: handleChange,
    editMode,
    setEditMode,
    value: `${value}`,
  };

  return (
    <BaseCell {...combineProps}>
      <Checkbox defaultChecked={value} onChange={handleChange} autoFocus />
    </BaseCell>
  );
};

export default BooleanCell;
