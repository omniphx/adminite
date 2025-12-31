import * as React from 'react';
import { DatePicker, Button } from 'antd';
import { Field as DescribeField } from 'jsforce';
import BaseCell from './BaseCell';
import { useConnectionStore } from '../../../stores/useConnectionStore';
import { useFieldUpdate } from '../../../queries/useQueryExecution';
import { getDateFnsLocale, formatDate, formatDateForStorage } from '../../../utils/dateFormatting';
import { DateFormatMode } from '../../../stores/useTabStore';

interface IDateCellProps {
  tabId: string;
  value: string;
  record: any;
  fieldSchema: DescribeField;
  dateFormat?: DateFormatMode;
}

const DateCell: React.FC<IDateCellProps> = (props: IDateCellProps) => {
  const { updateField } = useFieldUpdate();
  const { tabId, fieldSchema, record, dateFormat = 'human' } = props;
  // Get locale from userInfo (SOAP getUserInfo call) - userLocale is in format like 'en_US'
  const locale = useConnectionStore((state) => {
    const userLocale = (state.activeConnection.userInfo as any)?.userLocale;
    return getDateFnsLocale(userLocale);
  });

  const [editMode, setEditMode] = React.useState(false);
  const value = props.value
    ? dateFormat === 'iso'
      ? props.value
      : formatDate(props.value, locale)
    : '';
  const [editValue, setEditValue] = React.useState(value);

  const handleEditChange = (dateValue: any) => {
    const formattedValue = dateValue ? formatDateForStorage(dateValue.toDate()) : null;
    setEditValue(formattedValue || '');
    setEditMode(false);
    // Compare the storage format values to detect actual changes
    if (editValue === formattedValue) return;
    record[fieldSchema.name] = formattedValue;
    record.editFields = [...record.editFields, fieldSchema.name];
    updateField(tabId, record);
  };

  const handleCancelEditMode = () => {
    setEditMode(false);
    setEditValue(value);
  };

  const handleConfirmChange = () => {
    setEditMode(false);
    if (editValue === value) return;
    record[fieldSchema.name] = editValue;
    record.editFields = [...record.editFields, fieldSchema.name];
    updateField(tabId, record);
  };

  const handleClear = () => {
    setEditMode(false);
    record[fieldSchema.name] = null;
    record.editFields = [...record.editFields, fieldSchema.name];
    updateField(tabId, record);
  };

  const combineProps = {
    ...props,
    handleCancelEditMode,
    handleConfirmChange,
    editMode,
    setEditMode,
    setEditValue,
    value,
  };

  return (
    <BaseCell {...combineProps}>
      <DatePicker
        onChange={handleEditChange}
        size='small'
        allowClear
        showToday
        autoFocus
        open
        renderExtraFooter={() => (
          <div style={{ textAlign: 'right' }}>
            <Button style={{ padding: 0 }} type='link' onClick={handleClear}>
              Clear
            </Button>
          </div>
        )}
      />
    </BaseCell>
  );
};

export default DateCell;
