import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import dataRouter from './routes/data.js'
import agentRouter from './routes/agent.js'
import triageRouter from './routes/triage.js'
import assistRouter from './routes/assist.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use(rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true }))

app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

app.use('/api/network', dataRouter)
app.use('/api/agent', agentRouter)
app.use('/api/triage', triageRouter)
app.use('/api/assist', assistRouter)

app.use(errorHandler)

app.listen(PORT, () => console.log(`Network Ops backend running on :${PORT}`))
