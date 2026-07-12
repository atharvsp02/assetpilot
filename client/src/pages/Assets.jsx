import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import RoleGuard from '../components/RoleGuard.jsx'
import * as assetApi from '../api/assets.js'
import { listCategories } from '../api/categories.js'

const ASSET_STATUSES = ['AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED']
const CONDITIONS = ['New', 'Good', 'Fair', 'Poor']
const input = 'w-full rounded-md border border-[#e0dedb] px-3 py-2 text-sm focus:border-[#37322f] focus:outline-none focus:ring-1 focus:ring-[#37322f]'
const btn = 'rounded-md px-3 py-1.5 text-sm font-medium'

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—')

const emptyForm = {
  name: '', categoryId: '', serialNumber: '', acquisitionDate: '', acquisitionCost: '',
  condition: 'Good', location: '', isBookable: false, photoUrl: '',
}

export default function Assets() {
  const [assets, setAssets] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({ tag: '', status: '', categoryId: '', location: '' })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)

  useEffect(() => { listCategories().then(setCategories) }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      assetApi.listAssets(params).then(setAssets)
    }, 250)
    return () => clearTimeout(t)
  }, [filters])

  const reload = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    assetApi.listAssets(params).then(setAssets)
  }

  const save = async () => {
    setError('')
    const payload = {
      name: form.name,
      categoryId: form.categoryId,
      serialNumber: form.serialNumber || null,
      acquisitionDate: form.acquisitionDate || null,
      acquisitionCost: form.acquisitionCost === '' ? null : Number(form.acquisitionCost),
      condition: form.condition || null,
      location: form.location || null,
      isBookable: form.isBookable,
      photoUrl: form.photoUrl || null,
    }
    try {
      await assetApi.createAsset(payload)
      setShowForm(false); setForm(emptyForm); reload()
    } catch (e) { setError(e.response?.data?.message || 'Failed to register asset') }
  }

  const openDetail = async (row) => setDetail(await assetApi.getAsset(row.id))

  const columns = [
    { key: 'tag', header: 'Tag', render: (r) => <span className="font-mono text-xs">{r.tag}</span> },
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category', render: (r) => r.category?.name || '—' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'location', header: 'Location', render: (r) => r.location || '—' },
    { key: 'isBookable', header: 'Bookable', render: (r) => (r.isBookable ? 'Yes' : 'No') },
    { key: 'actions', header: '', render: (r) => <button onClick={() => openDetail(r)} className="text-[#37322f] hover:underline">View</button> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#37322f]">Assets</h1>
          <p className="mt-1 text-sm text-[#847d76]">Register, search, and track the full asset lifecycle.</p>
        </div>
        <RoleGuard roles={['ASSET_MANAGER', 'ADMIN']}>
          <button onClick={() => { setForm(emptyForm); setError(''); setShowForm(true) }} className={`${btn} bg-[#37322f] text-white hover:bg-[#4b453f]`}>
            + Register Asset
          </button>
        </RoleGuard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input placeholder="Search tag / serial…" className={input} value={filters.tag} onChange={(e) => setFilters({ ...filters, tag: e.target.value })} />
        <select className={input} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          {ASSET_STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
        </select>
        <select className={input} value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="Location…" className={input} value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
      </div>

      <div className="mt-4">
        <DataTable columns={columns} rows={assets} empty="No assets match." />
      </div>

      {showForm && (
        <Modal
          title="Register Asset"
          onClose={() => setShowForm(false)}
          footer={
            <>
              <button onClick={() => setShowForm(false)} className={`${btn} border border-[#e0dedb] text-[#605a57]`}>Cancel</button>
              <button onClick={save} className={`${btn} bg-[#37322f] text-white`}>Register</button>
            </>
          }
        >
          {error && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name"><input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Category">
              <select className={input} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">— select —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Serial number"><input className={input} value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} /></Field>
            <Field label="Acquisition date"><input type="date" className={input} value={form.acquisitionDate} onChange={(e) => setForm({ ...form, acquisitionDate: e.target.value })} /></Field>
            <Field label="Acquisition cost"><input type="number" min="0" className={input} value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} /></Field>
            <Field label="Condition">
              <select className={input} value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Location"><input className={input} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
            <Field label="Photo URL (optional)"><input className={input} value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} /></Field>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-[#605a57]">
            <input type="checkbox" checked={form.isBookable} onChange={(e) => setForm({ ...form, isBookable: e.target.checked })} />
            Shared / bookable resource
          </label>
        </Modal>
      )}

      {detail && (
        <Modal title={`${detail.tag} · ${detail.name}`} onClose={() => setDetail(null)}>
          <div className="mb-3"><StatusBadge status={detail.status} /></div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <Info label="Category" value={detail.category?.name} />
            <Info label="Serial" value={detail.serialNumber} />
            <Info label="Acquired" value={fmtDate(detail.acquisitionDate)} />
            <Info label="Cost" value={detail.acquisitionCost != null ? `₹${detail.acquisitionCost}` : '—'} />
            <Info label="Condition" value={detail.condition} />
            <Info label="Location" value={detail.location} />
            <Info label="Bookable" value={detail.isBookable ? 'Yes' : 'No'} />
            <Info label="Department" value={detail.department?.name} />
          </div>

          <History title="Allocation history" items={detail.allocations} render={(a) => (
            <span>{a.user?.name || 'Dept'} · <StatusBadge status={a.status} /> · {fmtDate(a.createdAt)}{a.returnedAt ? ` → ${fmtDate(a.returnedAt)}` : ''}</span>
          )} />
          <History title="Maintenance history" items={detail.maintenance} render={(m) => (
            <span>{m.description} · <StatusBadge status={m.status} /> · {fmtDate(m.createdAt)}</span>
          )} />
        </Modal>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-[#847d76]">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}
function Info({ label, value }) {
  return <div><span className="text-[#a39c94]">{label}: </span><span className="text-[#4b453f]">{value || '—'}</span></div>
}
function History({ title, items, render }) {
  return (
    <div className="mt-4">
      <h4 className="mb-2 text-sm font-semibold text-[#4b453f]">{title}</h4>
      {(!items || items.length === 0) ? (
        <p className="text-xs text-[#a39c94]">None yet.</p>
      ) : (
        <ul className="space-y-1 text-xs text-[#605a57]">
          {items.map((it) => <li key={it.id} className="rounded bg-[#fbfaf9] px-2 py-1.5">{render(it)}</li>)}
        </ul>
      )}
    </div>
  )
}
