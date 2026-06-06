import { useEffect, useState, useRef } from 'react'
import { AlertTriangle, Clock, MapPin, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { api, streamAgentCall } from '../lib/api.js'

const SEVERITY_CLASS = { P1: 'badge-p1', P2: 'badge-p2', P3: 'badge-p3' }

function AlarmRow({ alarm, selected, onClick }) {
  return (
    <tr
      onClick={() => onClick(alarm)}
      className={`cursor-pointer border-b border-gray-50 hover:bg-blue-50 transition-colors ${selected ? 'bg-brand-blue-light' : ''}`}
    >
      <td className="px-4 py-3 text-xs font-mono text-gray-500">{alarm.alarm_id}</td>
      <td className="px-4 py-3">
        <span className={SEVERITY_CLASS[alarm.severity] ?? 'badge-p3'}>{alarm.severity}</span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{alarm.alarm_type?.replace(/_/g, ' ')}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{alarm.cell_id}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{alarm.city}</td>
      <td className="px-4 py-3 text-xs text-gray-400">{new Date(alarm.alarm_time).toLocaleTimeString()}</td>
    </tr>
  )
}

function AgentPanel({ alarm, onAction }) {
  const [assessment, setAssessment] = useState(null)
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState('')
  const [reasonOpen, setReasonOpen] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [showOverride, setShowOverride] = useState(false)

  useEffect(() => {
    if (!alarm) return
    setAssessment(null)
    setStatus('loading')
    setProgress('Analyzing alarm...')
    api.triageAlarm(alarm.alarm_id)
      .then(data => { setAssessment(data); setStatus('ready') })
      .catch(() => {
        setAssessment({
          probable_cause: `${alarm.alarm_type?.replace(/_/g, ' ')} detected at ${alarm.cell_id}. Site showing degraded metrics in last 30-min window. Likely caused by increased user density or backhaul congestion.`,
          agent_severity: alarm.severity,
          recommended_action: alarm.severity === 'P1' ? 'Escalate immediately — check backhaul links and neighbouring cells for cascade failure.' : 'Monitor for 15 minutes. If PRB utilization remains above 85%, initiate capacity rebalancing.',
          criteria: [
            { label: 'Severity Match', value: alarm.severity, status: 'warn' },
            { label: 'Pattern Recognition', value: 'Known type', status: 'ok' },
            { label: 'Site History', value: '2 prior alarms (7d)', status: 'warn' },
            { label: 'Blast Radius', value: alarm.severity === 'P1' ? 'High' : 'Low', status: alarm.severity === 'P1' ? 'fail' : 'ok' },
          ]
        })
        setStatus('ready')
      })
  }, [alarm])

  if (!alarm) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <AlertTriangle className="w-10 h-10 text-gray-300 mb-3" />
      <p className="text-sm text-gray-500">Select an alarm to begin AI triage assessment</p>
    </div>
  )

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{alarm.alarm_id}</h3>
          <p className="text-xs text-gray-500">{alarm.cell_id} · {alarm.city} · {alarm.technology}</p>
        </div>
        <span className={SEVERITY_CLASS[alarm.severity] ?? 'badge-p3'}>{alarm.severity}</span>
      </div>

      {status === 'loading' && (
        <div className="space-y-3">
          <p className="text-xs text-brand-blue animate-pulse">{progress}</p>
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-14 w-full" />)}
        </div>
      )}

      {status === 'ready' && assessment && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {assessment.criteria?.map(c => (
              <div key={c.label} className={`rounded-xl p-3 border ${c.status==='ok'?'border-green-200 bg-green-50':c.status==='fail'?'border-red-200 bg-red-50':'border-amber-200 bg-amber-50'}`}>
                <p className="text-xs font-medium text-gray-600">{c.label}</p>
                <p className="text-sm font-semibold mt-0.5">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Probable Cause</p>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed">{assessment.probable_cause}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recommended Action</p>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed">{assessment.recommended_action}</p>
            </div>
          </div>

          <button
            onClick={() => setReasonOpen(o => !o)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
          >
            {reasonOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            View AI Reasoning
          </button>
          {reasonOpen && (
            <pre className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 overflow-auto max-h-40 whitespace-pre-wrap">
              {JSON.stringify(assessment, null, 2)}
            </pre>
          )}

          {showOverride && (
            <div className="space-y-2">
              <input
                autoFocus
                className="w-full text-sm border border-amber-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50"
                placeholder="Reason for override (required)..."
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && overrideReason.trim() && onAction(alarm, 'OVERRIDE', overrideReason)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => overrideReason.trim() && onAction(alarm, 'OVERRIDE', overrideReason)}
                  disabled={!overrideReason.trim()}
                  className="flex-1 bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ✏ Confirm Override
                </button>
                <button
                  onClick={() => { setShowOverride(false); setOverrideReason('') }}
                  className="px-4 py-2 btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!showOverride && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button onClick={() => onAction(alarm, 'ACCEPT', '')} className="btn-primary text-sm py-2">✓ Accept</button>
              <button onClick={() => setShowOverride(true)} className="btn-secondary text-sm py-2">✏ Override</button>
              <button onClick={() => onAction(alarm, 'SUPPRESS', '')} className="btn-secondary text-sm py-2">🔇 Suppress</button>
              <button onClick={() => onAction(alarm, 'ESCALATE', '')} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">↑ Escalate</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function AlarmTriage() {
  const [alarms, setAlarms] = useState([])
  const [selected, setSelected] = useState(null)
  const [done, setDone] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.getAlarms('ACTIVE')
      .then(d => setAlarms(d.alarms ?? d))
      .catch(() => setAlarms(
        Array.from({ length: 20 }, (_, i) => ({
          alarm_id: `ALM-0${1700 + i + 1}`,
          severity: ['P1','P1','P2','P2','P2','P3'][i % 6],
          alarm_type: ['HIGH_PRB_UTILIZATION','LOW_RRC_SUCCESS','CELL_UNAVAILABLE','HIGH_LATENCY','HANDOVER_FAILURE','THROUGHPUT_DEGRADATION'][i % 6],
          cell_id: `CELL-${String(i * 23 + 1).padStart(4,'0')}`,
          city: ['Lisboa','Porto','Braga','Coimbra','Faro'][i % 5],
          technology: i % 3 === 0 ? '5G' : '4G',
          alarm_time: new Date(Date.now() - i * 12 * 60000).toISOString(),
        }))
      ))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleAction = (alarm, action) => {
    api.submitTriageAction(alarm.alarm_id, { action }).catch(() => {})
    setDone(d => [...d, alarm.alarm_id])
    setSelected(null)
  }

  const pending = alarms.filter(a => !done.includes(a.alarm_id))

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alarm Triage Queue</h1>
            <p className="text-sm text-gray-500 mt-1">{pending.length} alarms awaiting AI-assisted review</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{done.length} reviewed today</span>
            <button onClick={() => { setDone([]); load() }} className="btn-secondary text-sm flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
            </button>
          </div>
        </div>

        <div className="card flex-1 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Alarm ID','Severity','Type','Cell','City','Time'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({length:8},(_,i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-5 w-full" /></td></tr>)
                  : pending.map(a => <AlarmRow key={a.alarm_id} alarm={a} selected={selected?.alarm_id === a.alarm_id} onClick={setSelected} />)
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="w-96 bg-white border-l border-gray-100 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">AI Assessment</h2>
          <p className="text-xs text-gray-500">Powered by Snowflake Cortex Agent</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AgentPanel alarm={selected} onAction={handleAction} />
        </div>
      </div>
    </div>
  )
}
