import { describe, it, expect } from 'vitest'
import { canTransition } from '../src/services/maintenanceService.js'

describe('maintenance transitions', () => {
  it('allows PENDING → APPROVED', () => expect(canTransition('PENDING', 'APPROVED')).toBe(true))
  it('allows PENDING → REJECTED', () => expect(canTransition('PENDING', 'REJECTED')).toBe(true))
  it('allows APPROVED → TECH_ASSIGNED', () => expect(canTransition('APPROVED', 'TECH_ASSIGNED')).toBe(true))
  it('allows IN_PROGRESS → RESOLVED', () => expect(canTransition('IN_PROGRESS', 'RESOLVED')).toBe(true))
  it('BLOCKS stage-skip PENDING → RESOLVED', () => expect(canTransition('PENDING', 'RESOLVED')).toBe(false))
  it('BLOCKS backwards IN_PROGRESS → APPROVED', () => expect(canTransition('IN_PROGRESS', 'APPROVED')).toBe(false))
  it('BLOCKS any move out of a terminal REJECTED state', () => expect(canTransition('REJECTED', 'APPROVED')).toBe(false))
})
