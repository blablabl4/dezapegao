-- CRIAÇÃO E CORREÇÃO DO BUCKET DE AVATARES

-- 1. Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;

-- 3. Criar Políticas RLS

-- A. Visualização pública (Qualquer um pode ver avatar)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- B. Upload autenticado (Usuário logado pode subir qualquer arquivo na pasta dele ou geral)
-- Simplificado: Permitir upload autenticado no bucket avatars
CREATE POLICY "Authenticated Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- C. Update (Usuário pode atualizar seus próprios arquivos)
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid() = owner );

-- D. Delete (Usuário pode deletar seus próprios arquivos)
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid() = owner );
