export function getProfileFieldPermissions(
  objectName: string,
  permissionIds?: string[]
): string {
  return build(
    `SELECT Field, Id, ParentId, Parent.ProfileId, Parent.Profile.Name, PermissionsEdit, PermissionsRead, SobjectType`,
    `FROM FieldPermissions`,
    `WHERE SobjectType ='${objectName}'`,
    `AND Parent.IsOwnedByProfile = true`,
    joinIds(permissionIds, `ParentId`),
    `ORDER BY Field, Parent.Profile.Name`
  )
}

export function getPermisionSetFieldPermissions(
  objectName: string,
  permissionIds?: string[]
): string {
  return build(
    `SELECT Field, Id, ParentId, Parent.ProfileId, Parent.Profile.Name, PermissionsEdit, PermissionsRead, SobjectType`,
    `FROM FieldPermissions`,
    `WHERE SobjectType ='${objectName}'`,
    `AND Parent.IsOwnedByProfile = false`,
    joinIds(permissionIds, `ParentId`),
    `ORDER BY Field, Parent.Name`
  )
}

export function getProfiles(permissionIds?: string[]): string {
  return build(
    `SELECT Id, Profile.Id, Profile.Name, IsOwnedByProfile`,
    `FROM PermissionSet`,
    `WHERE IsOwnedByProfile = true`,
    `AND Profile.UserLicense.Name NOT IN ('Identity', 'Work.com Only', 'Force.com - Free')`,
    `AND Profile.UserType IN ('PowerPartner', 'PowerCustomerSuccess', 'Standard')`,
    joinIds(permissionIds),
    `ORDER BY Profile.Name`
  )
}

export function getPermissionSets(
  namespace: string,
  permissionIds?: string[]
): string {
  return build(
    `SELECT Id, Name, Label, IsOwnedByProfile`,
    `FROM PermissionSet`,
    `WHERE IsOwnedByProfile = false`,
    `AND IsCustom = true`,
    namespace
      ? `AND NamespacePrefix = '${namespace}'`
      : `AND NamespacePrefix = null`,
    joinIds(permissionIds),
    `ORDER BY Name`
  )
}

function joinIds(permissionIds: string[], referenceId: string = 'Id'): string {
  if (!permissionIds) return ``
  if (permissionIds.length <= 0) return ``

  const queryComponents: string[] = []

  queryComponents.push(`AND ${referenceId} IN (`)
  queryComponents.push(
    permissionIds.map(permissionId => `\t'${permissionId}'`).join(`,\n`)
  )
  queryComponents.push(`)`)

  return queryComponents.join(`\n`)
}

function build(...queryComponents: string[]): string {
  return queryComponents.join(`\n`)
}
