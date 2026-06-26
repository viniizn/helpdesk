import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/stores/auth.store'

export function ProfilePage() {
  const queryClient = useQueryClient()
  const { user, setUser } = useAuthStore()

  const [form, setForm] = useState({
    secretariat: '',
    department:  '',
    location:    '',
  })

  // Preenche o form com os dados atuais quando o usuário carrega
  useEffect(() => {
    if (user) {
      setForm({
        secretariat: user.secretariat ?? '',
        department:  user.department ?? '',
        location:    user.location ?? '',
      })
    }
  }, [user])

  const mutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (updatedUser) => {
      setUser({ ...user!, ...updatedUser })
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate(form)
  }

  const isComplete = form.secretariat && form.department && form.location

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Meu perfil</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Esses dados ajudam o técnico a localizar você presencialmente.
        </p>
      </div>

      {!isComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          Complete sua localização para agilizar o atendimento presencial.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Localização</CardTitle>
          <CardDescription>Preenchido uma vez, usado em todos os chamados</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Secretaria</Label>
              <Input
                placeholder="Ex: Secretaria de Educação"
                value={form.secretariat}
                onChange={e => setForm(f => ({ ...f, secretariat: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Setor</Label>
              <Input
                placeholder="Ex: Recursos Humanos"
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Localização (sala, andar...)</Label>
              <Input
                placeholder="Ex: Sala 12, 2º andar"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}