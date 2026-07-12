// Shared badge for every status enum in the app (asset / allocation / booking / maintenance / audit).
const COLORS = {
  // asset
  AVAILABLE: 'bg-green-50 text-green-700',
  ALLOCATED: 'bg-blue-50 text-blue-700',
  RESERVED: 'bg-amber-50 text-amber-700',
  UNDER_MAINTENANCE: 'bg-orange-50 text-orange-700',
  LOST: 'bg-red-50 text-red-700',
  RETIRED: 'bg-slate-100 text-slate-500',
  DISPOSED: 'bg-slate-100 text-slate-500',
  // allocation
  ACTIVE: 'bg-blue-50 text-blue-700',
  RETURNED: 'bg-slate-100 text-slate-500',
  TRANSFER_REQUESTED: 'bg-amber-50 text-amber-700',
  TRANSFER_APPROVED: 'bg-green-50 text-green-700',
  // booking
  UPCOMING: 'bg-indigo-50 text-indigo-700',
  ONGOING: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-slate-100 text-slate-500',
  CANCELLED: 'bg-red-50 text-red-700',
  // maintenance
  PENDING: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
  TECH_ASSIGNED: 'bg-indigo-50 text-indigo-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  RESOLVED: 'bg-green-50 text-green-700',
  // audit item
  VERIFIED: 'bg-green-50 text-green-700',
  MISSING: 'bg-red-50 text-red-700',
  DAMAGED: 'bg-orange-50 text-orange-700',
}

export default function StatusBadge({ status }) {
  if (!status) return null
  const cls = COLORS[status] || 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {String(status).replaceAll('_', ' ')}
    </span>
  )
}
