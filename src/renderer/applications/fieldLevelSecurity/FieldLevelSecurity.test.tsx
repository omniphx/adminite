import * as React from 'react'
import FieldLevelSecurity from './FieldLevelSecurity'
import { shallow, mount } from 'enzyme'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { stubInterface } from 'ts-sinon'
import { ApplicationState } from '../../store/index';
import { FieldPermissionState } from '../../store/fieldPermission/types';
import { PermissionState } from '../../store/permission/types';
const mockStore: any = configureMockStore()

const stubbedState: ApplicationState = stubInterface<ApplicationState>()
const stubbedFieldPermissionState: FieldPermissionState = stubInterface<FieldPermissionState>()
const stubbedPermissionState: PermissionState = stubInterface<PermissionState>()

const state: ApplicationState = {
  ...stubbedState,
  fieldPermissionState: stubbedFieldPermissionState,
  permissionState: stubbedPermissionState
}

describe('<FieldLevelSecurity/>', () => {
  test('it should render', () => {
    const store = mockStore(state);
    shallow(
      <Provider store={store}>
        <FieldLevelSecurity />
      </Provider>
    )
  })

  test('it should select all', () => {
    const newState = {
      ...state,
      permissionState: {
        ...state.permissionState,
        sobjectName: 'Account',
        permissionIds: ['123'],
        permissions: [
          {
            Id: '123',
            Profile: {
              Id: '234',
              Name: 'Standard Profile',
            },
            name: 'Standard Profile',
            key: '123',
            IsOwnedByProfile: true
          }
        ],
        fields: [
          {
            Name: 'Id',
            IsUpdatable: true,
            RelationshipName: null,
            DataType: 'id',
            ValueTypeId: 'id',
            IsCompound: false,
            IsCreatable: false,
            IsPermissionable: true,
            Label: 'Account ID'
          },
          {
            Name: 'IsDeleted',
            IsUpdatable: true,
            RelationshipName: null,
            DataType: 'boolean',
            ValueTypeId: 'boolean',
            IsCompound: false,
            IsCreatable: false,
            IsPermissionable: true,
            Label: 'Deleted'
          },
          {
            Name: 'MasterRecord',
            IsUpdatable: true,
            RelationshipName: 'MasterRecord',
            DataType: 'reference',
            ValueTypeId: 'id',
            IsCompound: false,
            IsCreatable: false,
            IsPermissionable: true,
            Label: 'Master Record ID'
          }
        ]
      }
    }

    const store = mockStore(newState)
    const component = mount(
      <Provider store={store}>
        <FieldLevelSecurity />
      </Provider>
    )

    const checkbox = component.find('#edit_123_all input')
    checkbox.simulate('change', { target: { value: true } })

    expect(store.getActions()).toHaveLength(3)
  })

  test('it should ignore IsUpdate checkbox for edit all rendering', () => {
    const newState = {
      ...state,
      permissionState: {
        ...state.permissionState,
        sobjectName: 'Account',
        permissionIds: ['123'],
        permissions: [
          {
            Id: '123',
            Profile: {
              Id: '234',
              Name: 'Standard Profile',
            },
            name: 'Standard Profile',
            key: '123',
            IsOwnedByProfile: true
          }
        ],
        fields: [
          {
            Name: 'Id',
            IsUpdatable: true,
            RelationshipName: null,
            DataType: 'id',
            ValueTypeId: 'id',
            IsCompound: false,
            IsCreatable: false,
            IsPermissionable: true,
            Label: 'Account ID'
          },
          {
            Name: 'ReadOnly',
            IsUpdatable: false,
            RelationshipName: null,
            DataType: 'boolean',
            ValueTypeId: 'boolean',
            IsCompound: false,
            IsCreatable: false,
            IsCalculated: false,
            IsPermissionable: true,
            Label: 'Deleted'
          }
        ]
      },
      fieldPermissionState: {
        ...state.fieldPermissionState,
        fieldPermissions: {
          fp1: {
            Id: 'fp1',
            Field: 'Account.Id',
            ParentId: '123',
            PermissionsEdit: true,
            PermissionsRead: true
          },
          fp2: {
            Id: 'fp2',
            Field: 'Account.ReadOnly',
            ParentId: '123',
            PermissionsEdit: false,
            PermissionsRead: true
          },
        }
      }
    }

    const store = mockStore(newState)
    const component = mount(
      <Provider store={store}>
        <FieldLevelSecurity />
      </Provider>
    )

    const checkbox = component.find('#edit_123_all').first()
    expect(checkbox.props().checked).toBe(true)
    // console.log(checkbox.html())

    // component.find('#edit_123_all').forEach(checkbox => {
    //   console.log(checkbox.props())
    //   console.log(checkbox.html())
    // })

    // expect(store.getActions()).toHaveLength(3)
  })
})