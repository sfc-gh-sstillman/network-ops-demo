import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import FabChat from '../components/FabChat.jsx'

const SLA_DATA = [
  { city:'Lisboa', target:99.5, actual:99.2 },
  { city:'Porto',  target:99.5, actual:99.7 },
  { city:'Braga',  target:99.5, actual:99.6 },
  { city:'Coimbra',target:99.5, actual:99.1 },
  { city:'Faro',   target:99.5, actual:99.3 },
]

const HEATMAP_DATA = [
  { hour:'00', mon:2, tue:3, wed:2, thu:1, fri:4, sat:1, sun:0 },
  { hour:'04', mon:1, tue:2, wed:1, thu:2, fri:2, sat:0, sun:1 },
  { hour:'08', mon:8, tue:9, wed:7, thu:8, fri:11, sat:3, sun:2 },
  { hour:'12', mon:12, tue:14, wed:11, thu:13, fri:15, sat:5, sun:4 },
  { hour:'16', mon:15, tue:18, wed:14, thu:16, fri:20, sat:8, sun:6 },
  { hour:'20', mon:6, tue:7, wed:6, thu:7, fri:9, sat:4, sun:3 },
]

const DAYS = ['mon','tue','wed','thu','fri','sat','sun']

function HeatCell({ val }) {
  const opacity = Math.min(val / 20, 1)
  return (
    <div
      className="w-full h-8 rounded flex items-center justify-center text-xs font-medium"
      style={{ backgroundColor: `rgba(239,68,68,${opacity})`, color: val > 8 ? 'white' : '#374151' }}
    >
      {val}
    </div>
  )
}

export default function ManagerDashboard() {
  return (
    <div className="p-8 space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Network Manager</h1>
        <p className="text-sm text-gray-500 mt-1">SLA compliance · TTN/TTA tracking · Team performance</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'SLA Compliance', value: '94.2%', sub: '3 cities below target', warn: true },
          { label: 'Avg TTN (P1)', value: '3.2 min', sub: 'Target: ≤5 min ✓', ok: true },
          { label: 'Avg TTA (P1)', value: '6.8 min', sub: 'Target: ≤10 min ✓', ok: true },
          { label: 'Sites Below SLA', value: '27', sub: 'Out of 450', warn: true },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <p className="text-sm font-medium text-gray-500">{k.label}</p>
            <p className={`text-3xl font-bold mt-1 ${k.warn ? 'text-amber-600' : k.ok ? 'text-green-600' : 'text-gray-900'}`}>{k.value}</p>
            {k.sub && <p className="text-xs text-gray-400 mt-1">{k.sub}</p>}
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">SLA Compliance by City</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={SLA_DATA} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="city" tick={{fontSize:11}} />
            <YAxis tick={{fontSize:10}} domain={[98.5, 100.5]} unit="%" />
            <Tooltip />
            <ReferenceLine y={99.5} stroke="#F59E0B" strokeDasharray="4 4" label={{value:'Target', position:'right', fontSize:10}} />
            <Bar dataKey="actual" fill="#0066CC" radius={[6,6,0,0]} name="Actual %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">Incident Heatmap — by Hour × Day</h2>
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            <div className="grid gap-1" style={{gridTemplateColumns: '40px repeat(7, 1fr)'}}>
              <div />
              {DAYS.map(d => <div key={d} className="text-center text-xs font-medium text-gray-500 pb-1 capitalize">{d}</div>)}
              {HEATMAP_DATA.map(row => (
                <>
                  <div key={row.hour} className="flex items-center text-xs text-gray-400">{row.hour}:00</div>
                  {DAYS.map(d => <HeatCell key={d} val={row[d]} />)}
                </>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FabChat context="network_manager" />
    </div>
  )
}
