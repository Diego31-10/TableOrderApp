import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabaseClient';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, name: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (msg.includes('already registered') || msg.includes('already been registered'))
    return 'Este correo ya tiene una cuenta registrada.';
  if (msg.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('Unable to validate email') || msg.includes('invalid email'))
    return 'Correo electrónico inválido.';
  if (msg.includes('Email not confirmed') || msg.includes('email_not_confirmed'))
    return 'Debes confirmar tu correo antes de iniciar sesión.';
  if (msg.includes('over_email_send_rate_limit') || msg.includes('rate limit'))
    return 'Demasiados intentos. Espera un momento e intenta de nuevo.';
  return `Ocurrió un error: ${msg}`;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, initialized: true });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });
    return error ? translateError(error.message) : null;
  },

  signUp: async (email, password, name) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    set({ loading: false });
    if (error) return translateError(error.message);
    // Usuario creado pero la confirmación de email está activada en Supabase.
    // Retorna este marker para que la UI muestre el mensaje apropiado.
    if (data.user && !data.session) return 'CONFIRM_EMAIL';
    return null;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
