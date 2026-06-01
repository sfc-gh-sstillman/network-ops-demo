import { useEffect, useState } from 'react'
import { Activity, Clock, AlertTriangle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { api } from '../lib/api.js'
import FabChat from '../components/FabChat.jsx'

function KpiCard({ label, value, sub, ok }) {
  return (
    <div className="kpi-card">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${ok === false ? 'text-red-600' : ok ? 'text-green-600' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function mockTrend(n, base, spread) {
  return Array.from({length: n}, (_, i) => ({
    t: `${String(i).padStart(2,'0')}:00`,
    v: +(base + (Math.random() - 0.5) * spread).toFixed(1)
  }))
}

export default function EngineerDashboard() {
  const [alarms, setAlarms] = useState([])
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const mttrData = mockTrend(24, 45, 30)
  const availData = mockTrend(24, 99.3, 0.6)

  useEffect(() => {
    Promise.all([api.getAlarms('ACTIVE'), api.getCellSites()])
      .then(([a, s]) => { setAlarms(a.alarms ?? a); setSites(s.sites ?? s) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const p1 = alarms.filter(a => a.severity === 'P1').length
  const p2 = alarms.filter(a => a.severity === 'P2').length

  return (
    <div className="p-8 space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Network Engineer</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time monitoring · Click any metric to drill down</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <KpiCard label="Active Alarms" value={alarms.length || 300} sub="300 unreviewed" ok={false} />
        <KpiCard label="P1 Critical" value={p1 || 60} sub="Requires immediate action" ok={false} />
        <KpiCard label="Avg MTTD" value="8.2 min" sub="Target: ≤15 min" ok />
        <KpiCard label="Avg MTTR" value="42 min" sub="Target: ≤60 min" ok />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">MTTR Trend (24h)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mttrData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="t" tick={{fontSize:10}} />
              <YAxis tick={{fontSize:10}} unit=" min" />
              <Tooltip />
              <Line type="monotone" dataKey="v" stroke="#0066CC" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Cell Availability (24h)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={availData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="t" tick={{fontSize:10}} />
              <YAxis tick={{fontSize:10}} domain={[98.5, 100]} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="v" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Alarms by City</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={[
            {city:'Lisboa', p1:24, p2:36, p3:60},
            {city:'Porto',  p1:12, p2:22, p3:48},
            {city:'Braga',  p1:8,  p2:18, p3:36},
            {city:'Coimbra',p1:6,  p2:14, p3:28},
            {city:'Faro',   p1:10, p2:20, p3:42},
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="city" tick={{fontSize:11}} />
            <YAxis tick={{fontSize:10}} />
            <Tooltip />
            <Bar dataKey="p1" stackId="a" fill="#EF4444" name="P1" />
            <Bar dataKey="p2" stackId="a" fill="#F59E0B" name="P2" />
            <Bar dataKey="p3" stackId="a" fill="#3B82F6" name="P3" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <FabChat context="network_engineer" />
    </div>
  )
}
