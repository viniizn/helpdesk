import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { api } from '@/lib/api'

export function AcceptInvitePage() {
  const navigate       = useNavigate()
  const [params]       = useSearchParams()
  const token          = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  // Busca os dados do convite para mostrar nome/email
  const { data, isLoading, isError } = useQuery({
    queryKey: ['invite', token],
    queryFn:  async () => {
      const res = await api.get(`/invites/${token}`)
      return res.data.invite as { name: string; email: string; role: string }
    },
    enabled: !!token,
    retry:   false,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post('/invites/accept', { token, password })
    },
    onSuccess: () => {
      navigate('/login?invited=true')
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? 'Erro ao ativar conta')
    },
  })

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Link inválido.</p>
    </div>
  )

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Verificando convite...</p>
    </div>
  )

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6 space-y-2">
          <p className="font-semibold">Convite inválido ou expirado</p>
          <p className="text-sm text-muted-foreground">
            Este link não é mais válido. Peça ao administrador um novo convite.
          </p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bem-vindo, {data?.name}</CardTitle>
          <CardDescription>
            Você foi convidado como <strong>{data?.role}</strong>.<br />
            Defina sua senha para ativar a conta <strong>{data?.email}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                placeholder="Mínimo 8 caracteres, 1 maiúscula e 1 número"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              className="w-full"
              onClick={() => mutation.mutate()}
              disabled={password.length < 8 || mutation.isPending}
            >
              {mutation.isPending ? 'Ativando...' : 'Ativar minha conta'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}