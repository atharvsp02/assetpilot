import { api } from './client.js'

export const signup = (data) => api.post('/auth/signup', data).then((r) => r.data)
export const login = (data) => api.post('/auth/login', data).then((r) => r.data)
