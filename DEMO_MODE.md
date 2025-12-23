# 🎮 Modo DEMO - Guia de Uso

## O que é?

O **Modo DEMO** permite testar toda a interface do Dezapegão **sem precisar configurar o Supabase**. Perfeito para desenvolvimento e visualização rápida!

---

## ✅ Como funciona

Quando o arquivo `.env.local` não está configurado (ou tem valores de exemplo), o sistema entra automaticamente em modo DEMO.

### Indicadores visuais:
- 🟡 **Banner amarelo** no topo da página
- 🏷️ **Badge "DEMO"** no header ao lado do logo
- 🔧 **Mensagens** indicando funcionalidades mockadas

---

## 🎯 Funcionalidades Disponíveis

### ✅ Funcionando no DEMO
- **Feed público** com 6 anúncios de exemplo
- **Curtidas** (salvas localmente no navegador)
- **Navegação** entre todas as páginas
- **WhatsApp links** (abre conversa real se clicar)
- **Design completo** mobile-responsive
- **Interface visual** 100% funcional

### Anúncios de Exemplo:
1. Mesa de madeira maciça - R$ 450
2. iPhone 12 Pro 128GB - R$ 2.800
3. Sofá 3 lugares cinza - R$ 850
4. Bicicleta Caloi aro 29 - R$ 1.200
5. PlayStation 4 Slim 1TB - R$ 1.800
6. Tênis Nike Air Max 42 - R$ 280

### ⚠️ Limitações do DEMO
- ❌ Não cria anúncios reais
- ❌ Não salva curtidas no banco
- ❌ Não faz login/cadastro real
- ❌ Não tem persistência de dados

---

## 🔄 Como Sair do Modo DEMO

### 1. Configure o Supabase:
```bash
# Edite o arquivo .env.local
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

### 2. Reinicie o servidor:
```bash
# No terminal, pressione Ctrl+C
# Depois rode novamente:
npm run dev
```

### 3. Atualize o navegador:
- Pressione F5 ou Ctrl+R
- O banner amarelo deve desaparecer
- Funcionalidades reais estarão ativas

---

## 🧪 Testando no DEMO

### Fluxo de Teste Recomendado:

1. **Homepage (Feed)**
   - Acesse http://localhost:3000
   - Veja os 6 anúncios
   - Scroll vertical funciona
   - Clique nas curtidas (funciona localmente)

2. **Detalhes do Anúncio**
   - Clique no botão WhatsApp
   - Veja o link formatado
   - Teste em mobile (DevTools)

3. **Navegação**
   - Clique em "Entrar" → tela de login
   - Clique em "Cadastrar" → tela de signup
   - No login, clique "Entrar (DEMO)" → volta ao feed

4. **Mobile Responsive**
   - Abra Chrome DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Teste em iPhone SE, iPad, etc.

---

## 💡 Dicas de Desenvolvimento

### Quando usar DEMO:
- ✅ Testar UI/UX rapidamente
- ✅ Mostrar para clientes (preview)
- ✅ Fazer ajustes de design
- ✅ Desenvolvimento de componentes visuais

### Quando usar com Supabase:
- ✅ Testar fluxos completos
- ✅ Validar autenticação
- ✅ Criar dados reais
- ✅ Preparar para produção

---

## 🚀 Próximos Passos

Quando configurar o Supabase:

1. **Execute o schema SQL:**
   - `supabase/schema.sql` no SQL Editor

2. **Crie o bucket de storage:**
   - Nome: `listings`
   - Público: ✅ Sim

3. **Teste as funcionalidades reais:**
   - Cadastro de usuário
   - Criação de anúncio com upload
   - Sistema de curtidas persistente
   - Limite de 3 anúncios/semana

---

## 🔧 Troubleshooting

**Problema:** Banner "MODO DEMO" não aparece
- ✅ Verifique se `.env.local` existe
- ✅ Confira se tem valores reais do Supabase
- ✅ Reinicie o servidor dev

**Problema:** Anúncios não aparecem
- ✅ Veja o console do navegador (F12)
- ✅ Verifique se o build passou
- ✅ Certifique-se que `npm run dev` está rodando

**Problema:** Erro no build
- ✅ Delete a pasta `.next`
- ✅ Rode `npm install` novamente
- ✅ Execute `npm run build` para verificar

---

## 📊 Dados Mockados

### Usuário DEMO:
- ID: `demo-user-123`
- Username: `usuario_demo`
- Phone: `+5511999999999`
- Plan: `free`
- Ads Count: 2/3

### Outros usuários (nos anúncios):
- maria_tech (Pro)
- joao_vendedor (Basic)
- bike_lover (Free)
- gamer_pro (Premium)
- sneaker_head (Basic)

---

**🎯 Aproveite o modo DEMO para visualizar e testar rapidamente!**
