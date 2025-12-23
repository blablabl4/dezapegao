# 🎯 Dezapegão MVP

Marketplace hiperlocal de desapego para Heliópolis/SP com feed tipo Instagram Stories.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie `.env.local.example` para `.env.local`:
```bash
cp .env.local.example .env.local
```
4. Preencha as variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto Supabase (Settings → API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon/Public Key (Settings → API)

### 3. Configure Database

1. No Supabase Dashboard, vá em **SQL Editor**
2. Execute o arquivo `supabase/schema.sql` completo
3. Isso criará:
   - ✅ Tabelas (profiles, listings, likes)
   - ✅ Triggers e functions
   - ✅ Row Level Security (RLS)
   - ✅ Storage bucket para imagens

### 4. Run Development Server
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## ✨ Features (MVP)

### Implementado ✅
- [x] Feed público tipo Stories (scroll vertical)
- [x] Autenticação (email/senha)
- [x] Criar anúncio (1 foto, 24h duração)
- [x] Sistema de curtidas
- [x] Botão WhatsApp direto
- [x] Dashboard de anúncios
- [x] Controle de limite (3 anúncios/mês - plano Free)
- [x] Mobile-responsive

### Próximas Fases 🔜
- [ ] Upload de 3 fotos por anúncio
- [ ] Integração Stripe (planos pagos)
- [ ] WhatsApp Bot automático (Meta Cloud API)
- [ ] Gamificação + ranking
- [ ] Sistema de inadimplência
- [ ] Busca e filtros

---

## 🗂️ Project Structure

```
dezapegao/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── dashboard/
│   │   ├── new/            # Create listing
│   │   └── page.tsx        # User dashboard
│   ├── api/
│   │   ├── listings/       # Listings CRUD
│   │   └── analytics/      # Track clicks
│   ├── page.tsx            # Homepage (feed)
│   └── layout.tsx          # Root layout
├── components/
│   ├── Feed/
│   │   ├── StoryCard.tsx   # Listing card
│   │   └── LikeButton.tsx  # Like component
│   └── Layout/
│       └── Header.tsx      # Navigation header
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client
│   │   └── server.ts       # Server client
│   ├── utils.ts            # Helper functions
│   └── validation.ts       # Zod schemas
├── types/
│   └── database.ts         # TypeScript types
├── supabase/
│   └── schema.sql          # Database schema
└── middleware.ts           # Auth middleware
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Form Validation:** Zod
- **Forms:** React Hook Form

---

## 🎨 Design Philosophy

1. **Mobile-first** - Público principal usa celular
2. **Zero fricção** - Máximo 3 cliques para anunciar
3. **Stories-style** - Scroll vertical, fullscreen
4. **Cores vibrantes** - UI engajante para comunidade

---

## 📚 Key Pages

### Homepage (`/`)
- Feed público com todos os anúncios ativos
- Ordenado por likes + data
- Acesso sem login (SEO-friendly)

### Login/Signup (`/login`, `/signup`)
- Autenticação simples com Supabase Auth
- Redirect automático após login

### Dashboard (`/dashboard`)
- Visão geral dos anúncios do usuário
- Estatísticas (curtidas, cliques WhatsApp)
- Limite de anúncios por plano

### Create Listing (`/dashboard/new`)
- Upload de 1 foto
- Validação em tempo real
- Preview antes de publicar

---

## 🔐 Authentication Flow

1. User acessa `/signup`
2. Cria conta (email, senha, username)
3. Supabase cria `auth.users` + trigger cria `profiles`
4. Redirect para homepage
5. Middleware protege rotas `/dashboard/*`

---

## 📊 Database Schema

### `profiles`
- `id` → FK para auth.users
- `username` → Nome único
- `phone` → WhatsApp (opcional)
- `plan` → free, basic, pro, premium
- `ads_count` → Contador mensal

### `listings`
- `user_id` → FK para profiles
- `title`, `description`, `price`, `category`
- `image_url` → Supabase Storage
- `likes_count`, `whatsapp_clicks` → Métricas
- `status` → active, expired, removed
- `expires_at` → created_at + 24h

### `likes`
- `user_id`, `listing_id`
- UNIQUE(user_id, listing_id) → 1 curtida por usuário

---

## 🚨 Important Notes

### Storage Setup
Certifique-se de que o bucket `listings` existe no Supabase Storage:
1. Storage → Create bucket
2. Name: `listings`
3. Public: ✅ Enabled

### RLS Policies
As policies estão no `schema.sql`. Se tiver problemas de permissão, verifique se foram aplicadas corretamente.

### Image Upload Limits
- **Tamanho:** Máx 5MB
- **Formatos:** JPG, PNG, WebP
- **Path:** `{user_id}/{timestamp}.{ext}`

---

## 🧪 Testing Checklist

- [ ] Criar conta nova
- [ ] Login 
- [ ] Criar anúncio (upload foto)
- [ ] Curtir anúncio (logado e deslogado)
- [ ] Clicar WhatsApp
- [ ] Verificar limite de 3 anúncios
- [ ] Mobile responsive (Chrome DevTools)

---

## 📦 Deployment (Vercel)

```bash
# Connect repo
npx vercel

# Deploy production
npx vercel --prod
```

Adicione as variáveis de ambiente no Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🤝 Contributing

Este é um MVP. Próximos passos estão documentados em `docs/implementation_plan.md`.

---

## 📄 License

Proprietary - Dezapegão © 2024
