import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma.js'

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@assetflow.com'
  const password = process.env.ADMIN_PASSWORD || 'Admin@123'
  const name = process.env.ADMIN_NAME || 'Administrator'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({ where: { id: existing.id }, data: { role: 'ADMIN' } })
    }
    console.log(`Admin already exists: ${email}`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.create({ data: { name, email, passwordHash, role: 'ADMIN' } })
  console.log(`Created admin: ${email}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
