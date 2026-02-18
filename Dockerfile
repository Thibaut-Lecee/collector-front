# -----------------------
# Build Stage
# -----------------------
FROM node:25-alpine AS builder

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code
COPY . .

# Build Next.js application with standalone output
RUN \
  NODE_ENV=production \
  NEXTAUTH_URL="http://localhost:3000" \
  SESSION_SECRET="build-only-secret" \
  SESSION_DURATION="3600" \
  ZITADEL_DOMAIN="https://example.com" \
  ZITADEL_CLIENT_ID="build-only-client-id" \
  ZITADEL_CLIENT_SECRET="build-only-client-secret" \
  ZITADEL_CALLBACK_URL="http://localhost:3000/api/auth/callback/zitadel" \
  ZITADEL_POST_LOGOUT_URL="http://localhost:3000/api/auth/logout/callback" \
  pnpm run build

# -----------------------
# Production Stage
# -----------------------
FROM node:25-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./app/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./app/public

# Switch to non-root user
USER nextjs

# Run the standalone server from the app directory (Next.js output layout)
WORKDIR /app/app

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start application
CMD ["node", "server.js"]
