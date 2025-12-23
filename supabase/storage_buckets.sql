-- ============================================
-- DEZAPEGÃO - STORAGE BUCKETS
-- Aplicar no Supabase SQL Editor
-- ============================================

-- ============================================
-- CRIAR BUCKETS
-- ============================================

-- Bucket para avatares de usuários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars', 
    'avatars', 
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Bucket para imagens de anúncios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'listings', 
    'listings', 
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ============================================
-- POLÍTICAS DE STORAGE - AVATARS
-- ============================================

-- Avatares são públicos para leitura
DROP POLICY IF EXISTS "Avatares são públicos" ON storage.objects;
CREATE POLICY "Avatares são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Usuário pode fazer upload do próprio avatar
DROP POLICY IF EXISTS "Upload próprio avatar" ON storage.objects;
CREATE POLICY "Upload próprio avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuário pode atualizar próprio avatar
DROP POLICY IF EXISTS "Atualiza próprio avatar" ON storage.objects;
CREATE POLICY "Atualiza próprio avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuário pode deletar próprio avatar
DROP POLICY IF EXISTS "Deleta próprio avatar" ON storage.objects;
CREATE POLICY "Deleta próprio avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- POLÍTICAS DE STORAGE - LISTINGS
-- ============================================

-- Imagens de anúncios são públicas
DROP POLICY IF EXISTS "Imagens anúncios são públicas" ON storage.objects;
CREATE POLICY "Imagens anúncios são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings');

-- Usuário autenticado pode fazer upload
DROP POLICY IF EXISTS "Upload imagem anúncio" ON storage.objects;
CREATE POLICY "Upload imagem anúncio"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'listings' 
    AND auth.uid() IS NOT NULL
);

-- Usuário pode deletar suas imagens
DROP POLICY IF EXISTS "Deleta imagem anúncio" ON storage.objects;
CREATE POLICY "Deleta imagem anúncio"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'listings' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- MENSAGEM DE SUCESSO
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE 'Storage buckets e políticas configurados!';
END $$;
