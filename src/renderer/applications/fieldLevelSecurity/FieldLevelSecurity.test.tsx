import * as React from 'react';
import FieldLevelSecurity from './FieldLevelSecurity';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Zustand permission UI store (Phase 7 & 8)
const mockPermissionUIState = {
  sobjectName: '',
  permissionIds: [] as string[],
  permissionType: 'profile' as const,
  filter: '',
  fieldPermissionsToSave: {} as Record<string, any>,
  saveErrors: null as string | null,
  setPermissionType: jest.fn(),
  setPermissionIds: jest.fn(),
  setSObjectName: jest.fn(),
  setFilter: jest.fn(),
  reset: jest.fn(),
  updateFieldPermission: jest.fn(),
  clearFieldPermissionsToSave: jest.fn(),
  setSaveErrors: jest.fn(),
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

// Mock field permissions query (Phase 8)
const mockFieldPermissions: Record<string, any> = {};

jest.mock('../../queries/useFieldPermissionQuery', () => ({
  useFieldPermissionsQuery: () => ({ data: mockFieldPermissions, isLoading: false }),
}));

describe('<FieldLevelSecurity/>', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockPermissionUIState.sobjectName = '';
    mockPermissionUIState.permissionIds = [];
    mockPermissionUIState.permissionType = 'profile';
    mockPermissionUIState.filter = '';
    mockPermissionUIState.fieldPermissionsToSave = {};
    mockPermissionUIState.updateFieldPermission.mockClear();
    mockProfiles.length = 0;
    mockPermissionSets.length = 0;
    mockFields.length = 0;
    // Clear field permissions mock
    Object.keys(mockFieldPermissions).forEach((key) => delete mockFieldPermissions[key]);
  });

  it('should render', () => {
    render(<FieldLevelSecurity />);
  });

  it('should select all', async () => {
    // Set up mocks for this test
    mockPermissionUIState.sobjectName = 'Account';
    mockPermissionUIState.permissionIds = ['123'];
    mockProfiles.push({
      Id: '123',
      Profile: {
        Id: '234',
        Name: 'Standard Profile',
      },
      name: 'Standard Profile',
      key: '123',
      IsOwnedByProfile: true,
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
        Label: 'Account ID',
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
        Label: 'Deleted',
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
        Label: 'Master Record ID',
      }
    );

    render(<FieldLevelSecurity />);

    const checkbox = document.querySelector('input#edit_123_all');
    await userEvent.click(checkbox!);

    // Now uses Zustand updateFieldPermission instead of Redux dispatch
    expect(mockPermissionUIState.updateFieldPermission).toHaveBeenCalledTimes(3);
  });

  it('should ignore IsUpdate checkbox for edit all rendering', async () => {
    // Set up mocks for this test
    mockPermissionUIState.sobjectName = 'Account';
    mockPermissionUIState.permissionIds = ['123'];
    mockProfiles.push({
      Id: '123',
      Profile: {
        Id: '234',
        Name: 'Standard Profile',
      },
      name: 'Standard Profile',
      key: '123',
      IsOwnedByProfile: true,
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
        Label: 'Account ID',
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
        Label: 'Deleted',
      }
    );

    // Set up field permissions via TanStack Query mock
    mockFieldPermissions['fp1'] = {
      Id: 'fp1',
      Field: 'Account.Id',
      ParentId: '123',
      PermissionsEdit: true,
      PermissionsRead: true,
    };
    mockFieldPermissions['fp2'] = {
      Id: 'fp2',
      Field: 'Account.ReadOnly',
      ParentId: '123',
      PermissionsEdit: false,
      PermissionsRead: true,
    };

    render(<FieldLevelSecurity />);

    let checkbox: HTMLInputElement | null = document.querySelector('input#edit_123_all');
    await userEvent.click(checkbox!);

    checkbox = document.querySelector('input#edit_123_all');
    expect(checkbox?.checked).toBe(true);
  });
});
