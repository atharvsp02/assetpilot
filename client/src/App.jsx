import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'

function Home() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <h1 className="text-lg font-bold text-indigo-600">AssetFlow</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600">
            {user.name} · <span className="font-medium text-indigo-600">{user.role}</span>
          </span>
          <button
            onClick={logout}
            className="rounded-md border border-slate-300 px-3 py-1 text-slate-600 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="p-8">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Welcome, {user.name}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Auth + RBAC is live. Feature screens land in the next slices.
          </p>
        </div>
      </main>
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
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
