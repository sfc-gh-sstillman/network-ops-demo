-- =============================================================================
-- Network Operations — Snowflake Intelligence Agent
-- =============================================================================
-- Creates the NETWORK_OPERATIONS_AGENT backed by NETWORK_SEMANTIC_VIEW.
-- Run after synthetic-data.sql.
-- =============================================================================

USE ROLE PRODUCT_MANAGER;
USE WAREHOUSE APP_THOUGHTSPOT_OAUTH_WH;

-- Required for agent creation
CREATE DATABASE IF NOT EXISTS SNOWFLAKE_INTELLIGENCE;
CREATE SCHEMA IF NOT EXISTS SNOWFLAKE_INTELLIGENCE.AGENTS;

GRANT USAGE ON DATABASE SNOWFLAKE_INTELLIGENCE TO ROLE PRODUCT_MANAGER;
GRANT USAGE ON SCHEMA SNOWFLAKE_INTELLIGENCE.AGENTS TO ROLE PRODUCT_MANAGER;
GRANT CREATE AGENT ON SCHEMA SNOWFLAKE_INTELLIGENCE.AGENTS TO ROLE PRODUCT_MANAGER;
GRANT SELECT ON ALL SEMANTIC VIEWS IN SCHEMA TEMP.NETWORK_OPS_ANALYTICS TO ROLE PRODUCT_MANAGER;

CREATE OR REPLACE AGENT SNOWFLAKE_INTELLIGENCE.AGENTS.NETWORK_OPERATIONS_AGENT
WITH PROFILE = '{"display_name":"Network Operations AI Agent"}'
COMMENT = 'Telecom NOC intelligence agent — natural language queries over 450 cell sites in Portugal'
FROM SPECIFICATION $$
{
  "models": {"orchestration": ""},
  "instructions": {
    "response": "You are a telecom network operations analyst. Provide clear, data-driven answers with charts where helpful. Use bar charts for comparisons across cities or technology types, line charts for time trends. Key thresholds: RRC success ≥95% (below = degraded), PRB utilization <70% (warning >70%, critical >85%), Cell availability ≥99.5%, DL throughput ≥10 Mbps.",
    "orchestration": "Data covers 450 cell sites in Portugal (Lisboa, Porto, Braga, Coimbra, Faro) for Sept 29-30 2025, at 15-minute intervals. Technologies: 4G and 5G. RRC success rate = RRC_CONNESTABSUCC / RRC_CONNESTABATT * 100. For 'recent' or 'current' data, use the MAX(TIMESTAMP) in the dataset. When comparing cities, group by CITY. When comparing regions, group by REGION. 5G sites generally have higher throughput than 4G.",
    "sample_questions": [
      {"question": "Which cells have RRC success rate below 95%?"},
      {"question": "Show the top 10 most congested sites by PRB utilization"},
      {"question": "Compare average 4G vs 5G throughput by region"},
      {"question": "How many sites are currently below SLA targets?"},
      {"question": "What is our overall network availability?"},
      {"question": "Which city has the worst network performance?"},
      {"question": "Show PRB utilization trend for Lisboa over the last 24 hours"},
      {"question": "Which regions should be prioritized for capacity investment?"}
    ]
  },
  "tools": [{
    "tool_spec": {
      "type": "cortex_analyst_text_to_sql",
      "name": "Query Network Performance",
      "description": "Query network performance data: RRC success rates, PRB utilization, throughput, cell availability across 450 sites in Portugal. Use for KPI lookups, trend analysis, and site comparisons."
    }
  }],
  "tool_resources": {
    "Query Network Performance": {
      "semantic_view": "TEMP.NETWORK_OPS_ANALYTICS.NETWORK_SEMANTIC_VIEW",
      "execution_environment": {
        "type": "warehouse",
        "warehouse": "APP_THOUGHTSPOT_OAUTH_WH"
      }
    }
  }
}
$$;

GRANT USAGE ON AGENT SNOWFLAKE_INTELLIGENCE.AGENTS.NETWORK_OPERATIONS_AGENT TO ROLE PRODUCT_MANAGER;

SHOW AGENTS IN SCHEMA SNOWFLAKE_INTELLIGENCE.AGENTS;
