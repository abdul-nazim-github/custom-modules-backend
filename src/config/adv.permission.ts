export const MODULES = {
    PROFILE: {
        key: 'profile',
        submodules: {}
    },
    SETTINGS: {
        key: 'settings',
        submodules: {}
    },
    CLOSETAB: {
        key: 'closetab',
        submodules: {}
    },
    ACTIVITY: {
        key: 'activity',
        submodules: {}
    },
    SECURITY: {
        key: 'security',
        submodules: {
            EMAIL: {
                key: 'email',
                submodules: {}
            },
        }
    }
} as const;

export const ACTIONS = {
    VIEW: 'view',
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
    TAB: 'tab',
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
        ? `${module}.${submodule}.${action}`
        : `${module}.${action}`;
};

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


//  SECURITY: {
//         key: 'security',
//         submodules: {
//             EMAIL: {             // The internal reference name
//                 key: 'email',    // The string used in the permission (e.g., security.email.view)
//                 submodules: {}   // Empty because it has no further sub-levels
//             },
//             SMS: {               // You can add multiple submodules here
//                 key: 'sms',
//                 submodules: {}
//             }
//         }
//     }