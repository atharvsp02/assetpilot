import { useAuth } from '../context/AuthContext.jsx'

// Route-level role gate — server still enforces on every request; this is UX only.
export default function RoleRoute({ roles, children }) {
  const { hasRole } = useAuth()
  if (!hasRole(...roles)) {
    return (
      <div className="rounded-xl bg-white p-6 ring-1 ring-[#e6e3df]">
        <h2 className="text-lg font-semibold text-[#37322f]">Not authorized</h2>
        <p className="mt-1 text-sm text-[#847d76]">You don’t have access to this page.</p>
      </div>
    )
  }
  return children
}
