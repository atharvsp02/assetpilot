import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma.js'

const daysFromNow = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

async function reset() {
  await prisma.$transaction([
    prisma.auditItem.deleteMany(),
    prisma.auditCycle.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.maintenanceRequest.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.allocation.deleteMany(),
    prisma.asset.deleteMany(),
    prisma.user.updateMany({ data: { departmentId: null } }),
    prisma.department.updateMany({ data: { headId: null, parentId: null } }),
    prisma.department.deleteMany(),
    prisma.user.deleteMany(),
    prisma.category.deleteMany(),
  ])
}

async function main() {
  await reset()
  const hash = (pw) => bcrypt.hashSync(pw, 10)

  // Users (signup normally makes EMPLOYEE; roles here are seeded/promoted by the org)
  const admin = await prisma.user.create({ data: { name: 'System Admin', email: 'admin@assetflow.com', passwordHash: hash('Admin@123'), role: 'ADMIN' } })
  const meera = await prisma.user.create({ data: { name: 'Meera Kapoor', email: 'meera@assetflow.com', passwordHash: hash('Password@123'), role: 'ASSET_MANAGER' } })
  const arjun = await prisma.user.create({ data: { name: 'Arjun Nair', email: 'arjun@assetflow.com', passwordHash: hash('Password@123'), role: 'DEPARTMENT_HEAD' } })
  const priya = await prisma.user.create({ data: { name: 'Priya Sharma', email: 'priya@assetflow.com', passwordHash: hash('Password@123'), role: 'EMPLOYEE' } })
  const raj = await prisma.user.create({ data: { name: 'Raj Verma', email: 'raj@assetflow.com', passwordHash: hash('Password@123'), role: 'EMPLOYEE' } })
  const sara = await prisma.user.create({ data: { name: 'Sara Iyer', email: 'sara@assetflow.com', passwordHash: hash('Password@123'), role: 'EMPLOYEE' } })
  const vikram = await prisma.user.create({ data: { name: 'Vikram Rao', email: 'vikram@assetflow.com', passwordHash: hash('Password@123'), role: 'EMPLOYEE' } })

  // Departments (Operations is a child of IT — hierarchy)
  const it = await prisma.department.create({ data: { name: 'IT', headId: arjun.id, status: 'Active' } })
  const ops = await prisma.department.create({ data: { name: 'Operations', parentId: it.id, headId: meera.id, status: 'Active' } })
  const facilities = await prisma.department.create({ data: { name: 'Facilities', status: 'Active' } })
  await prisma.user.update({ where: { id: arjun.id }, data: { departmentId: it.id } })
  await prisma.user.update({ where: { id: priya.id }, data: { departmentId: it.id } })
  await prisma.user.update({ where: { id: raj.id }, data: { departmentId: ops.id } })
  await prisma.user.update({ where: { id: sara.id }, data: { departmentId: facilities.id } })

  // Categories
  const electronics = await prisma.category.create({ data: { name: 'Electronics', warrantyMonths: 24 } })
  const furniture = await prisma.category.create({ data: { name: 'Furniture' } })
  const vehicles = await prisma.category.create({ data: { name: 'Vehicles', warrantyMonths: 36 } })
  const rooms = await prisma.category.create({ data: { name: 'Meeting Rooms' } })

  // Assets — mix of categories, locations, statuses, bookable flags
  let n = 0
  const tag = () => `AF-${String(++n).padStart(4, '0')}`
  const mk = (data) => prisma.asset.create({ data: { tag: tag(), ...data } })

  const laptop1 = await mk({ name: 'Dell Latitude 5540', categoryId: electronics.id, serialNumber: 'DL-5540-001', acquisitionCost: 85000, acquisitionDate: daysFromNow(-200), condition: 'Good', location: 'HQ Floor 2', departmentId: it.id })
  const laptop2 = await mk({ name: 'MacBook Pro 14"', categoryId: electronics.id, serialNumber: 'MBP-14-002', acquisitionCost: 195000, acquisitionDate: daysFromNow(-120), condition: 'New', location: 'HQ Floor 2', departmentId: it.id })
  const laptop3 = await mk({ name: 'Lenovo ThinkPad X1', categoryId: electronics.id, serialNumber: 'TP-X1-003', acquisitionCost: 110000, condition: 'Good', location: 'HQ Floor 3', departmentId: ops.id })
  await mk({ name: 'HP LaserJet Printer', categoryId: electronics.id, serialNumber: 'HP-LJ-004', acquisitionCost: 32000, condition: 'Fair', location: 'HQ Floor 2' })
  await mk({ name: 'Epson Projector EB-2247U', categoryId: electronics.id, acquisitionCost: 68000, condition: 'Good', location: 'HQ Floor 1', isBookable: true })
  const roomB2 = await mk({ name: 'Meeting Room B2', categoryId: rooms.id, location: 'HQ Floor 1', isBookable: true, condition: 'Good' })
  const roomA1 = await mk({ name: 'Conference Room A1', categoryId: rooms.id, location: 'HQ Floor 3', isBookable: true, condition: 'Good' })
  await mk({ name: 'Ergonomic Chair', categoryId: furniture.id, acquisitionCost: 14000, condition: 'Good', location: 'HQ Floor 2', departmentId: facilities.id })
  await mk({ name: 'Standing Desk', categoryId: furniture.id, acquisitionCost: 28000, condition: 'New', location: 'HQ Floor 2', departmentId: facilities.id })
  await mk({ name: 'Whiteboard 6ft', categoryId: furniture.id, condition: 'Good', location: 'HQ Floor 1' })
  const van = await mk({ name: 'Delivery Van (KA-01-4321)', categoryId: vehicles.id, acquisitionCost: 900000, acquisitionDate: daysFromNow(-400), condition: 'Fair', location: 'Depot', departmentId: ops.id })
  await mk({ name: 'Forklift FL-7', categoryId: vehicles.id, acquisitionCost: 650000, condition: 'Good', location: 'Warehouse', departmentId: ops.id })
  await mk({ name: 'iPad Pro 12.9"', categoryId: electronics.id, serialNumber: 'IPD-013', acquisitionCost: 120000, condition: 'New', location: 'HQ Floor 2' })
  await mk({ name: 'Cisco Switch 48-port', categoryId: electronics.id, acquisitionCost: 240000, condition: 'Good', location: 'Server Room', departmentId: it.id })
  await mk({ name: 'Office Sofa', categoryId: furniture.id, condition: 'Fair', location: 'Reception' })

  // Active allocations (one overdue → shows on dashboard)
  await prisma.allocation.create({ data: { assetId: laptop1.id, userId: priya.id, allocatedById: meera.id, expectedReturnDate: daysFromNow(14), status: 'ACTIVE' } })
  await prisma.asset.update({ where: { id: laptop1.id }, data: { status: 'ALLOCATED' } })
  await prisma.allocation.create({ data: { assetId: laptop3.id, userId: raj.id, allocatedById: meera.id, expectedReturnDate: daysFromNow(-3), status: 'ACTIVE' } }) // overdue
  await prisma.asset.update({ where: { id: laptop3.id }, data: { status: 'ALLOCATED' } })

  // Bookings for bookable resources
  await prisma.booking.create({ data: { assetId: roomB2.id, bookedById: arjun.id, startTime: daysFromNow(1), endTime: new Date(daysFromNow(1).getTime() + 60 * 60 * 1000), status: 'UPCOMING' } })
  await prisma.booking.create({ data: { assetId: roomA1.id, bookedById: sara.id, startTime: daysFromNow(2), endTime: new Date(daysFromNow(2).getTime() + 2 * 60 * 60 * 1000), status: 'UPCOMING' } })

  // Pending maintenance request
  await prisma.maintenanceRequest.create({ data: { assetId: van.id, raisedById: raj.id, description: 'Brake pads worn, needs service', priority: 'High', status: 'PENDING' } })

  // Open audit cycle scoped to IT, with items
  const cycle = await prisma.auditCycle.create({ data: { name: 'FY26 IT Audit', scopeDepartmentId: it.id, startDate: daysFromNow(-2), endDate: daysFromNow(10), status: 'OPEN', createdById: admin.id } })
  const itAssets = await prisma.asset.findMany({ where: { departmentId: it.id }, select: { id: true } })
  if (itAssets.length) {
    await prisma.auditItem.createMany({ data: itAssets.map((a) => ({ cycleId: cycle.id, assetId: a.id, auditorId: priya.id, status: 'PENDING' })) })
  }

  // A couple of notifications for the admin
  await prisma.notification.create({ data: { userId: priya.id, type: 'ASSET_ASSIGNED', message: 'You were allocated AF-0001 · Dell Latitude 5540' } })

  console.log('Seeded demo org:')
  console.log('  Admin          admin@assetflow.com / Admin@123')
  console.log('  Asset Manager  meera@assetflow.com / Password@123')
  console.log('  Dept Head      arjun@assetflow.com / Password@123')
  console.log('  Employee       priya@assetflow.com / Password@123')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
