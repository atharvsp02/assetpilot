import { describe, it, expect } from 'vitest'
import { isConflict } from '../src/services/allocationService.js'

describe('allocation conflict', () => {
  it('blocks re-allocating an ALLOCATED asset', () => {
    expect(isConflict({ status: 'ALLOCATED' })).toBe(true)
  })
  it('allows allocating an AVAILABLE asset', () => {
    expect(isConflict({ status: 'AVAILABLE' })).toBe(false)
  })
  it('blocks allocating an asset UNDER_MAINTENANCE', () => {
    expect(isConflict({ status: 'UNDER_MAINTENANCE' })).toBe(true)
  })
  it('blocks allocating a RESERVED asset', () => {
    expect(isConflict({ status: 'RESERVED' })).toBe(true)
  })
})
