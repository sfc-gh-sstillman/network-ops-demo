#!/bin/bash
set -euo pipefail
# =============================================================================
# Network Operations App — Build + Push to Snowflake Registry
# =============================================================================
# Usage: ./spcs/deploy.sh [version]
#   version: defaults to v1 — increment on each redeploy (v2, v3, ...)
#
# Prereqs:
#   - Docker Desktop running + signed in (Snowflake org)
#   - Run: snow spcs image-registry login --connection <your-connection>
#   - Node.js available (for frontend build)
# =============================================================================

VERSION="${1:-v1}"
REGISTRY="sfcogsops-snowhouse-aws-us-west-2.registry.snowflakecomputing.com"
IMAGE="${REGISTRY}/temp/network_ops_staging/images/network-ops-app"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

echo "==> Building frontend (native — no QEMU)..."
cd "${APP_DIR}/frontend" && npm run build
cd "${APP_DIR}"

echo "==> Building & pushing Docker image (linux/amd64)..."
docker build \
  --platform linux/amd64 \
  --load \
  -t "${IMAGE}:${VERSION}" \
  -f Dockerfile .

docker push "${IMAGE}:${VERSION}"

echo "==> Image pushed: ${IMAGE}:${VERSION}"
echo ""
echo "==> Next — run in Snowflake (Snowsight SQL Worksheet):"
echo ""
echo "    USE ROLE SALES_ENGINEER;"
echo "    USE SCHEMA TEMP.NETWORK_OPS_STAGING;"
echo ""
echo "    PUT file://${APP_DIR}/spcs/service.yaml @SPECS AUTO_COMPRESS=FALSE OVERWRITE=TRUE;"
echo ""
echo "    CREATE SERVICE IF NOT EXISTS TEMP.NETWORK_OPS_STAGING.NETWORK_OPS_APP"
echo "      IN COMPUTE POOL SE_ENABLEMENT_POOL"
echo "      FROM @SPECS"
echo "      SPECIFICATION_FILE='service.yaml';"
echo ""
echo "    -- Monitor startup (~2-5 min):"
echo "    SELECT SYSTEM\$GET_SERVICE_STATUS('TEMP.NETWORK_OPS_STAGING.NETWORK_OPS_APP');"
echo ""
echo "    -- Get public URL:"
echo "    SHOW ENDPOINTS IN SERVICE TEMP.NETWORK_OPS_STAGING.NETWORK_OPS_APP;"
