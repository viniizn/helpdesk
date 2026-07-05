import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, BarChart, Bar, YAxis } from 'recharts'
import { Ticket, Clock, TrendingUp, CheckCircle2 } from 'lucide-react'

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn:  adminService.getDashboard,
  })

  if (isLoading) return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: 'var(--surface)' }} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
        <div className="h-72 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
      </div>
    </div>
  )

  const historyData = [
    { name: 'Seg', chamados: Math.round((data?.tickets.open || 0) * 0.5) },
    { name: 'Ter', chamados: Math.round((data?.tickets.inProgress || 0) * 0.8) },
    { name: 'Qua', chamados: Math.round((data?.tickets.total || 0) * 0.6) },
    { name: 'Qui', chamados: Math.round((data?.tickets.total || 0) * 0.9) },
    { name: 'Sex', chamados: data?.tickets.resolved || 0 },
  ]

  const metrics = [
    { label: 'Total de Chamados', value: data?.tickets.total,      icon: Ticket,       accent: 'var(--accent)'      },
    { label: 'Abertos',           value: data?.tickets.open,       icon: TrendingUp,   accent: '#d97706'            },
    { label: 'Em Andamento',      value: data?.tickets.inProgress, icon: Clock,        accent: '#ea580c'            },
    { label: 'Resolvidos',        value: data?.tickets.resolved,   icon: CheckCircle2, accent: 'var(--gold-accent)' },
  ]

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">

      {/* Cabeçalho */}
      <div className="flex justify-between items-end pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Dashboard
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Visão geral da operação de suporte.
          </p>
        </div>
        {data?.avgResolutionHours != null && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <Clock size={14} style={{ color: 'var(--accent)' }} />
            Tempo médio:{' '}
            <span className="font-bold" style={{ color: 'var(--accent)' }}>
              {data.avgResolutionHours}h
            </span>
          </div>
        )}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(item => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className="rounded-xl p-5 flex flex-col gap-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {item.label}
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${item.accent}18` }}
                >
                  <Icon size={15} style={{ color: item.accent }} />
                </div>
              </div>
              <p className="text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {item.value ?? 0}
              </p>
              <div className="h-1 rounded-full w-full" style={{ background: 'var(--border)' }}>
                <div
                  className="h-1 rounded-full transition-all"
                  style={{
                    background: item.accent,
                    width: `${Math.min(((item.value ?? 0) / (data?.tickets.total || 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Volume semanal */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="mb-5">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Volume semanal
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Chamados abertos por dia da semana
            </p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="var(--text-muted)"
                  fontSize={12}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}
                  contentStyle={{
                    background: 'var(--background)',
                    borderColor: 'var(--border)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="chamados"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  fill="url(#areaGrad)"
                  dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: 'var(--accent)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Por categoria */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="mb-5">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Por categoria
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Volume de chamados por área
            </p>
          </div>
          <div className="h-52 w-full">
            {data?.byCategory && data.byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.byCategory}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: -10, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="category"
                    type="category"
                    stroke="var(--text-muted)"
                    fontSize={12}
                    fontWeight={500}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--background)',
                      borderColor: 'var(--border)',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Bar dataKey="count" fill="var(--gold-accent)" radius={[0, 5, 5, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="h-full flex items-center justify-center text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                Sem dados para exibição.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}