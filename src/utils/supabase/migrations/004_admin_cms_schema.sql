-- Add is_admin to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 1. Table for Services (Studio Shoots)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table for Dynamic Landing Page Content
CREATE TABLE IF NOT EXISTS public.landing_content (
    key TEXT PRIMARY KEY, -- e.g., 'hero_section', 'studio_story'
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Table for Thematic Sessions
CREATE TABLE IF NOT EXISTS public.thematic_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    cover_image_url TEXT,
    highlight_images TEXT[] DEFAULT '{}',
    total_slots INTEGER DEFAULT 0,
    available_slots INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Table for Session Plans (Linked to Thematic Sessions)
CREATE TABLE IF NOT EXISTS public.session_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.thematic_sessions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    photo_quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES

-- Services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Landing Content
ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view landing content" ON public.landing_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage landing content" ON public.landing_content FOR ALL USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Thematic Sessions
ALTER TABLE public.thematic_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active thematic sessions" ON public.thematic_sessions FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage thematic sessions" ON public.thematic_sessions FOR ALL USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Session Plans
ALTER TABLE public.session_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view plans" ON public.session_plans FOR SELECT USING (true);
CREATE POLICY "Admins can manage plans" ON public.session_plans FOR ALL USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Function to handle available slots update (Trigger example for later)
-- We will implement this when we have the booking system.
