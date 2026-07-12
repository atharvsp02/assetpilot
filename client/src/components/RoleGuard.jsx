import { useAuth } from '../context/AuthContext.jsx'

// Cosmetic gate only — the server is always the source of truth for permissions.
export default function RoleGuard({ roles, children }) {
  const { hasRole } = useAuth()
  return hasRole(...roles) ? children : null
}
