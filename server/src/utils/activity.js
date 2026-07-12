import { prisma } from '../lib/prisma.js'

// Pass a transaction client when inside a tx; otherwise defaults to the shared prisma.
export const logActivity = (client, { actorId, action, entity, entityId, detail }) => {
  const db = client || prisma
  return db.activityLog.create({
    data: { actorId, action, entity, entityId, detail: detail ?? undefined },
  })
}
