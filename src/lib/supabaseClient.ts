import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Storage en memoria — no requiere módulos nativos.
// La sesión se mantiene mientras la app está abierta.
// Cambiar a AsyncStorage después del rebuild para persistencia total.
const store = new Map<string, string>();
const MemoryStorage = {
  getItem:    (key: string) => Promise.resolve(store.get(key) ?? null),
  setItem:    (key: string, value: string) => { store.set(key, value); return Promise.resolve(); },
  removeItem: (key: string) => { store.delete(key); return Promise.resolve(); },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: MemoryStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
