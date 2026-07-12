import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'
import { validate } from '../middleware/validate.js'
import { publicUser } from '../services/authService.js'
import { logActivity } from '../utils/activity.js'

const router = Router()

const promoteSchema = z.object({
  role: z.enum(['EMPLOYEE', 'DEPARTMENT_HEAD', 'ASSET_MANAGER', 'ADMIN']),
})

const updateSchema = z.object({
  departmentId: z.string().nullish(),
  status: z.enum(['Active', 'Inactive']).optional(),
})

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
      include: { department: { select: { id: true, name: true } } },
    })
    res.json(users.map((u) => ({ ...publicUser(u), department: u.department })))
  } catch (e) {
    next(e)
  }
})

// Role promotion — ADMIN only. Enforced server-side; a non-admin hitting this gets 403.
router.post('/:id/promote', requireAuth, requireRole('ADMIN'), validate(promoteSchema), async (req, res, next) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!target) return res.status(404).json({ code: 'NOT_FOUND', message: 'User not found' })
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: req.body.role },
    })
    await logActivity(null, {
      actorId: req.user.userId,
      action: `PROMOTE_TO_${req.body.role}`,
      entity: 'User',
      entityId: updated.id,
      detail: { from: target.role, to: req.body.role },
    })
    res.json(publicUser(updated))
  } catch (e) {
    next(e)
  }
})

router.patch('/:id', requireAuth, requireRole('ADMIN'), validate(updateSchema), async (req, res, next) => {
  try {
    const updated = await prisma.user.update({ where: { id: req.params.id }, data: req.body })
    res.json(publicUser(updated))
  } catch (e) {
    next(e)
  }
})

export default router
