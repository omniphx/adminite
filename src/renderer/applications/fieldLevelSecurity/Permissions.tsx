import * as React from 'react'
import { ApplicationState } from '../../store/index'
import SelectContext from '../SelectContext'
import { onPermissionIdsChange, onPermissionTypeChange, onPermissionsInit, onPermissionChange, onSObjectChange } from '../../store/permission/actions';
import { saveFieldPermissions } from '../../store/fieldPermission/actions'
import { Button, Row, Col, Radio, Select, Input } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import FieldLevelSecurity from './FieldLevelSecurity'

const { Option } = Select

import { useDispatch, useSelector } from 'react-redux'

const Permissions: React.FC = (props: any) => {
  const dispatch = useDispatch()

  const sobjects: any = useSelector((state: ApplicationState) => state.permissionState.sobjects)
  const sobjectName: any = useSelector((state: ApplicationState) => state.permissionState.sobjectName)
  const savePending: any = useSelector((state: ApplicationState) => state.fieldPermissionState.savePending)
  const permissionIds: any = useSelector((state: ApplicationState) => state.permissionState.permissionIds)
  const permissions: any = getPermissions(useSelector((state: ApplicationState) => state.permissionState.permissions))
  const permissionType: any = useSelector((state: ApplicationState) => state.permissionState.permissionType)
  const filter: string = useSelector((state: ApplicationState) => state.permissionState.filter)

  React.useEffect(() => {
    dispatch(onPermissionsInit())
  }, [])

  const handleSObjectChange = (sobjectName: any) => {
    dispatch(onSObjectChange(sobjectName))
  }

  const handlePermissionTypeChange = (event: RadioChangeEvent) => {
    dispatch(onPermissionTypeChange(event.target.value))
  }

  const handlePermissionSelection = (value: any, permissions: any) => {
    const permissionIds = permissions.map(permission => permission.key)
    dispatch(onPermissionIdsChange(permissionIds))
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(onPermissionChange({filter: event.currentTarget.value}))
  }

  function renderPermissionOptions() {
    return permissions.map(permission => (
      <Option key={permission.Id} value={permission.name}>{permission.name}</Option>
    ))
  }

  if (!sobjects) return <div />

  return (
    <div>
      <Row>
        <Col className='bump-left' sm={24} md={12}>
          <SelectContext
            sobjects={sobjects.map(sobject => {
              return {
                name: sobject.QualifiedApiName,
                label: sobject.Label
              }
            })}
            handleChange={handleSObjectChange}
            sobject={sobjectName}
            loading={!sobjects}
          />
        </Col>
        <Col sm={24} md={12} style={{textAlign:'right'}}>
          <Radio.Group
            defaultValue={permissionType}
            buttonStyle='solid'
            onChange={handlePermissionTypeChange}
          >
            <Radio.Button value='profile'>Profile</Radio.Button>
            <Radio.Button value='permissionSet'>
              PermissionSet
            </Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
      <Row>
        <Col sm={24} md={12}>
          <Select
            mode='multiple'
            style={{ width: '100%' }}
            value={permissions.filter(permission => permissionIds.indexOf(permission.Id) > -1).map(permission => permission.name)}
            placeholder={
              permissionType == 'profile'
                ? 'Choose your Profiles'
                : 'Choose your Permission Sets'
            }
            onChange={handlePermissionSelection}
          >
            {renderPermissionOptions()}
          </Select>
        </Col>
        <Col sm={24} md={12} style={{textAlign:'right'}}>
          <Button type='primary' onClick={() => dispatch(saveFieldPermissions())} loading={savePending}>
            Save
          </Button>
        </Col>
      </Row>
      <Row>
        <Col span={6}>
          <Input.Search
            placeholder='Filter fields'
            value={filter}
            onChange={handleChange}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <FieldLevelSecurity />
        </Col>
      </Row>
    </div>
  )
}

function getPermissions(permissions) {
  if (!permissions) return []
  return permissions.map(permission => {
    permission.name = permission.IsOwnedByProfile
      ? permission.Profile.Name
      : permission.Label
    permission.key = permission.Id
    return permission
  })
}

export default Permissions