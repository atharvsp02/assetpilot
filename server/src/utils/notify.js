import { prisma } from '../lib/prisma.js'

// Pass a transaction client when inside a tx; otherwise defaults to the shared prisma.
export const notify = (client, { userId, type, message }) => {
  const db = client || prisma
  return db.notification.create({ data: { userId, type, message } })
}
