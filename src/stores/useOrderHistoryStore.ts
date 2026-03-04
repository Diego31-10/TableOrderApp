/**
 * Order History Store
 * Persists the last MAX_ORDERS completed orders to AsyncStorage.
 * Each order snapshot is self-contained — no references to other stores.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from '@/src/lib/core/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'tableorder:order_history';
const MAX_ORDERS = 20;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderRecord {
  id: string;
  paidAt: string;
  serviceType: 'TABLE' | 'DELIVERY';
  tableName?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  shippingCost: number;
  grandTotal: number;
}

interface OrderHistoryState {
  orders: OrderRecord[];
  isLoaded: boolean;
  loadHistory: () => Promise<void>;
  saveOrder: (order: Omit<OrderRecord, 'id' | 'paidAt'>) => Promise<void>;
  clearHistory: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateOrderId(): string {
  return `TO-${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

async function persistOrders(orders: OrderRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('[OrderHistory] Failed to persist orders:', err);
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useOrderHistoryStore = create<OrderHistoryState>((set, get) => ({
  orders: [],
  isLoaded: false,

  loadHistory: async () => {
    if (get().isLoaded) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: OrderRecord[] = raw ? JSON.parse(raw) : [];
      set({ orders: parsed, isLoaded: true });
    } catch (err) {
      console.error('[OrderHistory] Failed to load history:', err);
      set({ isLoaded: true });
    }
  },

  saveOrder: async (orderData) => {
    const newOrder: OrderRecord = {
      ...orderData,
      id: generateOrderId(),
      paidAt: new Date().toISOString(),
    };
    const updated = [newOrder, ...get().orders].slice(0, MAX_ORDERS);
    set({ orders: updated });
    await persistOrders(updated);
  },

  clearHistory: async () => {
    set({ orders: [] });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('[OrderHistory] Failed to clear history:', err);
    }
  },
}));