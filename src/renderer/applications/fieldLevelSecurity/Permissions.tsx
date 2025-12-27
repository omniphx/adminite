import * as React from 'react'
import SelectContext from '../SelectContext'
import { saveFieldPermissions } from '../../store/fieldPermission/actions'
import { Button, Row, Col, Radio, Select, Input } from 'antd'
import type { RadioChangeEvent } from 'antd'
import FieldLevelSecurity from './FieldLevelSecurity'

const { Option } = Select

import { useDispatch, useSelector } from 'react-redux'
import { ApplicationState } from '../../store/index'

// Zustand + TanStack Query (Phase 7)
import { usePermissionUIStore, PermissionType } from '../../stores/usePermissionUIStore'
import { useProfilesQuery, usePermissionSetsQuery, useFlsSObjectsQuery } from '../../queries/usePermissionQuery'

const Permissions: React.FC = (props: any) => {
  const dispatch = useDispatch()

  // Zustand store for UI state
  const permissionType = usePermissionUIStore((state) => state.permissionType)
  const permissionIds = usePermissionUIStore((state) => state.permissionIds)
  const sobjectName = usePermissionUIStore((state) => state.sobjectName)
  const filter = usePermissionUIStore((state) => state.filter)
  const setPermissionType = usePermissionUIStore((state) => state.setPermissionType)
  const setPermissionIds = usePermissionUIStore((state) => state.setPermissionIds)
  const setSObjectName = usePermissionUIStore((state) => state.setSObjectName)
  const setFilter = usePermissionUIStore((state) => state.setFilter)

  // TanStack Query for data
  const { data: sobjects = [] } = useFlsSObjectsQuery()
  const { data: profiles = [] } = useProfilesQuery()
  const { data: permissionSets = [] } = usePermissionSetsQuery()

  // Redux still needed for fieldPermissions (until Phase 8)
  const savePending: any = useSelector((state: ApplicationState) => state.fieldPermissionState.savePending)

  // Get permissions based on type
  const rawPermissions = permissionType === 'profile' ? profiles : permissionSets
  const permissions = getPermissions(rawPermissions)

  const handleSObjectChange = (sobjectName: any) => {
    setSObjectName(sobjectName)
  }

  const handlePermissionTypeChange = (event: RadioChangeEvent) => {
    setPermissionType(event.target.value as PermissionType)
  }

  const handlePermissionSelection = (value: any, selectedOptions: any) => {
    const newPermissionIds = selectedOptions.map((option: any) => option.key)
    setPermissionIds(newPermissionIds)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.currentTarget.value)
  }

  function renderPermissionOptions() {
    return permissions.map(permission => (
      <Option key={permission.Id} value={permission.name}>{permission.name}</Option>
    ))
  }

  if (!sobjects || sobjects.length === 0) return <div />

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
            value={permissionType}
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

function getPermissions(permissions: any[]) {
  if (!permissions) return []
  return permissions.map(permission => {
    const mapped = { ...permission }
    mapped.name = permission.IsOwnedByProfile
      ? permission.Profile?.Name
      : permission.Label
    mapped.key = permission.Id
    return mapped
  })
}

export default Permissions