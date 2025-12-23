-- ============================================
-- DEZAPEGÃO - RLS POLICIES
-- Aplicar APÓS o schema.sql
-- ============================================

-- ============================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================

-- Qualquer um pode ver perfis ativos
DROP POLICY IF EXISTS "Perfis ativos são públicos" ON profiles;
CREATE POLICY "Perfis ativos são públicos"
ON profiles FOR SELECT
USING (status = 'active');

-- Usuário pode editar próprio perfil
DROP POLICY IF EXISTS "Usuário edita próprio perfil" ON profiles;
CREATE POLICY "Usuário edita próprio perfil"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Usuário pode criar próprio perfil (após signup)
DROP POLICY IF EXISTS "Usuário cria próprio perfil" ON profiles;
CREATE POLICY "Usuário cria próprio perfil"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- LISTINGS
-- ============================================

-- Anúncios ativos são públicos
DROP POLICY IF EXISTS "Anúncios ativos são públicos" ON listings;
CREATE POLICY "Anúncios ativos são públicos"
ON listings FOR SELECT
USING (status = 'active');

-- Dono vê todos os seus anúncios (qualquer status)
DROP POLICY IF EXISTS "Dono vê próprios anúncios" ON listings;
CREATE POLICY "Dono vê próprios anúncios"
ON listings FOR SELECT
USING (auth.uid() = user_id);

-- Usuário autenticado pode criar anúncio
DROP POLICY IF EXISTS "Usuário cria anúncio" ON listings;
CREATE POLICY "Usuário cria anúncio"
ON listings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Dono pode editar próprio anúncio
DROP POLICY IF EXISTS "Dono edita anúncio" ON listings;
CREATE POLICY "Dono edita anúncio"
ON listings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Dono pode deletar próprio anúncio
DROP POLICY IF EXISTS "Dono deleta anúncio" ON listings;
CREATE POLICY "Dono deleta anúncio"
ON listings FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- LISTING_IMAGES
-- ============================================

-- Imagens são públicas se o anúncio existir
DROP POLICY IF EXISTS "Imagens são públicas" ON listing_images;
CREATE POLICY "Imagens são públicas"
ON listing_images FOR SELECT
USING (true);

-- Dono do anúncio pode gerenciar imagens
DROP POLICY IF EXISTS "Dono gerencia imagens" ON listing_images;
CREATE POLICY "Dono gerencia imagens"
ON listing_images FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM listings 
        WHERE listings.id = listing_images.listing_id 
        AND listings.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Dono deleta imagens" ON listing_images;
CREATE POLICY "Dono deleta imagens"
ON listing_images FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM listings 
        WHERE listings.id = listing_images.listing_id 
        AND listings.user_id = auth.uid()
    )
);

-- ============================================
-- LIKES
-- ============================================

-- Likes são públicos (para contagem)
DROP POLICY IF EXISTS "Likes são públicos" ON likes;
CREATE POLICY "Likes são públicos"
ON likes FOR SELECT
USING (true);

-- Usuário autenticado pode dar like
DROP POLICY IF EXISTS "Usuário dá like" ON likes;
CREATE POLICY "Usuário dá like"
ON likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Usuário pode remover próprio like
DROP POLICY IF EXISTS "Usuário remove like" ON likes;
CREATE POLICY "Usuário remove like"
ON likes FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- ANALYTICS_EVENTS
-- ============================================

-- Qualquer um pode criar evento (inclusive anônimo)
DROP POLICY IF EXISTS "Eventos podem ser criados" ON analytics_events;
CREATE POLICY "Eventos podem ser criados"
ON analytics_events FOR INSERT
WITH CHECK (true);

-- Dono do anúncio pode ver analytics
DROP POLICY IF EXISTS "Dono vê analytics" ON analytics_events;
CREATE POLICY "Dono vê analytics"
ON analytics_events FOR SELECT
USING (
    listing_id IS NULL OR
    EXISTS (
        SELECT 1 FROM listings 
        WHERE listings.id = analytics_events.listing_id 
        AND listings.user_id = auth.uid()
    )
);

-- ============================================
-- REPORTS
-- ============================================

-- Usuário autenticado pode criar denúncia
DROP POLICY IF EXISTS "Usuário cria denúncia" ON reports;
CREATE POLICY "Usuário cria denúncia"
ON reports FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Usuário vê próprias denúncias
DROP POLICY IF EXISTS "Usuário vê próprias denúncias" ON reports;
CREATE POLICY "Usuário vê próprias denúncias"
ON reports FOR SELECT
USING (auth.uid() = reporter_id);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

-- Usuário vê própria assinatura
DROP POLICY IF EXISTS "Usuário vê assinatura" ON subscriptions;
CREATE POLICY "Usuário vê assinatura"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Apenas sistema pode inserir/atualizar (via service role)
-- Políticas de INSERT/UPDATE serão via service_role key nos webhooks

-- ============================================
-- ONBOARDING_RESPONSES
-- ============================================

-- Usuário gerencia próprio onboarding
DROP POLICY IF EXISTS "Usuário gerencia onboarding" ON onboarding_responses;
CREATE POLICY "Usuário gerencia onboarding"
ON onboarding_responses FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- MENSAGEM DE SUCESSO
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE 'Políticas RLS aplicadas com sucesso!';
END $$;
