import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import * as svc from '../services/bookingService.js'

const router = Router()

const bookingSchema = z.object({
  assetId: z.string().min(1),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
})

router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json(await svc.listBookings(req.query))
  } catch (e) {
    next(e)
  }
})

router.post('/', requireAuth, validate(bookingSchema), async (req, res, next) => {
  try {
    res.status(201).json(await svc.createBooking(req.body, req.user.userId))
  } catch (e) {
    if (e.code === 'OVERLAP') return res.status(409).json({ code: e.code, message: e.message })
    if (e.status) return res.status(e.status).json({ code: e.code, message: e.message })
    next(e)
  }
})

router.patch('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    res.json(await svc.cancelBooking(req.params.id, req.user))
  } catch (e) {
    if (e.status) return res.status(e.status).json({ code: e.code, message: e.message })
    next(e)
  }
})

export default router
