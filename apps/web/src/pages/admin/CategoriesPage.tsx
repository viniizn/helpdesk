import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { Button }  from '@/components/ui/button'
import { Input }   from '@/components/ui/input'
import { Label }   from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { adminService } from '@/services/admin.service'

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
    onError: (err: any) => {
      alert(err.response?.data?.message ?? 'Erro ao remover categoria')
    },
  })

  if (isLoading) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Categorias</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Nova categoria</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Infraestrutura"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Ex: Servidores, redes, VPN"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => create.mutate(form)}
                disabled={!form.name || create.isPending}
              >
                {create.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium">Descrição</th>
              <th className="text-left p-3 font-medium">Chamados</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories?.map(cat => (
              <tr key={cat.id} className="hover:bg-muted/30">
                <td className="p-3 font-medium">{cat.name}</td>
                <td className="p-3 text-muted-foreground">{cat.description ?? '—'}</td>
                <td className="p-3 text-muted-foreground">{cat._count.tickets}</td>
                <td className="p-3 text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove.mutate(cat.id)}
                    disabled={remove.isPending}
                  >
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}