import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { signToken } from '../utils/jwt.js'

export const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  departmentId: u.departmentId,
  status: u.status,
})

const httpError = (status, code, message) => {
  const e = new Error(message)
  e.status = status
  e.code = code
  return e
}

// Signup ALWAYS creates an EMPLOYEE — any `role` in the payload is ignored.
export const signup = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw httpError(409, 'EMAIL_TAKEN', 'Email already registered')
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: 'EMPLOYEE' },
  })
  return { token: signToken(user), user: publicUser(user) }
}

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw httpError(401, 'INVALID_CREDENTIALS', 'Invalid credentials')
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) throw httpError(401, 'INVALID_CREDENTIALS', 'Invalid credentials')
  return { token: signToken(user), user: publicUser(user) }
}
