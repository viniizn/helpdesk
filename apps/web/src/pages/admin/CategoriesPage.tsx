import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Plus } from 'lucide-react'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { adminService } from '@/services/admin.service'

const inputStyle: React.CSSProperties = {
  background: 'var(--background)',
  borderColor: 'var(--border)',
  color: 'var(--text-primary)',
}

export function CategoriesPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn:  adminService.getCategories,
  })

  const create = useMutation({
    mutationFn: adminService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      setOpen(false)
      setForm({ name: '', description: '' })
    },
  })

  const remove = useMutation({
    mutationFn: adminService.deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  })

  if (isLoading) return (
    <div className="p-6 text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>
      Carregando...
    </div>
  )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">

      {/* Cabeçalho */}
      <div
        className="flex items-center justify-between pb-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h2 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Categorias
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Estrutura de organização dos chamados.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              <Plus size={13} /> Nova categoria
            </button>
          </DialogTrigger>
          <DialogContent style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Nova categoria
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Nome</Label>
                <Input
                  style={inputStyle}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Infraestrutura"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Descrição (opcional)
                </Label>
                <Input
                  style={inputStyle}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Ex: Servidores e redes"
                />
              </div>
              <button
                className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40"
                style={{ background: 'var(--accent)' }}
                onClick={() => create.mutate(form)}
                disabled={!form.name || create.isPending}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
              >
                {create.isPending ? 'Criando...' : 'Criar categoria'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map(cat => (
          <div
            key={cat.id}
            className="group rounded-xl p-5 flex flex-col justify-between transition-colors min-h-[120px]"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {cat.name}
                </h3>
                <span
                  className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold shrink-0"
                  style={{ background: 'var(--gold-subtle)', color: 'var(--gold-accent)' }}
                >
                  {cat._count.tickets} chamados
                </span>
              </div>
              <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {cat.description ?? 'Sem descrição fornecida.'}
              </p>
            </div>

            {/* Excluir */}
            <div
              className="flex justify-end pt-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <button
                onClick={() => remove.mutate(cat.id)}
                disabled={remove.isPending}
                className="text-xs flex items-center gap-1 transition-colors disabled:opacity-40"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <Trash2 size={12} /> Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}