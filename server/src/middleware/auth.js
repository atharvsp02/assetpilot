import { verifyToken } from '../utils/jwt.js'

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing token' })
  try {
    req.user = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid token' })
  }
}
