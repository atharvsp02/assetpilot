import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate.js'
import * as authService from '../services/authService.js'

const router = Router()

// version-safe email check (avoids Zod major-version format API differences)
const email = z.string().trim().min(3).refine((v) => /.+@.+\..+/.test(v), { message: 'Invalid email' })

const signupSchema = z.object({
  name: z.string().trim().min(1),
  email,
  password: z.string().min(6),
})

const loginSchema = z.object({
  email,
  password: z.string().min(1),
})

router.post('/signup', validate(signupSchema), async (req, res, next) => {
  try {
    res.status(201).json(await authService.signup(req.body))
  } catch (e) {
    next(e)
  }
})

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    res.json(await authService.login(req.body))
  } catch (e) {
    next(e)
  }
})

export default router
