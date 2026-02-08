# Grafana Integration - Frontend

## Overview

Le frontend Next.js intègre maintenant les dashboards Grafana via le reverse proxy sécurisé de l'API. Seuls les utilisateurs avec le rôle **admin** dans Zitadel peuvent accéder aux dashboards.

---

## Composants créés

### 1. `GrafanaDashboard` Component

**Fichier**: `src/components/GrafanaDashboard.tsx`

Composant réutilisable pour afficher un dashboard Grafana dans une iframe.

**Fonctionnalités**:

- ✅ Détection automatique du rôle admin depuis le JWT Zitadel
- ✅ États de chargement, erreur, et accès refusé
- ✅ Configuration flexible (refresh, time range, kiosk mode)
- ✅ Styles Tailwind CSS

**Exemple d'utilisation**:

```tsx
import { GrafanaDashboard } from '@/components/GrafanaDashboard';

<GrafanaDashboard
  dashboardUid="api-logs"
  dashboardSlug="api-logs-dashboard"
  refresh="5s"
  from="now-1h"
  to="now"
  kiosk="tv"
  height="800px"
/>;
```

---

### 2. Page Monitoring Admin

**Fichier**: `src/app/admin/monitoring/page.tsx`

Page dédiée pour les administrateurs avec navigation entre plusieurs dashboards.

**URL**: `/admin/monitoring`

**Fonctionnalités**:

- ✅ Navigation par onglets entre dashboards
- ✅ Vérification du rôle admin
- ✅ Redirection automatique vers login si non authentifié
- ✅ Interface responsive avec Tailwind CSS

---

## Configuration

### Variables d'environnement

Aucune nouvelle variable requise ! Le composant utilise:

- `session.accessToken` de NextAuth pour l'authentification
- Le JWT contient déjà les rôles Zitadel

### Next.js Configuration

Le proxy `/internal/grafana/*` est automatiquement géré par Next.js et redirigé vers l'API backend.

**Fichier**: `next.config.ts` (si besoin de configuration proxy)

```typescript
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/internal/grafana/:path*',
        destination: 'http://localhost:5005/internal/grafana/:path*',
      },
    ];
  },
};
```

---

## Détection du rôle Admin

Le composant détecte le rôle admin en décodant le JWT:

```typescript
const payload = JSON.parse(atob(session.accessToken.split('.')[1]));

// Méthode 1: Zitadel project roles
const zitadelRoles = payload['urn:zitadel:iam:org:project:roles'];
const isAdmin = zitadelRoles && 'admin' in zitadelRoles;

// Méthode 2: Groups array (fallback)
const groups = payload.groups || [];
const isAdminGroup = groups.includes('admin');
```

---

## Dashboards disponibles

### 1. Logs API

- **UID**: `api-logs`
- **Description**: Visualisation en temps réel des logs de l'API
- **Refresh**: 5 secondes
- **Time range**: Dernière heure

### 2. Exploration

- **UID**: `explore`
- **Description**: Interface d'exploration des logs avec LogQL
- **Time range**: Dernière heure

---

## Utilisation

### Accéder à la page de monitoring

1. **Se connecter** avec un compte admin Zitadel
2. **Naviguer** vers `/admin/monitoring`
3. **Sélectionner** un dashboard via les onglets
4. **Visualiser** les logs en temps réel

### Ajouter un nouveau dashboard

Éditez `src/app/admin/monitoring/page.tsx`:

```typescript
const DASHBOARDS: DashboardConfig[] = [
  // ... dashboards existants
  {
    id: 'custom-dashboard',
    title: 'Mon Dashboard',
    description: 'Description du dashboard',
    dashboardUid: 'dashboard-uid-from-grafana',
    dashboardSlug: 'dashboard-slug',
    refresh: '10s',
    from: 'now-6h',
    to: 'now',
  },
];
```

---

## Sécurité

### Vérifications en place

1. **Authentication NextAuth**: Vérification de la session
2. **Role Check**: Décodage du JWT pour vérifier le rôle admin
3. **Backend Proxy**: L'API vérifie également le rôle admin
4. **No Direct Access**: Grafana n'est pas accessible publiquement

### États d'erreur

Le composant gère automatiquement:

- ❌ **Non authentifié**: Affiche un message et icône de cadenas
- ❌ **Non admin**: Affiche un message d'accès refusé
- ❌ **Erreur JWT**: Affiche un message d'erreur générique
- ⏳ **Chargement**: Affiche un spinner

---

## Personnalisation

### Styles

Le composant utilise Tailwind CSS. Vous pouvez personnaliser:

```tsx
<GrafanaDashboard
  className="my-custom-class"
  height="600px"
  // ... autres props
/>
```

### Kiosk Mode

Options disponibles:

- `kiosk="tv"`: Mode plein écran (recommandé)
- `kiosk="kiosk"`: Cache la navigation supérieure
- `kiosk={undefined}`: Mode normal

### Time Range

Exemples:

```tsx
from = 'now-1h'; // Dernière heure
from = 'now-24h'; // Dernières 24 heures
from = 'now-7d'; // Dernière semaine
to = 'now'; // Maintenant
```

### Auto-refresh

Exemples:

```tsx
refresh = '5s'; // 5 secondes
refresh = '30s'; // 30 secondes
refresh = '1m'; // 1 minute
refresh = '5m'; // 5 minutes
```

---

## Troubleshooting

### Dashboard ne charge pas

**Vérifier**:

1. L'utilisateur a-t-il le rôle admin dans Zitadel ?
2. Le backend API est-il démarré ?
3. Le dashboard UID existe-t-il dans Grafana ?

**Console browser**:

```javascript
// Vérifier le JWT
const token = session.accessToken;
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Roles:', payload['urn:zitadel:iam:org:project:roles']);
```

### Erreur CORS

Si vous voyez des erreurs CORS, vérifiez:

1. `CORS_ORIGIN` dans l'API backend inclut votre frontend URL
2. Next.js proxy configuration (si utilisé)

### Iframe bloquée

Certains navigateurs bloquent les iframes. Vérifiez:

1. Grafana `allow_embedding = true` dans `grafana.ini`
2. Pas de Content-Security-Policy bloquante

---

## Développement

### Tester localement

```bash
# Terminal 1: Backend API
cd collector-api
npm run dev

# Terminal 2: Frontend
cd collector-front
npm run dev

# Accéder à http://localhost:3000/admin/monitoring
```

### Créer des dashboards Grafana

1. Accéder à Grafana admin: `http://localhost:5005/internal/grafana/`
2. Login: `admin` / `admin`
3. Créer un dashboard
4. Copier le UID depuis l'URL
5. Ajouter à `DASHBOARDS` array dans `monitoring/page.tsx`

---

## Prochaines étapes

- [ ] Créer des dashboards personnalisés dans Grafana
- [ ] Ajouter plus de dashboards à la page monitoring
- [ ] Implémenter des filtres de temps personnalisés
- [ ] Ajouter des alertes visuelles pour les erreurs
- [ ] Créer une page d'administration complète

---

## Ressources

- [Grafana Embedding Documentation](https://grafana.com/docs/grafana/latest/dashboards/share-dashboards-panels/#embed-a-dashboard-or-panel)
- [Grafana Kiosk Mode](https://grafana.com/docs/grafana/latest/dashboards/use-dashboards/#kiosk-mode)
- [LogQL Query Language](https://grafana.com/docs/loki/latest/logql/)
