import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'blue'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>((set) => {
  // Pega o tema salvo ou usa 'dark' como padrão
  const savedTheme = (localStorage.getItem('app-theme') as Theme) || 'dark'
  
  // Aplica o atributo direto no HTML na inicialização do app
  document.documentElement.setAttribute('data-theme', savedTheme)

  return {
    theme: savedTheme,
    setTheme: (theme) => {
      localStorage.setItem('app-theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
      set({ theme })
    },
  }
})