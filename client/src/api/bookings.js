import { api } from './client.js'

export const listBookings = (params) => api.get('/bookings', { params }).then((r) => r.data)
export const createBooking = (data) => api.post('/bookings', data).then((r) => r.data)
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`).then((r) => r.data)
