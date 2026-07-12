import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev-secret'

export const signToken = (user) =>
  jwt.sign({ userId: user.id, role: user.role }, SECRET, { expiresIn: '12h' })

export const verifyToken = (token) => jwt.verify(token, SECRET)
