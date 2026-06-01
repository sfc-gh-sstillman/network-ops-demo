import { Router } from 'express'
import { query, SCHEMA_ANALYTICS } from '../lib/snowflake.js'

const router = Router()

const TEMPLATES = {
  INCIDENT_SUMMARY: (alarm) => `## Incident Summary — ${alarm?.ALARM_ID || 'N/A'}

**Alarm Type:** ${alarm?.ALARM_TYPE?.replace(/_/g,' ') || 'Unknown'}
**Cell Site:** ${alarm?.CELL_ID} · ${alarm?.CITY} · ${alarm?.TECHNOLOGY}
**Detected:** ${alarm?.ALARM_TIME ? new Date(alarm.ALARM_TIME).toLocaleString() : 'N/A'}

**Probable Cause:** Alarm type "${alarm?.ALARM_TYPE?.replace(/_/g,' ')}" detected. Site metrics indicate degraded performance in the last 30-minute window.

**Recommended Actions:**
1. Verify site connectivity and backhaul status
2. Check neighbouring cells for cascade effect
3. ${alarm?.SEVERITY === 'P1' ? 'Escalate to senior engineer immediately' : 'Monitor — open ticket if condition persists > 15 min'}

**Estimated Impact:** Dependent on user density at ${alarm?.CITY} — check sector load data.`,

  SLA_COMPLIANCE: (param) => `## SLA Compliance Report — ${param || 'Current Period'}

**Report generated:** ${new Date().toLocaleString()}

This report summarizes SLA performance across 450 cell sites in Portugal.
Query TEMP.NETWORK_OPS_ANALYTICS.SLA_TARGETS for site-level SLA targets.
Query TEMP.NETWORK_OPS_ANALYTICS.FACT_RAN_PERFORMANCE for actuals.

See Intelligence Chat for live SLA queries.`,

  SHIFT_HANDOVER: (param) => `## Shift Handover Note — ${param || new Date().toLocaleString()}

**Generated for shift transition.**

### Active Alarms
Query: SELECT * FROM TEMP.NETWORK_OPS_ANALYTICS.ALARMS WHERE STATUS = 'ACTIVE'

### Watch List
Review sites with sustained P2/P3 alarms in the last 2 hours.

### Notes
All triage decisions logged in TEMP.NETWORK_OPS_AI.TRIAGE_RUNS.`,
}

router.post('/generate', async (req, res, next) => {
  try {
    const { type, param } = req.body
    let content

    if (type === 'INCIDENT_SUMMARY' && param) {
      const rows = await query(
        `SELECT * FROM ${SCHEMA_ANALYTICS}.ALARMS WHERE ALARM_ID = ? LIMIT 1`, [param]
      ).catch(() => [])
      content = TEMPLATES.INCIDENT_SUMMARY(rows[0])
    } else {
      content = (TEMPLATES[type] || TEMPLATES.SLA_COMPLIANCE)(param)
    }

    res.json({ content })
  } catch (e) { next(e) }
})

router.post('/:outputId/approve', async (req, res, next) => {
  try {
    await query(
      `INSERT INTO TEMP.NETWORK_OPS_AI.ASSIST_OUTPUTS (OUTPUT_ID, REPORT_TYPE, STATUS, APPROVED_BY, APPROVED_AT)
       VALUES (?, 'APPROVED', 'APPROVED', CURRENT_USER(), CURRENT_TIMESTAMP())`,
      [req.params.outputId]
    ).catch(() => {})
    res.json({ success: true })
  } catch (e) { next(e) }
})

export default router
