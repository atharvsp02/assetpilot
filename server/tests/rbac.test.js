import { describe, it, expect } from 'vitest'
import { requireRole } from '../src/middleware/role.js'

const run = (role, allowed) => {
  let code = 200, nexted = false
  const req = { user: role ? { role } : null }
  const res = { status(c) { code = c; return this }, json() { return this } }
  requireRole(...allowed)(req, res, () => { nexted = true })
  return { code, nexted }
}

describe('requireRole', () => {
  it('allows ADMIN through an admin-only route', () => {
    const r = run('ADMIN', ['ADMIN'])
    expect(r.nexted).toBe(true)
  })
  it('blocks EMPLOYEE from an admin-only route with 403', () => {
    const r = run('EMPLOYEE', ['ADMIN'])
    expect(r.nexted).toBe(false)
    expect(r.code).toBe(403)
  })
  it('blocks unauthenticated (no user) with 403', () => {
    const r = run(null, ['ADMIN'])
    expect(r.nexted).toBe(false)
    expect(r.code).toBe(403)
  })
  it('allows a role that is one of several permitted', () => {
    const r = run('DEPARTMENT_HEAD', ['ASSET_MANAGER', 'DEPARTMENT_HEAD'])
    expect(r.nexted).toBe(true)
  })
})
