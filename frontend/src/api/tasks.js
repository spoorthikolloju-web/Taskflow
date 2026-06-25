import api from './axios'
export const getTasks = (params) => api.get('/tasks/', { params })
export const createTask = (data) => api.post('/tasks/', data)
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data)
export const deleteTask = (id) => api.delete(`/tasks/${id}`)
export const toggleComplete = (id) => api.patch(`/tasks/${id}/complete`)
export const getTaskStats = () => api.get('/tasks/stats/summary')
