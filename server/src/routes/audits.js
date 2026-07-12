import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'
import { validate } from '../middleware/validate.js'
import * as svc from '../services/auditService.js'

const router = Router()

const createSchema = z.object({
  name: z.string().trim().min(1),
  scopeDepartmentId: z.string().nullish(),
  scopeLocation: z.string().trim().nullish(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  auditorIds: z.array(z.string()).optional(),
})

const markSchema = z.object({
  status: z.enum(['VERIFIED', 'MISSING', 'DAMAGED']),
  note: z.string().trim().nullish(),
})

router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json(await svc.listCycles())
  } catch (e) {
    next(e)
  }
})

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    res.json(await svc.getCycle(req.params.id))
  } catch (e) {
    if (e.status) return res.status(e.status).json({ code: e.code, message: e.message })
    next(e)
  }
})

router.post('/', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), validate(createSchema), async (req, res, next) => {
  try {
    res.status(201).json(await svc.createCycle(req.body, req.user.userId))
  } catch (e) {
    next(e)
  }
})

// Auditors mark items. Blocked once the cycle is closed.
router.patch('/items/:id', requireAuth, validate(markSchema), async (req, res, next) => {
  try {
    res.json(await svc.markItem(req.params.id, req.body, req.user))
  } catch (e) {
    if (e.status) return res.status(e.status).json({ code: e.code, message: e.message })
    next(e)
  }
})

router.patch('/:id/close', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), async (req, res, next) => {
  try {
    res.json(await svc.closeCycle(req.params.id, req.user.userId))
  } catch (e) {
    if (e.status) return res.status(e.status).json({ code: e.code, message: e.message })
    next(e)
  }
})

export default router
