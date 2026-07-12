import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import RoleGuard from '../components/RoleGuard.jsx'
import * as mApi from '../api/maintenance.js'
import { listAssets } from '../api/assets.js'

const input = 'w-full rounded-md border border-[#e0dedb] px-3 py-2 text-sm focus:border-[#37322f] focus:outline-none focus:ring-1 focus:ring-[#37322f]'
const btn = 'rounded-md px-3 py-1 text-xs font-medium'
const fmt = (d) => new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })

// valid next actions per status — mirrors the server-side state machine
const NEXT = {
  PENDING: [['APPROVED', 'Approve', 'bg-green-600'], ['REJECTED', 'Reject', 'bg-red-600']],
  APPROVED: [['TECH_ASSIGNED', 'Assign technician', 'bg-[#37322f]']],
  TECH_ASSIGNED: [['IN_PROGRESS', 'Start work', 'bg-blue-600']],
  IN_PROGRESS: [['RESOLVED', 'Mark resolved', 'bg-green-600']],
  REJECTED: [],
  RESOLVED: [],
}

export default function Maintenance() {
  const [requests, setRequests] = useState([])
  const [assets, setAssets] = useState([])
  const [form, setForm] = useState({ assetId: '', description: '', priority: 'Medium', photoUrl: '' })
  const [msg, setMsg] = useState('')

  const load = () => mApi.listMaintenance().then(setRequests)
  useEffect(() => { listAssets().then(setAssets); load() }, [])

  const raise = async () => {
    setMsg('')
    if (!form.assetId || !form.description) { setMsg('Pick an asset and describe the issue'); return }
    try {
      await mApi.createMaintenance({ ...form, photoUrl: form.photoUrl || null })
      setForm({ assetId: '', description: '', priority: 'Medium', photoUrl: '' })
      setMsg('Request submitted.'); load()
    } catch (e) { setMsg(e.response?.data?.message || 'Failed to submit') }
  }

  const act = async (id, to) => {
    let tech
    if (to === 'TECH_ASSIGNED') {
      tech = prompt('Technician name?', 'In-house tech')
      if (tech === null) return
    }
    try { await mApi.transitionMaintenance(id, to, tech); load() }
    catch (e) { alert(e.response?.data?.message || 'Action failed') }
  }

  const columns = [
    { key: 'asset', header: 'Asset', render: (r) => <span><span className="font-mono text-xs">{r.asset?.tag}</span> {r.asset?.name}</span> },
    { key: 'description', header: 'Issue' },
    { key: 'priority', header: 'Priority' },
    { key: 'raisedBy', header: 'Raised by', render: (r) => r.raisedBy?.name || '—' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', header: 'Raised', render: (r) => fmt(r.createdAt) },
    { key: 'actions', header: 'Actions', render: (r) => (
      <RoleGuard roles={['ASSET_MANAGER', 'ADMIN']}>
        <div className="flex gap-1">
          {(NEXT[r.status] || []).map(([to, label, color]) => (
            <button key={to} onClick={() => act(r.id, to)} className={`${btn} ${color} text-white`}>{label}</button>
          ))}
          {(NEXT[r.status] || []).length === 0 && <span className="text-xs text-[#a39c94]">—</span>}
        </div>
      </RoleGuard>
    ) },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#37322f]">Maintenance</h1>
      <p className="mt-1 text-sm text-[#847d76]">Approval chain: Pending → Approved → Tech Assigned → In Progress → Resolved. No stage-skipping.</p>

      <div className="mt-5 rounded-xl bg-white p-5 ring-1 ring-[#e6e3df]">
        <h2 className="mb-3 font-semibold text-[#37322f]">Raise a request</h2>
        {msg && <div className="mb-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</div>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <select className={input} value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })}>
            <option value="">Select asset…</option>
            {assets.map((a) => <option key={a.id} value={a.id}>{a.tag} · {a.name}</option>)}
          </select>
          <input className={`${input} sm:col-span-2`} placeholder="Describe the issue" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select className={input} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
        </div>
        <div className="mt-3 flex gap-3">
          <input className={input} placeholder="Photo URL (optional)" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
          <button onClick={raise} className="rounded-md bg-[#37322f] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b453f]">Submit</button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 font-semibold text-[#37322f]">Approval queue</h2>
        <DataTable columns={columns} rows={requests} empty="No maintenance requests." />
      </div>
    </div>
  )
}
