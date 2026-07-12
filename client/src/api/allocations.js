import { api } from './client.js'

export const listAllocations = (params) => api.get('/allocations', { params }).then((r) => r.data)
export const allocate = (data) => api.post('/allocations', data).then((r) => r.data)
export const requestTransfer = (data) => api.post('/allocations/transfer-request', data).then((r) => r.data)
export const approveTransfer = (id) => api.patch(`/allocations/${id}/transfer-approve`).then((r) => r.data)
export const returnAsset = (id, checkInNotes) => api.post(`/allocations/${id}/return`, { checkInNotes }).then((r) => r.data)
