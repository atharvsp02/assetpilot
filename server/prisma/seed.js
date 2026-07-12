import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma.js'

async function main() {
  const adminEmail = 'admin@assetflow.com'
  const passwordHash = await bcrypt.hash('Admin@123', 10)
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN', passwordHash },
    create: { name: 'System Admin', email: adminEmail, passwordHash, role: 'ADMIN' },
  })
  console.log(`Seeded admin -> ${adminEmail} / Admin@123`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
