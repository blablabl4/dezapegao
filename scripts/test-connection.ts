import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testConnection() {
    console.log('--- TESTE DE CONEXÃO SUPABASE ---')
    console.log('URL:', url)
    console.log('Key:', key ? 'FOUND' : 'MISSING')

    if (!url || !key) {
        console.error('❌ Variáveis de ambiente faltando no .env.local')
        process.exit(1)
    }

    const supabase = createClient(url, key)

    // 1. Testar conexão com o banco (Tabela Listings)
    console.log('\n1. Testando Tabela Listings...')
    const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id')
        .limit(1)

    if (listingsError) {
        console.error('❌ Erro ao acessar listings:', listingsError.message)
    } else {
        console.log('✅ Conexão com Banco de Dados OK!')
    }

    // 2. Testar Storage
    console.log('\n2. Testando Storage (Bucket listings)...')
    const { data: buckets, error: storageError } = await supabase
        .storage
        .listBuckets()

    const hasListingsBucket = buckets?.some(b => b.name === 'listings')
    if (storageError || !hasListingsBucket) {
        console.error('❌ Bucket "listings" não encontrado ou inacessível.')
    } else {
        console.log('✅ Storage Bucket "listings" Detectado!')
    }

    // 3. Testar Auth Service
    console.log('\n3. Testando Auth Service...')
    const { data: authStatus, error: authError } = await supabase.auth.getSession()
    if (authError) {
        console.error('❌ Erro no serviço de Auth:', authError.message)
    } else {
        console.log('✅ Auth Service Online!')
    }

    console.log('\n--- FIM DOS TESTES DE CONEXÃO ---')
}

testConnection()
