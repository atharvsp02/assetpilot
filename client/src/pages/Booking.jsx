import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import * as bookingApi from '../api/bookings.js'
import { listAssets } from '../api/assets.js'

const input = 'w-full rounded-md border border-[#e0dedb] px-3 py-2 text-sm focus:border-[#37322f] focus:outline-none focus:ring-1 focus:ring-[#37322f]'
const btn = 'rounded-md px-3 py-1.5 text-sm font-medium'
const fmt = (d) => new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })

export default function Booking() {
  const [resources, setResources] = useState([])
  const [assetId, setAssetId] = useState('')
  const [bookings, setBookings] = useState([])
  const [form, setForm] = useState({ startTime: '', endTime: '' })
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  useEffect(() => {
    listAssets().then((all) => {
      const bookable = all.filter((a) => a.isBookable)
      setResources(bookable)
      if (bookable[0]) setAssetId(bookable[0].id)
    })
  }, [])

  const loadBookings = (id) => { if (id) bookingApi.listBookings({ assetId: id }).then(setBookings) }
  useEffect(() => { loadBookings(assetId) }, [assetId])

  const book = async () => {
    setError(''); setOk('')
    if (!form.startTime || !form.endTime) { setError('Pick a start and end time'); return }
    try {
      await bookingApi.createBooking({ assetId, startTime: form.startTime, endTime: form.endTime })
      setForm({ startTime: '', endTime: '' })
      setOk('Booked!'); loadBookings(assetId)
    } catch (e) {
      setError(e.response?.data?.message || 'Booking failed')
    }
  }

  const cancel = async (id) => { await bookingApi.cancelBooking(id); loadBookings(assetId) }

  const columns = [
    { key: 'startTime', header: 'Start', render: (r) => fmt(r.startTime) },
    { key: 'endTime', header: 'End', render: (r) => fmt(r.endTime) },
    { key: 'bookedBy', header: 'Booked by', render: (r) => r.bookedBy?.name || '—' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', header: '', render: (r) => (
      r.status !== 'CANCELLED' ? <button onClick={() => cancel(r.id)} className="text-red-600 hover:underline">Cancel</button> : null
    ) },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#37322f]">Resource Booking</h1>
      <p className="mt-1 text-sm text-[#847d76]">Overlap-safe scheduling — back-to-back slots allowed, true overlaps rejected.</p>

      {resources.length === 0 ? (
        <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          No bookable resources yet. Register an asset with the “shared / bookable” flag first.
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-xl bg-white p-5 ring-1 ring-[#e6e3df]">
            <label className="text-sm font-medium text-[#605a57]">Resource</label>
            <select className={`${input} mt-1`} value={assetId} onChange={(e) => setAssetId(e.target.value)}>
              {resources.map((a) => <option key={a.id} value={a.id}>{a.tag} · {a.name}</option>)}
            </select>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-[#847d76]">Start</label>
                <input type="datetime-local" className={`${input} mt-1`} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-[#847d76]">End</label>
                <input type="datetime-local" className={`${input} mt-1`} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
              <div className="flex items-end">
                <button onClick={book} className={`${btn} w-full bg-[#37322f] text-white hover:bg-[#4b453f]`}>Book slot</button>
              </div>
            </div>
            {error && <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            {ok && <div className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{ok}</div>}
          </div>

          <div className="mt-6">
            <h2 className="mb-2 font-semibold text-[#37322f]">Bookings for this resource</h2>
            <DataTable columns={columns} rows={bookings} empty="No bookings yet." />
          </div>
        </>
      )}
    </div>
  )
}
