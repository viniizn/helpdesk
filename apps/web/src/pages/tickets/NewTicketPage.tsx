import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ticketService } from '@/services/ticket.service'
import { useAuthStore }  from '@/stores/auth.store'

const MIN_DESCRIPTION = 20

export function NewTicketPage() {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const user         = useAuthStore(s => s.user)

  const [form, setForm] = useState({
    title:       '',
    description: '',
    priority:    'MEDIUM',
    categoryId:  '',
    location:    user?.location ?? '',
  })

  const descriptionLength  = form.description.length
  const isDescriptionValid = descriptionLength >= MIN_DESCRIPTION

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
    mutation.mutate(form)
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/tickets')}
        className="group flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
        Voltar para a lista
      </button>

      <div>
        <h2 className="text-xl font-semibold tracking-tight">Criar Nova Tarefa</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Abertura de chamados internos de suporte técnico.</p>
      </div>

      <div className="border rounded-xl bg-card shadow-sm p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">O que precisa ser feito? (Título)</Label>
            <Input
              placeholder="Ex: Erro ao carregar faturamento ou Teclado quebrado"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
              className="focus-visible:ring-1 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Detalhes adicionais</Label>
              <span className={`text-xs ${
                isDescriptionValid ? 'text-muted-foreground' : 'text-destructive'
              }`}>
                {descriptionLength}/{MIN_DESCRIPTION}
              </span>
            </div>
            <Textarea
              placeholder="Descreva o problema com o máximo de detalhes possível, incluindo passos para reproduzir ou logs de erro..."
              rows={5}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
              className={`resize-none focus-visible:ring-1 text-sm ${
                form.description.length > 0 && !isDescriptionValid
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }`}
            />
            {form.description.length > 0 && !isDescriptionValid && (
              <p className="text-xs text-destructive">
                Descreva o problema com mais detalhes (mínimo {MIN_DESCRIPTION} caracteres)
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Local do atendimento</Label>
            <Input
              placeholder="Ex: Sala 12, 2º andar"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="focus-visible:ring-1 text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              {user?.secretariat && user?.department
                ? `${user.secretariat} · ${user.department}`
                : 'Complete seu perfil para preencher automaticamente'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nível de urgência</Label>
              <Select
                value={form.priority}
                onValueChange={v => setForm(f => ({ ...f, priority: v }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-sm">
                  <SelectItem value="LOW">Baixa</SelectItem>
                  <SelectItem value="MEDIUM">Média</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="CRITICAL">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Contexto / Categoria</Label>
              <Select
                value={form.categoryId}
                onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}
              >
                <SelectTrigger className="text-sm">
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

          <div className="flex items-center gap-3 pt-3 justify-end border-t border-dashed mt-6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full text-xs px-4 text-muted-foreground"
              onClick={() => navigate('/tickets')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-full text-xs px-4"
              disabled={mutation.isPending || !isDescriptionValid || !form.title}
            >
              {mutation.isPending ? 'Criando...' : 'Criar tarefa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}