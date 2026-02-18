export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payloadB64Url = parts[1];
    if (!payloadB64Url) return null;

    const b64 = payloadB64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');

    const json =
      typeof globalThis.atob === 'function'
        ? globalThis.atob(padded)
        : Buffer.from(padded, 'base64').toString('binary');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function extractZitadelRoles(
  payload: Record<string, unknown> | null,
): string[] {
  if (!payload) return [];

  const roles = new Set<string>();
  const looksLikeId = (value: string) => /^\d{10,}$/.test(value);

  const roleClaimEntries = Object.entries(payload).filter(([key]) => {
    if (key === 'urn:zitadel:iam:org:project:roles') return true;
    if (key === 'urn:zitadel:iam:org:projects:roles') return true;
    return (
      key.startsWith('urn:zitadel:iam:org:project:') && key.endsWith(':roles')
    );
  });

  for (const [, value] of roleClaimEntries) {
    if (typeof value === 'object' && value !== null) {
      for (const [roleName, roleValue] of Object.entries(
        value as Record<string, unknown>,
      )) {
        // ZITADEL role claims may either map role names directly, or map a project id
        // to another object containing the role names. In the latter case we must
        // not treat the project id as a role.
        if (!looksLikeId(roleName)) {
          roles.add(roleName);
        }

        if (typeof roleValue === 'object' && roleValue !== null) {
          for (const nestedRoleName of Object.keys(
            roleValue as Record<string, unknown>,
          )) {
            if (!looksLikeId(nestedRoleName)) {
              roles.add(nestedRoleName);
            }
          }
        }
      }
    }
  }

  const groups = Array.isArray(payload.groups) ? payload.groups : [];
  for (const group of groups) {
    if (typeof group === 'string') roles.add(group);
  }

  return Array.from(roles);
}

export function hasZitadelAdminRole(
  payload: Record<string, unknown> | null,
): boolean {
  if (!payload) return false;

  const roleClaimEntries = Object.entries(payload).filter(([key]) => {
    if (key === 'urn:zitadel:iam:org:project:roles') return true;
    if (key === 'urn:zitadel:iam:org:projects:roles') return true;
    return (
      key.startsWith('urn:zitadel:iam:org:project:') && key.endsWith(':roles')
    );
  });

  for (const [, value] of roleClaimEntries) {
    if (typeof value === 'object' && value !== null) {
      if ('admin' in value) return true;
      // Sometimes roles can be nested by project id, scan one level deep
      for (const nested of Object.values(value as Record<string, unknown>)) {
        if (
          typeof nested === 'object' &&
          nested !== null &&
          'admin' in nested
        ) {
          return true;
        }
      }
    }
  }

  const groups = Array.isArray(payload.groups) ? payload.groups : [];
  return groups.includes('admin');
}
