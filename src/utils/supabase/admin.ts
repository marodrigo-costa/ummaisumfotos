import { createClient } from '@supabase/supabase-js'

/**
 * Cliente administrativo do Supabase que ignora o RLS.
 * Use APENAS no lado do servidor para operações sensíveis como 
 * gerenciamento de OTPs e criação de perfis.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
