import { prisma } from '../lib/prisma.js'
import { setAssetStatus } from './assetStatus.js'
import { logActivity } from '../utils/activity.js'

const httpError = (status, code, message) => Object.assign(new Error(message), { status, code })

export const createCycle = async ({ name, scopeDepartmentId, scopeLocation, startDate, endDate, auditorIds }, actorId) => {
  return prisma.$transaction(async (tx) => {
    const cycle = await tx.auditCycle.create({
      data: {
        name,
        scopeDepartmentId: scopeDepartmentId || null,
        scopeLocation: scopeLocation || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdById: actorId,
      },
    })
    // Assets in scope (by department and/or location; empty scope = all assets)
    const where = {}
    if (scopeDepartmentId) where.departmentId = scopeDepartmentId
    if (scopeLocation) where.location = { contains: scopeLocation, mode: 'insensitive' }
    const assets = await tx.asset.findMany({ where, select: { id: true } })
    const auditors = auditorIds && auditorIds.length ? auditorIds : [null]
    if (assets.length) {
      await tx.auditItem.createMany({
        data: assets.map((a, i) => ({
          cycleId: cycle.id,
          assetId: a.id,
          auditorId: auditors[i % auditors.length],
          status: 'PENDING',
        })),
      })
    }
    await logActivity(tx, { actorId, action: 'AUDIT_CREATED', entity: 'AuditCycle', entityId: cycle.id, detail: { assets: assets.length } })
    return cycle
  })
}

export const markItem = async (itemId, { status, note }, actor) => {
  const item = await prisma.auditItem.findUnique({ where: { id: itemId }, include: { cycle: true } })
  if (!item) throw httpError(404, 'NOT_FOUND', 'Audit item not found')
  if (item.cycle.status === 'CLOSED') throw httpError(400, 'CYCLE_CLOSED', 'This audit cycle is closed')
  // Only an assigned auditor for this item, or an Asset Manager / Admin, may mark it.
  const isManager = actor.role === 'ADMIN' || actor.role === 'ASSET_MANAGER'
  const isAssignedAuditor = !!item.auditorId && item.auditorId === actor.userId
  if (!isManager && !isAssignedAuditor)
    throw httpError(403, 'FORBIDDEN', 'You are not an assigned auditor for this item')
  return prisma.auditItem.update({ where: { id: itemId }, data: { status, note: note || null } })
}

export const closeCycle = async (id, actorId) => {
  return prisma.$transaction(async (tx) => {
    const cycle = await tx.auditCycle.findUnique({ where: { id }, include: { items: true } })
    if (!cycle) throw httpError(404, 'NOT_FOUND', 'Cycle not found')
    if (cycle.status === 'CLOSED') throw httpError(400, 'ALREADY_CLOSED', 'Cycle already closed')
    const missing = cycle.items.filter((i) => i.status === 'MISSING')
    for (const it of missing) {
      await setAssetStatus(tx, it.assetId, 'LOST', actorId, 'audit: confirmed missing')
    }
    const updated = await tx.auditCycle.update({ where: { id }, data: { status: 'CLOSED' } })
    await logActivity(tx, {
      actorId,
      action: 'AUDIT_CLOSED',
      entity: 'AuditCycle',
      entityId: id,
      detail: { missing: missing.length, damaged: cycle.items.filter((i) => i.status === 'DAMAGED').length },
    })
    return updated
  })
}

export const listCycles = async () =>
  prisma.auditCycle.findMany({ orderBy: { startDate: 'desc' }, include: { _count: { select: { items: true } } } })

export const getCycle = async (id) => {
  const cycle = await prisma.auditCycle.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { id: 'asc' },
        include: { asset: { select: { id: true, tag: true, name: true, status: true } } },
      },
    },
  })
  if (!cycle) throw httpError(404, 'NOT_FOUND', 'Cycle not found')
  const discrepancies = cycle.items.filter((i) => i.status === 'MISSING' || i.status === 'DAMAGED')
  return { ...cycle, discrepancies }
}
