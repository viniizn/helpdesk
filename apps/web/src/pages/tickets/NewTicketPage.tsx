import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, MapPin, Monitor } from 'lucide-react'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ticketService } from '@/services/ticket.service'
import { useAuthStore }  from '@/stores/auth.store'

const MIN_DESCRIPTION = 20

type AttendanceType = 'ON_SITE' | 'REMOTE'

// Estilos reutilizáveis para inputs dentro desta página
const inputStyle: React.CSSProperties = {
  background: 'var(--background)',
  borderColor: 'var(--border)',
  color: 'var(--text-primary)',
}

export function NewTicketPage() {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const user        = useAuthStore(s => s.user)

  const [form, setForm] = useState({
    title:       '',
    description: '',
    priority:    'MEDIUM',
    categoryId:  '',
    type:        'ON_SITE' as AttendanceType,
    location:    user?.location ?? '',
  })

  const descriptionLength  = form.description.length
  const isDescriptionValid = descriptionLength >= MIN_DESCRIPTION
  const isOnSite           = form.type === 'ON_SITE'

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn:  ticketService.getCategories,
  })

  const mutation = useMutation({
    mutationFn: ticketService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      navigate('/tickets')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate({
      ...form,
      location: isOnSite ? form.location : '',
    })
  }

  const attendanceOptions: { value: AttendanceType; label: string; hint: string; icon: typeof MapPin }[] = [
    { value: 'ON_SITE', label: 'Presencial', hint: 'Técnico vai até você', icon: MapPin },
    { value: 'REMOTE',  label: 'Remoto',     hint: 'Atendimento à distância', icon: Monitor },
  ]

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">

      {/* Voltar */}
      <button
        onClick={() => navigate('/tickets')}
        className="group flex items-center gap-1.5 text-xs font-medium transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
        Voltar para a lista
      </button>

      {/* Cabeçalho */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Novo Chamado
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Abertura de chamados de suporte técnico, presencial ou remoto.
        </p>
      </div>

      {/* Formulário */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Tipo de atendimento */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Tipo de atendimento
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {attendanceOptions.map(({ value, label, hint, icon: Icon }) => {
                const selected = form.type === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: value }))}
                    className="flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-left transition-colors"
                    style={{
                      border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                      background: selected ? 'rgba(var(--accent-rgb, 217,119,6),0.06)' : 'var(--background)',
                    }}
                  >
                    <Icon
                      size={17}
                      className="mt-0.5 shrink-0"
                      style={{ color: selected ? 'var(--accent)' : 'var(--text-muted)' }}
                    />
                    <span>
                      <span
                        className="block text-sm font-semibold"
                        style={{ color: selected ? 'var(--accent)' : 'var(--text-primary)' }}
                      >
                        {label}
                      </span>
                      <span className="block text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {hint}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Título */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Título
            </Label>
            <Input
              placeholder="Ex: Erro ao carregar faturamento"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
              style={inputStyle}
              className="text-sm"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Descrição
              </Label>
              <span
                className="text-xs font-semibold"
                style={{ color: isDescriptionValid ? 'var(--accent)' : '#dc2626' }}
              >
                {descriptionLength}/{MIN_DESCRIPTION}
              </span>
            </div>
            <Textarea
              placeholder={
                isOnSite
                  ? 'Descreva o problema com o máximo de detalhes...'
                  : 'Descreva o problema com o máximo de detalhes. Em atendimentos remotos, inclua o sistema operacional e, se possível, prints do erro.'
              }
              rows={5}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
              className="resize-none text-sm"
              style={{
                ...inputStyle,
                borderColor: form.description.length > 0 && !isDescriptionValid
                  ? '#fca5a5'
                  : 'var(--border)',
              }}
            />
            {form.description.length > 0 && !isDescriptionValid && (
              <p className="text-xs" style={{ color: '#dc2626' }}>
                Mínimo de {MIN_DESCRIPTION} caracteres.
              </p>
            )}
          </div>

          {/* Local (apenas presencial) ou aviso remoto */}
          {isOnSite ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Local do atendimento
              </Label>
              <Input
                placeholder="Ex: Sala 12, 2º andar"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                style={inputStyle}
                className="text-sm"
              />
              {(user?.secretariat || user?.department) && (
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  {[user.secretariat, user.department].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          ) : (
            <div
              className="flex items-start gap-2.5 rounded-lg px-4 py-3 text-xs"
              style={{ background: 'var(--background)', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}
            >
              <Monitor size={15} className="mt-0.5 shrink-0" />
              <span>
                O técnico entrará em contato para agendar o acesso remoto ou a chamada de vídeo. Nenhum local precisa ser informado.
              </span>
            </div>
          )}

          {/* Prioridade + Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Urgência
              </Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger className="text-sm" style={inputStyle}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baixa</SelectItem>
                  <SelectItem value="MEDIUM">Média</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="CRITICAL">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Categoria
              </Label>
              <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger className="text-sm" style={inputStyle}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-sm">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ações */}
          <div
            className="flex items-center justify-end gap-3 pt-4 mt-2"
            style={{ borderTop: '1px dashed var(--border)' }}
          >
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{ color: 'var(--text-muted)', background: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-subtle)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !isDescriptionValid || !form.title}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-40"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              {mutation.isPending ? 'Criando...' : 'Criar chamado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}