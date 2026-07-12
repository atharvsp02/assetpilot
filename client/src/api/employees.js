import { api } from './client.js'

export const listEmployees = () => api.get('/employees').then((r) => r.data)
export const promoteEmployee = (id, role) => api.post(`/employees/${id}/promote`, { role }).then((r) => r.data)
export const updateEmployee = (id, data) => api.patch(`/employees/${id}`, data).then((r) => r.data)
