-- 1. Tornar e-mail opcional (caso o cliente não queira fornecer)
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;

-- 2. Adicionar as colunas necessárias para o WhatsApp Auth e Biometria
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS passkey_registered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_access_token TEXT,
  ADD COLUMN IF NOT EXISTS first_access_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS temp_password_hash TEXT,
  ADD COLUMN IF NOT EXISTS temp_password_expires_at TIMESTAMPTZ;

-- 3. (Opcional) Adicionar índice para acelerar busca por telefone no login
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
