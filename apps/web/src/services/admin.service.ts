import { api } from '@/lib/api'

export const adminService = {
  async getDashboard() {
    const res = await api.get('/admin/dashboard')
    return res.data
  },

  async getUsers() {
    const res = await api.get('/admin/users')
    return res.data.users as {
      id: string; name: string; email: string; role: string
      _count: { createdTickets: number; assignedTickets: number }
    }[]
  },

  async updateRole(userId: string, role: string) {
    const res = await api.patch(`/admin/users/${userId}/role`, { role })
    return res.data.user
  },

  async getCategories() {
    const res = await api.get('/admin/categories')
    return res.data.categories as {
      id: string; name: string; description?: string
      _count: { tickets: number }
    }[]
  },

  async createCategory(data: { name: string; description?: string }) {
    const res = await api.post('/admin/categories', data)
    return res.data.category
  },

  async deleteCategory(id: string) {
    await api.delete(`/admin/categories/${id}`)
  },
}