import { create } from 'zustand';
import { TableData } from '@/src/lib/core/types';
import { TABLES_DATA } from '@/src/lib/core/mockData';

interface TableState {
  currentTable: TableData | null;
  isSessionActive: boolean;
  setTable: (id: string) => void;
  clearSession: () => void;
}

export const useTableStore = create<TableState>((set) => ({
  currentTable: null,
  isSessionActive: false,

  setTable: (id: string) => {
    const table = TABLES_DATA[id] ?? null;
    set({ currentTable: table, isSessionActive: table !== null });
  },

  clearSession: () => {
    set({ currentTable: null, isSessionActive: false });
  },
}));
