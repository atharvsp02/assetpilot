import { prisma } from '../lib/prisma.js'
import { setAssetStatus } from './assetStatus.js'
import { notify } from '../utils/notify.js'
import { logActivity } from '../utils/activity.js'

const httpError = (status, code, message, extra) =>
  Object.assign(new Error(message), { status, code, ...extra })

// An asset can only be allocated when it is AVAILABLE.
export const isConflict = (asset) => asset.status !== 'AVAILABLE'

export const allocate = async ({ assetId, userId, departmentId, expectedReturnDate }, actorId) => {
  return prisma.$transaction(async (tx) => {
    const asset = await tx.asset.findUnique({ where: { id: assetId } })
    if (!asset) throw httpError(404, 'NOT_FOUND', 'Asset not found')
    if (isConflict(asset)) {
      const current = await tx.allocation.findFirst({
        where: { assetId, status: 'ACTIVE' },
        include: { user: { select: { name: true } } },
      })
      const heldBy = current?.user?.name || 'another holder'
      throw httpError(409, 'ALREADY_ALLOCATED', `Currently held by ${heldBy}`, { heldBy })
    }
    const allocation = await tx.allocation.create({
      data: {
        assetId,
        userId: userId || null,
        departmentId: departmentId || null,
        allocatedById: actorId,
        expectedReturnDate: expectedReturnDate || null,
        status: 'ACTIVE',
      },
    })
    await setAssetStatus(tx, assetId, 'ALLOCATED', actorId, 'allocated')
    if (userId) await notify(tx, { userId, type: 'ASSET_ASSIGNED', message: `You were allocated ${asset.tag} · ${asset.name}` })
    return allocation
  })
}

export const requestTransfer = async ({ assetId, userId, departmentId, expectedReturnDate }, actorId) => {
  return prisma.$transaction(async (tx) => {
    const asset = await tx.asset.findUnique({ where: { id: assetId } })
    if (!asset) throw httpError(404, 'NOT_FOUND', 'Asset not found')
    if (asset.status !== 'ALLOCATED') throw httpError(400, 'NOT_ALLOCATED', 'Only an allocated asset can be transferred')
    const transfer = await tx.allocation.create({
      data: {
        assetId,
        userId: userId || null,
        departmentId: departmentId || null,
        allocatedById: actorId,
        expectedReturnDate: expectedReturnDate || null,
        status: 'TRANSFER_REQUESTED',
      },
    })
    await logActivity(tx, { actorId, action: 'TRANSFER_REQUESTED', entity: 'Asset', entityId: assetId })
    return transfer
  })
}

export const approveTransfer = async (transferId, approverId) => {
  return prisma.$transaction(async (tx) => {
    const transfer = await tx.allocation.findUnique({ where: { id: transferId } })
    if (!transfer || transfer.status !== 'TRANSFER_REQUESTED')
      throw httpError(404, 'NOT_FOUND', 'Transfer request not found')
    // close the current active holder's allocation
    await tx.allocation.updateMany({
      where: { assetId: transfer.assetId, status: 'ACTIVE' },
      data: { status: 'RETURNED', returnedAt: new Date() },
    })
    const activated = await tx.allocation.update({ where: { id: transferId }, data: { status: 'ACTIVE' } })
    await setAssetStatus(tx, transfer.assetId, 'ALLOCATED', approverId, 're-allocated via transfer')
    if (transfer.userId)
      await notify(tx, { userId: transfer.userId, type: 'TRANSFER_APPROVED', message: 'Transfer approved — asset is now allocated to you' })
    return activated
  })
}

export const returnAsset = async ({ allocationId, checkInNotes }, actorId) => {
  return prisma.$transaction(async (tx) => {
    const allocation = await tx.allocation.findUnique({ where: { id: allocationId } })
    if (!allocation || allocation.status !== 'ACTIVE') throw httpError(400, 'NOT_ACTIVE', 'Allocation is not active')
    const updated = await tx.allocation.update({
      where: { id: allocationId },
      data: { status: 'RETURNED', returnedAt: new Date(), checkInNotes: checkInNotes || null },
    })
    await setAssetStatus(tx, allocation.assetId, 'AVAILABLE', actorId, 'returned')
    return updated
  })
}

export const listAllocations = async ({ status, assetId, overdue }) => {
  const where = {}
  if (status) where.status = status
  if (assetId) where.assetId = assetId
  if (overdue === 'true' || overdue === true) {
    where.status = 'ACTIVE'
    where.expectedReturnDate = { lt: new Date() }
  }
  return prisma.allocation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      asset: { select: { id: true, tag: true, name: true, status: true } },
      user: { select: { id: true, name: true } },
    },
  })
}
