/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateConnectionInput = {
  id?: string | null,
  name: string,
  sortOrder?: number | null,
  accessToken?: string | null,
  instanceUrl?: string | null,
  refreshToken?: string | null,
  username?: string | null,
  first_name?: string | null,
  last_name?: string | null,
  email?: string | null,
  display_name?: string | null,
  timezone?: string | null,
  user_id?: string | null,
  user_type?: string | null,
  organization_id?: string | null,
  loginUrl?: string | null,
  redirectUri?: string | null,
  locale?: string | null,
  language?: string | null,
  owner?: string | null,
  _version?: number | null,
};

export type ModelConnectionConditionInput = {
  name?: ModelStringInput | null,
  sortOrder?: ModelIntInput | null,
  accessToken?: ModelStringInput | null,
  instanceUrl?: ModelStringInput | null,
  refreshToken?: ModelStringInput | null,
  username?: ModelStringInput | null,
  first_name?: ModelStringInput | null,
  last_name?: ModelStringInput | null,
  email?: ModelStringInput | null,
  display_name?: ModelStringInput | null,
  timezone?: ModelStringInput | null,
  user_id?: ModelStringInput | null,
  user_type?: ModelStringInput | null,
  organization_id?: ModelStringInput | null,
  loginUrl?: ModelStringInput | null,
  redirectUri?: ModelStringInput | null,
  locale?: ModelStringInput | null,
  language?: ModelStringInput | null,
  and?: Array< ModelConnectionConditionInput | null > | null,
  or?: Array< ModelConnectionConditionInput | null > | null,
  not?: ModelConnectionConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Connection = {
  __typename: "Connection",
  id?: string,
  name?: string,
  sortOrder?: number | null,
  accessToken?: string | null,
  instanceUrl?: string | null,
  refreshToken?: string | null,
  username?: string | null,
  first_name?: string | null,
  last_name?: string | null,
  email?: string | null,
  display_name?: string | null,
  timezone?: string | null,
  user_id?: string | null,
  user_type?: string | null,
  organization_id?: string | null,
  loginUrl?: string | null,
  redirectUri?: string | null,
  locale?: string | null,
  language?: string | null,
  owner?: string | null,
  _version?: number,
  _deleted?: boolean | null,
  _lastChangedAt?: number,
  createdAt?: string,
  updatedAt?: string,
};

export type UpdateConnectionInput = {
  id: string,
  name?: string | null,
  sortOrder?: number | null,
  accessToken?: string | null,
  instanceUrl?: string | null,
  refreshToken?: string | null,
  username?: string | null,
  first_name?: string | null,
  last_name?: string | null,
  email?: string | null,
  display_name?: string | null,
  timezone?: string | null,
  user_id?: string | null,
  user_type?: string | null,
  organization_id?: string | null,
  loginUrl?: string | null,
  redirectUri?: string | null,
  locale?: string | null,
  language?: string | null,
  owner?: string | null,
  _version?: number | null,
};

export type DeleteConnectionInput = {
  id?: string | null,
  _version?: number | null,
};

export type CreateSOQLQueryInput = {
  id?: string | null,
  name: string,
  body?: string | null,
  sobject?: string | null,
  createdAt?: string | null,
  updatedAT?: string | null,
  owner?: string | null,
  _version?: number | null,
};

export type ModelSOQLQueryConditionInput = {
  name?: ModelStringInput | null,
  body?: ModelStringInput | null,
  sobject?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAT?: ModelStringInput | null,
  and?: Array< ModelSOQLQueryConditionInput | null > | null,
  or?: Array< ModelSOQLQueryConditionInput | null > | null,
  not?: ModelSOQLQueryConditionInput | null,
};

export type SOQLQuery = {
  __typename: "SOQLQuery",
  id?: string,
  name?: string,
  body?: string | null,
  sobject?: string | null,
  createdAt?: string | null,
  updatedAT?: string | null,
  owner?: string | null,
  _version?: number,
  _deleted?: boolean | null,
  _lastChangedAt?: number,
  updatedAt?: string,
};

export type UpdateSOQLQueryInput = {
  id: string,
  name?: string | null,
  body?: string | null,
  sobject?: string | null,
  createdAt?: string | null,
  updatedAT?: string | null,
  owner?: string | null,
  _version?: number | null,
};

export type DeleteSOQLQueryInput = {
  id?: string | null,
  _version?: number | null,
};

export type CreateUserInput = {
  id?: string | null,
  email: string,
  owner?: string | null,
  disableAutoComplete?: boolean | null,
  disableInlineTabs?: boolean | null,
  tabDisplayType?: TabDisplayTypes | null,
  license?: Licenses | null,
  queryHotkey?: string | null,
  _version?: number | null,
};

export enum TabDisplayTypes {
  SOBJECT = "SOBJECT",
  ICON = "ICON",
}


export enum Licenses {
  FREE = "FREE",
  PROFESSIONAL = "PROFESSIONAL",
  TEAM = "TEAM",
  ENTERPRISE = "ENTERPRISE",
}


export type ModelUserConditionInput = {
  email?: ModelStringInput | null,
  disableAutoComplete?: ModelBooleanInput | null,
  disableInlineTabs?: ModelBooleanInput | null,
  tabDisplayType?: ModelTabDisplayTypesInput | null,
  license?: ModelLicensesInput | null,
  queryHotkey?: ModelStringInput | null,
  and?: Array< ModelUserConditionInput | null > | null,
  or?: Array< ModelUserConditionInput | null > | null,
  not?: ModelUserConditionInput | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type ModelTabDisplayTypesInput = {
  eq?: TabDisplayTypes | null,
  ne?: TabDisplayTypes | null,
};

export type ModelLicensesInput = {
  eq?: Licenses | null,
  ne?: Licenses | null,
};

export type User = {
  __typename: "User",
  id?: string,
  email?: string,
  owner?: string | null,
  disableAutoComplete?: boolean | null,
  disableInlineTabs?: boolean | null,
  tabDisplayType?: TabDisplayTypes | null,
  license?: Licenses | null,
  queryHotkey?: string | null,
  _version?: number,
  _deleted?: boolean | null,
  _lastChangedAt?: number,
  createdAt?: string,
  updatedAt?: string,
};

export type UpdateUserInput = {
  id: string,
  email?: string | null,
  owner?: string | null,
  disableAutoComplete?: boolean | null,
  disableInlineTabs?: boolean | null,
  tabDisplayType?: TabDisplayTypes | null,
  license?: Licenses | null,
  queryHotkey?: string | null,
  _version?: number | null,
};

export type DeleteUserInput = {
  id?: string | null,
  _version?: number | null,
};

export type ModelConnectionFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  sortOrder?: ModelIntInput | null,
  accessToken?: ModelStringInput | null,
  instanceUrl?: ModelStringInput | null,
  refreshToken?: ModelStringInput | null,
  username?: ModelStringInput | null,
  first_name?: ModelStringInput | null,
  last_name?: ModelStringInput | null,
  email?: ModelStringInput | null,
  display_name?: ModelStringInput | null,
  timezone?: ModelStringInput | null,
  user_id?: ModelStringInput | null,
  user_type?: ModelStringInput | null,
  organization_id?: ModelStringInput | null,
  loginUrl?: ModelStringInput | null,
  redirectUri?: ModelStringInput | null,
  locale?: ModelStringInput | null,
  language?: ModelStringInput | null,
  owner?: ModelStringInput | null,
  and?: Array< ModelConnectionFilterInput | null > | null,
  or?: Array< ModelConnectionFilterInput | null > | null,
  not?: ModelConnectionFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelConnectionConnection = {
  __typename: "ModelConnectionConnection",
  items?:  Array<Connection | null > | null,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelSOQLQueryFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  body?: ModelStringInput | null,
  sobject?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAT?: ModelStringInput | null,
  owner?: ModelStringInput | null,
  and?: Array< ModelSOQLQueryFilterInput | null > | null,
  or?: Array< ModelSOQLQueryFilterInput | null > | null,
  not?: ModelSOQLQueryFilterInput | null,
};

export type ModelSOQLQueryConnection = {
  __typename: "ModelSOQLQueryConnection",
  items?:  Array<SOQLQuery | null > | null,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelUserFilterInput = {
  id?: ModelIDInput | null,
  email?: ModelStringInput | null,
  owner?: ModelStringInput | null,
  disableAutoComplete?: ModelBooleanInput | null,
  disableInlineTabs?: ModelBooleanInput | null,
  tabDisplayType?: ModelTabDisplayTypesInput | null,
  license?: ModelLicensesInput | null,
  queryHotkey?: ModelStringInput | null,
  and?: Array< ModelUserFilterInput | null > | null,
  or?: Array< ModelUserFilterInput | null > | null,
  not?: ModelUserFilterInput | null,
};

export type ModelUserConnection = {
  __typename: "ModelUserConnection",
  items?:  Array<User | null > | null,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type CreateConnectionMutationVariables = {
  input?: CreateConnectionInput,
  condition?: ModelConnectionConditionInput | null,
};

export type CreateConnectionMutation = {
  createConnection?:  {
    __typename: "Connection",
    id: string,
    name: string,
    sortOrder?: number | null,
    accessToken?: string | null,
    instanceUrl?: string | null,
    refreshToken?: string | null,
    username?: string | null,
    first_name?: string | null,
    last_name?: string | null,
    email?: string | null,
    display_name?: string | null,
    timezone?: string | null,
    user_id?: string | null,
    user_type?: string | null,
    organization_id?: string | null,
    loginUrl?: string | null,
    redirectUri?: string | null,
    locale?: string | null,
    language?: string | null,
    owner?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateConnectionMutationVariables = {
  input?: UpdateConnectionInput,
  condition?: ModelConnectionConditionInput | null,
};

export type UpdateConnectionMutation = {
  updateConnection?:  {
    __typename: "Connection",
    id: string,
    name: string,
    sortOrder?: number | null,
    accessToken?: string | null,
    instanceUrl?: string | null,
    refreshToken?: string | null,
    username?: string | null,
    first_name?: string | null,
    last_name?: string | null,
    email?: string | null,
    display_name?: string | null,
    timezone?: string | null,
    user_id?: string | null,
    user_type?: string | null,
    organization_id?: string | null,
    loginUrl?: string | null,
    redirectUri?: string | null,
    locale?: string | null,
    language?: string | null,
    owner?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteConnectionMutationVariables = {
  input?: DeleteConnectionInput,
  condition?: ModelConnectionConditionInput | null,
};

export type DeleteConnectionMutation = {
  deleteConnection?:  {
    __typename: "Connection",
    id: string,
    name: string,
    sortOrder?: number | null,
    accessToken?: string | null,
    instanceUrl?: string | null,
    refreshToken?: string | null,
    username?: string | null,
    first_name?: string | null,
    last_name?: string | null,
    email?: string | null,
    display_name?: string | null,
    timezone?: string | null,
    user_id?: string | null,
    user_type?: string | null,
    organization_id?: string | null,
    loginUrl?: string | null,
    redirectUri?: string | null,
    locale?: string | null,
    language?: string | null,
    owner?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateSoqlQueryMutationVariables = {
  input?: CreateSOQLQueryInput,
  condition?: ModelSOQLQueryConditionInput | null,
};

export type CreateSoqlQueryMutation = {
  createSOQLQuery?:  {
    __typename: "SOQLQuery",
    id: string,
    name: string,
    body?: string | null,
    sobject?: string | null,
    createdAt?: string | null,
    updatedAT?: string | null,
    owner?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    updatedAt: string,
  } | null,
};

export type UpdateSoqlQueryMutationVariables = {
  input?: UpdateSOQLQueryInput,
  condition?: ModelSOQLQueryConditionInput | null,
};

export type UpdateSoqlQueryMutation = {
  updateSOQLQuery?:  {
    __typename: "SOQLQuery",
    id: string,
    name: string,
    body?: string | null,
    sobject?: string | null,
    createdAt?: string | null,
    updatedAT?: string | null,
    owner?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    updatedAt: string,
  } | null,
};

export type DeleteSoqlQueryMutationVariables = {
  input?: DeleteSOQLQueryInput,
  condition?: ModelSOQLQueryConditionInput | null,
};

export type DeleteSoqlQueryMutation = {
  deleteSOQLQuery?:  {
    __typename: "SOQLQuery",
    id: string,
    name: string,
    body?: string | null,
    sobject?: string | null,
    createdAt?: string | null,
    updatedAT?: string | null,
    owner?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    updatedAt: string,
  } | null,
};

export type CreateUserMutationVariables = {
  input?: CreateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type CreateUserMutation = {
  createUser?:  {
    __typename: "User",
    id: string,
    email: string,
    owner?: string | null,
    disableAutoComplete?: boolean | null,
    disableInlineTabs?: boolean | null,
    tabDisplayType?: TabDisplayTypes | null,
    license?: Licenses | null,
    queryHotkey?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateUserMutationVariables = {
  input?: UpdateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type UpdateUserMutation = {
  updateUser?:  {
    __typename: "User",
    id: string,
    email: string,
    owner?: string | null,
    disableAutoComplete?: boolean | null,
    disableInlineTabs?: boolean | null,
    tabDisplayType?: TabDisplayTypes | null,
    license?: Licenses | null,
    queryHotkey?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteUserMutationVariables = {
  input?: DeleteUserInput,
  condition?: ModelUserConditionInput | null,
};

export type DeleteUserMutation = {
  deleteUser?:  {
    __typename: "User",
    id: string,
    email: string,
    owner?: string | null,
    disableAutoComplete?: boolean | null,
    disableInlineTabs?: boolean | null,
    tabDisplayType?: TabDisplayTypes | null,
    license?: Licenses | null,
    queryHotkey?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type SyncConnectionsQueryVariables = {
  filter?: ModelConnectionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncConnectionsQuery = {
  syncConnections?:  {
    __typename: "ModelConnectionConnection",
    items?:  Array< {
      __typename: "Connection",
      id: string,
      name: string,
      sortOrder?: number | null,
      accessToken?: string | null,
      instanceUrl?: string | null,
      refreshToken?: string | null,
      username?: string | null,
      first_name?: string | null,
      last_name?: string | null,
      email?: string | null,
      display_name?: string | null,
      timezone?: string | null,
      user_id?: string | null,
      user_type?: string | null,
      organization_id?: string | null,
      loginUrl?: string | null,
      redirectUri?: string | null,
      locale?: string | null,
      language?: string | null,
      owner?: string | null,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetConnectionQueryVariables = {
  id?: string,
};

export type GetConnectionQuery = {
  getConnection?:  {
    __typename: "Connection",
    id: string,
    name: string,
    sortOrder?: number | null,
    accessToken?: string | null,
    instanceUrl?: string | null,
    refreshToken?: string | null,
    username?: string | null,
    first_name?: string | null,
    last_name?: string | null,
    email?: string | null,
    display_name?: string | null,
    timezone?: string | null,
    user_id?: string | null,
    user_type?: string | null,
    organization_id?: string | null,
    loginUrl?: string | null,
    redirectUri?: string | null,
    locale?: string | null,
    language?: string | null,
    owner?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListConnectionsQueryVariables = {
  filter?: ModelConnectionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListConnectionsQuery = {
  listConnections?:  {
    __typename: "ModelConnectionConnection",
    items?:  Array< {
      __typename: "Connection",
      id: string,
      name: string,
      sortOrder?: number | null,
      accessToken?: string | null,
      instanceUrl?: string | null,
      refreshToken?: string | null,
      username?: string | null,
      first_name?: string | null,
      last_name?: string | null,
      email?: string | null,
      display_name?: string | null,
      timezone?: string | null,
      user_id?: string | null,
      user_type?: string | null,
      organization_id?: string | null,
      loginUrl?: string | null,
      redirectUri?: string | null,
      locale?: string | null,
      language?: string | null,
      owner?: string | null,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncSoqlQueriesQueryVariables = {
  filter?: ModelSOQLQueryFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncSoqlQueriesQuery = {
  syncSOQLQueries?:  {
    __typename: "ModelSOQLQueryConnection",
    items?:  Array< {
      __typename: "SOQLQuery",
      id: string,
      name: string,
      body?: string | null,
      sobject?: string | null,
      createdAt?: string | null,
      updatedAT?: string | null,
      owner?: string | null,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetSoqlQueryQueryVariables = {
  id?: string,
};

export type GetSoqlQueryQuery = {
  getSOQLQuery?:  {
    __typename: "SOQLQuery",
    id: string,
    name: string,
    body?: string | null,
    sobject?: string | null,
    createdAt?: string | null,
    updatedAT?: string | null,
    owner?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    updatedAt: string,
  } | null,
};

export type ListSoqlQuerysQueryVariables = {
  filter?: ModelSOQLQueryFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListSoqlQuerysQuery = {
  listSOQLQuerys?:  {
    __typename: "ModelSOQLQueryConnection",
    items?:  Array< {
      __typename: "SOQLQuery",
      id: string,
      name: string,
      body?: string | null,
      sobject?: string | null,
      createdAt?: string | null,
      updatedAT?: string | null,
      owner?: string | null,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncUsersQueryVariables = {
  filter?: ModelUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncUsersQuery = {
  syncUsers?:  {
    __typename: "ModelUserConnection",
    items?:  Array< {
      __typename: "User",
      id: string,
      email: string,
      owner?: string | null,
      disableAutoComplete?: boolean | null,
      disableInlineTabs?: boolean | null,
      tabDisplayType?: TabDisplayTypes | null,
      license?: Licenses | null,
      queryHotkey?: string | null,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetUserQueryVariables = {
  id?: string,
};

export type GetUserQuery = {
  getUser?:  {
    __typename: "User",
    id: string,
    email: string,
    owner?: string | null,
    disableAutoComplete?: boolean | null,
    disableInlineTabs?: boolean | null,
    tabDisplayType?: TabDisplayTypes | null,
    license?: Licenses | null,
    queryHotkey?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListUsersQueryVariables = {
  filter?: ModelUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUsersQuery = {
  listUsers?:  {
    __typename: "ModelUserConnection",
    items?:  Array< {
      __typename: "User",
      id: string,
      email: string,
      owner?: string | null,
      disableAutoComplete?: boolean | null,
      disableInlineTabs?: boolean | null,
      tabDisplayType?: TabDisplayTypes | null,
      license?: Licenses | null,
      queryHotkey?: string | null,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type OnCreateConnectionSubscriptionVariables = {
  owner?: string,
};

export type OnCreateConnectionSubscription = {
  onCreateConnection?:  {
    __typename: "Connection",
    id: string,
    name: string,
    sortOrder?: number | null,
    accessToken?: string | null,
    instanceUrl?: string | null,
    refreshToken?: string | null,
    username?: string | null,
    first_name?: string | null,
    last_name?: string | null,
    email?: string | null,
    display_name?: string | null,
    timezone?: string | null,
    user_id?: string | null,
    user_type?: string | null,
    organization_id?: string | null,
    loginUrl?: string | null,
    redirectUri?: string | null,
    locale?: string | null,
    language?: string | null,
    owner?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateConnectionSubscriptionVariables = {
  owner?: string,
};

export type OnUpdateConnectionSubscription = {
  onUpdateConnection?:  {
    __typename: "Connection",
    id: string,
    name: string,
    sortOrder?: number | null,
    accessToken?: string | null,
    instanceUrl?: string | null,
    refreshToken?: string | null,
    username?: string | null,
    first_name?: string | null,
    last_name?: string | null,
    email?: string | null,
    display_name?: string | null,
    timezone?: string | null,
    user_id?: string | null,
    user_type?: string | null,
    organization_id?: string | null,
    loginUrl?: string | null,
    redirectUri?: string | null,
    locale?: string | null,
    language?: string | null,
    owner?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteConnectionSubscriptionVariables = {
  owner?: string,
};

export type OnDeleteConnectionSubscription = {
  onDeleteConnection?:  {
    __typename: "Connection",
    id: string,
    name: string,
    sortOrder?: number | null,
    accessToken?: string | null,
    instanceUrl?: string | null,
    refreshToken?: string | null,
    username?: string | null,
    first_name?: string | null,
    last_name?: string | null,
    email?: string | null,
    display_name?: string | null,
    timezone?: string | null,
    user_id?: string | null,
    user_type?: string | null,
    organization_id?: string | null,
    loginUrl?: string | null,
    redirectUri?: string | null,
    locale?: string | null,
    language?: string | null,
    owner?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateSoqlQuerySubscriptionVariables = {
  owner?: string,
};

export type OnCreateSoqlQuerySubscription = {
  onCreateSOQLQuery?:  {
    __typename: "SOQLQuery",
    id: string,
    name: string,
    body?: string | null,
    sobject?: string | null,
    createdAt?: string | null,
    updatedAT?: string | null,
    owner?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    updatedAt: string,
  } | null,
};

export type OnUpdateSoqlQuerySubscriptionVariables = {
  owner?: string,
};

export type OnUpdateSoqlQuerySubscription = {
  onUpdateSOQLQuery?:  {
    __typename: "SOQLQuery",
    id: string,
    name: string,
    body?: string | null,
    sobject?: string | null,
    createdAt?: string | null,
    updatedAT?: string | null,
    owner?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    updatedAt: string,
  } | null,
};

export type OnDeleteSoqlQuerySubscriptionVariables = {
  owner?: string,
};

export type OnDeleteSoqlQuerySubscription = {
  onDeleteSOQLQuery?:  {
    __typename: "SOQLQuery",
    id: string,
    name: string,
    body?: string | null,
    sobject?: string | null,
    createdAt?: string | null,
    updatedAT?: string | null,
    owner?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    updatedAt: string,
  } | null,
};

export type OnCreateUserSubscriptionVariables = {
  owner?: string,
};

export type OnCreateUserSubscription = {
  onCreateUser?:  {
    __typename: "User",
    id: string,
    email: string,
    owner?: string | null,
    disableAutoComplete?: boolean | null,
    disableInlineTabs?: boolean | null,
    tabDisplayType?: TabDisplayTypes | null,
    license?: Licenses | null,
    queryHotkey?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateUserSubscriptionVariables = {
  owner?: string,
};

export type OnUpdateUserSubscription = {
  onUpdateUser?:  {
    __typename: "User",
    id: string,
    email: string,
    owner?: string | null,
    disableAutoComplete?: boolean | null,
    disableInlineTabs?: boolean | null,
    tabDisplayType?: TabDisplayTypes | null,
    license?: Licenses | null,
    queryHotkey?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteUserSubscriptionVariables = {
  owner?: string,
};

export type OnDeleteUserSubscription = {
  onDeleteUser?:  {
    __typename: "User",
    id: string,
    email: string,
    owner?: string | null,
    disableAutoComplete?: boolean | null,
    disableInlineTabs?: boolean | null,
    tabDisplayType?: TabDisplayTypes | null,
    license?: Licenses | null,
    queryHotkey?: string | null,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};
