import { describe, it, expect } from 'vitest'
import { hasOverlap } from '../src/services/bookingService.js'

const b = (s, e, status = 'UPCOMING') => ({ startTime: new Date(s), endTime: new Date(e), status })
const existing = [b('2026-07-12T09:00', '2026-07-12T10:00')]

describe('booking overlap', () => {
  it('REJECTS a true overlap (09:30–10:30 vs 09:00–10:00)', () => {
    expect(hasOverlap(new Date('2026-07-12T09:30'), new Date('2026-07-12T10:30'), existing)).toBe(true)
  })
  it('ALLOWS back-to-back (10:00–11:00 right after 09:00–10:00)', () => {
    expect(hasOverlap(new Date('2026-07-12T10:00'), new Date('2026-07-12T11:00'), existing)).toBe(false)
  })
  it('ALLOWS a fully separate slot (11:00–12:00)', () => {
    expect(hasOverlap(new Date('2026-07-12T11:00'), new Date('2026-07-12T12:00'), existing)).toBe(false)
  })
  it('REJECTS a slot fully inside an existing one (09:15–09:45)', () => {
    expect(hasOverlap(new Date('2026-07-12T09:15'), new Date('2026-07-12T09:45'), existing)).toBe(true)
  })
  it('REJECTS a slot that fully contains an existing one (08:00–11:00)', () => {
    expect(hasOverlap(new Date('2026-07-12T08:00'), new Date('2026-07-12T11:00'), existing)).toBe(true)
  })
  it('IGNORES cancelled bookings', () => {
    const cancelled = [b('2026-07-12T09:00', '2026-07-12T10:00', 'CANCELLED')]
    expect(hasOverlap(new Date('2026-07-12T09:30'), new Date('2026-07-12T10:30'), cancelled)).toBe(false)
  })
})
