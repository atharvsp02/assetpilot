import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RoleRoute from './components/RoleRoute.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import OrgSetup from './pages/OrgSetup.jsx'
import Assets from './pages/Assets.jsx'
import Allocation from './pages/Allocation.jsx'
import Booking from './pages/Booking.jsx'
import Maintenance from './pages/Maintenance.jsx'
import Audit from './pages/Audit.jsx'

function Placeholder({ title }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#37322f]">{title}</h1>
      <p className="mt-1 text-sm text-[#847d76]">Coming in the next slice.</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/org" element={<RoleRoute roles={['ADMIN']}><OrgSetup /></RoleRoute>} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/allocation" element={<Allocation />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/audit" element={<Audit />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
