import { api } from '@/lib/api'

export interface ProfileInput {
  secretariat?: string
  department?:  string
  location?:    string
}

export const userService = {
  async updateProfile(data: ProfileInput) {
    const res = await api.patch('/users/profile', data)
    return res.data.user
  },
}