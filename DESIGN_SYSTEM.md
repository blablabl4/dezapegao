# Design System - Dezapegão

## 🎨 Padrões Estabelecidos

### Animações (Consistentes)

#### Menu Lateral
```typescript
// Slide from left
transition-transform duration-300 ease-out
transform: isOpen ? 'translate-x-0' : '-translate-x-full'
```

#### Modais
```typescript
// Fade in backdrop
backdrop: bg-black/50 backdrop-blur(12px)
// Modal content: sem animação, aparece instantâneo
```

#### Botões
```typescript
// Hover suave
transition hover:bg-white/10
// Scale para avatar
hover:scale-105 transition
```

### Layout (Grid & Spacing)

#### Modais
- Max width: `max-w-lg` (512px)
- Padding: `px-4 py-6`
- Não cobrem banner (top-14)

#### Cards
- Grid 2 colunas: `grid-cols-2`
- Gap: `gap-3`
- Aspect square: `aspect-square`
- Border radius: `rounded-2xl`

#### Spacing Vertical
- Seções: `space-y-5` ou `space-y-6`
- Cards em grid: `mb-6`
- Título → conteúdo: `mb-4`

### Glassmorphism (Padrão)

```typescript
const glassStyle = {
  background: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}
```

**Backdrop forte:**
```typescript
backdropFilter: 'blur(12px)'
background: rgba(0, 0, 0, 0.5)
```

### Tipografia

#### Hierarquia
- H1: `text-2xl font-bold`
- H2: `text-lg font-semibold`
- Body: `text-sm`
- Label: `text-xs`

#### Cores de Texto
- Principal: `text-white`
- Secundário: `text-white/80`
- Terciário: `text-white/60`
- Placeholder: `text-white/40`

#### Alinhamento
- **SEMPRE centralizar** em botões/badges
- Usar: `text-center` ou `flex items-center justify-center`
- Emojis: `inline-flex items-center gap-1`

### Cores (Semânticas)

```typescript
// Sucesso/Preços
text-green-400

// Curtidas/Destaque
text-pink-400

// Info/Plano
text-purple-300

// Alerta
text-yellow-400

// Erro
text-red-400
```

### Botões

#### Primário (CTA)
```typescript
bg-white text-purple-600
hover:bg-white/90
py-4 rounded-2xl
```

#### Secundário (Glass)
```typescript
style={glassStyle}
hover:bg-white/10
px-4 py-3 rounded-xl
```

#### Ícone
```typescript
w-10 h-10 rounded-full
flex items-center justify-center
hover:bg-white/10
```

### Inputs

```typescript
// Padrão
bg-white/10 
border border-white/20
rounded-xl
text-white
placeholder-white/40
focus:ring-2 focus:ring-white/30
```

### Componentes Reutilizáveis

#### Modal Structure
```tsx
<>
  {/* Backdrop */}
  <div className="fixed top-14 ... bg-black/50" 
       style={{backdropFilter: 'blur(12px)'}} />
  
  {/* Content */}
  <div className="fixed top-14 ... z-50">
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* conteúdo */}
    </div>
  </div>
</>
```

#### Stats Cards (3 colunas)
```tsx
<div className="grid grid-cols-3 gap-3">
  <div className="rounded-2xl p-4 flex flex-col items-center" 
       style={glassStyle}>
    <p className="text-2xl font-bold">X</p>
    <p className="text-xs text-white/60">Label</p>
  </div>
</div>
```

#### Action Buttons (Stack)
```tsx
<div className="space-y-1.5">
  <button className="w-full ... flex items-center justify-center">
    Ação
  </button>
</div>
```

## 🔄 Para Próximas Páginas

### Checklist
- [ ] Usar `glassStyle` constante
- [ ] Modais com `backdrop-blur(12px)`
- [ ] Menu lateral `translate-x` (300ms ease-out)
- [ ] Todo texto centralizado em botões
- [ ] Emojis com `inline-flex items-center`
- [ ] Grid 2 ou 3 colunas consistente
- [ ] Spacing `gap-3` / `space-y-5`
- [ ] Border radius `rounded-xl` ou `rounded-2xl`
- [ ] Hover transitions suaves

### Antipadrões (Evitar)
- ❌ Animações diferentes em modais
- ❌ Texto descentralizado
- ❌ Spacing inconsistente
- ❌ Border radius misturado
- ❌ Cores fora da paleta
- ❌ Glassmorphism com opacidades diferentes
