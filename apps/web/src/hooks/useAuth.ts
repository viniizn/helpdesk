import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { api } from '@/services/api'

export function useAuth() {
  const { user, setUser } = useAuthStore()

  const { isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn:  async () => {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
      return data.user
    },
    enabled:         !user,
    retry:           false,

    refetchOnWindowFocus: false,
  })

  return { user, isLoading }
}