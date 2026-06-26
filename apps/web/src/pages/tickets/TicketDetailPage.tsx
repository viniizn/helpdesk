import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Circle, Clock, AlertCircle, CheckCircle2, XCircle, Lock, MessageSquare, ShieldAlert } from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge }    from '@/components/ui/badge'
import { ticketService } from '@/services/ticket.service'
import { useAuthStore }  from '@/stores/auth.store'
import { ALLOWED_TRANSITIONS } from '@helpdesk/shared'

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  OPEN:         { label: 'Aberto',         icon: <Circle size={14} />,       color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50' },
  IN_PROGRESS:  { label: 'Em andamento',    icon: <Clock size={14} />,        color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50' },
  WAITING_USER: { label: 'Aguardando',     icon: <AlertCircle size={14} />,  color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/50' },
  RESOLVED:     { label: 'Resolvido',      icon: <CheckCircle2 size={14} />, color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/50' },
  CLOSED:       { label: 'Encerrado',      icon: <XCircle size={14} />,      color: 'text-muted-foreground',               bg: 'bg-muted/50 border-muted' },
}

const STATUS_FLOW = ['OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED']

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW:      { label: 'Baixa',   color: 'bg-secondary text-secondary-foreground hover:bg-secondary' },
  MEDIUM:   { label: 'Média',   color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 hover:bg-sky-500/10' },
  HIGH:     { label: 'Alta',    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 hover:bg-orange-500/10' },
  CRITICAL: { label: 'Crítica', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 animate-pulse' },
}

const ACTION_LABEL: Record<string, string> = {
  IN_PROGRESS:  'Iniciar atendimento',
  WAITING_USER: 'Ausente',
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
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <div className="h-6 w-24 bg-muted animate-pulse rounded" />
      <div className="h-44 rounded-xl bg-muted/60 animate-pulse" />
    </div>
  )

  if (!ticket) return <div className="p-6 text-center text-muted-foreground">Chamado não encontrado</div>

  const s          = STATUS_CONFIG[ticket.status]
  const allowedNext = ALLOWED_TRANSITIONS[ticket.status as keyof typeof ALLOWED_TRANSITIONS] ?? []
  const isClosed   = ticket.status === 'CLOSED'
  const currentStep = STATUS_FLOW.indexOf(ticket.status)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      
      {/* Voltar Minimalista */}
      <button
        onClick={() => navigate('/tickets')}
        className="group flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
        Voltar para a lista
      </button>

      {/* Card Principal de Contexto da Tarefa */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                Chamado #{ticket.id.slice(-4)}
              </span>
              <h2 className={`text-xl font-semibold tracking-tight ${isClosed ? 'line-through text-muted-foreground/60' : ''}`}>
                {ticket.title}
              </h2>
            </div>
            <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_CONFIG[ticket.priority].color}`}>
              {PRIORITY_CONFIG[ticket.priority].label}
            </Badge>
          </div>
          {/* Badges de Meta em Grid Slim */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${s.bg} ${s.color} font-medium`}>
              {s.icon} {s.label}
            </div>
            <div className="bg-secondary/60 text-secondary-foreground px-2.5 py-1 rounded-full">
              Cat: <span className="font-medium text-foreground">{ticket.category.name}</span>
            </div>
            <div className="bg-secondary/60 text-secondary-foreground px-2.5 py-1 rounded-full">
              Por: <span className="font-medium text-foreground">{ticket.createdBy.name}</span>
            </div>

            {(ticket.createdBy.secretariat || ticket.createdBy.department || ticket.location) && (
              <div className="bg-secondary/60 text-secondary-foreground px-2.5 py-1 rounded-full">
                <span className="font-medium text-foreground">
                  {[ticket.createdBy.secretariat, ticket.createdBy.department, ticket.location]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
            )}
          </div>

          <hr className="border-border" />

          {/* Descrição Limpa */}
          <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap bg-muted/30 p-3.5 rounded-lg border border-dashed">
            {ticket.description}
          </div>
        </div>

        {/* Timeline Discreta de Progresso (Bottom bar do Card) */}
        <div className="bg-muted/20 px-5 py-3 border-t flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Fluxo da Tarefa:</span>
          <div className="flex items-center gap-1.5">
            {STATUS_FLOW.map((st, i) => (
              <div key={st} className="flex items-center gap-1">
                <div 
                  title={STATUS_CONFIG[st].label}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i <= currentStep ? 'bg-primary scale-110 shadow-sm' : 'bg-muted-foreground/20'
                  }`} 
                />
                {i < STATUS_FLOW.length - 1 && (
                  <div className={`h-[2px] w-4 transition-colors ${
                    i < currentStep ? 'bg-primary' : 'bg-muted-foreground/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Actions (Próximos Passos Estilo Fluxo de Trabalho) */}
      {isAgent && allowedNext.length > 0 && (
        <div className="bg-secondary/30 border border-secondary rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <p className="font-semibold text-foreground">Ações sugeridas</p>
            <p className="text-muted-foreground">Mova o status desta tarefa para o próximo estágio.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {allowedNext.map((next: string, idx: number) => {
              const nextConfig = STATUS_CONFIG[next]
              const isPrimary = idx === 0
              return (
                <Button
                  key={next}
                  size="sm"
                  variant={isPrimary ? 'default' : 'outline'}
                  className="rounded-full text-xs gap-1.5 shadow-sm"
                  onClick={() => changeStatus.mutate(next)}
                  disabled={changeStatus.isPending}
                >
                  {ACTION_LABEL[next]}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Caixa de Texto de Interação */}
      {!isClosed && (
        <div className="border rounded-xl p-4 bg-card shadow-sm space-y-3">
          <Textarea
            placeholder={isInternal ? 'Escreva uma nota interna confidencial...' : 'Escreva uma atualização ou resposta para a tarefa...'}
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            className={`resize-none focus-visible:ring-1 text-sm ${
              isInternal 
                ? 'border-amber-300 focus-visible:ring-amber-400 bg-amber-50/10' 
                : 'focus-visible:ring-primary'
            }`}
          />
          <div className="flex items-center justify-between">
            {isAgent ? (
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={e => setIsInternal(e.target.checked)}
                  className="rounded border-muted text-amber-500 focus:ring-amber-500"
                />
                <span className={isInternal ? 'text-amber-600 font-semibold' : ''}>Nota Interna (Apenas Staff)</span>
              </label>
            ) : <div />}
            <Button
              onClick={() => addComment.mutate({ body: comment, isInternal })}
              disabled={!comment.trim() || addComment.isPending}
              size="sm"
              className="rounded-full px-4 text-xs"
            >
              {addComment.isPending ? 'Enviando...' : 'Responder'}
            </Button>
          </div>
        </div>
      )}

      {/* Histórico / Feed de Comentários estilo Chat Minimalista */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground tracking-wider uppercase">
          <MessageSquare size={14} />
          Histórico de Atualizações ({ticket.comments?.length ?? 0})
        </div>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-4 before:w-px before:bg-border/60">
          {ticket.comments?.map(c => {
            const isMe = c.author.id === user?.id
            return (
              <div
                key={c.id}
                className={`relative pl-8 transition-opacity ${c.isInternal ? 'opacity-95' : ''}`}
              >
                {/* Indicador de Timeline visual */}
                <div className={`absolute left-[11px] top-3 w-2.5 h-2.5 rounded-full border-2 bg-background ${
                  c.isInternal ? 'border-amber-500' : 'border-primary'
                }`} />

                <div className={`rounded-xl p-4 text-sm border shadow-xs space-y-1.5 ${
                  c.isInternal
                    ? 'bg-amber-550/5 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40'
                    : isMe
                      ? 'bg-muted/40 border-border'
                      : 'bg-card border-border'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-foreground">{c.author.name}</span>
                      <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.2 rounded-md">
                        {c.author.role}
                      </span>
                    </div>
                    {c.isInternal && (
                      <span className="text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldAlert size={10} /> Privado
                      </span>
                    )}
                  </div>
                  <p className="text-foreground/80 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">{c.body}</p>
                </div>
              </div>
            )
          })}

          {ticket.comments?.length === 0 && (
            <p className="text-xs text-muted-foreground italic pl-8">Nenhuma atividade registrada ainda nesta tarefa.</p>
          )}
        </div>
      </div>

      {/* Alerta de Encerrado */}
      {isClosed && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground border border-dashed rounded-xl p-4 bg-muted/10 justify-center">
          <Lock size={14} />
          Esta tarefa foi arquivada e concluída. Novas interações estão bloqueadas.
        </div>
      )}
    </div>
  )
}