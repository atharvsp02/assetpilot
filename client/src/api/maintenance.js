import { api } from './client.js'

export const listMaintenance = (params) => api.get('/maintenance', { params }).then((r) => r.data)
export const createMaintenance = (data) => api.post('/maintenance', data).then((r) => r.data)
export const transitionMaintenance = (id, to, technicianName) =>
  api.patch(`/maintenance/${id}/status`, { to, technicianName }).then((r) => r.data)
