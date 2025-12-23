-- ⚠️ SCRIPT DE RESET GERAL DO DEZAPEGÃO ⚠️
-- Execute com cuidado! Isso vai apagar TODOS os dados.

-- 1. Limpar tabelas dependentes (cascata garante, mas bom ser explícito)
TRUNCATE TABLE "listings" CASCADE;
TRUNCATE TABLE "listing_images" CASCADE;
TRUNCATE TABLE "likes" CASCADE;
TRUNCATE TABLE "reports" CASCADE;
TRUNCATE TABLE "analytics_events" CASCADE;
TRUNCATE TABLE "subscriptions" CASCADE;
TRUNCATE TABLE "onboarding_responses" CASCADE;

-- 2. Limpar perfis (deleta dados de usuários)
TRUNCATE TABLE "profiles" CASCADE;

-- 3. Para apagar usuários do sistema de Auth (requer permissão especial/admin)
-- Se você rodar apenas as linhas acima, os usuários ainda existirão no Auth,
-- mas estarão "quebrados" (sem perfil). O app vai tentar criar perfil novo no login.

-- PARA RESET COMPLETO (Apaga logins):
-- DELETE FROM auth.users;

-- ⚠️ NOTA: Se deletar auth.users, você precisa criar conta novamente com email/senha.
