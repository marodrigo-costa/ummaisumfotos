-- Adiciona campos para apuração de receita nos agendamentos
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS scheduled_value NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS realized_value NUMERIC(10, 2) DEFAULT 0;

-- Comentários para documentação
COMMENT ON COLUMN bookings.scheduled_value IS 'Valor previsto/programado para o ensaio';
COMMENT ON COLUMN bookings.realized_value IS 'Valor efetivamente realizado/pago após o ensaio';
