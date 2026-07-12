import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/org', label: 'Organization', roles: ['ADMIN'] },
  { to: '/assets', label: 'Assets' },
  { to: '/allocation', label: 'Allocation' },
  { to: '/booking', label: 'Booking' },
  { to: '/maintenance', label: 'Maintenance' },
  { to: '/audit', label: 'Audit' },
]

export default function Layout() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const items = NAV.filter((n) => !n.roles || hasRole(...n.roles))

  return (
    <div className="flex min-h-screen bg-[#efece8]">
      <aside className="flex w-56 flex-col border-r border-[#e6e3df] bg-white">
        <div className="px-5 py-4">
          <span className="text-lg font-bold text-[#37322f]">AssetFlow</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {items.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-[#f0ebe4] text-[#4b453f]' : 'text-[#605a57] hover:bg-[#fbfaf9]'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[#e6e3df] p-3 text-sm">
          <div className="px-2 font-medium text-[#4b453f]">{user.name}</div>
          <div className="px-2 text-xs font-medium text-[#37322f]">{user.role}</div>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="mt-2 w-full rounded-md border border-[#e0dedb] px-3 py-1.5 text-[#605a57] hover:bg-[#fbfaf9]"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
