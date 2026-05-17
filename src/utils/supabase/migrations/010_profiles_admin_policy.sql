-- 1. Remover a política recursiva anterior
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 2. Criar função auxiliar SECURITY DEFINER para evitar recursão infinita
-- Esta função ignora o RLS ao verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar a nova política usando a função auxiliar
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT
USING (
    id = auth.uid() -- O usuário sempre vê o próprio perfil
    OR 
    public.is_admin() -- Admins vêem tudo
);
