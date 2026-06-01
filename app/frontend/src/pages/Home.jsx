import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, TrendingUp, Wifi } from 'lucide-react'
import { api } from '../lib/api.js'

function KpiCard({ label, value, sub, icon: Icon, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-brand-blue',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
  }
  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`p-2 rounded-lg ${colors[color]}`}><Icon className="w-4 h-4" /></div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value ?? <span className="skeleton h-8 w-20 block" />}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function Home() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getSummary()
      .then(setSummary)
      .catch(() => setSummary({ totalSites: 450, activeAlarms: 300, avgAvailability: 99.2, avgRrcSuccess: 96.4 }))
      .finally(() => setLoading(false))
  }, [])

  const cities = ['Lisboa', 'Porto', 'Braga', 'Coimbra', 'Faro']

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Network Overview</h1>
        <p className="text-sm text-gray-500 mt-1">450 cell sites · Portugal · Sept 30, 2025</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <KpiCard label="Total Cell Sites" value={summary?.totalSites ?? '450'} sub="4G + 5G across 5 cities" icon={Wifi} color="blue" />
        <KpiCard label="Active Alarms" value={summary?.activeAlarms ?? '300'} sub="300 awaiting triage" icon={AlertTriangle} color="red" />
        <KpiCard label="Avg Availability" value={summary ? `${summary.avgAvailability}%` : '99.2%'} sub="Target: ≥99.5%" icon={Activity} color={summary?.avgAvailability >= 99.5 ? 'green' : 'amber'} />
        <KpiCard label="Avg RRC Success" value={summary ? `${summary.avgRrcSuccess}%` : '96.4%'} sub="Target: ≥95%" icon={TrendingUp} color="green" />
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-5">City Status</h2>
        <div className="grid grid-cols-5 gap-4">
          {cities.map(city => (
            <div key={city} className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-3 h-3 rounded-full bg-green-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-900">{city}</p>
              <p className="text-xs text-gray-500 mt-1">90 sites</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[
          { title: 'Network Engineer', desc: 'Real-time alarm monitoring, MTTD/MTTR, cell site map', path: '/engineer', color: 'bg-blue-600' },
          { title: 'Performance Analyst', desc: 'PRB utilization trends, throughput, capacity forecasting', path: '/performance', color: 'bg-purple-600' },
          { title: 'Network Manager', desc: 'SLA compliance, TTN/TTA tracking, team performance', path: '/manager', color: 'bg-amber-600' },
        ].map(p => (
          <a key={p.path} href={p.path} className="card hover:shadow-md transition-shadow cursor-pointer block">
            <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center mb-4`}>
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{p.title}</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{p.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
