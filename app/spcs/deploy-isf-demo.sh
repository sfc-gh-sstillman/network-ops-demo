#!/bin/bash
set -euo pipefail
# =============================================================================
# ISF Demo Hub — Build + Push Network Ops App to sfsenorthamerica-sstillman_test
# =============================================================================
# Usage: ./spcs/deploy-isf-demo.sh [version]
#
# Prereqs:
#   - Docker Desktop running
#   - snow CLI authenticated with sfsenorthamerica-sstillman_test connection
# =============================================================================

VERSION="${1:-v1}"
REGISTRY="sfsenorthamerica-sstillman-test.registry.snowflakecomputing.com"
IMAGE="${REGISTRY}/isf_demos/apps/images/network-ops-app"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

echo "==> Logging into Snowflake container registry..."
snow spcs image-registry token --connection sfsenorthamerica-sstillman_test --format json 2>/dev/null \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" \
  | docker login "${REGISTRY}" -u 0sessiontoken --password-stdin

echo "==> Building frontend..."
cd "${APP_DIR}/frontend" && npm run build
cd "${APP_DIR}"

echo "==> Building Docker image (linux/amd64)..."
docker build \
  --platform linux/amd64 \
  --load \
  -t "${IMAGE}:${VERSION}" \
  -f Dockerfile .

echo "==> Pushing image..."
docker push "${IMAGE}:${VERSION}"

echo "==> Image pushed: ${IMAGE}:${VERSION}"
echo ""
echo "==> Next steps — run in Snowflake:"
echo ""
echo "    USE ROLE ISF_DEMO_ADMIN;"
echo "    USE SCHEMA ISF_DEMOS.APPS;"
echo "    PUT file://${APP_DIR}/spcs/service-isf-demo.yaml @ISF_DEMOS.APPS.SPECS AUTO_COMPRESS=FALSE OVERWRITE=TRUE;"
echo ""
echo "    CREATE SERVICE IF NOT EXISTS ISF_DEMOS.APPS.NETWORK_OPS_DEMO"
echo "      IN COMPUTE POOL ISF_DEMO_POOL"
echo "      FROM @ISF_DEMOS.APPS.SPECS"
echo "      SPECIFICATION_FILE='service-isf-demo.yaml';"
echo ""
echo "    -- Get public URL:"
echo "    SHOW ENDPOINTS IN SERVICE ISF_DEMOS.APPS.NETWORK_OPS_DEMO;"
