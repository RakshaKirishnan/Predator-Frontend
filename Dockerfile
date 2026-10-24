
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app


COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_FACE_AUTH_API_URL=http://localhost:8090
ENV NEXT_PUBLIC_FACE_AUTH_API_URL=${NEXT_PUBLIC_FACE_AUTH_API_URL}

RUN npm run build

FROM node:20-alpine AS runtime

LABEL org.opencontainers.image.title="Predator – Face Auth Frontend" \
      org.opencontainers.image.description="Next.js face-capture UI for the Predator authentication system" \
      org.opencontainers.image.version="1.0.0"

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static  ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public         ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/ > /dev/null || exit 1

CMD ["node", "server.js"]
