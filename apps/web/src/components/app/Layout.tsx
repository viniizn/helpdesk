import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { LayoutDashboard, Ticket, Users, Tag, LogOut, UserCircle, UserPlus, Paintbrush } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'

export function Layout() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()

  const logout = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      setUser(null)
      navigate('/login')
    },
  })

  const navItem =
    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ' +
    'text-[var(--sidebar-text)] hover:text-[var(--sidebar-active)] hover:bg-[var(--sidebar-hover-bg)] group'

  const active = 'text-[var(--sidebar-active)] bg-[var(--sidebar-active-bg)] font-semibold'

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>

      {/* Sidebar */}
      <aside
        className="w-60 flex flex-col shrink-0 transition-colors duration-300"
        style={{
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-md" style={{ background: 'var(--gold-accent)' }}>
            <Ticket size={15} color="var(--sidebar-bg)" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold tracking-tight" style={{ color: 'var(--sidebar-active)' }}>
              Helpdesk
            </p>
            <p className="text-[11px] truncate" style={{ color: 'var(--sidebar-muted)' }}>
              {user?.name}
            </p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavLink to="/tickets" className={({ isActive }) => cn(navItem, isActive && active)}>
            <Ticket size={15} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
            Chamados
          </NavLink>

          {user?.role === 'ADMIN' && (
            <>
              <div className="pt-5 pb-2 px-3">
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--sidebar-muted)' }}>
                  Administração
                </span>
              </div>
              <NavLink to="/admin/dashboard" className={({ isActive }) => cn(navItem, isActive && active)}>
                <LayoutDashboard size={15} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                Dashboard
              </NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => cn(navItem, isActive && active)}>
                <Users size={15} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                Usuários
              </NavLink>
              <NavLink to="/admin/categories" className={({ isActive }) => cn(navItem, isActive && active)}>
                <Tag size={15} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                Categorias
              </NavLink>
              <NavLink to="/admin/invites" className={({ isActive }) => cn(navItem, isActive && active)}>
                <UserPlus size={15} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                Convites
              </NavLink>
            </>
          )}

          {/* Seção do usuário */}
          <div className="pt-4 mt-4 space-y-0.5" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
            <NavLink to="/profile" className={({ isActive }) => cn(navItem, isActive && active)}>
              <UserCircle size={15} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              Meu perfil
            </NavLink>
            <NavLink to="/appearance" className={({ isActive }) => cn(navItem, isActive && active)}>
              <Paintbrush size={15} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              Aparência
            </NavLink>
          </div>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <button
            onClick={() => logout.mutate()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-red-500/10 group"
            style={{ color: 'var(--sidebar-muted)' }}
          >
            <LogOut size={15} className="shrink-0 group-hover:text-red-400 transition-colors" />
            <span className="group-hover:text-red-400 transition-colors">Encerrar sessão</span>
          </button>
        </div>
      </aside>

      {/*  Conteúdo principal  */}
      <main className="flex-1 overflow-auto transition-colors duration-300" style={{ background: 'var(--background)' }}>
        <Outlet />
      </main>
    </div>
  )
}