'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GrafanaDashboard } from '@/components/GrafanaDashboard';
import { decodeJwtPayload, hasZitadelAdminRole } from '@/lib/jwt';

type DashboardConfig = {
  id: string;
  title: string;
  description: string;
  dashboardUid: string;
  dashboardSlug: string;
  path?: string;
  refresh?: string;
  from?: string;
  to?: string;
};

const DASHBOARDS: DashboardConfig[] = [
  {
    id: 'api-logs',
    title: 'Logs API',
    description: "Visualisation en temps réel des logs de l'API",
    dashboardUid: 'api-logs',
    dashboardSlug: 'api-logs-dashboard',
    refresh: '5s',
    from: 'now-1h',
    to: 'now',
  },
  {
    id: 'api-metrics',
    title: 'Metrics API',
    description: "Métriques de l'API via Prometheus (RPS, latences, erreurs, CPU/RAM)",
    dashboardUid: 'api-metrics',
    dashboardSlug: 'api-metrics',
    refresh: '5s',
    from: 'now-15m',
    to: 'now',
  },
  {
    id: 'k6-overview',
    title: 'Load tests (k6)',
    description:
      "Vue k6 (VUs, throughput, latences) envoyée dans Prometheus via remote write. Lance `make k6-load` pour alimenter les graphes.",
    dashboardUid: 'k6-overview',
    dashboardSlug: 'k6-overview',
    refresh: '5s',
    from: 'now-15m',
    to: 'now',
  },
  {
    id: 'explore',
    title: 'Exploration',
    description: "Interface d'exploration des logs avec LogQL",
    dashboardUid: 'explore',
    dashboardSlug: 'explore',
    path: '/explore',
    from: 'now-1h',
    to: 'now',
  },
];

export default function MonitoringPage() {
  const { data: session, status } = useSession();
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardConfig>(
    DASHBOARDS[0],
  );
  const grafanaBaseUrl =
    (process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://localhost:3002')
      .trim()
      .replace(/\/$/, '') || 'http://localhost:3002';
  const prometheusBaseUrl =
    (process.env.NEXT_PUBLIC_PROMETHEUS_URL || 'http://localhost:9090')
      .trim()
      .replace(/\/$/, '') || 'http://localhost:9090';
  const idPayload = session?.idToken ? decodeJwtPayload(session.idToken) : null;
  const accessPayload = session?.accessToken
    ? decodeJwtPayload(session.accessToken)
    : null;
  const isAdmin =
    hasZitadelAdminRole(idPayload) || hasZitadelAdminRole(accessPayload);

  useEffect(() => {
    if (status === 'unauthenticated') {
      void signIn('zitadel', { callbackUrl: '/admin/monitoring' });
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated' && !isAdmin) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 px-6 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Acces refuse
            </h1>
            <p className="text-gray-600">
              Vous devez avoir le role <strong>admin</strong> pour acceder aux
              dashboards Grafana.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Monitoring & Logs
              </h1>
              <p className="text-gray-600">
                Dashboards Grafana pour la surveillance de l&apos;API et
                l&apos;analyse des logs
              </p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <a
                  href={grafanaBaseUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                  title="Ouvrir Grafana"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 3h7v7m0-7L10 14m-4 7H3v-3"
                    />
                  </svg>
                  Ouvrir Grafana
                </a>
                <a
                  href={prometheusBaseUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                  title="Ouvrir Prometheus"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 3h7v7m0-7L10 14m-4 7H3v-3"
                    />
                  </svg>
                  Ouvrir Prometheus
                </a>
              </div>
            )}
          </div>

          {/* Dashboard Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Dashboards">
                {DASHBOARDS.map((dashboard) => (
                  <button
                    key={dashboard.id}
                    onClick={() => setSelectedDashboard(dashboard)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${
                        selectedDashboard.id === dashboard.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {dashboard.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Dashboard Description */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {selectedDashboard.description}
            </p>
          </div>

          {/* Dashboard Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <GrafanaDashboard
              dashboardUid={selectedDashboard.dashboardUid}
              dashboardSlug={selectedDashboard.dashboardSlug}
              path={selectedDashboard.path}
              refresh={selectedDashboard.refresh}
              from={selectedDashboard.from}
              to={selectedDashboard.to}
              kiosk="tv"
              height="800px"
              className="w-full"
            />
          </div>

          {/* Info Box */}
          {isAdmin && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Accès administrateur
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Vous avez accès aux dashboards Grafana en tant
                      qu&apos;administrateur. Les dashboards se rafraîchissent
                      automatiquement toutes les{' '}
                      {selectedDashboard.refresh || '30s'}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
