import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Circle, Clock, CheckCircle2, XCircle, Lock, MessageSquare, ShieldAlert } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { ticketService } from '@/services/ticket.service'
import { useAuthStore }  from '@/stores/auth.store'
import { ALLOWED_TRANSITIONS } from '@helpdesk/shared'

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  OPEN:         { label: 'Aberto',        icon: <Circle size={13} />,       color: '#407E8C', bg: 'rgba(64,126,140,0.08)',   border: 'rgba(64,126,140,0.22)' },
  IN_PROGRESS:  { label: 'Em andamento',  icon: <Clock size={13} />,        color: '#b45309', bg: 'rgba(217,119,6,0.08)',    border: 'rgba(217,119,6,0.22)'  },
  RESOLVED:     { label: 'Resolvido',     icon: <CheckCircle2 size={13} />, color: '#A58D66', bg: 'rgba(165,141,102,0.10)', border: 'rgba(165,141,102,0.28)' },
  CLOSED:       { label: 'Encerrado',     icon: <XCircle size={13} />,      color: '#6b7280', bg: 'rgba(107,114,128,0.06)', border: 'rgba(107,114,128,0.18)' },
}

const STATUS_FLOW = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  LOW:      { label: 'Baixa',   color: 'var(--text-secondary)',  bg: 'var(--surface-subtle)' },
  MEDIUM:   { label: 'Média',   color: 'var(--accent)',          bg: 'var(--accent-subtle)' },
  HIGH:     { label: 'Alta',    color: '#b45309',                bg: 'rgba(217,119,6,0.10)' },
  CRITICAL: { label: 'Crítica', color: '#dc2626',                bg: 'rgba(220,38,38,0.10)' },
}

const ACTION_LABEL: Record<string, string> = {
  IN_PROGRESS:  'Iniciar atendimento',
  RESOLVED:     'Marcar como resolvido',
  CLOSED:       'Fechar chamado',
  OPEN:         'Reabrir',
}

export function TicketDetailPage() {
  const { id }      = useParams<{ id: string }>()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const user        = useAuthStore(s => s.user)
  const isAgent     = user?.role === 'AGENT' || user?.role === 'ADMIN'

  const [comment, setComment]       = useState('')
  const [isInternal, setIsInternal] = useState(false)

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['tickets', id],
    queryFn:  () => ticketService.get(id!),
  })

  const changeStatus = useMutation({
    mutationFn: (status: string) => ticketService.changeStatus(id!, status),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['tickets', id] }),
  })

  const addComment = useMutation({
    mutationFn: (data: { body: string; isInternal: boolean }) => ticketService.addComment(id!, data),
    onSuccess: () => {
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['tickets', id] })
    },
  })

  if (isLoading) return (
    <div className="p-8 max-w-3xl mx-auto space-y-4">
      <div className="h-6 w-24 rounded animate-pulse" style={{ background: 'var(--surface-subtle)' }} />
      <div className="h-48 rounded-xl animate-pulse" style={{ background: 'var(--surface-subtle)' }} />
    </div>
  )

  if (!ticket) return (
    <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
      Chamado não encontrado
    </div>
  )

  const s           = STATUS_CONFIG[ticket.status]
  const allowedNext = ALLOWED_TRANSITIONS[ticket.status as keyof typeof ALLOWED_TRANSITIONS] ?? []
  const isClosed    = ticket.status === 'CLOSED'
  const currentStep = STATUS_FLOW.indexOf(ticket.status)
  const priority    = PRIORITY_CONFIG[ticket.priority]

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">

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

      {/* Card principal */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="p-6 space-y-4">
          {/* Título + prioridade */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                #{ticket.id.slice(-4)}
              </span>
              <h2
                className={`text-xl font-semibold tracking-tight ${isClosed ? 'line-through opacity-40' : ''}`}
                style={{ color: 'var(--text-primary)' }}
              >
                {ticket.title}
              </h2>
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0"
              style={{ background: priority.bg, color: priority.color }}
            >
              {priority.label}
            </span>
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status */}
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium"
              style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
            >
              {s.icon} {s.label}
            </span>

            {[
              { label: 'Cat', value: ticket.category.name },
              { label: 'Por', value: ticket.createdBy.name },
              ...(ticket.createdBy.secretariat || ticket.createdBy.department || ticket.location
                ? [{ label: '', value: [ticket.createdBy.secretariat, ticket.createdBy.department, ticket.location].filter(Boolean).join(' · ') }]
                : []),
            ].map((item, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full"
                style={{ background: 'var(--surface-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                {item.label && <span className="opacity-60">{item.label}: </span>}
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
              </span>
            ))}
          </div>

          <hr style={{ borderColor: 'var(--border)' }} />

          {/* Descrição */}
          <div
            className="text-sm leading-relaxed whitespace-pre-wrap p-4 rounded-lg"
            style={{
              background: 'var(--surface-subtle)',
              color: 'var(--text-primary)',
              border: '1px dashed var(--border-strong)',
            }}
          >
            {ticket.description}
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="px-6 py-3 flex items-center justify-between text-[11px]"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-subtle)' }}
        >
          <span className="font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Progresso
          </span>
          <div className="flex items-center gap-1.5">
            {STATUS_FLOW.map((st, i) => (
              <div key={st} className="flex items-center gap-1">
                <div
                  title={STATUS_CONFIG[st]?.label}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: i <= currentStep ? 'var(--accent)' : 'var(--border-strong)',
                    transform: i === currentStep ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
                {i < STATUS_FLOW.length - 1 && (
                  <div
                    className="h-px w-5 transition-colors"
                    style={{ background: i < currentStep ? 'var(--accent)' : 'var(--border)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ações */}
      {isAgent && allowedNext.length > 0 && (
        <div
          className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="text-xs">
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Ações disponíveis</p>
            <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>Avance o status desta tarefa.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {allowedNext.map((next: string, idx: number) => {
              if (!ACTION_LABEL[next]) return null
              return (
                <button
                  key={next}
                  onClick={() => changeStatus.mutate(next)}
                  disabled={changeStatus.isPending}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  style={
                    idx === 0
                      ? { background: 'var(--accent)', color: '#fff' }
                      : { background: 'var(--surface-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                  }
                  onMouseEnter={e => {
                    if (idx === 0) e.currentTarget.style.background = 'var(--accent-hover)'
                    else e.currentTarget.style.background = 'rgba(var(--teal) / 0.06)'
                  }}
                  onMouseLeave={e => {
                    if (idx === 0) e.currentTarget.style.background = 'var(--accent)'
                    else e.currentTarget.style.background = 'var(--surface-subtle)'
                  }}
                >
                  {ACTION_LABEL[next]}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Caixa de comentário */}
      {!isClosed && (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <Textarea
            placeholder={isInternal ? 'Nota interna (apenas staff)...' : 'Escreva uma atualização ou resposta...'}
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="resize-none text-sm rounded-lg"
            style={{
              borderColor: isInternal ? '#d97706' : 'var(--border)',
              background: isInternal ? 'rgba(217,119,6,0.05)' : 'var(--background)',
              color: 'var(--text-primary)',
            }}
          />
          <div className="flex items-center justify-between">
            {isAgent ? (
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={e => setIsInternal(e.target.checked)}
                  className="rounded"
                />
                <span style={{ color: isInternal ? '#d97706' : 'inherit' }}>Nota interna</span>
              </label>
            ) : <div />}
            <button
              onClick={() => addComment.mutate({ body: comment, isInternal })}
              disabled={!comment.trim() || addComment.isPending}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-40"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              {addComment.isPending ? 'Enviando...' : 'Responder'}
            </button>
          </div>
        </div>
      )}

      {/* Feed de comentários */}
      <div className="space-y-4">
        <div
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          <MessageSquare size={13} />
          Histórico ({ticket.comments?.length ?? 0})
        </div>

        <div
          className="space-y-3 relative"
          style={{
            paddingLeft: '2rem',
          }}
        >
          <div
            className="absolute left-4 top-0 bottom-0 w-px"
            style={{ background: 'var(--border)' }}
          />

          {ticket.comments?.map(c => {
            const isMe = c.author.id === user?.id
            return (
              <div key={c.id} className="relative">
                {/* Dot na timeline */}
                <div
                  className="absolute -left-[1.125rem] top-4 w-2 h-2 rounded-full"
                  style={{ background: c.isInternal ? '#d97706' : 'var(--accent)' }}
                />

                <div
                  className="rounded-xl p-4 text-sm space-y-2"
                  style={{
                    background: c.isInternal
                      ? 'rgba(217,119,6,0.05)'
                      : isMe
                        ? 'var(--surface-subtle)'
                        : 'var(--surface)',
                    border: `1px solid ${c.isInternal ? 'rgba(217,119,6,0.20)' : 'var(--border)'}`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {c.author.name}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
                        style={{ background: 'var(--gold-subtle)', color: 'var(--gold-accent)' }}
                      >
                        {c.author.role}
                      </span>
                    </div>
                    {c.isInternal && (
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: 'rgba(217,119,6,0.10)', color: '#d97706' }}
                      >
                        <ShieldAlert size={9} /> Privado
                      </span>
                    )}
                  </div>
                  <p
                    className="leading-relaxed text-xs sm:text-sm whitespace-pre-wrap"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {c.body}
                  </p>
                </div>
              </div>
            )
          })}

          {ticket.comments?.length === 0 && (
            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
              Nenhuma atividade registrada ainda.
            </p>
          )}
        </div>
      </div>

      {/* Chamado encerrado */}
      {isClosed && (
        <div
          className="flex items-center gap-2 text-xs rounded-xl p-4 justify-center"
          style={{
            border: '1px dashed var(--border-strong)',
            color: 'var(--text-muted)',
            background: 'var(--surface-subtle)',
          }}
        >
          <Lock size={13} style={{ color: 'var(--accent)' }} />
          Esta tarefa foi encerrada. Novas interações estão bloqueadas.
        </div>
      )}
    </div>
  )
}