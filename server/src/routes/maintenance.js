import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'
import { validate } from '../middleware/validate.js'
import * as svc from '../services/maintenanceService.js'

const router = Router()

const createSchema = z.object({
  assetId: z.string().min(1),
  description: z.string().trim().min(1),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  photoUrl: z.string().trim().nullish(),
})

const transitionSchema = z.object({
  to: z.enum(['APPROVED', 'REJECTED', 'TECH_ASSIGNED', 'IN_PROGRESS', 'RESOLVED']),
  technicianName: z.string().trim().nullish(),
})

router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json(await svc.listRequests(req.query))
  } catch (e) {
    next(e)
  }
})

// Any authenticated user may raise a request.
router.post('/', requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    res.status(201).json(await svc.createRequest(req.body, req.user.userId))
  } catch (e) {
    next(e)
  }
})

// The approval chain is driven by Asset Manager / Admin. Invalid jumps → 400.
router.patch('/:id/status', requireAuth, requireRole('ASSET_MANAGER', 'ADMIN'), validate(transitionSchema), async (req, res, next) => {
  try {
    res.json(await svc.transition(req.params.id, req.body.to, req.user, { technicianName: req.body.technicianName }))
  } catch (e) {
    if (e.status) return res.status(e.status).json({ code: e.code, message: e.message })
    next(e)
  }
})

export default router
