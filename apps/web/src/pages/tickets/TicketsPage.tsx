import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Circle, Clock, AlertCircle, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ticketService } from '@/services/ticket.service'

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; badge: string }> = {
  OPEN:         { label: 'Aberto',         icon: <Circle size={16} className="fill-blue-500/10" />,        color: 'text-blue-500',        badge: 'bg-blue-500/10 border-blue-500/20' },
  IN_PROGRESS:  { label: 'Em andamento',    icon: <Clock size={16} />,                                      color: 'text-amber-500',       badge: 'bg-amber-500/10 border-amber-500/20' },
  WAITING_USER: { label: 'Aguardando',     icon: <AlertCircle size={16} />,                                color: 'text-orange-500',      badge: 'bg-orange-500/10 border-orange-500/20' },
  RESOLVED:     { label: 'Resolvido',      icon: <CheckCircle2 size={16} className="fill-green-500/10" />,  color: 'text-green-500',       badge: 'bg-green-500/10 border-green-500/20' },
  CLOSED:       { label: 'Fechado',        icon: <XCircle size={16} />,                                    color: 'text-muted-foreground', badge: 'bg-gray-500/10 border-gray-500/20' },
}

const PRIORITY_BAR: Record<string, string> = {
  LOW:      'bg-slate-200 dark:bg-slate-800',
  MEDIUM:   'bg-sky-400',
  HIGH:     'bg-orange-400',
  CRITICAL: 'bg-rose-500 animate-pulse',
}

const FILTERS = [
  { value: '',             label: 'Todos' },
  { value: 'OPEN',         label: 'Abertos' },
  { value: 'IN_PROGRESS',  label: 'Em andamento' },
  { value: 'WAITING_USER', label: 'Aguardando' },
  { value: 'RESOLVED',     label: 'Resolvidos' },
  { value: 'CLOSED',       label: 'Fechados' },
]

export function TicketsPage() {
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', status],
    queryFn:  () => ticketService.list(status ? { status } : undefined),
  })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Suas Tarefas</h1>
          <p className="text-sm text-muted-foreground">
            {data?.meta.total ?? 0} chamados pendentes de resolução.
          </p>
        </div>
        <Button asChild size="sm" className="shadow-sm gap-1.5 rounded-full px-4">
          <Link to="/tickets/new">
            <Plus size={16} />
            Novo chamado
          </Link>
        </Button>
      </div>

      {/* Filtros Modernos Estilo To-Do (Pills) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map(f => {
          const isActive = status === f.value
          return (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Lista Estilo Linear / Todoist */}
      {isLoading ? (
        <div className="space-y-2 border rounded-xl p-2 bg-card">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[52px] rounded-lg bg-muted/60 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="border rounded-xl bg-card shadow-sm divide-y divide-border overflow-hidden">
          {data?.tickets.map(ticket => {
            const s = STATUS_CONFIG[ticket.status]
            const isClosed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED'
            
            return (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center gap-4 p-3.5 hover:bg-muted/40 transition-colors group relative"
              >
                {/* Indicador Lateral Discreto de Prioridade */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${PRIORITY_BAR[ticket.priority]}`} />

                {/* Ícone de Status (Funciona como o Checkbox do To-Do) */}
                <div className={`shrink-0 transition-transform group-hover:scale-105 ${s.color}`}>
                  {s.icon}
                </div>

                {/* Conteúdo Principal */}
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                  <div className="md:col-span-2 min-w-0">
                    {/* Alinhamento flex para o título e a tag de status */}
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium truncate transition-colors ${
                        isClosed ? 'line-through text-muted-foreground/70' : 'text-foreground group-hover:text-primary'
                      }`}>
                        {ticket.title}
                      </p>
                      
                      {/* Tag de Status Dinâmica */}
                      <span className={`shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full border ${s.badge} ${s.color}`}>
                        {s.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 truncate">
                      <span className="font-medium bg-secondary px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                        {ticket.category.name}
                      </span>
                      <span>•</span>
                      <span>{ticket.createdBy.name}</span>
                    </div>
                  </div>

                  {/* Atribuído a / Responsável */}
                  <div className="hidden md:flex items-center justify-end text-xs text-muted-foreground">
                    {ticket.assignedTo ? (
                      <span className="bg-muted px-2 py-1 rounded-md max-w-[120px] truncate">
                        {ticket.assignedTo.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40 italic text-[11px]">Sem técnico</span>
                    )}
                  </div>
                </div>

                {/* Seta indicativa ao pairar */}
                <ChevronRight size={14} className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
              </Link>
            )
          })}

          {data?.tickets.length === 0 && (
            <div className="text-center py-16 text-muted-foreground bg-muted/10">
              <CheckCircle2 size={36} className="mx-auto mb-3 opacity-20 text-emerald-500" />
              <p className="text-sm font-medium">Tudo limpo por aqui!</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Nenhum chamado corresponde ao filtro.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}