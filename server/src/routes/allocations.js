import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'
import { validate } from '../middleware/validate.js'
import * as svc from '../services/allocationService.js'

const router = Router()

const allocateSchema = z.object({
  assetId: z.string().min(1),
  userId: z.string().nullish(),
  departmentId: z.string().nullish(),
  expectedReturnDate: z.coerce.date().nullish(),
})

const transferSchema = z.object({
  assetId: z.string().min(1),
  userId: z.string().nullish(),
  departmentId: z.string().nullish(),
  expectedReturnDate: z.coerce.date().nullish(),
})

const returnSchema = z.object({ checkInNotes: z.string().nullish() })

router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json(await svc.listAllocations(req.query))
  } catch (e) {
    next(e)
  }
})

router.post('/', requireAuth, requireRole('ASSET_MANAGER', 'ADMIN', 'DEPARTMENT_HEAD'), validate(allocateSchema), async (req, res, next) => {
  try {
    res.status(201).json(await svc.allocate(req.body, req.user.userId))
  } catch (e) {
    if (e.code === 'ALREADY_ALLOCATED')
      return res.status(409).json({ code: e.code, message: e.message, heldBy: e.heldBy })
    next(e)
  }
})

// Any authenticated user may request a transfer of an allocated asset.
router.post('/transfer-request', requireAuth, validate(transferSchema), async (req, res, next) => {
  try {
    res.status(201).json(await svc.requestTransfer(req.body, req.user.userId))
  } catch (e) {
    next(e)
  }
})

router.patch('/:id/transfer-approve', requireAuth, requireRole('ASSET_MANAGER', 'ADMIN', 'DEPARTMENT_HEAD'), async (req, res, next) => {
  try {
    res.json(await svc.approveTransfer(req.params.id, req.user.userId))
  } catch (e) {
    next(e)
  }
})

router.post('/:id/return', requireAuth, requireRole('ASSET_MANAGER', 'ADMIN'), validate(returnSchema), async (req, res, next) => {
  try {
    res.json(await svc.returnAsset({ allocationId: req.params.id, checkInNotes: req.body.checkInNotes }, req.user.userId))
  } catch (e) {
    next(e)
  }
})

export default router
