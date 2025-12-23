-- Seed Data para Testar Dezapegão
-- Execute no Supabase SQL Editor DEPOIS de rodar o schema.sql principal

-- IMPORTANTE: Substitua os IDs abaixo pelos IDs reais dos seus usuários
-- após criar contas via signup

-- Exemplos de anúncios para teste
-- Você precisará substituir 'USER_ID_AQUI' pelo ID real do usuário

-- Exemplo 1: Mesa de madeira
INSERT INTO public.listings (
  user_id,
  title,
  description,
  price,
  category,
  image_url,
  status,
  expires_at,
  likes_count,
  whatsapp_clicks
) VALUES (
  'USER_ID_AQUI', -- Substitua pelo seu user ID
  'Mesa de madeira maciça',
  'Mesa linda de madeira, semi-nova, comporta 6 pessoas. Perfeita para sala de jantar!',
  450.00,
  'moveis',
  'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=800',
  'active',
  NOW() + INTERVAL '24 hours',
  12,
  5
);

-- Exemplo 2: iPhone
INSERT INTO public.listings (
  user_id,
  title,
  description,
  price,
  category,
  image_url,
  status,
  expires_at,
  likes_count,
  whatsapp_clicks
) VALUES (
  'USER_ID_AQUI',
  'iPhone 12 Pro 128GB',
  'iPhone em ótimo estado, sem arranhões, bateria 89%. Acompanha capa e carregador.',
  2800.00,
  'eletronicos',
  'https://images.unsplash.com/photo-1592286927505-ed6a5be4e0b6?w=800',
  'active',
  NOW() + INTERVAL '24 hours',
  25,
  15
);

-- Exemplo 3: Sofá
INSERT INTO public.listings (
  user_id,
  title,
  description,
  price,
  category,
  image_url,
  status,
  expires_at,
  likes_count,
  whatsapp_clicks
) VALUES (
  'USER_ID_AQUI',
  'Sofá 3 lugares cinza',
  'Sofá confortável, tecido de qualidade. Usado apenas 1 ano. Motivo da venda: mudança.',
  850.00,
  'moveis',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
  'active',
  NOW() + INTERVAL '24 hours',
  8,
  3
);

-- Exemplo 4: Bicicleta
INSERT INTO public.listings (
  user_id,
  title,
  description,
  price,
  category,
  image_url,
  status,
  expires_at,
  likes_count,
  whatsapp_clicks
) VALUES (
  'USER_ID_AQUI',
  'Bicicleta Caloi aro 29',
  'Bike zerada, freio a disco, câmbio Shimano 21 marchas. Ideal para trilhas.',
  1200.00,
  'esportes',
  'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800',
  'active',
  NOW() + INTERVAL '24 hours',
  18,
  9
);

-- Exemplo 5: Geladeira
INSERT INTO public.listings (
  user_id,
  title,
  description,
  price,
  category,
  image_url,
  status,
  expires_at,
  likes_count,
  whatsapp_clicks
) VALUES (
  'USER_ID_AQUI',
  'Geladeira Brastemp Frost Free 400L',
  'Geladeira duplex, muito espaçosa, economia de energia. Funcionando perfeitamente.',
  1500.00,
  'eletrodomesticos',
  'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800',
  'active',
  NOW() + INTERVAL '24 hours',
  6,
  4
);

-- Exemplo 6: Tênis Nike
INSERT INTO public.listings (
  user_id,
  title,
  description,
  price,
  category,
  image_url,
  status,
  expires_at,
  likes_count,
  whatsapp_clicks
) VALUES (
  'USER_ID_AQUI',
  'Tênis Nike Air Max masculino 42',
  'Tênis original Nike, tamanho 42, usado poucas vezes. Muito conservado.',
  280.00,
  'roupas',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  'active',
  NOW() + INTERVAL '24 hours',
  20,
  11
);

-- Exemplo 7: Playstation 4
INSERT INTO public.listings (
  user_id,
  title,
  description,
  price,
  category,
  image_url,
  status,
  expires_at,
  likes_count,
  whatsapp_clicks
) VALUES (
  'USER_ID_AQUI',
  'PlayStation 4 Slim 1TB + 2 controles',
  'Console em perfeito estado com 2 controles originais e 5 jogos. Tudo funcionando.',
  1800.00,
  'eletronicos',
  'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
  'active',
  NOW() + INTERVAL '24 hours',
  32,
  16
);

-- Exemplo 8: Berço
INSERT INTO public.listings (
  user_id,
  title,
  description,
  price,
  category,
  image_url,
  status,
  expires_at,
  likes_count,
  whatsapp_clicks
) VALUES (
  'USER_ID_AQUI',
  'Berço de bebê branco com colchão',
  'Berço de madeira maciça, pintado de branco. Acompanha colchão novo. Muito conservado.',
  400.00,
  'brinquedos',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
  'active',
  NOW() + INTERVAL '24 hours',
  14,
  8
);

-- NOTA: Para usar este seed:
-- 1. Crie uma conta no app via /signup
-- 2. Pegue seu user_id no Supabase (Table Editor > profiles)
-- 3. Substitua 'USER_ID_AQUI' pelo ID real
-- 4. Execute no SQL Editor
