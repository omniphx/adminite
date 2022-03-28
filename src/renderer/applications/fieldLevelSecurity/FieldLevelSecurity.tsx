import * as React from 'react';
import { ApplicationState } from '../../store/index';
import { onFieldPermissionChange } from '../../store/fieldPermission/actions';
import { Table, Checkbox, Tooltip } from 'antd';
import Column from 'antd/lib/table/Column';

import { useDispatch, useSelector } from 'react-redux';

const FieldLevelSecurity: React.FC = () => {
  const dispatch = useDispatch();

  const sobjectName = useSelector(
    (state: ApplicationState) => state.permissionState.sobjectName
  );
  const fields = useSelector(
    (state: ApplicationState) => state.permissionState.fields
  );
  const fieldPermissions = useSelector(
    (state: ApplicationState) => state.fieldPermissionState.fieldPermissions
  );
  const permissionIds = useSelector(
    (state: ApplicationState) => state.permissionState.permissionIds
  );
  const permissions = useSelector(
    (state: ApplicationState) => state.permissionState.permissions
  );
  const filter = useSelector(
    (state: ApplicationState) => state.permissionState.filter
  );

  const filteredPermissions = permissions
    .filter(permission => permissionIds.includes(permission.key))
    .map(permission => {
      permission.name = permission.IsOwnedByProfile
        ? permission.Profile.Name
        : permission.Name;
      permission.key = permission.Id;

      return permission;
    });

  const filteredFields = fields
    .filter(field => {
      //Component fields such as Address Street should be omitted even though they are permissionable
      return field.IsPermissionable && !field.IsComponent;
    })
    .filter(field => {
      if (!filter || filter.length <= 0) return true;
      const nameMatch =
        field.Name.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
      const labelMatch =
        field.Label.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
      return nameMatch || labelMatch;
    });

  const fieldWrappers = getFieldWrappers(
    filteredFields,
    filteredPermissions,
    fieldPermissions
  );

  const handleEditCellClick = (record, permissionKey) => {
    record[`edit_${permissionKey}`] = !record[`edit_${permissionKey}`];
    handleEditFieldPermissionChange(record, permissionKey);
  };

  const handleReadCellClick = (record, permissionKey) => {
    record[`read_${permissionKey}`] = !record[`read_${permissionKey}`];
    handleReadFieldPermissionChange(record, permissionKey);
  };

  const handleEditAll = (value, permissionKey) => {
    fieldWrappers.forEach(field => {
      if (field.key === 'all') return;
      if (!field.IsUpdatable && field.DataType !== 'address') {
        if (!value) return;
        field[`read_${permissionKey}`] = value;
        handleReadFieldPermissionChange(field, permissionKey);
      } else {
        field[`edit_${permissionKey}`] = value;
        handleEditFieldPermissionChange(field, permissionKey);
      }
    });
  };

  const handleReadAll = (value, permissionKey) => {
    fieldWrappers.forEach(field => {
      if (field.key === 'all') return;
      field[`read_${permissionKey}`] = value;
      handleReadFieldPermissionChange(field, permissionKey);
    });
  };

  const handleReadAllByField = (value, row) => {
    filteredPermissions.forEach(permission => {
      row[`read_${permission.key}`] = value;
      handleReadFieldPermissionChange(row, permission.key);
    });
  };

  const handleEditAllByField = (value, row) => {
    filteredPermissions.forEach(permission => {
      row[`edit_${permission.key}`] = value;
      handleEditFieldPermissionChange(row, permission.key);
    });
  };

  const handleEditFieldPermissionChange = (record, permissionKey) => {
    if (record[`edit_${permissionKey}`] === true) {
      record[`read_${permissionKey}`] = true;
    }

    handleFieldPermissionChange(record, permissionKey);
  };

  const handleReadFieldPermissionChange = (record, permissionKey) => {
    if (record[`read_${permissionKey}`] === false) {
      record[`edit_${permissionKey}`] = false;
    }

    handleFieldPermissionChange(record, permissionKey);
  };

  const handleFieldPermissionChange = (record, permissionKey) => {
    const fieldLevelPermission = {
      Field: `${sobjectName}.${record.key.replace('__r', '__c')}`,
      PermissionsRead: record[`read_${permissionKey}`],
      PermissionsEdit: record[`edit_${permissionKey}`],
      SobjectType: sobjectName,
      ParentId: permissionKey
    };

    const salesforceId = record[`id_${permissionKey}`];

    if (salesforceId) {
      fieldLevelPermission['Id'] = salesforceId;
      dispatch(
        onFieldPermissionChange({
          [salesforceId]: fieldLevelPermission
        })
      );
    } else {
      const { Field } = fieldLevelPermission;
      const fieldPermissionKey = `${Field}${permissionKey}`;
      dispatch(
        onFieldPermissionChange({
          [fieldPermissionKey]: fieldLevelPermission
        })
      );
    }
  };

  if (!filteredPermissions || filteredPermissions.length <= 0) return <Table />;
  if (!sobjectName) return <Table />;
  if (!fieldWrappers || fieldWrappers.length <= 0) return <Table />;

  //Slightly ackward
  const dataSource = [createFirstRow(), ...fieldWrappers];

  return (
    <Table
      className='fls-table'
      dataSource={dataSource}
      bordered={false}
      pagination={{ position: ['topRight', 'bottomRight'], pageSize: 25 }}
      scroll={{ x: 'max-content' }}
      size='small'
    >
      {renderFirstColumn()}
      {renderSecondColumn()}
      {renderPermissionColumns()}
    </Table>
  );

  function createFirstRow() {
    const firstRow = { field: 'All', key: 'all' };
    filteredPermissions.forEach(permission => {
      const permissionKey = permission.key;
      firstRow[`edit_${permissionKey}`] = fieldWrappers.every(
        fieldPermission =>
          fieldPermission[`edit_${permissionKey}`] ||
          fieldPermission.editDisabled
      );
      firstRow[`read_${permissionKey}`] = fieldWrappers.every(
        fieldPermission => fieldPermission[`read_${permissionKey}`]
      );
    });

    return firstRow;
  }

  //Field column
  function renderFirstColumn() {
    return (
      <Column
        title=''
        dataIndex='field'
        key='field'
        width={250}
        // fixed='left'
        render={(field, record, index) => {
          if (index === 0) {
            return <div className='first-column'>All</div>;
          }
          const label = record['label'] ? record['label'] : record['name'];
          const apiName = record['name'];
          return (
            <div className='first-column'>
              {apiName} ({label})
            </div>
          );
        }}
      />
    );
  }

  function renderSecondColumn() {
    return (
      <Column
        title=''
        width={100}
        dataIndex='controls'
        key='controls'
        // fixed='left'
        render={(field: string, row: any, index: number) => {
          if (index === 0) {
            return <div />;
          }

          const disabled = row.editDisabled;
          let editAllValue = !disabled;
          let readAllValue = true;

          for (const key in row) {
            if (!readAllValue) break;
            if (!key.includes('read_')) continue;
            readAllValue = readAllValue && row[key];
          }

          for (const key in row) {
            if (!editAllValue) break;
            if (!key.includes('edit_')) continue;
            editAllValue = editAllValue && row[key];
          }

          return (
            <div>
              <div className='no-wrap'>
                <Checkbox
                  checked={editAllValue}
                  disabled={disabled}
                  onChange={event =>
                    handleEditAllByField(event.target.checked, row)
                  }
                />{' '}
                Edit
              </div>
              <div className='no-wrap'>
                <Checkbox
                  checked={readAllValue}
                  onChange={event =>
                    handleReadAllByField(event.target.checked, row)
                  }
                />{' '}
                Read
              </div>
            </div>
          );
        }}
      />
    );
  }

  function renderPermissionColumns() {
    const permissionColumns = [];
    filteredPermissions.forEach(permission => {
      const permissionKey = permission.Id;
      const editKey = `edit_${permissionKey}`;
      const readKey = `read_${permissionKey}`;
      const profileLabel =
        permission.name.length > 31
          ? `${permission.name.substring(0, 28)}...`
          : permission.name;
      permissionColumns.push(
        <Column
          className='rotate'
          colSpan={2}
          width={100}
          title={() => (
            <div className='header' style={{ textAlign: 'center' }}>
              <Tooltip title={permission.name} placement='top'>
                <span>{profileLabel}</span>
              </Tooltip>
            </div>
          )}
          dataIndex={editKey}
          key={editKey}
          onCell={(record: any, rowIndex) => ({
            onClick: () => {
              if (rowIndex === 0) {
                // handleEditAll(event.target.checked, permissionKey)}
              } else {
                if (record.editDisabled) return;
                handleEditCellClick(record, permissionKey);
              }
            }
          })}
          render={(value, record: any, index) => {
            const cellKey = `${editKey}_${record.key}`;
            const disabled = record.editDisabled;
            if (index === 0) {
              return (
                //Need to add padding:'16px 8px' to cell
                <div style={{ textAlign: 'center' }}>
                  <div>Edit</div>
                  <Checkbox
                    name='Edit'
                    checked={value}
                    id={cellKey}
                    disabled={disabled}
                    onChange={event =>
                      handleEditAll(event.target.checked, permissionKey)
                    }
                  />
                </div>
              );
            } else {
              return (
                <div style={{ textAlign: 'center' }}>
                  <Tooltip title={`Edit ${permission.name}`} placement='bottom'>
                    <Checkbox
                      id={cellKey}
                      checked={value}
                      disabled={disabled}
                    />
                  </Tooltip>
                </div>
              );
            }
          }}
        />
      );
      permissionColumns.push(
        <Column
          className='rotate'
          colSpan={0}
          width={100}
          dataIndex={readKey}
          key={readKey}
          onCell={(record, rowIndex) => ({
            onClick: () => {
              if (rowIndex === 0) {
                // handleReadAll(, permissionKey)
              } else {
                handleReadCellClick(record, permissionKey);
              }
            }
          })}
          render={(value, record: any, index) => {
            const cellKey = `${readKey}_${record.key}`;
            if (index === 0) {
              return (
                <div style={{ textAlign: 'center' }}>
                  <div>Read</div>
                  <Checkbox
                    id={cellKey}
                    checked={value}
                    onChange={event =>
                      handleReadAll(event.target.checked, permissionKey)
                    }
                  />
                </div>
              );
            } else {
              return (
                <div style={{ textAlign: 'center' }}>
                  <Tooltip title={`Read ${permission.name}`} placement='bottom'>
                    <Checkbox id={cellKey} checked={value} />
                  </Tooltip>
                </div>
              );
            }
          }}
        />
      );
    });

    return permissionColumns;
  }
};

function getFieldWrappers(
  fields: any,
  permissionSets: any,
  fieldPermissions: any
) {
  //Should never happen
  if (!fieldPermissions) return [];
  if (!fields) return [];
  if (!permissionSets) return [];

  const fieldWrappers = {};

  fields.forEach((field: any) => {
    if (field.DataType === 'reference') {
      if (field.RelationshipName) {
        //This is a hacky thing I have to do because Salesforce does not use consistent naming
        field.Name = field.RelationshipName.replace('__r', '__c');
      } else {
        //Hack for external data sources
        field.Name = field.Name.replace('Id', '');
      }
    }

    fieldWrappers[field.Name] = {
      ...field,
      key: field.Name,
      //Address is not updateable because it is a compound field but it can still be assigned edit access
      editDisabled: !field.IsUpdatable && !field.IsCompound
    };

    permissionSets.forEach(permission => {
      const profileKeyName = permission.Id;
      fieldWrappers[field.Name] = {
        ...fieldWrappers[field.Name],
        name: field.Name,
        label: field.Label,
        key: field.Name,
        [`edit_${profileKeyName}`]: false,
        [`read_${profileKeyName}`]: false
      };
    });
  });

  for (let fieldKey in fieldPermissions) {
    if (!fieldPermissions.hasOwnProperty(fieldKey)) continue;
    let fieldPermission = fieldPermissions[fieldKey];
    if (!fieldPermission.ParentId) continue;
    if (!fieldPermission.Field) continue;

    const profileKeyName = fieldPermission.ParentId;
    const field = fieldPermission.Field.split('.')[1];
    if (!fieldWrappers.hasOwnProperty(field)) continue;

    fieldWrappers[field] = {
      ...fieldWrappers[field],
      [`edit_${profileKeyName}`]: fieldPermission.PermissionsEdit,
      [`read_${profileKeyName}`]: fieldPermission.PermissionsRead,
      [`id_${profileKeyName}`]: fieldPermission.Id
    };
  }

  //Sort objects alphabetically
  return Object.keys(fieldWrappers)
    .sort()
    .map(field => fieldWrappers[field]);
}

export default FieldLevelSecurity;
