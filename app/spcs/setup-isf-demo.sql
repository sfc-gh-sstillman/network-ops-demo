-- =============================================================================
-- ISF Demo Hub — SPCS Service Deploy (sfsenorthamerica-sstillman_test)
-- =============================================================================
-- Run after image is pushed via deploy-isf-demo.sh
-- =============================================================================

USE ROLE ACCOUNTADMIN;
USE DATABASE ISF_DEMOS;
USE SCHEMA APPS;

-- Stage for service specs
CREATE STAGE IF NOT EXISTS SPECS ENCRYPTION = (TYPE = 'SNOWFLAKE_SSE');

-- Upload service.yaml (run from terminal):
-- snow stage copy spcs/service-isf-demo.yaml @ISF_DEMOS.APPS.SPECS --overwrite --connection sfsenorthamerica-sstillman_test

-- Deploy the service
CREATE SERVICE IF NOT EXISTS ISF_DEMOS.APPS.NETWORK_OPS_DEMO
  IN COMPUTE POOL ISF_DEMO_POOL
  FROM @ISF_DEMOS.APPS.SPECS
  SPECIFICATION_FILE = 'service-isf-demo.yaml';

-- Monitor (check every 30s until READY)
SELECT v.value:containerName::VARCHAR AS container,
       v.value:status::VARCHAR        AS status,
       v.value:message::VARCHAR       AS message
FROM (SELECT PARSE_JSON(SYSTEM$GET_SERVICE_STATUS('ISF_DEMOS.APPS.NETWORK_OPS_DEMO'))) t,
LATERAL FLATTEN(input => t.$1) v;

-- Get public URL (run after status = READY)
SHOW ENDPOINTS IN SERVICE ISF_DEMOS.APPS.NETWORK_OPS_DEMO;

-- =============================================================================
-- Access Control — Demo Viewers can access the endpoint
-- =============================================================================
GRANT USAGE ON SERVICE ISF_DEMOS.APPS.NETWORK_OPS_DEMO TO ROLE ISF_DEMO_VIEWER;
GRANT SERVICE ROLE ISF_DEMOS.APPS.NETWORK_OPS_DEMO!ALL_ENDPOINTS_USAGE TO ROLE ISF_DEMO_VIEWER;

-- Admin can manage
GRANT USAGE ON SERVICE ISF_DEMOS.APPS.NETWORK_OPS_DEMO TO ROLE ISF_DEMO_ADMIN;
GRANT SERVICE ROLE ISF_DEMOS.APPS.NETWORK_OPS_DEMO!ALL_ENDPOINTS_USAGE TO ROLE ISF_DEMO_ADMIN;

-- =============================================================================
-- Manage (suspend to stop billing, resume to start)
-- =============================================================================
-- ALTER SERVICE ISF_DEMOS.APPS.NETWORK_OPS_DEMO SUSPEND;
-- ALTER SERVICE ISF_DEMOS.APPS.NETWORK_OPS_DEMO RESUME;
-- DROP SERVICE ISF_DEMOS.APPS.NETWORK_OPS_DEMO;
