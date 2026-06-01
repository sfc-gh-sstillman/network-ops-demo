-- =============================================================================
-- Network Operations App — SPCS Setup (Snowhouse)
-- =============================================================================
-- Snowhouse uses SPCS_ADMIN_RL for compute pool creation.
-- This script handles everything else: grants, stage, and service deploy.
-- Compute pool: SE_ENABLEMENT_POOL (already exists, SALES_ENGINEER has USAGE)
-- =============================================================================

USE ROLE SALES_ENGINEER;
USE DATABASE TEMP;
USE SCHEMA NETWORK_OPS_STAGING;

-- Stage for service specs
CREATE STAGE IF NOT EXISTS SPECS ENCRYPTION = (TYPE = 'SNOWFLAKE_SSE');

-- Upload service.yaml (run from your terminal, not SQL Worksheet)
-- PUT file://spcs/service.yaml @TEMP.NETWORK_OPS_STAGING.SPECS AUTO_COMPRESS=FALSE OVERWRITE=TRUE;

-- Verify the file uploaded
LIST @TEMP.NETWORK_OPS_STAGING.SPECS;

-- =============================================================================
-- Deploy the service
-- =============================================================================
CREATE SERVICE IF NOT EXISTS TEMP.NETWORK_OPS_STAGING.NETWORK_OPS_APP
  IN COMPUTE POOL SE_ENABLEMENT_POOL
  FROM @TEMP.NETWORK_OPS_STAGING.SPECS
  SPECIFICATION_FILE = 'service.yaml';

-- =============================================================================
-- Monitor (check every 30s until READY)
-- =============================================================================
SELECT v.value:containerName::VARCHAR   AS container,
       v.value:status::VARCHAR          AS status,
       v.value:message::VARCHAR         AS message
FROM (SELECT PARSE_JSON(SYSTEM$GET_SERVICE_STATUS('TEMP.NETWORK_OPS_STAGING.NETWORK_OPS_APP'))) t,
LATERAL FLATTEN(input => t.$1) v;

-- =============================================================================
-- Get public URL (run after status = READY)
-- =============================================================================
SHOW ENDPOINTS IN SERVICE TEMP.NETWORK_OPS_STAGING.NETWORK_OPS_APP;

-- =============================================================================
-- Grant access to yourself and teammates
-- =============================================================================
GRANT USAGE ON SERVICE TEMP.NETWORK_OPS_STAGING.NETWORK_OPS_APP TO ROLE SALES_ENGINEER;
GRANT SERVICE ROLE TEMP.NETWORK_OPS_STAGING.NETWORK_OPS_APP!ALL_ENDPOINTS_USAGE TO ROLE SALES_ENGINEER;

-- =============================================================================
-- Manage (suspend to stop billing, resume to start)
-- =============================================================================
-- ALTER SERVICE TEMP.NETWORK_OPS_STAGING.NETWORK_OPS_APP SUSPEND;
-- ALTER SERVICE TEMP.NETWORK_OPS_STAGING.NETWORK_OPS_APP RESUME;
-- DROP SERVICE TEMP.NETWORK_OPS_STAGING.NETWORK_OPS_APP;
