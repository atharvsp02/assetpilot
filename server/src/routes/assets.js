import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'
import { validate } from '../middleware/validate.js'
import { nextAssetTag } from '../utils/assetTag.js'
import { logActivity } from '../utils/activity.js'

const router = Router()

const registerSchema = z.object({
  name: z.string().trim().min(1),
  categoryId: z.string().min(1),
  serialNumber: z.string().trim().nullish(),
  acquisitionDate: z.coerce.date().nullish(),
  acquisitionCost: z.coerce.number().min(0).nullish(),
  condition: z.string().trim().nullish(),
  location: z.string().trim().nullish(),
  photoUrl: z.string().trim().nullish(),
  isBookable: z.coerce.boolean().default(false),
  departmentId: z.string().nullish(),
})

// Search / filter
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { tag, serial, categoryId, status, departmentId, location } = req.query
    const where = {}
    if (tag) where.tag = { contains: String(tag), mode: 'insensitive' }
    if (serial) where.serialNumber = { contains: String(serial), mode: 'insensitive' }
    if (categoryId) where.categoryId = String(categoryId)
    if (status) where.status = String(status)
    if (departmentId) where.departmentId = String(departmentId)
    if (location) where.location = { contains: String(location), mode: 'insensitive' }
    const assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    })
    res.json(assets)
  } catch (e) {
    next(e)
  }
})

// Per-asset detail + allocation & maintenance history
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        department: { select: { id: true, name: true } },
        allocations: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
        maintenance: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!asset) return res.status(404).json({ code: 'NOT_FOUND', message: 'Asset not found' })
    res.json(asset)
  } catch (e) {
    next(e)
  }
})

// Register — Asset Manager / Admin only. Auto-generates the tag inside a tx.
router.post('/', requireAuth, requireRole('ASSET_MANAGER', 'ADMIN'), validate(registerSchema), async (req, res, next) => {
  try {
    const asset = await prisma.$transaction(async (tx) => {
      const tag = await nextAssetTag(tx)
      const created = await tx.asset.create({ data: { ...req.body, tag } })
      await logActivity(tx, {
        actorId: req.user.userId,
        action: 'ASSET_REGISTERED',
        entity: 'Asset',
        entityId: created.id,
        detail: { tag },
      })
      return created
    })
    res.status(201).json(asset)
  } catch (e) {
    next(e)
  }
})

// Metadata update only — never status (status is a side-effect of real actions).
router.patch('/:id', requireAuth, requireRole('ASSET_MANAGER', 'ADMIN'), validate(registerSchema.partial()), async (req, res, next) => {
  try {
    const asset = await prisma.asset.update({ where: { id: req.params.id }, data: req.body })
    res.json(asset)
  } catch (e) {
    next(e)
  }
})

export default router
