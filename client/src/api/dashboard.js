import { api } from './client.js'

export const getDashboard = () => api.get('/dashboard').then((r) => r.data)
export const listNotifications = () => api.get('/notifications').then((r) => r.data)
export const markRead = (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data)
