import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id:    string
  name:  string
  email: string
  role:  'USER' | 'AGENT' | 'ADMIN'
}

interface AuthStore {
  user:      User | null
  setUser:   (user: User | null) => void
  isAdmin:   () => boolean
  isAgent:   () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:    null,
      setUser: (user) => set({ user }),
      // Métodos derivados, oq evita comparar string em todo componente
      isAdmin: () => get().user?.role === 'ADMIN',
      isAgent: () => get().user?.role === 'AGENT' || get().user?.role === 'ADMIN',
    }),
    {
      name: 'auth-storage', // chave no localStorage
    }
  )
)