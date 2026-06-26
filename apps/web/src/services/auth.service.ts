import { api } from '@/lib/api'

interface LoginInput {
  email:    string
  password: string
}

interface User {
  id:    string
  name:  string
  email: string
  role:  'USER' | 'AGENT' | 'ADMIN'
}

export const authService = {
  async login(data: LoginInput): Promise<User> {
    const res = await api.post('/auth/login', data)
    return res.data.user
  },

  async me(): Promise<User> {
    const res = await api.get('/auth/me')
    return res.data.user
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },
}