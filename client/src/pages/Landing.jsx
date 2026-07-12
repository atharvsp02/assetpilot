import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const FEATURES = [
  { title: 'Conflict-safe allocation', body: 'One holder per asset, always. Try to double-allocate and AssetFlow blocks it and offers a transfer instead.' },
  { title: 'Overlap-safe booking', body: 'Book shared resources by time slot. Back-to-back is fine; true overlaps are rejected before they happen.' },
  { title: 'Maintenance approvals', body: 'Route every repair through a strict approval chain — no skipping stages, asset status stays in sync automatically.' },
  { title: 'Audit cycles', body: 'Run structured audits, flag discrepancies, and close the cycle to lock results and update asset statuses.' },
  { title: 'Real RBAC', body: 'Four roles with distinct powers. Promotion happens only by an Admin — enforced on the server, not just hidden in the UI.' },
  { title: 'Live KPI dashboard', body: 'Availability, allocations, maintenance, bookings, overdue returns — all from real data, updated as you work.' },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[#f7f5f3] text-[#37322f]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#37322f]/10 bg-[#f7f5f3]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-[#37322f] text-sm font-bold text-white">A</span>
            <span className="text-lg font-semibold tracking-tight">AssetFlow</span>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-[#605a57] md:flex">
            <a href="#features" className="hover:text-[#37322f]">Features</a>
            <a href="#how" className="hover:text-[#37322f]">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard" className="rounded-full bg-[#37322f] px-5 py-2 text-sm font-medium text-white hover:bg-[#4b453f]">
                Open app
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-full px-4 py-2 text-sm font-medium text-[#37322f] hover:bg-[#37322f]/5">Sign in</Link>
                <Link to="/signup" className="rounded-full bg-[#37322f] px-5 py-2 text-sm font-medium text-white hover:bg-[#4b453f]">Get started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-6 pt-24 pb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#37322f]/10 bg-white px-4 py-1.5 text-xs font-medium text-[#605a57] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Enterprise asset & resource management
          </span>
          <h1 className="mt-6 font-serif text-5xl leading-tight text-[#37322f] md:text-7xl md:leading-[1.05]">
            Every asset, booking, and repair — under control.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[#605a57]">
            Track assets across their full lifecycle, allocate them without conflicts, book shared resources without overlaps, and route maintenance through real approval workflows.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/signup" className="rounded-full bg-[#37322f] px-8 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#4b453f]">
              Get started free
            </Link>
            <Link to="/login" className="rounded-full border border-[#37322f]/15 bg-white px-8 py-3 text-sm font-medium text-[#37322f] hover:bg-[#37322f]/5">
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-xs text-[#a39c94]">Demo admin — admin@assetflow.com / Admin@123</p>
        </div>

        {/* Dashboard preview — real markup, mirrors the in-app dashboard */}
        <div id="how" className="mx-auto max-w-5xl px-6 pb-20">
          <div className="overflow-hidden rounded-2xl border border-[#e0dedb] bg-white shadow-[0_30px_80px_-30px_rgba(55,50,47,0.35)]">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-[#eeece9] bg-[#faf9f7] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#e2564d]" />
              <span className="h-3 w-3 rounded-full bg-[#e6b34a]" />
              <span className="h-3 w-3 rounded-full bg-[#5aa563]" />
              <span className="ml-3 text-xs font-medium text-[#a39c94]">AssetFlow — Dashboard</span>
            </div>

            <div className="flex">
              {/* Sidebar */}
              <aside className="hidden w-48 shrink-0 border-r border-[#eeece9] bg-[#faf9f7] p-4 sm:block">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded bg-[#37322f] text-xs font-bold text-white">A</span>
                  <span className="text-sm font-semibold">AssetFlow</span>
                </div>
                <nav className="mt-5 space-y-1 text-sm">
                  <span className="block rounded-md bg-[#37322f] px-3 py-1.5 font-medium text-white">Dashboard</span>
                  {['Assets', 'Allocation', 'Booking', 'Maintenance', 'Audit'].map((n) => (
                    <span key={n} className="block rounded-md px-3 py-1.5 text-[#605a57]">{n}</span>
                  ))}
                </nav>
              </aside>

              {/* Main */}
              <div className="flex-1 p-5 text-left">
                <h3 className="text-lg font-bold text-[#37322f]">Dashboard</h3>
                <p className="text-xs text-[#847d76]">Live snapshot of your organization’s assets and activity.</p>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Assets Available', value: '128', accent: 'text-green-600' },
                    { label: 'Assets Allocated', value: '74', accent: 'text-blue-600' },
                    { label: 'Maintenance Today', value: '3', accent: 'text-orange-600' },
                    { label: 'Active Bookings', value: '12', accent: 'text-[#37322f]' },
                    { label: 'Pending Transfers', value: '2', accent: 'text-amber-600' },
                    { label: 'Upcoming Returns', value: '5', accent: 'text-[#37322f]' },
                  ].map((k) => (
                    <div key={k.label} className="rounded-lg bg-[#fbfaf9] p-3 ring-1 ring-[#e6e3df]">
                      <div className="text-[10px] font-medium uppercase tracking-wide text-[#a39c94]">{k.label}</div>
                      <div className={`mt-1 text-2xl font-bold ${k.accent}`}>{k.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="text-xs font-semibold text-red-800">⚠ Overdue Returns (2)</div>
                  <div className="mt-1 text-[11px] text-red-700">
                    <span className="font-mono">AF-0114</span> ThinkPad X1 — held by Priya · due 07/09
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-[#a39c94]">Preview — the live dashboard updates from real data.</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-[#37322f]/8 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl text-[#37322f]">Built narrow and deep, not wide and shallow.</h2>
            <p className="mt-3 text-[#605a57]">The workflows that actually matter, done with correct, defensible logic.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-[#e0dedb] bg-[#fbfaf9] p-6">
                <h3 className="font-semibold text-[#37322f]">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#605a57]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#37322f]">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="font-serif text-4xl text-white">Ready to bring order to your assets?</h2>
          <p className="mx-auto mt-3 max-w-lg text-[#e0dedb]">Sign up as an employee in seconds. An admin can promote you when you’re ready.</p>
          <Link to="/signup" className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-medium text-[#37322f] hover:bg-[#f2efeb]">
            Get started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#37322f]/8 bg-[#f7f5f3]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-[#847d76] md:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded bg-[#37322f] text-xs font-bold text-white">A</span>
            <span className="font-medium text-[#37322f]">AssetFlow</span>
          </div>
          <span>Built for the Odoo Hackathon 2026.</span>
        </div>
      </footer>
    </div>
  )
}
