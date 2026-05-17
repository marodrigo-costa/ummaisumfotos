-- Tabela de galerias
CREATE TABLE IF NOT EXISTS public.galleries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  smugmug_link TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;

-- Política: clientes podem ver suas próprias galerias
CREATE POLICY "client_view_own_galleries" ON public.galleries
  FOR SELECT USING (auth.uid() = client_id);

-- Política: admins podem tudo
CREATE POLICY "admin_all_galleries" ON public.galleries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );
