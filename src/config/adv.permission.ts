export const MODULES = {
    PROFILE: {
        key: 'profile',
        submodules: {}
    },
    SETTINGS: {
        key: 'settings',
        submodules: {}
    },
    ACTIVITY: {
        key: 'activity',
        submodules: {}
    },
    SECURITY: {
        key: 'security',
        submodules: {}
    }
} as const;


export const ACTIONS = {
    VIEW: 'view',
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete'
} as const;


export type ModuleKey = keyof typeof MODULES;
export type ActionType = typeof ACTIONS[keyof typeof ACTIONS];


export const getPermission = (
    moduleKey: ModuleKey,
    action: ActionType,
    submodule?: string
): string => {
    const module = MODULES[moduleKey].key;

    return submodule
        ? `${module}:${submodule}:${action}`
        : `${module}:${action}`;
};
export const     = (): string[] => {
    const permissions: string[] = [];
    Object.values(MODULES).forEach(module => {
        Object.values(ACTIONS).forEach(action => {
            permissions.push(`${module.key}:${action}`)
        })
    });
    return permissions;
}