export type StudioRole = 'admin' | 'moderator' | 'overlay_manager' | 'viewer';

export interface StudioPermission {
  action: string;
  resource: string;
}

export interface StudioRoleDefinition {
  role: StudioRole;
  description: string;
  permissions: StudioPermission[];
}

export const StudioRoles: Record<StudioRole, StudioRoleDefinition> = {
  admin: {
    role: 'admin',
    description: 'Full access to all Studio Edition features, settings, and billing.',
    permissions: [
      { action: '*', resource: '*' }
    ]
  },
  moderator: {
    role: 'moderator',
    description: 'Can manage chat, ban users, and review moderation logs.',
    permissions: [
      { action: 'read', resource: 'chat' },
      { action: 'write', resource: 'chat' },
      { action: 'moderate', resource: 'users' },
      { action: 'read', resource: 'moderation_logs' },
      { action: 'update', resource: 'identity_links' }
    ]
  },
  overlay_manager: {
    role: 'overlay_manager',
    description: 'Can change themes, switch scenes, and manage plugins.',
    permissions: [
      { action: 'read', resource: 'themes' },
      { action: 'update', resource: 'themes' },
      { action: 'read', resource: 'plugins' },
      { action: 'manage', resource: 'plugins' },
      { action: 'manage', resource: 'obs_scenes' }
    ]
  },
  viewer: {
    role: 'viewer',
    description: 'Read-only access to specific dashboards.',
    permissions: [
      { action: 'read', resource: 'chat' },
      { action: 'read', resource: 'analytics' }
    ]
  }
};

export function hasPermission(role: StudioRole, action: string, resource: string): boolean {
  const roleDef = StudioRoles[role];
  if (!roleDef) return false;

  for (const perm of roleDef.permissions) {
    if (perm.action === '*' && perm.resource === '*') return true;
    if (perm.action === action && (perm.resource === resource || perm.resource === '*')) return true;
  }
  return false;
}
