import { Router } from 'express'
import { query, SCHEMA_ANALYTICS } from '../lib/snowflake.js'

const router = Router()

router.get('/:alarmId', async (req, res, next) => {
  try {
    const { alarmId } = req.params
    const rows = await query(
      `SELECT * FROM ${SCHEMA_ANALYTICS}.ALARMS WHERE ALARM_ID = ? LIMIT 1`,
      [alarmId]
    )
    if (!rows.length) return res.status(404).json({ error: 'Alarm not found' })
    const alarm = rows[0]

    // Simulated AI assessment (replace with real Cortex Agent call when wiring agent)
    const assessment = {
      probable_cause: `${alarm.ALARM_TYPE?.replace(/_/g, ' ')} detected at ${alarm.CELL_ID} (${alarm.CITY}). Site metrics in the last 30-minute window indicate elevated utilization. Likely cause: increased user density or upstream transport issue.`,
      agent_severity: alarm.SEVERITY,
      recommended_action: alarm.SEVERITY === 'P1'
        ? 'Escalate immediately — verify backhaul links and check for cascade failure in adjacent cells.'
        : 'Monitor for 15 minutes. If condition persists, initiate load-balancing to adjacent sectors.',
      criteria: [
        { label: 'Severity Assessment', value: alarm.SEVERITY, status: alarm.SEVERITY === 'P1' ? 'fail' : 'warn' },
        { label: 'Pattern Match', value: 'Known type', status: 'ok' },
        { label: 'Technology', value: alarm.TECHNOLOGY, status: 'ok' },
        { label: 'Blast Radius', value: alarm.SEVERITY === 'P1' ? 'High' : 'Low', status: alarm.SEVERITY === 'P1' ? 'fail' : 'ok' },
      ]
    }

    res.json(assessment)
  } catch (e) { next(e) }
})

router.post('/:alarmId/action', async (req, res, next) => {
  try {
    const { alarmId } = req.params
    const { action, overrideReason = '' } = req.body

    await query(
      `INSERT INTO TEMP.NETWORK_OPS_AI.TRIAGE_RUNS (RUN_ID, ALARM_ID, ANALYST_ACTION, OVERRIDE_REASON, CREATED_BY)
       VALUES (?, ?, ?, ?, CURRENT_USER())`,
      [`TRN-${Date.now()}`, alarmId, action, overrideReason]
    )

    if (action === 'ACCEPT' || action === 'SUPPRESS') {
      await query(
        `UPDATE ${SCHEMA_ANALYTICS}.ALARMS SET STATUS = 'RESOLVED', AI_REVIEWED = TRUE WHERE ALARM_ID = ?`,
        [alarmId]
      ).catch(() => {})
    }

    res.json({ success: true, action })
  } catch (e) { next(e) }
})

export default router
