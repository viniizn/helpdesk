import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge }  from '@/components/ui/badge'
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

  if (isLoading) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Usuários</h2>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Chamados</th>
              <th className="text-left p-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users?.map(user => (
              <tr key={user.id} className="hover:bg-muted/30">
                <td className="p-3 font-medium">{user.name}</td>
                <td className="p-3 text-muted-foreground">{user.email}</td>
                <td className="p-3 text-muted-foreground">
                  {user._count.createdTickets} criados · {user._count.assignedTickets} atribuídos
                </td>
                <td className="p-3">
                  {user.id === currentUser?.id ? (
                    <Badge>{user.role}</Badge>
                  ) : (
                    <Select
                      value={user.role}
                      onValueChange={role => updateRole.mutate({ userId: user.id, role })}
                    >
                      <SelectTrigger className="w-28 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">USER</SelectItem>
                        <SelectItem value="AGENT">AGENT</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}