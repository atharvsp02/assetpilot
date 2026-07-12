import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import RoleGuard from '../components/RoleGuard.jsx'
import * as allocApi from '../api/allocations.js'
import { listAssets } from '../api/assets.js'
import { listEmployees } from '../api/employees.js'

const input = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
const btn = 'rounded-md px-3 py-1.5 text-sm font-medium'
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—')
const isOverdue = (a) => a.status === 'ACTIVE' && a.expectedReturnDate && new Date(a.expectedReturnDate) < new Date()

export default function Allocation() {
  const [assets, setAssets] = useState([])
  const [employees, setEmployees] = useState([])
  const [active, setActive] = useState([])
  const [transfers, setTransfers] = useState([])
  const [form, setForm] = useState({ assetId: '', userId: '', expectedReturnDate: '' })
  const [conflict, setConflict] = useState(null)
  const [msg, setMsg] = useState('')
  const [returning, setReturning] = useState(null)
  const [notes, setNotes] = useState('')

  const reload = async () => {
    setAssets(await listAssets())
    setActive(await allocApi.listAllocations({ status: 'ACTIVE' }))
    setTransfers(await allocApi.listAllocations({ status: 'TRANSFER_REQUESTED' }))
  }
  useEffect(() => { listEmployees().then(setEmployees); reload() }, [])

  const availableAssets = assets.filter((a) => a.status === 'AVAILABLE')

  const submitAllocate = async () => {
    setMsg(''); setConflict(null)
    try {
      await allocApi.allocate({
        assetId: form.assetId,
        userId: form.userId || null,
        expectedReturnDate: form.expectedReturnDate || null,
      })
      setForm({ assetId: '', userId: '', expectedReturnDate: '' })
      setMsg('Asset allocated.')
      reload()
    } catch (e) {
      if (e.response?.status === 409) setConflict({ heldBy: e.response.data.heldBy })
      else setMsg(e.response?.data?.message || 'Allocation failed')
    }
  }

  const requestTransfer = async () => {
    try {
      await allocApi.requestTransfer({ assetId: form.assetId, userId: form.userId || null, expectedReturnDate: form.expectedReturnDate || null })
      setConflict(null); setMsg('Transfer requested — awaiting approval.'); reload()
    } catch (e) { setMsg(e.response?.data?.message || 'Transfer request failed') }
  }

  const approve = async (id) => { await allocApi.approveTransfer(id); reload() }

  const doReturn = async () => {
    await allocApi.returnAsset(returning.id, notes)
    setReturning(null); setNotes(''); reload()
  }

  const activeCols = [
    { key: 'asset', header: 'Asset', render: (r) => <span><span className="font-mono text-xs">{r.asset?.tag}</span> {r.asset?.name}</span> },
    { key: 'user', header: 'Holder', render: (r) => r.user?.name || 'Department' },
    { key: 'createdAt', header: 'Allocated', render: (r) => fmtDate(r.createdAt) },
    { key: 'expectedReturnDate', header: 'Expected return', render: (r) => (
      <span className={isOverdue(r) ? 'font-medium text-red-600' : ''}>
        {fmtDate(r.expectedReturnDate)}{isOverdue(r) && ' · OVERDUE'}
      </span>
    ) },
    { key: 'actions', header: '', render: (r) => (
      <RoleGuard roles={['ASSET_MANAGER', 'ADMIN']}>
        <button onClick={() => { setReturning(r); setNotes('') }} className="text-indigo-600 hover:underline">Return</button>
      </RoleGuard>
    ) },
  ]

  const transferCols = [
    { key: 'asset', header: 'Asset', render: (r) => <span><span className="font-mono text-xs">{r.asset?.tag}</span> {r.asset?.name}</span> },
    { key: 'user', header: 'Requested for', render: (r) => r.user?.name || 'Department' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', header: '', render: (r) => (
      <RoleGuard roles={['ASSET_MANAGER', 'DEPARTMENT_HEAD', 'ADMIN']}>
        <button onClick={() => approve(r.id)} className="text-green-600 hover:underline">Approve</button>
      </RoleGuard>
    ) },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Allocation &amp; Transfer</h1>
      <p className="mt-1 text-sm text-slate-500">Conflict-safe allocation — an asset can only be held by one holder at a time.</p>

      <RoleGuard roles={['ASSET_MANAGER', 'ADMIN', 'DEPARTMENT_HEAD']}>
        <div className="mt-5 rounded-xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="mb-3 font-semibold text-slate-800">Allocate an asset</h2>
          {msg && <div className="mb-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</div>}
          {conflict && (
            <div className="mb-3 flex items-center justify-between rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <span>Currently held by <b>{conflict.heldBy}</b>. You can request a transfer instead.</span>
              <button onClick={requestTransfer} className={`${btn} bg-amber-600 text-white`}>Request Transfer</button>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <select className={input} value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })}>
              <option value="">Select asset…</option>
              {availableAssets.map((a) => <option key={a.id} value={a.id}>{a.tag} · {a.name}</option>)}
              {form.assetId && !availableAssets.find((a) => a.id === form.assetId) && (
                <option value={form.assetId}>{assets.find((a) => a.id === form.assetId)?.tag} (selected)</option>
              )}
            </select>
            <select className={input} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
              <option value="">Assign to…</option>
              {employees.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <input type="date" className={input} value={form.expectedReturnDate} onChange={(e) => setForm({ ...form, expectedReturnDate: e.target.value })} />
            <button onClick={submitAllocate} disabled={!form.assetId} className={`${btn} bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50`}>Allocate</button>
          </div>
          <p className="mt-2 text-xs text-slate-400">Tip: to allocate an already-held asset, use Request Transfer after selecting it.</p>
          <select className={`${input} mt-2`} value="" onChange={(e) => setForm({ ...form, assetId: e.target.value })}>
            <option value="">…or pick any asset (incl. allocated) to transfer</option>
            {assets.map((a) => <option key={a.id} value={a.id}>{a.tag} · {a.name} ({a.status})</option>)}
          </select>
        </div>
      </RoleGuard>

      <div className="mt-6">
        <h2 className="mb-2 font-semibold text-slate-800">Active allocations</h2>
        <DataTable columns={activeCols} rows={active} empty="Nothing allocated right now." />
      </div>

      <div className="mt-6">
        <h2 className="mb-2 font-semibold text-slate-800">Pending transfer requests</h2>
        <DataTable columns={transferCols} rows={transfers} empty="No transfer requests." />
      </div>

      {returning && (
        <Modal
          title="Return asset"
          onClose={() => setReturning(null)}
          footer={
            <>
              <button onClick={() => setReturning(null)} className={`${btn} border border-slate-300 text-slate-600`}>Cancel</button>
              <button onClick={doReturn} className={`${btn} bg-indigo-600 text-white`}>Confirm return</button>
            </>
          }
        >
          <p className="mb-3 text-sm text-slate-600">
            Returning <b>{returning.asset?.tag}</b> from {returning.user?.name || 'Department'}.
          </p>
          <label className="text-sm font-medium text-slate-600">Condition check-in notes</label>
          <textarea className={`${input} mt-1`} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Minor scratches on lid" />
        </Modal>
      )}
    </div>
  )
}
