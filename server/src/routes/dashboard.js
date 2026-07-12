import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    const [available, allocated, maintenanceToday, activeBookings, pendingTransfers, upcomingReturns, overdue] =
      await Promise.all([
        prisma.asset.count({ where: { status: 'AVAILABLE' } }),
        prisma.asset.count({ where: { status: 'ALLOCATED' } }),
        prisma.maintenanceRequest.count({ where: { createdAt: { gte: startOfDay, lte: endOfDay } } }),
        prisma.booking.count({ where: { status: { in: ['UPCOMING', 'ONGOING'] } } }),
        prisma.allocation.count({ where: { status: 'TRANSFER_REQUESTED' } }),
        prisma.allocation.count({ where: { status: 'ACTIVE', expectedReturnDate: { gte: now } } }),
        prisma.allocation.findMany({
          where: { status: 'ACTIVE', expectedReturnDate: { lt: now } },
          orderBy: { expectedReturnDate: 'asc' },
          include: { asset: { select: { tag: true, name: true } }, user: { select: { name: true } } },
        }),
      ])

    res.json({ available, allocated, maintenanceToday, activeBookings, pendingTransfers, upcomingReturns, overdue })
  } catch (e) {
    next(e)
  }
})

export default router
