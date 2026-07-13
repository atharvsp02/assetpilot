import bcrypt from 'bcryptjs'
import { prisma } from './prisma.js'

export const bootstrapAdmin = async () => {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) return

  const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (existingAdmin) return

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    await prisma.user.update({ where: { id: existingUser.id }, data: { role: 'ADMIN' } })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: { name: process.env.ADMIN_NAME || 'Administrator', email, passwordHash, role: 'ADMIN' },
  })
}
