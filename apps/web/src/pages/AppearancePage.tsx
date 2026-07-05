import { useThemeStore } from '@/stores/theme.store'
import { useViewStore, type TicketView } from '@/stores/view.store'
import { cn } from '@/lib/utils'
import { Check, Sun, Moon, Palette, Droplets, Leaf, Flame, LayoutGrid, List } from 'lucide-react'

// ─── Paletas disponíveis ─────────────────────────────────────────────────────
const THEMES = [
  {
    id: 'light',
    label: 'Claro',
    description: 'Interface limpa com tons de slate',
    icon: Sun,
    preview: {
      bg: '#f8fafc',
      surface: '#f1f5f9',
      card: '#ffffff',
      accent: '#2563eb',
      text: '#0f172a',
      textMuted: '#94a3b8',
      sidebar: '#0f172a',
      sidebarText: '#94a3b8',
      gold: '#b45309',
    },
  },
  {
    id: 'dark',
    label: 'Escuro',
    description: 'Grafite profundo estilo Linear/Vercel',
    icon: Moon,
    preview: {
      bg: '#09090b',
      surface: '#141416',
      card: '#1c1c1e',
      accent: '#3f3f46',
      text: '#f4f4f5',
      textMuted: '#52525b',
      sidebar: '#09090b',
      sidebarText: '#a1a1aa',
      gold: '#f59e0b',
    },
  },
  {
    id: 'blue',
    label: 'Soho Waterworks',
    description: 'Azul petróleo com detalhes dourados',
    icon: Droplets,
    preview: {
      bg: '#083A4F',
      surface: '#103C4C',
      card: '#0a3345',
      accent: '#407E8C',
      text: '#E5E1DD',
      textMuted: '#7aa8b0',
      sidebar: '#072F40',
      sidebarText: '#8abcc4',
      gold: '#A58D66',
    },
  },
  {
    id: 'forest',
    label: 'Forest',
    description: 'Verde musgo com acentos âmbar',
    icon: Leaf,
    preview: {
      bg: '#0d1f0e',
      surface: '#132315',
      card: '#182c1a',
      accent: '#4a7c59',
      text: '#e8ede9',
      textMuted: '#6b8f73',
      sidebar: '#0a1a0b',
      sidebarText: '#7aab85',
      gold: '#c49a2e',
    },
  },
  {
    id: 'ember',
    label: 'Ember',
    description: 'Terracota quente com tons de cobre',
    icon: Flame,
    preview: {
      bg: '#1a0e0a',
      surface: '#231510',
      card: '#2c1a13',
      accent: '#c0540a',
      text: '#f2e8e4',
      textMuted: '#8f6a5e',
      sidebar: '#140b07',
      sidebarText: '#a07060',
      gold: '#d4923a',
    },
  },
  {
    id: 'violet',
    label: 'Violet Dusk',
    description: 'Roxo escuro minimalista com lilás',
    icon: Palette,
    preview: {
      bg: '#0f0d17',
      surface: '#17142a',
      card: '#1d1933',
      accent: '#7c5cfc',
      text: '#ede9ff',
      textMuted: '#6b5f8a',
      sidebar: '#0c0a14',
      sidebarText: '#8a7ab0',
      gold: '#e8a838',
    },
  },
]

// ─── Opções de visualização de chamados ──────────────────────────────────────
const VIEW_OPTIONS: { id: TicketView; label: string; description: string; icon: typeof LayoutGrid }[] = [
  {
    id: 'kanban',
    label: 'Kanban',
    description: 'Chamados em colunas por status, estilo quadro',
    icon: LayoutGrid,
  },
  {
    id: 'list',
    label: 'Lista',
    description: 'Chamados agrupados em tabela por status',
    icon: List,
  },
]

// ─── Mini Preview do Tema ────────────────────────────────────────────────────
function ThemePreview({ theme }: { theme: typeof THEMES[0] }) {
  const p = theme.preview
  return (
    <div
      className="w-full h-28 rounded-lg overflow-hidden flex"
      style={{ background: p.bg, border: `1px solid ${p.surface}` }}
    >
      {/* Sidebar mini */}
      <div
        className="w-10 flex flex-col items-center pt-2 gap-1.5 shrink-0"
        style={{ background: p.sidebar }}
      >
        <div className="w-4 h-4 rounded" style={{ background: p.accent }} />
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-6 h-1.5 rounded-sm"
            style={{ background: i === 0 ? p.sidebarText : `${p.sidebarText}44` }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-2 flex flex-col gap-1.5">
        {/* Topbar */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-1.5 rounded" style={{ background: `${p.text}66` }} />
          <div className="w-8 h-3 rounded" style={{ background: p.accent }} />
        </div>
        {/* Cards row */}
        <div className="flex gap-1.5 flex-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-md p-1 flex flex-col gap-1"
              style={{ background: p.surface }}
            >
              <div className="w-full h-1 rounded-sm" style={{ background: p.gold + '88' }} />
              <div className="w-3/4 h-1 rounded-sm" style={{ background: `${p.text}55` }} />
              <div className="w-1/2 h-1 rounded-sm" style={{ background: `${p.textMuted}66` }} />
              {i === 0 && (
                <div
                  className="w-full h-3 mt-auto rounded"
                  style={{ background: p.card, border: `1px solid ${p.accent}44` }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Mini Preview: Kanban ────────────────────────────────────────────────────
function KanbanViewPreview() {
  return (
    <div
      className="w-full h-24 rounded-lg overflow-hidden flex gap-1.5 p-2"
      style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
    >
      {[...Array(3)].map((_, col) => (
        <div
          key={col}
          className="flex-1 rounded-md p-1 flex flex-col gap-1"
          style={{ background: 'var(--surface)' }}
        >
          <div className="flex items-center gap-1 px-0.5 mb-0.5">
            <div className="w-1 h-1 rounded-full" style={{ background: 'var(--accent)' }} />
            <div className="w-6 h-1 rounded-sm" style={{ background: 'var(--text-muted)' }} />
          </div>
          {[...Array(col === 1 ? 3 : 2)].map((_, card) => (
            <div
              key={card}
              className="w-full rounded"
              style={{
                height: 10,
                background: 'var(--surface-card, rgba(255,255,255,0.03))',
                border: '1px solid var(--border)',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Mini Preview: Lista ─────────────────────────────────────────────────────
function ListViewPreview() {
  return (
    <div
      className="w-full h-24 rounded-lg overflow-hidden flex flex-col gap-1 p-2"
      style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
    >
      {[...Array(4)].map((_, row) => (
        <div
          key={row}
          className="flex items-center justify-between rounded-md px-2"
          style={{ background: 'var(--surface)', height: 18 }}
        >
          <div className="flex flex-col gap-1">
            <div
              className="h-1 rounded-sm"
              style={{ width: row % 2 === 0 ? 42 : 30, background: 'var(--text-secondary)' }}
            />
          </div>
          <div
            className="rounded-full"
            style={{ width: 16, height: 5, background: row === 1 ? 'var(--accent)' : 'var(--text-muted)', opacity: row === 1 ? 1 : 0.5 }}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Componente Principal ────────────────────────────────────────────────────
export function AppearancePage() {
  const { theme, setTheme } = useThemeStore()
  const { ticketView, setTicketView } = useViewStore()

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Aparência
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Escolha o tema visual e a forma de visualizar seus chamados. A alteração é aplicada imediatamente.
        </p>
      </div>

      {/* Seção de temas */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Paletas de Cores
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEMES.map((t) => {
            const Icon = t.icon
            const isActive = theme === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={cn(
                  'group relative text-left rounded-xl p-4 flex flex-col gap-3 transition-all duration-200',
                  isActive ? 'ring-2' : 'hover:ring-1'
                )}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  ringColor: isActive ? 'var(--accent)' : 'var(--border-strong)',
                  outline: isActive
                    ? '2px solid var(--accent)'
                    : '1px solid transparent',
                  outlineOffset: '0px',
                  boxShadow: isActive ? '0 0 0 2px var(--accent)' : undefined,
                }}
              >
                {/* Checkmark */}
                {isActive && (
                  <div
                    className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--accent)' }}
                  >
                    <Check size={11} color="#fff" strokeWidth={3} />
                  </div>
                )}

                {/* Preview visual */}
                <ThemePreview theme={t} />

                {/* Info */}
                <div className="flex items-start gap-2.5 pt-0.5">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: t.preview.accent + '22' }}
                  >
                    <Icon size={13} style={{ color: t.preview.accent }} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold leading-tight"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {t.label}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {t.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Seção de visualização de chamados */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Visualização de Chamados
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VIEW_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const isActive = ticketView === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setTicketView(opt.id)}
                className={cn(
                  'group relative text-left rounded-xl p-4 flex flex-col gap-3 transition-all duration-200',
                  isActive ? 'ring-2' : 'hover:ring-1'
                )}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  ringColor: isActive ? 'var(--accent)' : 'var(--border-strong)',
                  outline: isActive ? '2px solid var(--accent)' : '1px solid transparent',
                  outlineOffset: '0px',
                  boxShadow: isActive ? '0 0 0 2px var(--accent)' : undefined,
                }}
              >
                {/* Checkmark */}
                {isActive && (
                  <div
                    className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--accent)' }}
                  >
                    <Check size={11} color="#fff" strokeWidth={3} />
                  </div>
                )}

                {/* Preview visual */}
                {opt.id === 'kanban' ? <KanbanViewPreview /> : <ListViewPreview />}

                {/* Info */}
                <div className="flex items-start gap-2.5 pt-0.5">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'var(--accent)' + '22' }}
                  >
                    <Icon size={13} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                      {opt.label}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {opt.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Preview do tema ativo */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Tema Ativo
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <div
          className="rounded-xl p-5 flex flex-wrap gap-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {[
            { label: 'Fundo',       val: '--background' },
            { label: 'Superfície',  val: '--surface' },
            { label: 'Borda',       val: '--border' },
            { label: 'Texto',       val: '--text-primary' },
            { label: 'Secundário',  val: '--text-secondary' },
            { label: 'Mutado',      val: '--text-muted' },
            { label: 'Destaque',    val: '--accent' },
            { label: 'Dourado',     val: '--gold-accent' },
          ].map(({ label, val }) => (
            <div key={val} className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-md border"
                style={{
                  background: `var(${val})`,
                  borderColor: 'var(--border-strong)',
                }}
              />
              <div>
                <p className="text-[10px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {label}
                </p>
                <p className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {val}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}