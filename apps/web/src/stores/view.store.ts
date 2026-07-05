import { create } from 'zustand'

export type TicketView = 'kanban' | 'list'

interface ViewState {
  ticketView: TicketView
  setTicketView: (view: TicketView) => void
}

export const useViewStore = create<ViewState>((set) => {
  // Pega a view salva ou usa 'kanban' como padrão
  const savedView = (localStorage.getItem('ticket-view') as TicketView) || 'kanban'

  return {
    ticketView: savedView,
    setTicketView: (view) => {
      localStorage.setItem('ticket-view', view)
      set({ ticketView: view })
    },
  }
})