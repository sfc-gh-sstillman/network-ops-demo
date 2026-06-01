const BASE = '/api'

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export const api = {
  // Network data
  getSummary:       () => req('/network/summary'),
  getCellSites:     () => req('/network/sites'),
  getPerformance:   (params = '') => req(`/network/performance${params}`),
  getAlarms:        (status = 'ACTIVE') => req(`/network/alarms?status=${status}`),
  getSlaStatus:     () => req('/network/sla'),

  // Triage
  triageAlarm:      (alarmId) => req(`/triage/${alarmId}`),
  submitTriageAction: (alarmId, body) => req(`/triage/${alarmId}/action`, {
    method: 'POST', body: JSON.stringify(body)
  }),

  // Assist
  generateReport:   (type, params) => req('/assist/generate', {
    method: 'POST', body: JSON.stringify({ type, ...params })
  }),
  approveReport:    (outputId) => req(`/assist/${outputId}/approve`, { method: 'POST' }),

  // Agent chat (non-streaming)
  chat:             (message, history = []) => req('/agent/chat', {
    method: 'POST', body: JSON.stringify({ message, history })
  }),
}

// SSE streaming helper for agent calls
export function streamAgentCall(path, body, onChunk, onDone, onError) {
  fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify(body)
  }).then(res => {
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    function read() {
      reader.read().then(({ done, value }) => {
        if (done) { onDone?.(); return }
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try { onChunk(JSON.parse(line.slice(6))) } catch {}
          }
        }
        read()
      }).catch(onError)
    }
    read()
  }).catch(onError)
}
