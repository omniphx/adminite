import * as React from 'react';
import FieldLevelSecurity from './FieldLevelSecurity';

import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { stubInterface } from 'ts-sinon';
import { ApplicationState } from '../../store/index';
import { FieldPermissionState } from '../../store/fieldPermission/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Zustand permission UI store (Phase 7)
const mockPermissionUIState = {
  sobjectName: '',
  permissionIds: [] as string[],
  permissionType: 'profile' as const,
  filter: '',
  setPermissionType: jest.fn(),
  setPermissionIds: jest.fn(),
  setSObjectName: jest.fn(),
  setFilter: jest.fn(),
  reset: jest.fn(),
};

jest.mock('../../stores/usePermissionUIStore', () => ({
  usePermissionUIStore: (selector: any) => selector(mockPermissionUIState),
}));

// Mock TanStack Query hooks (Phase 7)
const mockProfiles: any[] = [];
const mockPermissionSets: any[] = [];
const mockFields: any[] = [];

jest.mock('../../queries/usePermissionQuery', () => ({
  useProfilesQuery: () => ({ data: mockProfiles, isLoading: false }),
  usePermissionSetsQuery: () => ({ data: mockPermissionSets, isLoading: false }),
  useFlsFieldsQuery: () => ({ data: mockFields, isLoading: false }),
}));

const mockStore: any = configureMockStore();

const stubbedState: ApplicationState = stubInterface<ApplicationState>();
const stubbedFieldPermissionState: FieldPermissionState = stubInterface<
  FieldPermissionState
>();

const state: ApplicationState = {
  ...stubbedState,
  fieldPermissionState: stubbedFieldPermissionState,
};

describe('<FieldLevelSecurity/>', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockPermissionUIState.sobjectName = '';
    mockPermissionUIState.permissionIds = [];
    mockPermissionUIState.permissionType = 'profile';
    mockPermissionUIState.filter = '';
    mockProfiles.length = 0;
    mockPermissionSets.length = 0;
    mockFields.length = 0;
  });

  it('should render', () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <FieldLevelSecurity />
      </Provider>
    );
  });

  it('should select all', () => {
    // Set up mocks for this test
    mockPermissionUIState.sobjectName = 'Account';
    mockPermissionUIState.permissionIds = ['123'];
    mockProfiles.push({
      Id: '123',
      Profile: {
        Id: '234',
        Name: 'Standard Profile'
      },
      name: 'Standard Profile',
      key: '123',
      IsOwnedByProfile: true
    });
    mockFields.push(
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
    );

    const store = mockStore(state);
    render(
      <Provider store={store}>
        <FieldLevelSecurity />
      </Provider>
    );

    const checkbox = document.querySelector('input#edit_123_all');
    userEvent.click(checkbox);

    expect(store.getActions()).toHaveLength(3);
  });

  it.only('should ignore IsUpdate checkbox for edit all rendering', () => {
    // Set up mocks for this test
    mockPermissionUIState.sobjectName = 'Account';
    mockPermissionUIState.permissionIds = ['123'];
    mockProfiles.push({
      Id: '123',
      Profile: {
        Id: '234',
        Name: 'Standard Profile'
      },
      name: 'Standard Profile',
      key: '123',
      IsOwnedByProfile: true
    });
    mockFields.push(
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
    );

    const newState = {
      ...state,
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
          }
        }
      }
    };

    const store = mockStore(newState);
    render(
      <Provider store={store}>
        <FieldLevelSecurity />
      </Provider>
    );

    let checkbox: HTMLInputElement = document.querySelector(
      'input#edit_123_all'
    );
    userEvent.click(checkbox);

    checkbox = document.querySelector('input#edit_123_all');
    expect(checkbox.checked).toBe(true);
  });
});
