import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { LayoutDashboard, Ticket, Users, Tag, LogOut, UserCircle, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authService }  from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'

export function Layout() {
  const navigate  = useNavigate()
  const { user, setUser } = useAuthStore()

  const logout = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      setUser(null)
      navigate('/login')
    },
  })

  const navItem = 'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent'
  const active  = 'bg-accent font-medium'

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-semibold text-lg">Helpdesk</h1>
          <p className="text-xs text-muted-foreground mt-1">{user?.name}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavLink
            to="/tickets"
            className={({ isActive }) => cn(navItem, isActive && active)}
          >
            <Ticket size={16} />
            Chamados
          </NavLink>

          {/* Admin vê itens extras */}
          {user?.role === 'ADMIN' && (
            <>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => cn(navItem, isActive && active)}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => cn(navItem, isActive && active)}
              >
                <Users size={16} />
                Usuários
              </NavLink>
              <NavLink
                to="/admin/categories"
                className={({ isActive }) => cn(navItem, isActive && active)}
              >
                <Tag size={16} />
                Categorias
              </NavLink>

              <NavLink
                to="/admin/invites"
                className={({ isActive }) => cn(navItem, isActive && active)}
              >
                <UserPlus size={16} />
                Convites
              </NavLink>
            </>
          )}
          <NavLink
            to="/profile"
            className={({ isActive }) => cn(navItem, isActive && active)}
          >
            <UserCircle size={16} />
            Meu perfil
          </NavLink>
        </nav>

        <div className="p-3 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => logout.mutate()}
          >
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}