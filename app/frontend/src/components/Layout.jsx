import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, AlertTriangle, Activity, BarChart2,
  Briefcase, TrendingUp, FileText, MessageSquare, ChevronDown, Bell
} from 'lucide-react'

function SnowflakeLogo({ className }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 2l2.5 4.33h5L23 11l2.5 4.33-2.5 4.33L25.5 24h-5L18 28.33 15.5 24h-5L13 19.67 10.5 15.33 13 11l-2.5-4.67h5L18 2zm0 4.33L16.25 9.5h-3.5l1.75 3.03L12.75 15.5l1.75 3.03-1.75 2.97h3.5L18 24.67l1.75-3.17h3.5l-1.75-2.97L23.25 15.5l-1.75-3.03 1.75-2.97h-3.5L18 6.33z" />
    </svg>
  )
}

const PERSONAS = [
  { id: 'engineer',    label: 'Network Engineer',       color: 'bg-blue-600' },
  { id: 'analyst',     label: 'Performance Analyst',    color: 'bg-purple-600' },
  { id: 'manager',     label: 'Network Manager',        color: 'bg-amber-600' },
  { id: 'executive',   label: 'Executive',              color: 'bg-green-600' },
]

const NAV = [
  { to: '/',           label: 'Overview',              icon: LayoutDashboard },
  { to: '/engineer',   label: 'Network Engineer',      icon: Activity },
  { to: '/triage',     label: 'Alarm Triage',          icon: AlertTriangle,  badge: true },
  { to: '/performance',label: 'Performance',           icon: BarChart2 },
  { to: '/manager',    label: 'Manager',               icon: Briefcase },
  { to: '/executive',  label: 'Executive',             icon: TrendingUp },
  { to: '/reports',    label: 'Reports & Assist',      icon: FileText },
  { to: '/chat',       label: 'Intelligence Chat',     icon: MessageSquare },
]

export default function Layout() {
  const [persona, setPersona] = useState(PERSONAS[0])
  const [personaOpen, setPersonaOpen] = useState(false)
  const [triageCount] = useState(300)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 77 89" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M38.5 0L45.9 12.8H60.7L53.3 25.6L60.7 38.4L53.3 51.2L60.7 64H45.9L38.5 76.8L31.1 64H16.3L23.7 51.2L16.3 38.4L23.7 25.6L16.3 12.8H31.1L38.5 0Z" fill="#29B5E8"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">Network Ops</span>
          </div>
          <p className="text-xs text-gray-500">Intelligence Platform</p>
        </div>

        <div className="px-4 py-3 border-b border-gray-100 relative">
          <button
            onClick={() => setPersonaOpen(o => !o)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${persona.color}`} />
              <span className="text-xs font-medium text-gray-700 truncate">{persona.label}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
          </button>
          {personaOpen && (
            <div className="absolute left-4 right-4 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1">
              {PERSONAS.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setPersona(p); setPersonaOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-left"
                >
                  <div className={`w-2 h-2 rounded-full ${p.color}`} />
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ` +
                (isActive
                  ? 'bg-brand-blue-light text-brand-blue'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
              }
            >
              <span className="flex items-center gap-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </span>
              {badge && triageCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {triageCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">N</div>
            <div>
              <p className="text-xs font-medium text-gray-900">NOC Demo</p>
              <p className="text-xs text-gray-400">Portugal · Sept 2025</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${persona.color}`} />
            <span className="text-sm font-medium text-gray-600">{persona.label} View</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Live · Sept 30, 2025</span>
            <button className="relative p-2 rounded-lg hover:bg-gray-50">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <Outlet context={{ persona }} />
        </div>
      </main>
    </div>
  )
}
