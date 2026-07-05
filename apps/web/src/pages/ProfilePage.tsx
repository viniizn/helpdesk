import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/stores/auth.store'
import { Building2, Briefcase, MapPin, CheckCircle2, AlertCircle } from 'lucide-react'

const inputStyle: React.CSSProperties = {
  background: 'var(--background)',
  borderColor: 'var(--border)',
  color: 'var(--text-primary)',
}

function getInitial(name?: string | null) {
  if (!name) return '?'
  return name.trim().charAt(0).toUpperCase()
}

export function ProfilePage() {
  const queryClient = useQueryClient()
  const { user, setUser } = useAuthStore()

  const [form, setForm] = useState({
    secretariat: '',
    department:  '',
    location:    '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        secretariat: user.secretariat ?? '',
        department:  user.department  ?? '',
        location:    user.location    ?? '',
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
  const initial = getInitial(user?.name)

  const fields = [
    {
      key: 'secretariat' as const,
      label: 'Secretaria',
      placeholder: 'Ex: Secretaria de Educação',
      icon: Building2,
    },
    {
      key: 'department' as const,
      label: 'Setor',
      placeholder: 'Ex: Recursos Humanos',
      icon: Briefcase,
    },
    {
      key: 'location' as const,
      label: 'Localização (sala, andar...)',
      placeholder: 'Ex: Sala 12, 2º andar',
      icon: MapPin,
    },
  ]

  return (
    <div className="p-8 max-w-md mx-auto space-y-6">

      {/* Cabeçalho com avatar */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center rounded-full shrink-0 select-none"
          style={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
            color: '#fff',
            fontSize: '1.5rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
          }}
          aria-hidden="true"
        >
          {initial}
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {user?.name ?? 'Meu perfil'}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Esses dados ajudam o técnico a localizar você presencialmente.
          </p>
        </div>
      </div>

      {/* Alerta de status do perfil */}
      <div
        className="flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm"
        style={
          isComplete
            ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)', color: '#047857' }
            : { background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.22)', color: '#92400e' }
        }
      >
        {isComplete ? (
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
        ) : (
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
        )}
        <span>
          {isComplete
            ? 'Perfil completo. Seus dados de localização estão prontos para uso.'
            : 'Complete sua localização para agilizar o atendimento presencial.'}
        </span>
      </div>

      {/* Card do formulário */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Localização
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Preenchido uma vez, usado em todos os chamados.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, placeholder, icon: Icon }) => (
            <div className="space-y-1.5" key={key}>
              <Label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {label}
              </Label>
              <div className="relative">
                <Icon
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                />
                <Input
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40 mt-2"
            style={{ background: 'var(--accent)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            {mutation.isPending ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}