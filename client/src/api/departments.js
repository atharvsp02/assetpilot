import { api } from './client.js'

export const listDepartments = () => api.get('/departments').then((r) => r.data)
export const createDepartment = (data) => api.post('/departments', data).then((r) => r.data)
export const updateDepartment = (id, data) => api.patch(`/departments/${id}`, data).then((r) => r.data)
export const deleteDepartment = (id) => api.delete(`/departments/${id}`)
