import { prisma } from '../lib/prisma.js'
import { setAssetStatus } from './assetStatus.js'
import { notify } from '../utils/notify.js'

const httpError = (status, code, message) => Object.assign(new Error(message), { status, code })

// The approval chain — a request may only move along these edges. No stage-skipping.
export const TRANSITIONS = {
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: ['TECH_ASSIGNED'],
  TECH_ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  REJECTED: [],
  RESOLVED: [],
}

export const canTransition = (from, to) => (TRANSITIONS[from] || []).includes(to)

export const createRequest = async ({ assetId, description, priority, photoUrl }, userId) => {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } })
  if (!asset) throw httpError(404, 'NOT_FOUND', 'Asset not found')
  return prisma.maintenanceRequest.create({
    data: { assetId, raisedById: userId, description, priority: priority || 'Medium', photoUrl: photoUrl || null, status: 'PENDING' },
  })
}

export const transition = async (id, to, actor, extra = {}) => {
  return prisma.$transaction(async (tx) => {
    const req = await tx.maintenanceRequest.findUnique({ where: { id } })
    if (!req) throw httpError(404, 'NOT_FOUND', 'Request not found')
    if (!canTransition(req.status, to))
      throw httpError(400, 'INVALID_TRANSITION', `Cannot move from ${req.status} to ${to}`)
    const data = { status: to }
    if (to === 'APPROVED' || to === 'REJECTED') data.approvedById = actor.userId
    if (to === 'TECH_ASSIGNED') data.technicianName = extra.technicianName || 'Assigned technician'
    if (to === 'RESOLVED') data.resolvedAt = new Date()
    const updated = await tx.maintenanceRequest.update({ where: { id }, data })
    // Asset status side-effects
    if (to === 'APPROVED') await setAssetStatus(tx, req.assetId, 'UNDER_MAINTENANCE', actor.userId, 'maintenance approved')
    if (to === 'RESOLVED') await setAssetStatus(tx, req.assetId, 'AVAILABLE', actor.userId, 'maintenance resolved')
    await notify(tx, { userId: req.raisedById, type: `MAINTENANCE_${to}`, message: `Your maintenance request is now ${to.replaceAll('_', ' ').toLowerCase()}` })
    return updated
  })
}

export const listRequests = async ({ status, assetId }) => {
  const where = {}
  if (status) where.status = status
  if (assetId) where.assetId = assetId
  return prisma.maintenanceRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      asset: { select: { id: true, tag: true, name: true } },
      raisedBy: { select: { id: true, name: true } },
    },
  })
}
