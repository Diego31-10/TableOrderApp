import { create } from 'zustand';
import { OrderRecord } from '@/src/lib/core/types';
import { supabase } from '@/src/lib/supabaseClient';

interface OrderHistoryState {
  orders: OrderRecord[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  addOrder: (order: Omit<OrderRecord, 'id'>) => Promise<void>;
  clearHistory: () => void;
}

export const useOrderHistoryStore = create<OrderHistoryState>((set) => ({
  orders: [],
  loading: false,

  fetchOrders: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, service_type, table_name, subtotal, discount, total, shipping_cost, created_at,
        order_items (product_id, name, price, quantity)
      `)
      .order('created_at', { ascending: false });

    if (error || !data) {
      set({ loading: false });
      return;
    }

    const orders: OrderRecord[] = (data as any[]).map((row) => ({
      id: row.id,
      timestamp: row.created_at,
      items: (row.order_items as any[]).map((item) => ({
        product: {
          id: item.product_id,
          name: item.name,
          price: item.price,
          category: 'FOOD' as const,
          image: '',
        },
        quantity: item.quantity,
      })),
      subtotal: row.subtotal,
      discount: row.discount,
      total: row.total,
      shippingCost: row.shipping_cost,
      serviceType: row.service_type as 'TABLE' | 'DELIVERY',
      tableName: row.table_name ?? undefined,
    }));

    set({ orders, loading: false });
  },

  addOrder: async (orderData) => {
    const tempId = `temp-${Date.now()}`;

    // Optimistic update — se muestra de inmediato en historial
    set((s) => ({ orders: [{ ...orderData, id: tempId }, ...s.orders] }));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        service_type: orderData.serviceType,
        table_name: orderData.tableName ?? null,
        subtotal: orderData.subtotal,
        discount: orderData.discount,
        total: orderData.total,
        shipping_cost: orderData.shippingCost,
      })
      .select('id')
      .single();

    if (error || !order) {
      console.error('[Orders] Insert failed:', error);
      return;
    }

    await supabase.from('order_items').insert(
      orderData.items.map((item) => ({
        order_id: (order as any).id,
        product_id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }))
    );

    // Reemplaza el ID temporal con el UUID real de Supabase
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === tempId ? { ...o, id: (order as any).id } : o
      ),
    }));
  },

  clearHistory: () => set({ orders: [] }),
}));
