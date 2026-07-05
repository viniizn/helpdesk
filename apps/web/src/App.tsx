import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoginPage }        from '@/pages/auth/LoginPage'
import { AcceptInvitePage } from '@/pages/auth/AcceptInvitePage'
import { TicketsPage }      from '@/pages/tickets/TicketsPage'
import { TicketDetailPage } from '@/pages/tickets/TicketDetailPage'
import { NewTicketPage }    from '@/pages/tickets/NewTicketPage'
import { DashboardPage }    from '@/pages/admin/DashboardPage'
import { UsersPage }        from '@/pages/admin/UsersPage'
import { CategoriesPage }   from '@/pages/admin/CategoriesPage'
import { InvitesPage }      from '@/pages/admin/InvitesPage'
import { Layout }           from '@/components/app/Layout'
import { ProfilePage }      from '@/pages/ProfilePage'
import { AppearancePage }   from '@/pages/AppearancePage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div>Carregando...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background/50 backdrop-blur-xs">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/tickets" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"         element={<LoginPage />} />
      <Route path="/accept-invite" element={<AcceptInvitePage />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/tickets" replace />} />
        <Route path="profile"    element={<ProfilePage />} />
        <Route path="appearance" element={<AppearancePage />} />
        <Route path="tickets"    element={<TicketsPage />} />
        <Route path="tickets/new" element={<NewTicketPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />

        <Route path="admin/dashboard"  element={<AdminRoute><DashboardPage /></AdminRoute>} />
        <Route path="admin/users"      element={<AdminRoute><UsersPage /></AdminRoute>} />
        <Route path="admin/categories" element={<AdminRoute><CategoriesPage /></AdminRoute>} />
        <Route path="admin/invites"    element={<AdminRoute><InvitesPage /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  )
}