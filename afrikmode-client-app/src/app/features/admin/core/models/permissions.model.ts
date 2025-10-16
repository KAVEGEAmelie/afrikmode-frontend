// src/app/features/admin/core/models/permissions.model.ts

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: ModuleType;
  actions: ActionType[];
}

export type ModuleType = 
  | 'dashboard'
  | 'users' 
  | 'products' 
  | 'orders' 
  | 'stores' 
  | 'analytics' 
  | 'marketing'
  | 'settings'
  | 'reports'
  | 'support'
  | 'security'
  | 'content';

export type ActionType = 
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'suspend'
  | 'export'
  | 'import'
  | 'manage'
  | 'configure';

export interface RolePermissions {
  role: AdminRoleType;
  permissions: Permission[];
  restrictions?: RoleRestriction[];
}

export type AdminRoleType = 
  | 'super_admin'    // Accès total 
  | 'admin'          // Accès large mais limité
  | 'manager'        // Gestion des opérations
  | 'vendor_admin'   // Gestion de magasin
  | 'support'        // Support client
  | 'analyst'        // Analytics et rapports
  | 'content_manager'// Gestion du contenu
  | 'moderator';     // Modération

export interface RoleRestriction {
  module: ModuleType;
  action: ActionType;
  condition?: string;
  message: string;
}

// Définition des permissions par module
export const MODULE_PERMISSIONS: Record<ModuleType, Permission[]> = {
  dashboard: [
    {
      id: 'dashboard.view',
      name: 'Voir le dashboard',
      description: 'Accès au tableau de bord principal',
      module: 'dashboard',
      actions: ['view']
    }
  ],
  
  users: [
    {
      id: 'users.view',
      name: 'Voir les utilisateurs',
      description: 'Consulter la liste des utilisateurs',
      module: 'users',
      actions: ['view']
    },
    {
      id: 'users.create',
      name: 'Créer des utilisateurs',
      description: 'Ajouter de nouveaux utilisateurs',
      module: 'users',
      actions: ['create']
    },
    {
      id: 'users.edit',
      name: 'Modifier les utilisateurs',
      description: 'Éditer les informations utilisateur',
      module: 'users',
      actions: ['edit']
    },
    {
      id: 'users.delete',
      name: 'Supprimer des utilisateurs',
      description: 'Supprimer des comptes utilisateur',
      module: 'users',
      actions: ['delete']
    },
    {
      id: 'users.suspend',
      name: 'Suspendre des utilisateurs',
      description: 'Suspendre ou bannir des utilisateurs',
      module: 'users',
      actions: ['suspend']
    },
    {
      id: 'users.export',
      name: 'Exporter les utilisateurs',
      description: 'Exporter des données utilisateur',
      module: 'users',
      actions: ['export']
    }
  ],

  products: [
    {
      id: 'products.view',
      name: 'Voir les produits',
      description: 'Consulter le catalogue produits',
      module: 'products',
      actions: ['view']
    },
    {
      id: 'products.create',
      name: 'Créer des produits',
      description: 'Ajouter de nouveaux produits',
      module: 'products',
      actions: ['create']
    },
    {
      id: 'products.edit',
      name: 'Modifier les produits',
      description: 'Éditer les produits existants',
      module: 'products',
      actions: ['edit']
    },
    {
      id: 'products.delete',
      name: 'Supprimer des produits',
      description: 'Supprimer des produits du catalogue',
      module: 'products',
      actions: ['delete']
    },
    {
      id: 'products.approve',
      name: 'Approuver les produits',
      description: 'Valider les produits en attente',
      module: 'products',
      actions: ['approve']
    }
  ],

  orders: [
    {
      id: 'orders.view',
      name: 'Voir les commandes',
      description: 'Consulter les commandes',
      module: 'orders',
      actions: ['view']
    },
    {
      id: 'orders.edit',
      name: 'Modifier les commandes',
      description: 'Éditer le statut des commandes',
      module: 'orders',
      actions: ['edit']
    },
    {
      id: 'orders.export',
      name: 'Exporter les commandes',
      description: 'Exporter des données de commandes',
      module: 'orders',
      actions: ['export']
    }
  ],

  stores: [
    {
      id: 'stores.view',
      name: 'Voir les magasins',
      description: 'Consulter les magasins',
      module: 'stores',
      actions: ['view']
    },
    {
      id: 'stores.create',
      name: 'Créer des magasins',
      description: 'Ajouter de nouveaux magasins',
      module: 'stores',
      actions: ['create']
    },
    {
      id: 'stores.edit',
      name: 'Modifier les magasins',
      description: 'Éditer les informations des magasins',
      module: 'stores',
      actions: ['edit']
    },
    {
      id: 'stores.approve',
      name: 'Approuver les magasins',
      description: 'Valider les demandes de magasins',
      module: 'stores',
      actions: ['approve']
    }
  ],

  analytics: [
    {
      id: 'analytics.view',
      name: 'Voir les analytics',
      description: 'Accès aux données analytiques',
      module: 'analytics',
      actions: ['view']
    },
    {
      id: 'analytics.export',
      name: 'Exporter les analytics',
      description: 'Exporter des rapports analytiques',
      module: 'analytics',
      actions: ['export']
    }
  ],

  marketing: [
    {
      id: 'marketing.view',
      name: 'Voir le marketing',
      description: 'Accès aux campagnes marketing',
      module: 'marketing',
      actions: ['view']
    },
    {
      id: 'marketing.create',
      name: 'Créer des campagnes',
      description: 'Créer des campagnes marketing',
      module: 'marketing',
      actions: ['create']
    },
    {
      id: 'marketing.edit',
      name: 'Modifier les campagnes',
      description: 'Éditer les campagnes existantes',
      module: 'marketing',
      actions: ['edit']
    }
  ],

  settings: [
    {
      id: 'settings.view',
      name: 'Voir les paramètres',
      description: 'Accès aux paramètres système',
      module: 'settings',
      actions: ['view']
    },
    {
      id: 'settings.configure',
      name: 'Configurer le système',
      description: 'Modifier les paramètres système',
      module: 'settings',
      actions: ['configure']
    }
  ],

  reports: [
    {
      id: 'reports.view',
      name: 'Voir les rapports',
      description: 'Accès aux rapports système',
      module: 'reports',
      actions: ['view']
    },
    {
      id: 'reports.create',
      name: 'Créer des rapports',
      description: 'Générer de nouveaux rapports',
      module: 'reports',
      actions: ['create']
    },
    {
      id: 'reports.export',
      name: 'Exporter les rapports',
      description: 'Exporter des rapports',
      module: 'reports',
      actions: ['export']
    }
  ],

  support: [
    {
      id: 'support.view',
      name: 'Voir le support',
      description: 'Accès aux tickets de support',
      module: 'support',
      actions: ['view']
    },
    {
      id: 'support.edit',
      name: 'Gérer le support',
      description: 'Répondre aux tickets de support',
      module: 'support',
      actions: ['edit']
    }
  ],

  security: [
    {
      id: 'security.view',
      name: 'Voir la sécurité',
      description: 'Accès aux logs de sécurité',
      module: 'security',
      actions: ['view']
    },
    {
      id: 'security.manage',
      name: 'Gérer la sécurité',
      description: 'Configurer les paramètres de sécurité',
      module: 'security',
      actions: ['manage']
    }
  ],

  content: [
    {
      id: 'content.view',
      name: 'Voir le contenu',
      description: 'Accès au contenu du site',
      module: 'content',
      actions: ['view']
    },
    {
      id: 'content.edit',
      name: 'Modifier le contenu',
      description: 'Éditer le contenu du site',
      module: 'content',
      actions: ['edit']
    }
  ]
};

// Configuration des permissions par rôle
export const ROLE_PERMISSIONS_CONFIG: Record<AdminRoleType, RolePermissions> = {
  super_admin: {
    role: 'super_admin',
    permissions: Object.values(MODULE_PERMISSIONS).flat(), // Toutes les permissions
    restrictions: []
  },

  admin: {
    role: 'admin',
    permissions: [
      ...MODULE_PERMISSIONS.dashboard,
      ...MODULE_PERMISSIONS.users,
      ...MODULE_PERMISSIONS.products,
      ...MODULE_PERMISSIONS.orders,
      ...MODULE_PERMISSIONS.stores,
      ...MODULE_PERMISSIONS.analytics,
      ...MODULE_PERMISSIONS.marketing,
      ...MODULE_PERMISSIONS.reports,
      ...MODULE_PERMISSIONS.support
    ],
    restrictions: [
      {
        module: 'settings',
        action: 'configure',
        message: 'Seuls les super admins peuvent modifier les paramètres système'
      },
      {
        module: 'security',
        action: 'manage',
        message: 'Gestion de la sécurité réservée aux super admins'
      }
    ]
  },

  manager: {
    role: 'manager',
    permissions: [
      ...MODULE_PERMISSIONS.dashboard,
      ...MODULE_PERMISSIONS.users.filter(p => !p.actions.includes('delete')),
      ...MODULE_PERMISSIONS.products,
      ...MODULE_PERMISSIONS.orders,
      ...MODULE_PERMISSIONS.stores.filter(p => !p.actions.includes('delete')),
      ...MODULE_PERMISSIONS.analytics,
      ...MODULE_PERMISSIONS.reports
    ],
    restrictions: [
      {
        module: 'users',
        action: 'delete',
        message: 'Les managers ne peuvent pas supprimer des utilisateurs'
      }
    ]
  },

  vendor_admin: {
    role: 'vendor_admin',
    permissions: [
      ...MODULE_PERMISSIONS.dashboard,
      ...MODULE_PERMISSIONS.products,
      ...MODULE_PERMISSIONS.orders,
      MODULE_PERMISSIONS.stores.find(p => p.id === 'stores.view')!,
      MODULE_PERMISSIONS.stores.find(p => p.id === 'stores.edit')!,
      ...MODULE_PERMISSIONS.analytics.filter(p => p.actions.includes('view'))
    ],
    restrictions: [
      {
        module: 'users',
        action: 'view',
        condition: 'own_customers_only',
        message: 'Accès limité aux clients de votre magasin'
      }
    ]
  },

  support: {
    role: 'support',
    permissions: [
      MODULE_PERMISSIONS.dashboard.find(p => p.id === 'dashboard.view')!,
      MODULE_PERMISSIONS.users.find(p => p.id === 'users.view')!,
      MODULE_PERMISSIONS.users.find(p => p.id === 'users.edit')!,
      MODULE_PERMISSIONS.orders.find(p => p.id === 'orders.view')!,
      MODULE_PERMISSIONS.orders.find(p => p.id === 'orders.edit')!,
      ...MODULE_PERMISSIONS.support
    ],
    restrictions: []
  },

  analyst: {
    role: 'analyst',
    permissions: [
      MODULE_PERMISSIONS.dashboard.find(p => p.id === 'dashboard.view')!,
      ...MODULE_PERMISSIONS.analytics,
      ...MODULE_PERMISSIONS.reports
    ],
    restrictions: []
  },

  content_manager: {
    role: 'content_manager',
    permissions: [
      MODULE_PERMISSIONS.dashboard.find(p => p.id === 'dashboard.view')!,
      ...MODULE_PERMISSIONS.content,
      ...MODULE_PERMISSIONS.marketing
    ],
    restrictions: []
  },

  moderator: {
    role: 'moderator',
    permissions: [
      MODULE_PERMISSIONS.dashboard.find(p => p.id === 'dashboard.view')!,
      MODULE_PERMISSIONS.users.find(p => p.id === 'users.view')!,
      MODULE_PERMISSIONS.users.find(p => p.id === 'users.suspend')!,
      MODULE_PERMISSIONS.products.find(p => p.id === 'products.view')!,
      MODULE_PERMISSIONS.products.find(p => p.id === 'products.approve')!,
      MODULE_PERMISSIONS.stores.find(p => p.id === 'stores.view')!,
      MODULE_PERMISSIONS.stores.find(p => p.id === 'stores.approve')!,
      ...MODULE_PERMISSIONS.support
    ],
    restrictions: []
  }
};