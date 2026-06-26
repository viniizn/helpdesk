import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminService } from '@/services/admin.service'

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn:  adminService.getDashboard,
  })

  if (isLoading) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',        value: data?.tickets.total },
          { label: 'Abertos',      value: data?.tickets.open },
          { label: 'Em andamento', value: data?.tickets.inProgress },
          { label: 'Resolvidos',   value: data?.tickets.resolved },
        ].map(item => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{item.value ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tempo médio */}
      {data?.avgResolutionHours !== null && (
        <Card className="max-w-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo médio de resolução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.avgResolutionHours}h</p>
          </CardContent>
        </Card>
      )}

      {/* Por categoria */}
      <div>
        <h3 className="font-medium mb-3">Chamados por categoria</h3>
        <div className="space-y-2">
          {data?.byCategory.map((c: { category: string; count: number }) => (
            <div key={c.category} className="flex items-center gap-3">
              <span className="text-sm w-36 truncate">{c.category}</span>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${(c.count / (data?.tickets.total || 1)) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-6 text-right">
                {c.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}