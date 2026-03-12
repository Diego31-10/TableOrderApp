import { create } from 'zustand';
import { OrderRecord } from '@/src/lib/core/types';

interface OrderHistoryState {
  orders: OrderRecord[];
  addOrder: (order: OrderRecord) => void;
  clearHistory: () => void;
}

export const useOrderHistoryStore = create<OrderHistoryState>((set, get) => ({
  orders: [],

  addOrder: (order) => {
    set({ orders: [order, ...get().orders] });
  },

  clearHistory: () => set({ orders: [] }),
}));