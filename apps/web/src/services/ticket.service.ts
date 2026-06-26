import { api } from '@/lib/api'

export interface Ticket {
  id:          string
  title:       string
  description: string
  status:      string
  priority:    string
  location?:   string
  category:    { id: string; name: string }
  createdBy: {
    id:           string
    name:         string
    secretariat?: string
    department?:  string
    location?:    string
  }
  assignedTo:  { id: string; name: string } | null
  createdAt:   string
  updatedAt:   string
}

export interface Comment {
  id:         string
  body:       string
  isInternal: boolean
  createdAt:  string
  author:     { id: string; name: string; role: string }
}

export const ticketService = {
  async list(params?: Record<string, string>) {
    const res = await api.get('/tickets', { params })
    return res.data as { tickets: Ticket[]; meta: { total: number; totalPages: number; page: number } }
  },

  async get(id: string) {
    const res = await api.get(`/tickets/${id}`)
    return res.data.ticket as Ticket & { comments: Comment[] }
  },

  async create(data: { title: string; description: string; priority: string; categoryId: string }) {
    const res = await api.post('/tickets', data)
    return res.data.ticket as Ticket
  },

  async changeStatus(id: string, status: string) {
    const res = await api.patch(`/tickets/${id}/status`, { status })
    return res.data.ticket as Ticket
  },

  async addComment(ticketId: string, data: { body: string; isInternal: boolean }) {
    const res = await api.post(`/tickets/${ticketId}/comments`, data)
    return res.data.comment as Comment
  },

  async getCategories() {
    const res = await api.get('/tickets/categories')
    return res.data.categories as { id: string; name: string }[]
  },
}