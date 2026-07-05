import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminService } from '@/services/admin.service'
import { useAuthStore }  from '@/stores/auth.store'

export function UsersPage() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore(s => s.user)

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn:  adminService.getUsers,
  })

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminService.updateRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  if (isLoading) return (
    <div className="p-6 text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>
      Carregando usuários...
    </div>
  )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">

      {/* Cabeçalho */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
        <h2 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Usuários
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Gerencie permissões e visualize a carga de trabalho de cada conta.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users?.map(user => {
          const isSelf = user.id === currentUser?.id
          return (
            <div
              key={user.id}
              className="rounded-xl p-5 flex flex-col justify-between gap-4 transition-colors"
              style={{
                background: 'var(--surface)',
                border: isSelf
                  ? '1px solid var(--accent)'
                  : '1px solid var(--border)',
                outline: isSelf ? '2px solid rgba(64,126,140,0.12)' : 'none',
              }}
              onMouseEnter={e => {
                if (!isSelf) e.currentTarget.style.borderColor = 'var(--border-strong)'
              }}
              onMouseLeave={e => {
                if (!isSelf) e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              {/* Info */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    {user.name}
                    {isSelf && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                      >
                        Você
                      </span>
                    )}
                  </h3>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {user._count.createdTickets} criados · {user._count.assignedTickets} atribuídos
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {user.email}
                </p>
              </div>

              {/* Função */}
              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Função
                </span>
                {isSelf ? (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: 'var(--gold-subtle)', color: 'var(--gold-accent)' }}
                  >
                    {user.role}
                  </span>
                ) : (
                  <Select value={user.role} onValueChange={role => updateRole.mutate({ userId: user.id, role })}>
                    <SelectTrigger
                      className="w-28 h-7 text-xs"
                      style={{
                        background: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">USER</SelectItem>
                      <SelectItem value="AGENT">AGENT</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}