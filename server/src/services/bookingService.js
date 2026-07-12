import { prisma } from '../lib/prisma.js'
import { notify } from '../utils/notify.js'

const httpError = (status, code, message) => Object.assign(new Error(message), { status, code })

// Pure overlap rule: reject iff the new slot overlaps any non-cancelled booking.
// Back-to-back is allowed (newStart === existing.end passes, since < is strict).
export const hasOverlap = (newStart, newEnd, existing) =>
  existing.some((b) => b.status !== 'CANCELLED' && newStart < b.endTime && newEnd > b.startTime)

export const createBooking = async ({ assetId, startTime, endTime }, userId) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  if (!(end > start)) throw httpError(400, 'BAD_RANGE', 'End time must be after start time')
  return prisma.$transaction(async (tx) => {
    const asset = await tx.asset.findUnique({ where: { id: assetId } })
    if (!asset) throw httpError(404, 'NOT_FOUND', 'Asset not found')
    if (!asset.isBookable) throw httpError(400, 'NOT_BOOKABLE', 'This asset is not a bookable resource')
    const existing = await tx.booking.findMany({ where: { assetId, status: { not: 'CANCELLED' } } })
    if (hasOverlap(start, end, existing)) throw httpError(409, 'OVERLAP', 'This slot overlaps an existing booking')
    const booking = await tx.booking.create({
      data: { assetId, bookedById: userId, startTime: start, endTime: end, status: 'UPCOMING' },
    })
    await notify(tx, { userId, type: 'BOOKING_CONFIRMED', message: `Booking confirmed — ${asset.tag} · ${asset.name}` })
    return booking
  })
}

export const listBookings = async ({ assetId }) => {
  const where = {}
  if (assetId) where.assetId = assetId
  return prisma.booking.findMany({
    where,
    orderBy: { startTime: 'asc' },
    include: {
      asset: { select: { id: true, tag: true, name: true } },
      bookedBy: { select: { id: true, name: true } },
    },
  })
}

export const cancelBooking = async (id, actor) => {
  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking) throw httpError(404, 'NOT_FOUND', 'Booking not found')
  // Only the booker, or an Asset Manager / Admin, may cancel a booking.
  const privileged = actor.role === 'ASSET_MANAGER' || actor.role === 'ADMIN'
  if (booking.bookedById !== actor.userId && !privileged)
    throw httpError(403, 'FORBIDDEN', 'You cannot cancel another user’s booking')
  const updated = await prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' } })
  await notify(null, { userId: actor.userId, type: 'BOOKING_CANCELLED', message: `Booking cancelled — ${id}` })
  return updated
}
