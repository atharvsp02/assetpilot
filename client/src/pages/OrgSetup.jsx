import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import * as deptApi from '../api/departments.js'
import * as catApi from '../api/categories.js'
import * as empApi from '../api/employees.js'

const ROLES = ['EMPLOYEE', 'DEPARTMENT_HEAD', 'ASSET_MANAGER', 'ADMIN']
const TABS = ['Departments', 'Categories', 'Employee Directory']

const btn = 'rounded-md px-3 py-1.5 text-sm font-medium'
const input = 'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export default function OrgSetup() {
  const [tab, setTab] = useState('Departments')
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Organization Setup</h1>
      <p className="mt-1 text-sm text-slate-500">Master data — admin only.</p>
      <div className="mt-5 flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-5">
        {tab === 'Departments' && <DepartmentsPanel />}
        {tab === 'Categories' && <CategoriesPanel />}
        {tab === 'Employee Directory' && <EmployeesPanel />}
      </div>
    </div>
  )
}

function DepartmentsPanel() {
  const [rows, setRows] = useState([])
  const [emps, setEmps] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', headId: '', parentId: '', status: 'Active' })
  const [error, setError] = useState('')

  const load = async () => {
    setRows(await deptApi.listDepartments())
    setEmps(await empApi.listEmployees())
  }
  useEffect(() => { load() }, [])

  const startAdd = () => { setEditing(null); setForm({ name: '', headId: '', parentId: '', status: 'Active' }); setError(''); setOpen(true) }
  const startEdit = (d) => { setEditing(d); setForm({ name: d.name, headId: d.head?.id || '', parentId: d.parent?.id || '', status: d.status }); setError(''); setOpen(true) }

  const save = async () => {
    setError('')
    const payload = { name: form.name, headId: form.headId || null, parentId: form.parentId || null, status: form.status }
    try {
      if (editing) await deptApi.updateDepartment(editing.id, payload)
      else await deptApi.createDepartment(payload)
      setOpen(false)
      await load()
    } catch (e) { setError(e.response?.data?.message || 'Save failed') }
  }

  const remove = async (d) => {
    if (!confirm(`Delete department "${d.name}"?`)) return
    try { await deptApi.deleteDepartment(d.id); await load() }
    catch (e) { alert(e.response?.data?.message || 'Delete failed') }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'head', header: 'Head', render: (r) => r.head?.name || '—' },
    { key: 'parent', header: 'Parent', render: (r) => r.parent?.name || '—' },
    { key: 'members', header: 'Members', render: (r) => r._count?.members ?? 0 },
    { key: 'assets', header: 'Assets', render: (r) => r._count?.assets ?? 0 },
    { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
    {
      key: 'actions', header: '', render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => startEdit(r)} className="text-indigo-600 hover:underline">Edit</button>
          <button onClick={() => remove(r)} className="text-red-600 hover:underline">Delete</button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button onClick={startAdd} className={`${btn} bg-indigo-600 text-white hover:bg-indigo-700`}>+ Add Department</button>
      </div>
      <DataTable columns={columns} rows={rows} empty="No departments yet." />
      {open && (
        <Modal
          title={editing ? 'Edit Department' : 'Add Department'}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button onClick={() => setOpen(false)} className={`${btn} border border-slate-300 text-slate-600`}>Cancel</button>
              <button onClick={save} className={`${btn} bg-indigo-600 text-white`}>Save</button>
            </>
          }
        >
          {error && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <label className="text-sm font-medium text-slate-600">Name</label>
          <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="mt-3 block text-sm font-medium text-slate-600">Head</label>
          <select className={input} value={form.headId} onChange={(e) => setForm({ ...form, headId: e.target.value })}>
            <option value="">— none —</option>
            {emps.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <label className="mt-3 block text-sm font-medium text-slate-600">Parent department</label>
          <select className={input} value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
            <option value="">— none —</option>
            {rows.filter((d) => d.id !== editing?.id).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <label className="mt-3 block text-sm font-medium text-slate-600">Status</label>
          <select className={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Active</option><option>Inactive</option>
          </select>
        </Modal>
      )}
    </div>
  )
}

function CategoriesPanel() {
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', warrantyMonths: '', status: 'Active' })
  const [error, setError] = useState('')

  const load = async () => setRows(await catApi.listCategories())
  useEffect(() => { load() }, [])

  const startAdd = () => { setEditing(null); setForm({ name: '', warrantyMonths: '', status: 'Active' }); setError(''); setOpen(true) }
  const startEdit = (c) => { setEditing(c); setForm({ name: c.name, warrantyMonths: c.warrantyMonths ?? '', status: c.status }); setError(''); setOpen(true) }

  const save = async () => {
    setError('')
    const payload = { name: form.name, warrantyMonths: form.warrantyMonths === '' ? null : Number(form.warrantyMonths), status: form.status }
    try {
      if (editing) await catApi.updateCategory(editing.id, payload)
      else await catApi.createCategory(payload)
      setOpen(false); await load()
    } catch (e) { setError(e.response?.data?.message || 'Save failed') }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'warrantyMonths', header: 'Warranty (mo)', render: (r) => r.warrantyMonths ?? '—' },
    { key: 'assets', header: 'Assets', render: (r) => r._count?.assets ?? 0 },
    { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
    { key: 'actions', header: '', render: (r) => <button onClick={() => startEdit(r)} className="text-indigo-600 hover:underline">Edit</button> },
  ]

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button onClick={startAdd} className={`${btn} bg-indigo-600 text-white hover:bg-indigo-700`}>+ Add Category</button>
      </div>
      <DataTable columns={columns} rows={rows} empty="No categories yet." />
      {open && (
        <Modal
          title={editing ? 'Edit Category' : 'Add Category'}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button onClick={() => setOpen(false)} className={`${btn} border border-slate-300 text-slate-600`}>Cancel</button>
              <button onClick={save} className={`${btn} bg-indigo-600 text-white`}>Save</button>
            </>
          }
        >
          {error && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <label className="text-sm font-medium text-slate-600">Name</label>
          <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="mt-3 block text-sm font-medium text-slate-600">Warranty period (months, optional)</label>
          <input type="number" min="0" className={input} value={form.warrantyMonths} onChange={(e) => setForm({ ...form, warrantyMonths: e.target.value })} />
          <label className="mt-3 block text-sm font-medium text-slate-600">Status</label>
          <select className={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Active</option><option>Inactive</option>
          </select>
        </Modal>
      )}
    </div>
  )
}

function EmployeesPanel() {
  const [rows, setRows] = useState([])
  const load = async () => setRows(await empApi.listEmployees())
  useEffect(() => { load() }, [])

  const promote = async (id, role) => {
    try { await empApi.promoteEmployee(id, role); await load() }
    catch (e) { alert(e.response?.data?.message || 'Promotion failed') }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'department', header: 'Department', render: (r) => r.department?.name || '—' },
    { key: 'role', header: 'Role', render: (r) => <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{r.role}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
    {
      key: 'actions', header: 'Set role', render: (r) => (
        <select
          value={r.role}
          onChange={(e) => promote(r.id, e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
        >
          {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
      ),
    },
  ]

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Promote a member by changing their role. Enforced server-side (Admin only).</p>
      <DataTable columns={columns} rows={rows} empty="No employees yet." />
    </div>
  )
}

function StatusPill({ status }) {
  const active = status === 'Active'
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  )
}
