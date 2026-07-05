import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Mail } from 'lucide-react'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { api } from '@/lib/api'

interface Invite {
  id:        string
  name:      string
  email:     string
  role:      string
  expiresAt: string
  status:    'pending' | 'accepted' | 'expired'
}

const STATUS_CONFIG = {
  pending:  { label: 'Pendente',  bg: 'rgba(217,119,6,0.10)',    color: '#b45309' },
  accepted: { label: 'Aceito',    bg: 'var(--accent-subtle)',     color: 'var(--accent)' },
  expired:  { label: 'Expirado',  bg: 'var(--surface-subtle)',    color: 'var(--text-muted)' },
}

const inputStyle: React.CSSProperties = {
  background: 'var(--background)',
  borderColor: 'var(--border)',
  color: 'var(--text-primary)',
}

export function InvitesPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'USER' })
  const [devLink, setDevLink] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'invites'],
    queryFn:  async () => {
      const res = await api.get('/invites')
      return res.data.invites as Invite[]
    },
  })

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.post('/invite', form)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invites'] })
      setForm({ name: '', email: '', role: 'USER' })
      if (data.devLink) setDevLink(data.devLink)
      else setOpen(false)
    },
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">

      {/* Cabeçalho */}
      <div
        className="flex items-center justify-between pb-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h2 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Convites
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Gerencie o fluxo de acessos à plataforma.
          </p>
        </div>

        <Dialog open={open} onOpenChange={o => { setOpen(o); setDevLink('') }}>
          <DialogTrigger asChild>
            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              <Mail size={13} /> Convidar usuário
            </button>
          </DialogTrigger>

          <DialogContent style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Novo convite
              </DialogTitle>
            </DialogHeader>

            {devLink ? (
              <div className="space-y-3 pt-2 text-xs">
                <p style={{ color: 'var(--text-muted)' }}>
                  Ambiente de desenvolvimento — use o link abaixo para testar:
                </p>
                <div
                  className="p-3 rounded-lg font-mono break-all text-xs"
                  style={{
                    background: 'var(--surface-subtle)',
                    border: '1px solid var(--border)',
                    color: 'var(--accent)',
                  }}
                >
                  {devLink}
                </div>
                <button
                  className="w-full py-2 rounded-lg text-sm font-semibold transition-colors"
                  style={{ background: 'var(--surface-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                  onClick={() => { setOpen(false); setDevLink('') }}
                >
                  Fechar
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Nome</Label>
                  <Input
                    style={inputStyle}
                    placeholder="Nome do usuário"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Email</Label>
                  <Input
                    style={inputStyle}
                    type="email"
                    placeholder="nome@empresa.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Perfil</Label>
                  <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                    <SelectTrigger style={inputStyle}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Usuário</SelectItem>
                      <SelectItem value="AGENT">Técnico</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <button
                  className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40"
                  style={{ background: 'var(--accent)' }}
                  onClick={() => create.mutate()}
                  disabled={!form.name || !form.email || create.isPending}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                >
                  {create.isPending ? 'Enviando...' : 'Enviar convite'}
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl animate-pulse"
              style={{ background: 'var(--surface-subtle)' }}
            />
          ))}
        </div>
      ) : (
        <div
          className="divide-y rounded-xl overflow-hidden"
          style={{
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            divideColor: 'var(--border)',
          }}
        >
          {data?.map(invite => {
            const s = STATUS_CONFIG[invite.status]
            return (
              <div
                key={invite.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm transition-colors"
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {invite.name}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: 'var(--gold-accent)' }}
                    >
                      {invite.role}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {invite.email}
                  </p>
                </div>
                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Expira {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                  </span>
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            )
          })}

          {data?.length === 0 && (
            <p className="p-10 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              Nenhum convite pendente.
            </p>
          )}
        </div>
      )}
    </div>
  )
}