'use client';

import { useSession } from 'next-auth/react';
import {
  decodeJwtPayload,
  extractZitadelRoles,
  hasZitadelAdminRole,
} from '@/lib/jwt';

interface GrafanaDashboardProps {
  /**
   * Dashboard UID from Grafana
   * Example: 'api-logs' or 'abc123'
   */
  dashboardUid: string;

  /**
   * Grafana path override (useful for non-dashboard pages like /explore).
   * Example: '/explore' or '/d/<uid>/<slug>'.
   */
  path?: string;

  /**
   * Dashboard slug (optional, for better URLs)
   * Example: 'api-logs-dashboard'
   */
  dashboardSlug?: string;

  /**
   * Organization ID (default: 1)
   */
  orgId?: number;

  /**
   * Auto-refresh interval
   * Examples: '5s', '10s', '1m', '5m'
   */
  refresh?: string;

  /**
   * Time range start
   * Examples: 'now-1h', 'now-24h', '2024-01-01T00:00:00Z'
   */
  from?: string;

  /**
   * Time range end
   * Examples: 'now', '2024-01-02T00:00:00Z'
   */
  to?: string;

  /**
   * Kiosk mode
   * - undefined: normal mode
   * - 'kiosk': hides top navigation
   * - 'tv': full kiosk mode (recommended for embedding)
   */
  kiosk?: 'kiosk' | 'tv';

  /**
   * Height of the iframe
   */
  height?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Grafana Dashboard Component
 *
 * Embeds a Grafana dashboard via a configurable base URL.
 * - `NEXT_PUBLIC_GRAFANA_URL` (recommended when Grafana is exposed, e.g. http://localhost:3002)
 * - fallback: `/internal/grafana` (Ingress path routing)
 * Only accessible to admin users.
 *
 * @example
 * ```tsx
 * <GrafanaDashboard
 *   dashboardUid="api-logs"
 *   dashboardSlug="api-logs-dashboard"
 *   refresh="5s"
 *   from="now-1h"
 *   to="now"
 *   kiosk="tv"
 * />
 * ```
 */
export function GrafanaDashboard({
  dashboardUid,
  path,
  dashboardSlug,
  orgId = 1,
  refresh,
  from = 'now-1h',
  to = 'now',
  kiosk = 'tv',
  height = '600px',
  className = '',
}: GrafanaDashboardProps) {
  const { data: session, status } = useSession();
  const idPayload = session?.idToken ? decodeJwtPayload(session.idToken) : null;
  const accessPayload = session?.accessToken
    ? decodeJwtPayload(session.accessToken)
    : null;
  const isAdmin =
    hasZitadelAdminRole(idPayload) || hasZitadelAdminRole(accessPayload);
  const idRoles = extractZitadelRoles(idPayload);
  const accessRoles = extractZitadelRoles(accessPayload);
  const roles = idRoles.length > 0 ? idRoles : accessRoles;
  const error =
    status === 'authenticated' &&
    Boolean(session?.idToken || session?.accessToken) &&
    !isAdmin &&
    roles.length === 0
      ? 'No ZITADEL roles found in token. Ensure the user is granted a project role (e.g. admin) and re-login.'
      : null;

  // Build Grafana URL
  const buildDashboardUrl = () => {
    const base =
      (process.env.NEXT_PUBLIC_GRAFANA_URL || '').trim().replace(/\/$/, '') ||
      '/internal/grafana';
    const params = new URLSearchParams();
    params.set('orgId', orgId.toString());

    if (kiosk) params.set('kiosk', kiosk);
    if (refresh) params.set('refresh', refresh);
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const slug = dashboardSlug || dashboardUid;
    const grafanaPath = path || `/d/${dashboardUid}/${slug}`;
    return `${base}${grafanaPath}?${params.toString()}`;
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return (
      <div
        className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Non authentifié
          </h3>
          <p className="text-red-600">
            Veuillez vous connecter pour accéder aux dashboards.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div
        className={`flex items-center justify-center bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <svg
            className="w-16 h-16 text-yellow-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Accès refusé
          </h3>
          <p className="text-yellow-700">
            Vous devez avoir le rôle <strong>admin</strong> pour accéder aux
            dashboards.
          </p>
        </div>
      </div>
    );
  }

  // Render iframe
  return (
    <div className={`relative ${className}`}>
      <iframe
        src={buildDashboardUrl()}
        width="100%"
        height={height}
        title="Grafana Dashboard"
        allow="fullscreen"
        className="rounded-lg shadow-lg"
      />
    </div>
  );
}
