import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { authService }  from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'

export function LoginPage() {
  const navigate = useNavigate()
  const setUser  = useAuthStore(s => s.setUser)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => {
      setUser(user)
      navigate('/tickets')
    },
    onError: () => setError('Email ou senha inválidos'),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    mutation.mutate(form)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--background)' }}
    >
      {/* Glow sutil de fundo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(64,126,140,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm space-y-8">

        {/* Logo / título */}
        <div className="text-center space-y-1">
          <div
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4"
            style={{ background: 'var(--accent)', boxShadow: '0 0 24px rgba(64,126,140,0.35)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Helpdesk
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Entre com suas credenciais
          </p>
        </div>

        {/* Card do form */}
        <div
          className="rounded-2xl p-7 space-y-5"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Email
              </Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="text-sm h-10"
                style={{
                  background: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Senha
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                className="text-sm h-10"
                style={{
                  background: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {error && (
              <p
                className="text-xs px-3 py-2 rounded-lg"
                style={{ background: 'rgba(220,38,38,0.08)', color: '#ef4444', border: '1px solid rgba(220,38,38,0.15)' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full h-10 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 mt-2"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              {mutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Acesso restrito. Solicite um convite ao administrador.
        </p>
      </div>
    </div>
  )
}