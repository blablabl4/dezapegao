# Dezapegão - Setup Instructions

## 🚀 Quick Setup (15 minutes)

### Step 1: Supabase Account
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Wait for database initialization (~2 minutes)

### Step 2: Environment Variables
1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy:
   - Project URL
   - `anon` public key
3. Create `.env.local` file in project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Database Schema
1. In Supabase Dashboard, click **SQL Editor**
2. Open `supabase/schema.sql` from this project
3. Copy ALL content
4. Paste in SQL Editor and click **RUN**
5. Wait for success message

### Step 4: Storage Bucket
1. In Supabase, go to **Storage**
2. Click **Create bucket**
3. Name: `listings`
4. Public bucket: ✅ **Enabled**
5. Click **Create**

### Step 5: Run Project
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## ✅ Verify Setup

1. Homepage loads without errors
2. Click "Cadastrar" → create account
3. Click "Criar Anúncio" → upload image → publish
4. Should see your listing in feed

---

## 🐛 Troubleshooting

**Error: "Could not connect to Supabase"**
- Check `.env.local` exists and has correct values
- Restart dev server: `npm run dev`

**Error: "relation 'profiles' does not exist"**
- Run `supabase/schema.sql` in SQL Editor again

**Error: "Storage error"**
- Create `listings` bucket in Storage tab
- Make sure it's PUBLIC

**Error: "Row Level Security policy violated"**
- RLS policies from schema.sql not applied
- Re-run the entire schema.sql file

---

## 🎯 First Test

1. **Create account** → Use real email
2. **Create listing:**
   - Title: "Mesa de madeira"
   - Price: 150
   - Category: Móveis
   - Upload any image
3. **See in feed** → Should appear at top
4. **Test like** → Click heart icon
5. **Test WhatsApp** → Add your phone in signup

---

Need help? Check main README.md for full documentation.
