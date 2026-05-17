-- Adiciona campos faltantes na tabela bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Comentários para documentação
COMMENT ON COLUMN public.bookings.service_id IS 'ID do serviço de estúdio (quando não é temático)';
COMMENT ON COLUMN public.bookings.end_date IS 'Data e hora prevista para o término do ensaio';
