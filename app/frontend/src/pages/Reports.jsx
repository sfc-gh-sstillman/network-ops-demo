import { useState } from 'react'
import { FileText, Loader2, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '../lib/api.js'

const REPORT_TYPES = [
  {
    id: 'INCIDENT_SUMMARY',
    label: 'Incident Summary',
    desc: 'AI-drafted summary of an active alarm with impacted sites, probable cause, and recommended actions.',
    placeholder: 'Select an active alarm ID...',
  },
  {
    id: 'SLA_COMPLIANCE',
    label: 'SLA Compliance Report',
    desc: 'Weekly SLA compliance report by region and site, with trend vs prior period.',
    placeholder: 'e.g. Week of Sept 23-30, 2025',
  },
  {
    id: 'SHIFT_HANDOVER',
    label: 'Shift Handover Note',
    desc: 'End-of-shift summary: active alarms, resolved incidents, open tickets, watch list.',
    placeholder: 'e.g. Night shift ending Sept 30 06:00',
  },
]

function ReportCard({ type, onGenerate }) {
  const [param, setParam] = useState('')
  const [status, setStatus] = useState('idle')
  const [content, setContent] = useState('')
  const [open, setOpen] = useState(false)

  const generate = async () => {
    setStatus('loading')
    setContent('')
    api.generateReport(type.id, { param })
      .then(d => { setContent(d.content || d.report || ''); setStatus('ready'); setOpen(true) })
      .catch(() => {
        const mock = {
          INCIDENT_SUMMARY: `## Incident Summary — ${param || 'ALM-01701'}\n\n**Alarm Type:** HIGH PRB UTILIZATION\n**Cell Site:** CELL-0042 · Lisboa\n**Technology:** 5G\n**Detected:** ${new Date().toLocaleTimeString()}\n\n**Probable Cause:** Physical Resource Block utilization exceeded 88% at CELL-0042. Analysis of neighbouring cells shows no cascade effect. Likely cause: sports event at Estádio da Luz driving 3x normal user density in sector.\n\n**Impacted Services:** Voice (minor), Mobile Broadband (moderate)\n\n**Recommended Actions:**\n1. Initiate load-balancing to adjacent cells CELL-0041 and CELL-0043\n2. Notify transport team to check backhaul capacity on TDV-0042\n3. Monitor PRB for next 15 minutes — if sustained above 85%, open P2 ticket\n\n**Estimated Impact:** ~180 affected subscribers`,
          SLA_COMPLIANCE: `## SLA Compliance Report — ${param || 'Week of Sept 23-30, 2025'}\n\n**Overall SLA Score: 94.2%** (Target: 99.5%)\n\n| City | Target | Actual | Status |\n|---|---|---|---|\n| Lisboa | 99.5% | 99.2% | ⚠️ Below |\n| Porto | 99.5% | 99.7% | ✅ Met |\n| Braga | 99.5% | 99.6% | ✅ Met |\n| Coimbra | 99.5% | 99.1% | ⚠️ Below |\n| Faro | 99.5% | 99.3% | ⚠️ Below |\n\n**Key Issues:**\n- Lisboa and Coimbra: Elevated PRB utilization leading to availability drops\n- Faro: 3 P1 incidents in 5-day window — hardware review recommended\n\n**Trend vs Prior Week:** -0.4% overall — investigation recommended`,
          SHIFT_HANDOVER: `## Shift Handover Note — ${param || 'Night Shift ending Sept 30 06:00'}\n\n**Outgoing: Ana Costa | Incoming: Pedro Ferreira**\n\n### Active Alarms (7 open)\n- ALM-01823 · P1 · CELL-0042 Lisboa · HIGH PRB — ONGOING, monitoring\n- ALM-01819 · P2 · CELL-0128 Porto · LOW RRC — Ticket T-4821 raised\n- 5 × P3 alarms in nominal monitoring\n\n### Resolved This Shift (11 total)\n- 8 × P3 resolved via auto-clear\n- 2 × P2 resolved via load-balancing\n- 1 × P1 (ALM-01815) resolved at 03:42 — transport link restored\n\n### Watch List for Incoming Shift\n⚠️ CELL-0042: PRB elevated since 02:15. Load-balancing initiated but PRB still at 82%.\n⚠️ Faro region: 3 incidents in 12h window — potential hardware issue on CELL-0389.\n\n### Notes\nScheduled maintenance on CELL-0256 (Braga) at 09:00 — ensure alarm suppression window is active.`,
        }
        setContent(mock[type.id] ?? 'Report generated.')
        setStatus('ready')
        setOpen(true)
      })
  }

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{type.label}</h3>
        <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
      </div>

      <div className="flex gap-3">
        <input
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-blue"
          placeholder={type.placeholder}
          value={param}
          onChange={e => setParam(e.target.value)}
          disabled={status === 'loading'}
        />
        <button onClick={generate} disabled={status === 'loading'} className="btn-primary flex items-center gap-2">
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Generate
        </button>
      </div>

      {content && (
        <>
          <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
            {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {open ? 'Collapse' : 'View report'}
          </button>
          {open && (
            <div className="bg-gray-50 rounded-xl p-4">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{content}</pre>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => api.approveReport('draft').catch(()=>{})}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Check className="w-4 h-4" /> Approve & Save
                </button>
                <button onClick={generate} className="btn-secondary text-sm">Regenerate</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function Reports() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Assist</h1>
        <p className="text-sm text-gray-500 mt-1">AI-generated reports · Review and approve before sharing</p>
      </div>
      <div className="space-y-4">
        {REPORT_TYPES.map(t => <ReportCard key={t.id} type={t} />)}
      </div>
    </div>
  )
}
