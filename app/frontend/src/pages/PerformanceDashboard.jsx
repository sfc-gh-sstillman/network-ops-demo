import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { api } from '../lib/api.js'
import FabChat from '../components/FabChat.jsx'

function mock(n, base, spread, key = 'v') {
  return Array.from({length: n}, (_, i) => ({ t: `${String(i).padStart(2,'0')}:00`, [key]: +(base + (Math.random() - 0.5) * spread).toFixed(1) }))
}

export default function PerformanceDashboard() {
  return (
    <div className="p-8 space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance Analyst</h1>
        <p className="text-sm text-gray-500 mt-1">Capacity planning · PRB utilization · Throughput analysis</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Avg PRB Utilization', value: '68.4%', sub: 'Warning threshold: 70%', warn: true },
          { label: 'Sites > 85% PRB', value: '23', sub: 'Critical — need rebalancing', warn: true },
          { label: 'Avg 5G Throughput', value: '142 Mbps', sub: 'DL · ↑12% vs last week' },
          { label: 'Avg 4G Throughput', value: '38 Mbps', sub: 'DL · Within target' },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <p className="text-sm font-medium text-gray-500">{k.label}</p>
            <p className={`text-3xl font-bold mt-1 ${k.warn ? 'text-amber-600' : 'text-gray-900'}`}>{k.value}</p>
            {k.sub && <p className="text-xs text-gray-400 mt-1">{k.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">PRB Utilization Trend — Lisboa (24h)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mock(24, 68, 20)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="t" tick={{fontSize:10}} />
              <YAxis tick={{fontSize:10}} domain={[0,100]} unit="%" />
              <Tooltip />
              <ReferenceLine y={85} stroke="#EF4444" strokeDasharray="4 4" label={{value:'Critical', position:'right', fontSize:10}} />
              <ReferenceLine y={70} stroke="#F59E0B" strokeDasharray="4 4" label={{value:'Warning', position:'right', fontSize:10}} />
              <Line type="monotone" dataKey="v" stroke="#8B5CF6" strokeWidth={2} dot={false} name="PRB %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">4G vs 5G Throughput by Region</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              {region:'Lisboa', '4G':35, '5G':148},
              {region:'Norte',  '4G':38, '5G':156},
              {region:'Centro', '4G':32, '5G':138},
              {region:'Algarve','4G':28, '5G':122},
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="region" tick={{fontSize:10}} />
              <YAxis tick={{fontSize:10}} unit=" Mbps" />
              <Tooltip />
              <Bar dataKey="4G" fill="#93C5FD" radius={[4,4,0,0]} />
              <Bar dataKey="5G" fill="#0066CC" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Top 10 Sites by PRB Utilization</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart layout="vertical" data={Array.from({length:10},(_,i)=>({site:`CELL-${String(i+1).padStart(4,'0')}`,prb:+(88-i*0.8).toFixed(1)}))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{fontSize:10}} domain={[0,100]} unit="%" />
            <YAxis dataKey="site" type="category" width={75} tick={{fontSize:10}} />
            <Tooltip />
            <ReferenceLine x={85} stroke="#EF4444" strokeDasharray="4 4" />
            <Bar dataKey="prb" fill="#F59E0B" radius={[0,4,4,0]} name="PRB %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <FabChat context="performance_analyst" />
    </div>
  )
}
