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
    USERS = 'users.view',
    MANAGE_USERS = 'users.*',
    PERMISSIONS = 'permissions.view',
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

import { MODULES as ADV_MODULES, ACTIONS as ADV_ACTIONS } from './adv.permission.js';

export const MODULES = ADV_MODULES;
export const ACTIONS = ADV_ACTIONS;

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
