-- 1. Update Profiles with is_active flag
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Update Thematic Sessions with gallery images for the "O que rolou" feature
ALTER TABLE public.thematic_sessions
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';

-- 3. Create Bookings (Agendamentos) Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT, -- Restringe deletar perfil se houver agendamento
    plan_id UUID REFERENCES public.session_plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'pendente', -- pendente, confirmado, fotografado, disponibilizado
    booking_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES FOR BOOKINGS

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Clients can view their own bookings
CREATE POLICY "Clients can view own bookings" ON public.bookings FOR SELECT 
USING (client_id = auth.uid());

-- Clients can insert their own bookings
CREATE POLICY "Clients can insert own bookings" ON public.bookings FOR INSERT 
WITH CHECK (client_id = auth.uid());

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL 
USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- 4. Criar view ou função helper para trazer contagem rápida de stats de clientes (Opcional, mas útil para o CRM)
-- Vamos criar uma view que cruza perfis com agendamentos para acesso rápido no admin
CREATE OR REPLACE VIEW public.admin_client_stats AS
SELECT 
    p.id as client_id,
    COUNT(b.id) as total_bookings,
    SUM(CASE WHEN b.status = 'pendente' THEN 1 ELSE 0 END) as pending_bookings
FROM public.profiles p
LEFT JOIN public.bookings b ON p.id = b.client_id
GROUP BY p.id;
