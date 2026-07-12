import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RoleRoute from './components/RoleRoute.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import OrgSetup from './pages/OrgSetup.jsx'
import Assets from './pages/Assets.jsx'

function Placeholder({ title }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">Coming in the next slice.</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/org" element={<RoleRoute roles={['ADMIN']}><OrgSetup /></RoleRoute>} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/allocation" element={<Placeholder title="Allocation" />} />
            <Route path="/booking" element={<Placeholder title="Booking" />} />
            <Route path="/maintenance" element={<Placeholder title="Maintenance" />} />
            <Route path="/audit" element={<Placeholder title="Audit" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
