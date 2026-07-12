import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'
import { validate } from '../middleware/validate.js'

const router = Router()

const categorySchema = z.object({
  name: z.string().trim().min(1),
  warrantyMonths: z.coerce.number().int().min(0).nullish(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
})

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { assets: true } } },
    })
    res.json(categories)
  } catch (e) {
    next(e)
  }
})

router.post('/', requireAuth, requireRole('ADMIN'), validate(categorySchema), async (req, res, next) => {
  try {
    const category = await prisma.category.create({ data: req.body })
    res.status(201).json(category)
  } catch (e) {
    next(e)
  }
})

router.patch('/:id', requireAuth, requireRole('ADMIN'), validate(categorySchema.partial()), async (req, res, next) => {
  try {
    const category = await prisma.category.update({ where: { id: req.params.id }, data: req.body })
    res.json(category)
  } catch (e) {
    next(e)
  }
})

export default router
