import { Router } from 'express'
import fetch from 'node-fetch'

const router = Router()

const AGENT_URL = process.env.SNOWFLAKE_AGENT_URL ||
  'https://snowhouse.snowflakecomputing.com/api/v2/cortex/agents/SNOWFLAKE_INTELLIGENCE.AGENTS.NETWORK_OPERATIONS_AGENT:run'

router.post('/chat', async (req, res, next) => {
  try {
    const { message, history = [] } = req.body
    const token = process.env.SNOWFLAKE_PAT || process.env.SNOWFLAKE_OAUTH_TOKEN

    if (!token) {
      return res.json({ answer: `[Demo mode] You asked: "${message}"\n\nTo enable live responses, set SNOWFLAKE_PAT in your .env file.` })
    }

    const body = {
      model: '',
      messages: [
        ...history.map(m => ({ role: m.role, content: [{ type: 'text', text: m.content }] })),
        { role: 'user', content: [{ type: 'text', text: message }] }
      ],
      tools: [{ tool_spec: { type: 'cortex_analyst_text_to_sql', name: 'Query Network Performance' } }],
      tool_choice: 'auto',
    }

    const agentRes = await fetch(AGENT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Snowflake-Authorization-Token-Type': 'KEYPAIR_JWT',
      },
      body: JSON.stringify(body),
    })

    if (!agentRes.ok) {
      const err = await agentRes.text()
      return res.json({ answer: `Agent error: ${err}` })
    }

    const data = await agentRes.json()
    const answer = data?.choices?.[0]?.message?.content?.[0]?.text || 'No response from agent.'
    const sql = data?.choices?.[0]?.message?.content?.find(c => c.type === 'tool_result')?.tool_results?.[0]?.sql

    res.json({ answer, sql })
  } catch (e) { next(e) }
})

export default router
