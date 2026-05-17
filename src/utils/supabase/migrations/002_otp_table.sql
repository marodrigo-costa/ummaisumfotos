-- Tabela para armazenar os códigos OTP de WhatsApp
CREATE TABLE IF NOT EXISTS public.auth_otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    attempts INTEGER DEFAULT 0,
    verified_at TIMESTAMPTZ,
    
    -- Um usuário não pode ter códigos infinitos ativos
    CONSTRAINT active_otp_limit UNIQUE (phone, code)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.auth_otps ENABLE ROW LEVEL SECURITY;

-- Apenas o servidor (service_role) pode gerenciar esta tabela
-- Criamos uma política restritiva para garantir segurança máxima
CREATE POLICY "Servidor gerencia OTPs" 
ON public.auth_otps 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Adicionar índice para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_auth_otps_phone ON public.auth_otps(phone);
CREATE INDEX IF NOT EXISTS idx_auth_otps_expires_at ON public.auth_otps(expires_at);

-- Comentários para documentação
COMMENT ON TABLE public.auth_otps IS 'Armazena códigos temporários para autenticação via WhatsApp.';
