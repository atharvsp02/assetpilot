import { useEffect, useState } from 'react'
import Modal from '../components/Modal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import RoleGuard from '../components/RoleGuard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import * as auditApi from '../api/audits.js'
import { listDepartments } from '../api/departments.js'
import { listEmployees } from '../api/employees.js'

const input = 'w-full rounded-md border border-[#e0dedb] px-3 py-2 text-sm focus:border-[#37322f] focus:outline-none focus:ring-1 focus:ring-[#37322f]'
const btn = 'rounded-md px-3 py-1.5 text-sm font-medium'
const MARKS = [['VERIFIED', 'bg-green-600'], ['MISSING', 'bg-red-600'], ['DAMAGED', 'bg-orange-500']]

export default function Audit() {
  const { hasRole } = useAuth()
  const [cycles, setCycles] = useState([])
  const [selected, setSelected] = useState(null)
  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', scopeDepartmentId: '', scopeLocation: '', startDate: '', endDate: '', auditorIds: [] })
  const [error, setError] = useState('')

  const loadCycles = () => auditApi.listCycles().then(setCycles)
  useEffect(() => { loadCycles(); listDepartments().then(setDepartments); listEmployees().then(setEmployees) }, [])

  const open = async (id) => setSelected(await auditApi.getCycle(id))

  const create = async () => {
    setError('')
    try {
      const cycle = await auditApi.createCycle({
        name: form.name,
        scopeDepartmentId: form.scopeDepartmentId || null,
        scopeLocation: form.scopeLocation || null,
        startDate: form.startDate,
        endDate: form.endDate,
        auditorIds: form.auditorIds,
      })
      setShowCreate(false)
      setForm({ name: '', scopeDepartmentId: '', scopeLocation: '', startDate: '', endDate: '', auditorIds: [] })
      await loadCycles()
      open(cycle.id)
    } catch (e) { setError(e.response?.data?.message || 'Failed to create cycle') }
  }

  const mark = async (itemId, status) => { await auditApi.markItem(itemId, status); open(selected.id) }
  const close = async () => { await auditApi.closeCycle(selected.id); await loadCycles(); open(selected.id) }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#37322f]">Asset Audit</h1>
          <p className="mt-1 text-sm text-[#847d76]">Run audit cycles, flag discrepancies, close to lock and update statuses.</p>
        </div>
        <RoleGuard roles={['ADMIN', 'ASSET_MANAGER']}>
          <button onClick={() => { setError(''); setShowCreate(true) }} className={`${btn} bg-[#37322f] text-white hover:bg-[#4b453f]`}>+ New Cycle</button>
        </RoleGuard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[#605a57]">Cycles</h2>
          {cycles.length === 0 && <p className="text-sm text-[#a39c94]">No cycles yet.</p>}
          {cycles.map((c) => (
            <button
              key={c.id}
              onClick={() => open(c.id)}
              className={`w-full rounded-lg border p-3 text-left ${selected?.id === c.id ? 'border-[#8a8178] bg-[#f0ebe4]' : 'border-[#e6e3df] bg-white hover:bg-[#fbfaf9]'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#37322f]">{c.name}</span>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-1 text-xs text-[#a39c94]">{c._count?.items ?? 0} assets</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {!selected ? (
            <div className="rounded-xl bg-white p-6 text-sm text-[#a39c94] ring-1 ring-[#e6e3df]">Select a cycle to review its items.</div>
          ) : (
            <div className="rounded-xl bg-white p-5 ring-1 ring-[#e6e3df]">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-[#37322f]">{selected.name} <StatusBadge status={selected.status} /></h2>
                {selected.status === 'OPEN' && hasRole('ADMIN', 'ASSET_MANAGER') && (
                  <button onClick={close} className={`${btn} bg-[#37322f] text-white`}>Close cycle</button>
                )}
              </div>
              {selected.discrepancies?.length > 0 && (
                <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {selected.discrepancies.length} discrepancy(ies): {selected.discrepancies.map((d) => d.asset?.tag).join(', ')}
                </div>
              )}
              <div className="mt-4 space-y-2">
                {selected.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between rounded-lg border border-[#efece8] px-3 py-2">
                    <div className="text-sm">
                      <span className="font-mono text-xs">{it.asset?.tag}</span> {it.asset?.name}
                      <span className="ml-2"><StatusBadge status={it.status} /></span>
                    </div>
                    {selected.status === 'OPEN' && (
                      <div className="flex gap-1">
                        {MARKS.map(([m, color]) => (
                          <button key={m} onClick={() => mark(it.id, m)} className={`rounded px-2 py-1 text-xs font-medium text-white ${color} ${it.status === m ? 'ring-2 ring-offset-1 ring-[#a39c94]' : 'opacity-85 hover:opacity-100'}`}>
                            {m}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <Modal
          title="New Audit Cycle"
          onClose={() => setShowCreate(false)}
          footer={
            <>
              <button onClick={() => setShowCreate(false)} className={`${btn} border border-[#e0dedb] text-[#605a57]`}>Cancel</button>
              <button onClick={create} className={`${btn} bg-[#37322f] text-white`}>Create</button>
            </>
          }
        >
          {error && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <label className="text-sm font-medium text-[#605a57]">Name</label>
          <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#847d76]">Scope: department</label>
              <select className={input} value={form.scopeDepartmentId} onChange={(e) => setForm({ ...form, scopeDepartmentId: e.target.value })}>
                <option value="">All</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#847d76]">Scope: location</label>
              <input className={input} value={form.scopeLocation} onChange={(e) => setForm({ ...form, scopeLocation: e.target.value })} placeholder="(optional)" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#847d76]">Start</label>
              <input type="date" className={input} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#847d76]">End</label>
              <input type="date" className={input} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <label className="mt-3 block text-xs font-medium text-[#847d76]">Auditors (Ctrl/Cmd-click to select several)</label>
          <select
            multiple
            className={`${input} h-28`}
            value={form.auditorIds}
            onChange={(e) => setForm({ ...form, auditorIds: Array.from(e.target.selectedOptions, (o) => o.value) })}
          >
            {employees.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
        </Modal>
      )}
    </div>
  )
}
