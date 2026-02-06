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
    MANAGE_PERMISSIONS = 'permissions.*',
    CONTACT_FORM = 'contact.view'
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
    PROFILE: { key: 'profile', submodules: {} },
    SETTINGS: { key: 'settings', submodules: {} },
    ACTIVITY: { key: 'activity', submodules: {} },
    SECURITY: {
        key: 'security',
        submodules: {
            EMAIL: { key: 'email', submodules: {} },
        }
    },
    USERS: { key: 'users', submodules: {} },
    PERMISSIONS: { key: 'permissions', submodules: {} },
    CONTACT: { key: 'contact', submodules: {} },
} as const;

export const ACTIONS = {
    VIEW: 'view',
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
} as const;

export const isValidModulePath = (path: string): boolean => {
    const parts = path.split('.');
    let current: any = MODULES;

    for (const part of parts) {
        const found = Object.values(current).find((m: any) => m.key === part) as any;
        if (!found) return false;
        current = found.submodules || {};
    }
    return true;
};

export const generateMatrix = (): string[] => {
    const permissions: string[] = [];
    const traverse = (modules: any, prefix = '') => {
        Object.values(modules).forEach((module: any) => {
            const currentPath = prefix ? `${prefix}.${module.key}` : module.key;
            Object.values(ACTIONS).forEach(action => {
                permissions.push(`${currentPath}.${action}`);
            });
            if (module.submodules && Object.keys(module.submodules).length > 0) {
                traverse(module.submodules, currentPath);
            }
        });
    };
    traverse(MODULES);
    return permissions;
};
