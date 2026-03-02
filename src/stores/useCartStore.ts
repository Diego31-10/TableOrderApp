import { create } from 'zustand';
import { CartItem, Product } from '@/src/lib/core/types';

interface CartState {
  items: CartItem[];
  isBirthdayMode: boolean;
  discount: number;
  total: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  resetCart: () => void;
  setBirthdayMode: (active: boolean, discount?: number) => void;
}

function calcTotal(items: CartItem[], discount: number): number {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  return parseFloat((subtotal * (1 - discount)).toFixed(2));
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isBirthdayMode: false,
  discount: 0,
  total: 0,

  addItem: (product: Product) => {
    const { items, discount } = get();
    const existing = items.find((i) => i.product.id === product.id);
    const updated = existing
      ? items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      : [...items, { product, quantity: 1 }];

    set({ items: updated, total: calcTotal(updated, discount) });
  },

  removeItem: (productId: string) => {
    const { items, discount } = get();
    const existing = items.find((i) => i.product.id === productId);
    if (!existing) return;

    const updated =
      existing.quantity === 1
        ? items.filter((i) => i.product.id !== productId)
        : items.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: i.quantity - 1 }
              : i
          );

    set({ items: updated, total: calcTotal(updated, discount) });
  },

  resetCart: () => {
    set({ items: [], total: 0, isBirthdayMode: false, discount: 0 });
  },

  setBirthdayMode: (active: boolean, discount = 0) => {
    const { items } = get();
    set({
      isBirthdayMode: active,
      discount: active ? discount : 0,
      total: calcTotal(items, active ? discount : 0),
    });
  },
}));
