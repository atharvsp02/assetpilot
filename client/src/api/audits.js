import { api } from './client.js'

export const listCycles = () => api.get('/audits').then((r) => r.data)
export const getCycle = (id) => api.get(`/audits/${id}`).then((r) => r.data)
export const createCycle = (data) => api.post('/audits', data).then((r) => r.data)
export const markItem = (id, status, note) => api.patch(`/audits/items/${id}`, { status, note }).then((r) => r.data)
export const closeCycle = (id) => api.patch(`/audits/${id}/close`).then((r) => r.data)
