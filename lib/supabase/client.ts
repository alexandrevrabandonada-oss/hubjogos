/**
 * Supabase Client
 * Inicialização segura e tratamento de ausência de envs
 * 
 * O app pode funcionar sem Supabase conectado neste estágio.
 * Features que dependem de banco serão criadas em tijolos futuros.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Flag para verificar se Supabase está configurado
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Get Supabase client singleton
 * Retorna null se não configurado
 */
export function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    console.warn(
      '⚠️  Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}

export default getSupabaseClient;
