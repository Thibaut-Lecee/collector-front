# Collector Front

Frontend Next.js pour le projet Collector, avec authentification ZITADEL via NextAuth.

## Prérequis

- Node.js (voir `.nvmrc`)
- API Collector accessible (par défaut `http://localhost:3001/api`)
- Instance ZITADEL configurée

## Variables d'environnement

Copier le fichier d'exemple puis adapter les valeurs:

```bash
cp .env.example .env.local
```

Variables clés:

- `NEXT_PUBLIC_API_URL`
- `SESSION_SECRET`
- `SESSION_DURATION`
- `ZITADEL_DOMAIN` ou `ZITADEL_ISSUER`
- `ZITADEL_CLIENT_ID`
- `ZITADEL_CLIENT_SECRET`
- `ZITADEL_CALLBACK_URL`
- `ZITADEL_POST_LOGOUT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## Démarrage local

```bash
npm install
npm run dev
```

Application: `http://localhost:3000`

## Scripts

```bash
npm run prepack      # Typecheck
npm run lint         # Lint Next.js
npm run format       # Prettier
npm run test         # Playwright E2E
npm run test:e2e     # Alias Playwright E2E
npm run build
npm run start
```

## Notes techniques

- Le logout applicatif et ZITADEL passe par:
  - `POST /api/auth/logout`
  - `GET /api/auth/logout/callback`
- Le dashboard Grafana est exposé via le rewrite `/internal/grafana/:path*` vers l'API backend.
