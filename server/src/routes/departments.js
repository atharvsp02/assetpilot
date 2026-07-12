import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'
import { validate } from '../middleware/validate.js'

const router = Router()

const deptSchema = z.object({
  name: z.string().trim().min(1),
  headId: z.string().nullish(),
  parentId: z.string().nullish(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
})

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        head: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true } },
        _count: { select: { members: true, assets: true } },
      },
    })
    res.json(departments)
  } catch (e) {
    next(e)
  }
})

router.post('/', requireAuth, requireRole('ADMIN'), validate(deptSchema), async (req, res, next) => {
  try {
    const dept = await prisma.department.create({ data: req.body })
    res.status(201).json(dept)
  } catch (e) {
    next(e)
  }
})

router.patch('/:id', requireAuth, requireRole('ADMIN'), validate(deptSchema.partial()), async (req, res, next) => {
  try {
    const dept = await prisma.department.update({ where: { id: req.params.id }, data: req.body })
    res.json(dept)
  } catch (e) {
    next(e)
  }
})

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const counts = await prisma.department.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { members: true, assets: true, children: true } } },
    })
    if (!counts) return res.status(404).json({ code: 'NOT_FOUND', message: 'Department not found' })
    const { members, assets, children } = counts._count
    if (members || assets || children)
      return res.status(409).json({ code: 'DEPT_IN_USE', message: 'Department has members, assets, or sub-departments' })
    await prisma.department.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (e) {
    next(e)
  }
})

export default router
