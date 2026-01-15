export enum Role {
    ADMIN = 'admin',
    USER = 'user',
    SUPER_ADMIN = 'super_admin'
}

export enum Permission {
    PROFILE = 'modules~permission~profile',
    SETTINGS = 'modules~permission~settings',
    ACTIVITY = 'modules~permission~activity',
    SECURITY = 'modules~permission~security',
    MANAGE_USERS = 'modules~permission~manage_users',
    MANAGE_PERMISSIONS = 'modules~permission~manage_permissions'
}


export const RolePermissions: Record<Role, Permission[]> = {
    [Role.SUPER_ADMIN]: [
        Permission.PROFILE,
        Permission.SETTINGS,
        Permission.ACTIVITY,
        Permission.SECURITY,
        Permission.MANAGE_USERS,
        Permission.MANAGE_PERMISSIONS
    ],
    [Role.ADMIN]: [
        Permission.PROFILE,
        Permission.SETTINGS,
        Permission.ACTIVITY,
        Permission.SECURITY
    ],
    [Role.USER]: [
        Permission.PROFILE,
        Permission.SETTINGS
    ]
};
