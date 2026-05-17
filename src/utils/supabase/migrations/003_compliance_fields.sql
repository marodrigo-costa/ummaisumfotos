-- 1. Adicionar colunas de compliance e consentimento LGPD
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS accept_terms BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_marketing BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_notifications BOOLEAN DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN profiles.accept_terms IS 'Obrigatório: Aceite dos termos de uso e política de privacidade (LGPD).';
COMMENT ON COLUMN profiles.allow_marketing IS 'Opcional: Autorização para uso de imagem em portfólio e divulgação do estúdio.';
COMMENT ON COLUMN profiles.allow_notifications IS 'Opcional: Aceite para receber notificações sobre novos ensaios e promoções.';
