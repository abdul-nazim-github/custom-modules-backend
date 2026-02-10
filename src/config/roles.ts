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
    MANAGE_PERMISSIONS = 'modules~permission~manage_permissions',
    CONTACT_FORM = 'modules~permission~contact_form'
}


export const RolePermissions: Record<Role, Permission[]> = {
    [Role.SUPER_ADMIN]: [
        Permission.PROFILE,
        Permission.SETTINGS,
        Permission.ACTIVITY,
        Permission.SECURITY,
        Permission.MANAGE_USERS,
        Permission.MANAGE_PERMISSIONS,
        Permission.CONTACT_FORM
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

export const MODULES = {
    PROFILE: 'profile',
    SETTINGS: 'settings',
    ACTIVITY: 'activity',
    SECURITY: 'security',
    USERS: 'users',
    PERMISSIONS: 'permissions'
} as const;

export const ACTIONS = {
    VIEW: 'view',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    ALL: '*'
} as const;

export function isValidModulePath(path: string): boolean {
    return Object.values(MODULES).includes(path as any);
}
