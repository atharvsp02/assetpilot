import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
    res.json(notifications)
  } catch (e) {
    next(e)
  }
})

router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    // Only the owner may mark their notification read.
    const n = await prisma.notification.findUnique({ where: { id: req.params.id } })
    if (!n || n.userId !== req.user.userId)
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Notification not found' })
    res.json(await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } }))
  } catch (e) {
    next(e)
  }
})

export default router
