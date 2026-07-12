import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import KpiCard from '../components/KpiCard.jsx'
import * as dash from '../api/dashboard.js'

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—')

export default function Dashboard() {
  const [kpi, setKpi] = useState(null)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    dash.getDashboard().then(setKpi)
    dash.listNotifications().then(setNotifications)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#37322f]">Dashboard</h1>
      <p className="mt-1 text-sm text-[#847d76]">Live snapshot of your organization’s assets and activity.</p>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KpiCard label="Assets Available" value={kpi?.available ?? '—'} accent="text-green-600" />
        <KpiCard label="Assets Allocated" value={kpi?.allocated ?? '—'} accent="text-blue-600" />
        <KpiCard label="Maintenance Today" value={kpi?.maintenanceToday ?? '—'} accent="text-orange-600" />
        <KpiCard label="Active Bookings" value={kpi?.activeBookings ?? '—'} accent="text-[#37322f]" />
        <KpiCard label="Pending Transfers" value={kpi?.pendingTransfers ?? '—'} accent="text-amber-600" />
        <KpiCard label="Upcoming Returns" value={kpi?.upcomingReturns ?? '—'} accent="text-[#37322f]" />
      </div>

      {kpi?.overdue?.length > 0 && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-800">⚠ Overdue Returns ({kpi.overdue.length})</h2>
          <ul className="mt-2 space-y-1 text-sm text-red-700">
            {kpi.overdue.map((a) => (
              <li key={a.id}>
                <span className="font-mono text-xs">{a.asset?.tag}</span> {a.asset?.name} — held by {a.user?.name || 'Dept'} · due {fmtDate(a.expectedReturnDate)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl bg-white p-5 ring-1 ring-[#e6e3df]">
          <h2 className="mb-3 font-semibold text-[#37322f]">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/assets" className="rounded-md bg-[#37322f] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b453f]">Register Asset</Link>
            <Link to="/booking" className="rounded-md bg-[#37322f] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b453f]">Book Resource</Link>
            <Link to="/maintenance" className="rounded-md border border-[#e0dedb] px-4 py-2 text-sm font-medium text-[#4b453f] hover:bg-[#fbfaf9]">Raise Maintenance</Link>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 ring-1 ring-[#e6e3df]">
          <h2 className="mb-3 font-semibold text-[#37322f]">Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-sm text-[#a39c94]">Nothing new.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {notifications.slice(0, 6).map((n) => (
                <li key={n.id} className="rounded-md bg-[#fbfaf9] px-3 py-2 text-[#605a57]">{n.message}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
