import * as React from 'react';
import { DatePicker, Button } from 'antd';
import { Field as DescribeField } from 'jsforce';
import BaseCell from './BaseCell';
import { parseISO } from 'date-fns';
import { useConnectionStore } from '../../../stores/useConnectionStore';
import { useFieldUpdate } from '../../../queries/useQueryExecution';
import { getDateFnsLocale, formatDateTime } from '../../../utils/dateFormatting';
import { DateFormatMode } from '../../../stores/useTabStore';

interface IDateTimeCellProps {
  tabId: string;
  value: string;
  record: any;
  fieldSchema: DescribeField;
  dateFormat?: DateFormatMode;
}

const DateTimeCell: React.FC<IDateTimeCellProps> = (props: IDateTimeCellProps) => {
  const { updateField } = useFieldUpdate();
  const { tabId, fieldSchema, record, dateFormat = 'human' } = props;

  // Get locale from userInfo (SOAP getUserInfo call) - userLocale is in format like 'en_US'
  const locale = useConnectionStore((state) => {
    const userLocale = (state.activeConnection.userInfo as any)?.userLocale;
    return getDateFnsLocale(userLocale);
  });

  const [editMode, setEditMode] = React.useState(false);
  const displayValue = props.value
    ? dateFormat === 'iso'
      ? props.value
      : formatDateTime(props.value, locale)
    : '';
  // Store the ISO string for comparison and submission
  const [editValue, setEditValue] = React.useState(props.value || '');

  React.useEffect(() => {
    setEditValue(props.value || '');
  }, [props.value]);

  const handleEditChange = (dateValue: any) => {
    if (dateValue) {
      setEditValue(dateValue.toDate().toISOString());
    }
  };

  const handleCancelEditMode = () => {
    setEditMode(false);
    setEditValue(props.value || '');
  };

  const handleConfirmChange = () => {
    setEditMode(false);
    // Compare ISO strings to detect actual changes
    const originalDate = props.value ? parseISO(props.value).getTime() : null;
    const editDate = editValue ? parseISO(editValue).getTime() : null;
    if (originalDate === editDate) return;
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
    value: displayValue,
  };

  return (
    <BaseCell {...combineProps}>
      <DatePicker
        showTime
        onChange={handleEditChange}
        onOk={handleConfirmChange}
        size='small'
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

export default DateTimeCell;
