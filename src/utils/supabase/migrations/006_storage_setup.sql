-- 1. Criar o bucket para armazenar as fotos (se não existir)
-- Nota: Alguns ambientes Supabase exigem criação via Dashboard, mas as políticas abaixo são essenciais.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir que qualquer pessoa veja as fotos (Leitura Pública)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');

-- 3. Permitir que apenas Admins façam Upload
CREATE POLICY "Admins can upload images" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'images' AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
);

-- 4. Permitir que apenas Admins apaguem fotos
CREATE POLICY "Admins can delete images" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'images' AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
);
