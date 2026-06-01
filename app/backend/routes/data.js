import { Router } from 'express'
import { query, SCHEMA_ANALYTICS } from '../lib/snowflake.js'

const router = Router()

router.get('/summary', async (req, res, next) => {
  try {
    const rows = await query(`
      SELECT
        (SELECT COUNT(*) FROM ${SCHEMA_ANALYTICS}.DIM_CELL_SITE)                           AS total_sites,
        (SELECT COUNT(*) FROM ${SCHEMA_ANALYTICS}.ALARMS WHERE STATUS = 'ACTIVE')          AS active_alarms,
        (SELECT ROUND(AVG(CELL_AVAILABILITY)*100, 1) FROM ${SCHEMA_ANALYTICS}.FACT_RAN_PERFORMANCE) AS avg_availability,
        (SELECT ROUND(AVG(RRC_CONNESTABSUCC * 100.0 / NULLIF(RRC_CONNESTABATT,0)), 1) FROM ${SCHEMA_ANALYTICS}.FACT_RAN_PERFORMANCE) AS avg_rrc_success
    `)
    const r = rows[0]
    res.json({
      totalSites:      r.TOTAL_SITES,
      activeAlarms:    r.ACTIVE_ALARMS,
      avgAvailability: r.AVG_AVAILABILITY,
      avgRrcSuccess:   r.AVG_RRC_SUCCESS,
    })
  } catch (e) { next(e) }
})

router.get('/sites', async (req, res, next) => {
  try {
    const sites = await query(`SELECT * FROM ${SCHEMA_ANALYTICS}.DIM_CELL_SITE LIMIT 500`)
    res.json({ sites })
  } catch (e) { next(e) }
})

router.get('/alarms', async (req, res, next) => {
  try {
    const status = req.query.status || 'ACTIVE'
    const alarms = await query(
      `SELECT * FROM ${SCHEMA_ANALYTICS}.ALARMS WHERE STATUS = ? ORDER BY SEVERITY, ALARM_TIME DESC LIMIT 500`,
      [status]
    )
    res.json({ alarms })
  } catch (e) { next(e) }
})

router.get('/performance', async (req, res, next) => {
  try {
    const rows = await query(`
      SELECT CITY, REGION, TECHNOLOGY,
             ROUND(AVG(DL_PRB_UTILIZATION), 1) AS avg_prb,
             ROUND(AVG(DL_THROUGHPUT_MBPS), 1) AS avg_dl_throughput,
             ROUND(AVG(CELL_AVAILABILITY) * 100, 2) AS avg_availability,
             ROUND(AVG(RRC_CONNESTABSUCC * 100.0 / NULLIF(RRC_CONNESTABATT, 0)), 2) AS rrc_success_rate
      FROM ${SCHEMA_ANALYTICS}.FACT_RAN_PERFORMANCE f
      JOIN ${SCHEMA_ANALYTICS}.DIM_CELL_SITE s USING (CELL_ID)
      GROUP BY CITY, REGION, TECHNOLOGY
      ORDER BY CITY, TECHNOLOGY
    `)
    res.json({ performance: rows })
  } catch (e) { next(e) }
})

router.get('/sla', async (req, res, next) => {
  try {
    const rows = await query(`
      SELECT s.CITY, s.REGION,
             ROUND(AVG(f.CELL_AVAILABILITY) * 100, 2) AS actual_availability,
             MAX(t.AVAILABILITY_TARGET) AS target_availability,
             ROUND(AVG(f.RRC_CONNESTABSUCC * 100.0 / NULLIF(f.RRC_CONNESTABATT,0)), 2) AS rrc_success_rate,
             MAX(t.RRC_SUCCESS_RATE_TARGET) AS rrc_target
      FROM ${SCHEMA_ANALYTICS}.FACT_RAN_PERFORMANCE f
      JOIN ${SCHEMA_ANALYTICS}.DIM_CELL_SITE s USING (CELL_ID)
      LEFT JOIN ${SCHEMA_ANALYTICS}.SLA_TARGETS t ON t.CELL_ID = s.CELL_ID
      GROUP BY s.CITY, s.REGION
      ORDER BY actual_availability
    `)
    res.json({ sla: rows })
  } catch (e) { next(e) }
})

export default router
