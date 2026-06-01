import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import EngineerDashboard from './pages/EngineerDashboard.jsx'
import AlarmTriage from './pages/AlarmTriage.jsx'
import PerformanceDashboard from './pages/PerformanceDashboard.jsx'
import ManagerDashboard from './pages/ManagerDashboard.jsx'
import ExecutiveDashboard from './pages/ExecutiveDashboard.jsx'
import Reports from './pages/Reports.jsx'
import IntelligenceChat from './pages/IntelligenceChat.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="engineer" element={<EngineerDashboard />} />
        <Route path="triage" element={<AlarmTriage />} />
        <Route path="performance" element={<PerformanceDashboard />} />
        <Route path="manager" element={<ManagerDashboard />} />
        <Route path="executive" element={<ExecutiveDashboard />} />
        <Route path="reports" element={<Reports />} />
        <Route path="chat" element={<IntelligenceChat />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
