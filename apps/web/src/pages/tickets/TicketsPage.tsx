import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, MessageSquare, MapPin, ArrowUpRight, User, Loader2, Inbox } from 'lucide-react'
import { ticketService } from '@/services/ticket.service'
import { useViewStore } from '@/stores/view.store'

const COLUMNS = [
  { id: 'OPEN',        label: 'Abertos',      dot: 'var(--accent)',       color: '#3b82f6' },
  { id: 'IN_PROGRESS', label: 'Em Andamento', dot: '#d97706',             color: '#f59e0b' },
//  { id: 'WAITING',     label: 'Aguardando',   dot: '#ea580c',             color: '#ea580c' },
  { id: 'RESOLVED',    label: 'Resolvidos',   dot: 'var(--gold-accent)',  color: '#10b981' },
]

const PRIORITY: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  LOW:      { label: 'Baixa',   bg: 'rgba(148,163,184,0.08)', color: 'var(--text-muted)',     dot: 'var(--text-muted)' },
  MEDIUM:   { label: 'Média',   bg: 'rgba(64,126,140,0.12)',  color: 'var(--text-secondary)', dot: 'var(--accent)'     },
  HIGH:     { label: 'Alta',    bg: 'rgba(217,119,6,0.12)',   color: '#f59e0b',               dot: '#f59e0b'           },
  CRITICAL: { label: 'Crítica', bg: 'rgba(220,38,38,0.12)',   color: '#ef4444',               dot: '#ef4444'           },
}

function SkeletonCard() {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-3 animate-pulse"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex justify-between">
        <div className="w-16 h-3 rounded opacity-10 bg-current" />
        <div className="w-10 h-3 rounded opacity-10 bg-current" />
      </div>
      <div className="w-full h-3 rounded opacity-10 bg-current" />
      <div className="w-3/4 h-3 rounded opacity-10 bg-current" />
    </div>
  )
}

// ─── VIEW KANBAN (estilo Trello) ─────────────────────────────────────────────
function KanbanView({ data, isLoading }: { data: any; isLoading: boolean }) {
  const byStatus = (id: string) => data?.tickets.filter((t: any) => t.status === id) ?? []

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {COLUMNS.map(col => {
        const tickets = byStatus(col.id)
        return (
          <div
            key={col.id}
            className="rounded-xl flex flex-col gap-2 min-h-[580px] p-2"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 sticky top-0 rounded-t-lg"
              style={{ background: 'var(--surface)' }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full"
                  style={{ background: col.dot, boxShadow: `0 0 6px ${col.dot}aa` }} />
                <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
                  {col.label}
                </span>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full tabular-nums"
                style={{ background: 'rgba(0,0,0,0.15)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {isLoading ? <Loader2 size={10} className="animate-spin" /> : tickets.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 pb-2 overflow-y-auto max-h-[calc(100vh-220px)]">
              {isLoading
                ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
                : tickets.map((ticket: any) => {
                    const p = PRIORITY[ticket.priority] ?? PRIORITY.LOW
                    return (
                      <Link
                        key={ticket.id}
                        to={`/tickets/${ticket.id}`}
                        className="group block rounded-xl p-4 transition-all duration-200"
                        style={{
                          background: 'var(--surface-card, rgba(255,255,255,0.02))',
                          border: '1px solid var(--border)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'var(--border-strong)'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.22)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)'
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                            style={{ background: 'var(--gold-subtle, rgba(165,141,102,0.1))', color: 'var(--gold-accent)' }}>
                            {ticket.category.name}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{ background: p.bg, color: p.color }}>
                            <span className="w-1 h-1 rounded-full" style={{ background: p.dot }} />
                            {p.label}
                          </span>
                        </div>

                        <h3 className="text-[13px] font-medium line-clamp-2 leading-snug mb-3.5 transition-colors duration-200"
                          style={{ color: 'var(--text-secondary)' }}>
                          {ticket.title}
                        </h3>

                        <div className="flex flex-col gap-2 pt-3"
                          style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}>
                          {ticket.location && (
                            <div className="flex items-center gap-1.5 text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                              <MapPin size={12} className="shrink-0 opacity-70" />
                              <span className="truncate">{ticket.location}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-[11px] truncate max-w-[130px]" style={{ color: 'var(--text-muted)' }}>
                              <User size={12} className="shrink-0 opacity-70" />
                              <span className="truncate">{ticket.createdBy.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                              <span className="flex items-center gap-1">
                                <MessageSquare size={12} className="opacity-70" />
                                <span className="tabular-nums">{ticket.comments?.length ?? 0}</span>
                              </span>
                              <ArrowUpRight size={13}
                                className="opacity-0 group-hover:opacity-100 transition-all"
                                style={{ color: 'var(--accent)' }} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}

              {!isLoading && tickets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 rounded-xl gap-2 mt-2"
                  style={{ border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.05)' }}>
                    <Plus size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <p className="text-[11px] font-medium">Nenhum chamado</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── VIEW LISTA (estilo empresa/tabela) ──────────────────────────────────────
function ListView({ data, isLoading }: { data: any; isLoading: boolean }) {
  const tickets = data?.tickets ?? []
  const [activeFilter, setActiveFilter] = useState('ALL')

  const filterTabs = useMemo(() => {
    const totalCount = tickets.length
    return [
      { id: 'ALL', label: 'Todos', dot: 'var(--text-muted)', count: totalCount },
      ...COLUMNS.map(col => ({
        id: col.id,
        label: col.label,
        dot: col.dot,
        count: tickets.filter((t: any) => t.status === col.id).length,
      })),
    ]
  }, [tickets])

  return (
    <div className="space-y-6">
      
      {/* ── Barra de Filtros Inteligentes (Tabs) ───────────────── */}
      <div 
        className="flex items-center gap-1 overflow-x-auto pb-1 border-b scrollbar-none"
        style={{ borderColor: 'var(--border)' }}
      >
        {filterTabs.map(tab => {
          const isActive = activeFilter === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className="group flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all relative shrink-0"
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                background: isActive ? 'var(--surface, rgba(255,255,255,0.05))' : 'transparent'
              }}
              onMouseEnter={e => !isActive && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span 
                className="w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125"
                style={{ 
                  background: tab.dot,
                  boxShadow: isActive ? `0 0 6px ${tab.dot}aa` : 'none' 
                }}
              />
              {tab.label}
              <span 
                className="text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-semibold"
                style={{ 
                  background: isActive ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.04)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
              >
                {tab.count}
              </span>
              {isActive && (
                <div 
                  className="absolute bottom-[-5px] left-2 right-2 h-0.5 rounded-t-full"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Listagem Agrupada por Status ───────────────────────── */}
      <div className="space-y-6">
        {COLUMNS.map(col => {
          if (activeFilter !== 'ALL' && activeFilter !== col.id) return null

          const group = tickets.filter((t: any) => t.status === col.id)
          if (!isLoading && group.length === 0) return null

          return (
            <div key={col.id} className="space-y-2">
              {/* Header do grupo */}
              <div className="flex items-center gap-2 px-1">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: col.dot, boxShadow: `0 0 6px ${col.dot}99` }}
                />
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {col.label}
                </span>
                <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {group.length}
                </span>
                <div className="flex-1 h-px opacity-40" style={{ background: 'var(--border)' }} />
              </div>

              {/* Lista Interna Tabela */}
              <div 
                className="rounded-xl overflow-hidden border transition-all" 
                style={{ borderColor: 'var(--border)', background: 'var(--surface-card, rgba(255,255,255,0.01))' }}
              >
                {isLoading
                  ? [...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 px-4 py-3.5 animate-pulse border-b"
                        style={{ borderColor: 'var(--border)', background: 'transparent' }}
                      >
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="w-2/5 h-3 rounded opacity-10 bg-current" />
                          <div className="w-1/4 h-2.5 rounded opacity-10 bg-current" />
                        </div>
                        <div className="w-16 h-4 rounded-full opacity-10 bg-current" />
                      </div>
                    ))
                  : group.map((ticket: any, idx: number) => {
                      const p = PRIORITY[ticket.priority] ?? PRIORITY.LOW
                      const isLast = idx === group.length - 1

                      return (
                        <Link
                          key={ticket.id}
                          to={`/tickets/${ticket.id}`}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 transition-all duration-150"
                          style={{
                            background: 'transparent',
                            borderBottom: isLast ? 'none' : '1px solid var(--border)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover, rgba(255,255,255,0.03))'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          {/* Lado Esquerdo */}
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[13px] font-medium truncate group-hover:text-[var(--text-primary)] transition-colors"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {ticket.title}
                            </p>
                            <div className="flex items-center flex-wrap gap-3 mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                              <span className="font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--gold-accent)' }}>
                                {ticket.category.name}
                              </span>
                              {ticket.location && (
                                <span className="flex items-center gap-1 truncate max-w-[140px]">
                                  <MapPin size={11} className="shrink-0 opacity-60" />
                                  <span className="truncate">{ticket.location}</span>
                                </span>
                              )}
                              <span className="flex items-center gap-1 truncate max-w-[120px]">
                                <User size={11} className="opacity-60 shrink-0" />
                                <span className="truncate">{ticket.createdBy.name}</span>
                              </span>
                            </div>
                          </div>

                          {/* Lado Direito */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                            <span
                              className="text-[10px] font-medium px-2.5 py-0.5 rounded-full border shrink-0"
                              style={{ 
                                background: p.bg, 
                                color: p.color,
                                borderColor: p.color === 'var(--text-muted)' ? 'var(--border)' : 'transparent'
                              }}
                            >
                              {p.label}
                            </span>

                            <span
                              className="flex items-center gap-1 text-[11px] font-medium min-w-[32px] justify-end"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              <MessageSquare size={12} className="opacity-60" />
                              <span className="tabular-nums">{ticket.comments?.length ?? 0}</span>
                            </span>

                            <div className="w-3 h-3 flex items-center justify-center">
                              <ArrowUpRight
                                size={13}
                                className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[var(--accent)] shrink-0"
                              />
                            </div>
                          </div>
                        </Link>
                      )
                    })}
              </div>
            </div>
          )
        })}

        {/* Estado Vazio */}
        {!isLoading && activeFilter !== 'ALL' && tickets.filter((t: any) => t.status === activeFilter).length === 0 && (
          <div 
            className="flex flex-col items-center justify-center text-center py-12 gap-1.5"
            style={{ color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '12px' }}
          >
            <Inbox size={16} className="opacity-50" />
            <p className="text-xs font-medium">Nenhum chamado nesta etapa</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PAGE PRINCIPAL ───────────────────────────────────────────────────────────
export function TicketsPage() {
  const ticketView = useViewStore(s => s.ticketView)

  const { data, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketService.list(),
  })

  const total = data?.tickets.length ?? 0

  return (
    <div className="p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Quadro de Chamados
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {isLoading ? 'Carregando…' : `${total} chamado${total !== 1 ? 's' : ''} no total`}
          </p>
        </div>

        <Link
          to="/tickets/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-white transition-all shadow-md shrink-0"
          style={{ background: 'var(--accent)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
        >
          <Plus size={14} />
          Novo Chamado
        </Link>
      </div>

      {/* Conteúdo */}
      {ticketView === 'kanban'
        ? <KanbanView data={data} isLoading={isLoading} />
        : <ListView data={data} isLoading={isLoading} />
      }
    </div>
  )
}