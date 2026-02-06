export enum Role {
    ADMIN = 'admin',
    USER = 'user',
    SUPER_ADMIN = 'super_admin'
}

export enum Permission {
    PROFILE = 'profile.view',
    SETTINGS = 'settings.view',
    ACTIVITY = 'activity.view',
    SECURITY = 'security.view',
    MANAGE_USERS = 'users.*',
    MANAGE_PERMISSIONS = 'permissions.*'
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
