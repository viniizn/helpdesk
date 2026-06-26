import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Mail, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  pending:  { label: 'Pendente',  icon: <Clock size={12} />,        color: 'text-amber-600 bg-amber-50 border-amber-200' },
  accepted: { label: 'Aceito',    icon: <CheckCircle2 size={12} />, color: 'text-green-600 bg-green-50 border-green-200' },
  expired:  { label: 'Expirado',  icon: <XCircle size={12} />,      color: 'text-gray-500 bg-gray-50 border-gray-200' },
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
      // Em dev, mostra o link direto
      if (data.devLink) setDevLink(data.devLink)
      else setOpen(false)
    },
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Convites</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie o acesso ao sistema
          </p>
        </div>
        <Dialog open={open} onOpenChange={o => { setOpen(o); setDevLink('') }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Mail size={16} />
              Convidar usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo convite</DialogTitle>
            </DialogHeader>

            {devLink ? (
              // Em dev — mostra o link para testar sem SMTP
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  SMTP não configurado. Use o link abaixo para testar:
                </p>
                <div className="bg-muted rounded-lg p-3 break-all text-xs font-mono">
                  {devLink}
                </div>
                <Button className="w-full" onClick={() => { setOpen(false); setDevLink('') }}>
                  Fechar
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    placeholder="Nome completo"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@dominio.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Perfil</Label>
                  <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Usuário</SelectItem>
                      <SelectItem value="AGENT">Técnico</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={() => create.mutate()}
                  disabled={!form.name || !form.email || create.isPending}
                >
                  {create.isPending ? 'Enviando...' : 'Enviar convite'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Perfil</th>
                <th className="text-left p-3 font-medium">Expira</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.map(invite => {
                const s = STATUS_CONFIG[invite.status]
                return (
                  <tr key={invite.id} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{invite.name}</td>
                    <td className="p-3 text-muted-foreground">{invite.email}</td>
                    <td className="p-3 text-muted-foreground">{invite.role}</td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${s.color}`}>
                        {s.icon} {s.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {data?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                    Nenhum convite enviado ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}