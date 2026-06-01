FROM --platform=linux/amd64 node:20-slim
WORKDIR /app

# Layer 1: Backend deps (cached unless package.json changes)
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# Layer 2: Pre-built frontend static files
COPY frontend/dist ./public

# Layer 3: Backend source
COPY backend/ .

ENV NODE_ENV=production
ENV PORT=8080
ENV ENVIRONMENT=spcs
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["node", "index.js"]
