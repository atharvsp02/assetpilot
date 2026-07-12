// Shared badge for every status enum in the app (asset / allocation / booking / maintenance / audit).
const COLORS = {
  // asset
  AVAILABLE: 'bg-green-50 text-green-700',
  ALLOCATED: 'bg-blue-50 text-blue-700',
  RESERVED: 'bg-amber-50 text-amber-700',
  UNDER_MAINTENANCE: 'bg-orange-50 text-orange-700',
  LOST: 'bg-red-50 text-red-700',
  RETIRED: 'bg-[#efece8] text-[#847d76]',
  DISPOSED: 'bg-[#efece8] text-[#847d76]',
  // allocation
  ACTIVE: 'bg-blue-50 text-blue-700',
  RETURNED: 'bg-[#efece8] text-[#847d76]',
  TRANSFER_REQUESTED: 'bg-amber-50 text-amber-700',
  TRANSFER_APPROVED: 'bg-green-50 text-green-700',
  // booking
  UPCOMING: 'bg-[#f0ebe4] text-[#4b453f]',
  ONGOING: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-[#efece8] text-[#847d76]',
  CANCELLED: 'bg-red-50 text-red-700',
  // maintenance
  PENDING: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
  TECH_ASSIGNED: 'bg-[#f0ebe4] text-[#4b453f]',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  RESOLVED: 'bg-green-50 text-green-700',
  // audit item
  VERIFIED: 'bg-green-50 text-green-700',
  MISSING: 'bg-red-50 text-red-700',
  DAMAGED: 'bg-orange-50 text-orange-700',
}

export default function StatusBadge({ status }) {
  if (!status) return null
  const cls = COLORS[status] || 'bg-[#efece8] text-[#605a57]'
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {String(status).replaceAll('_', ' ')}
    </span>
  )
}
