import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  darkMode: boolean;
  toggleDarkMode: () => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      selectedOrderId: null,
      setSelectedOrderId: (id) => set({ selectedOrderId: id }),
    }),
    {
      name: 'zaqathon-app-storage',
      partialize: (state) => ({ darkMode: state.darkMode }),
    }
  )
);
