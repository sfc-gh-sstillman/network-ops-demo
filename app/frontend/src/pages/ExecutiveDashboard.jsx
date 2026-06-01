import { TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import FabChat from '../components/FabChat.jsx'

export default function ExecutiveDashboard() {
  return (
    <div className="p-8 space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Business impact · Revenue at risk · Strategic KPIs</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Revenue at Risk', value: '€42K', sub: 'Current active incidents', icon: DollarSign, color: 'red' },
          { label: 'Network Availability', value: '99.2%', sub: 'Target: 99.5% · Δ-0.3%', icon: TrendingDown, color: 'amber' },
          { label: 'Churn Risk Score', value: '12.4', sub: 'Moderate — monitor', icon: Users, color: 'amber' },
          { label: 'Est. Annual Value', value: '€12.3M', sub: 'From NOC intelligence', icon: TrendingUp, color: 'green' },
        ].map(k => {
          const colors = { red:'bg-red-50 text-red-600', amber:'bg-amber-50 text-amber-600', green:'bg-green-50 text-green-600' }
          return (
            <div key={k.label} className="kpi-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">{k.label}</span>
                <div className={`p-2 rounded-lg ${colors[k.color]}`}><k.icon className="w-4 h-4" /></div>
              </div>
              <p className={`text-3xl font-bold ${k.color === 'red' ? 'text-red-600' : k.color === 'amber' ? 'text-amber-600' : 'text-green-600'}`}>{k.value}</p>
              {k.sub && <p className="text-xs text-gray-400 mt-1">{k.sub}</p>}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Revenue at Risk — 7-Day Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={Array.from({length:7},(_,i)=>({day:`Day ${i+1}`, risk: 30+Math.random()*30}))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{fontSize:10}} />
              <YAxis tick={{fontSize:10}} unit="K€" />
              <Tooltip formatter={v=>`€${v.toFixed(0)}K`} />
              <Line type="monotone" dataKey="risk" stroke="#EF4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">4G vs 5G Performance Summary</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { metric: 'Availability', '4G': 99.1, '5G': 99.4 },
              { metric: 'RRC Success', '4G': 95.8, '5G': 97.2 },
              { metric: 'Handover OK', '4G': 94.2, '5G': 96.1 },
            ]} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="metric" tick={{fontSize:10}} />
              <YAxis tick={{fontSize:10}} domain={[92,100]} unit="%" />
              <Tooltip />
              <Bar dataKey="4G" fill="#93C5FD" radius={[4,4,0,0]} />
              <Bar dataKey="5G" fill="#0066CC" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card bg-gradient-to-r from-blue-50 to-white">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Business Value by Persona</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { role: 'Network Engineer', value: '€275K/yr', detail: '40% faster issue detection' },
            { role: 'Performance Analyst', value: '€1.2M/yr', detail: 'Proactive capacity planning' },
            { role: 'Network Manager', value: '€870K/yr', detail: 'SLA breach prevention' },
            { role: 'Executive', value: '€9.9M/yr', detail: 'Reduced customer churn' },
          ].map(p => (
            <div key={p.role} className="text-center p-4 bg-white rounded-xl border border-blue-100">
              <p className="text-xl font-bold text-brand-blue">{p.value}</p>
              <p className="text-xs font-semibold text-gray-700 mt-1">{p.role}</p>
              <p className="text-xs text-gray-400 mt-1">{p.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <FabChat context="executive" />
    </div>
  )
}
