'use client' // 👈 important if used in client components

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Add console logs to verify
console.log('🔍 Supabase URL:', supabaseUrl)
console.log('🔑 Supabase Key:', supabaseAnonKey ? 'Loaded ✅' : 'Missing ❌')

if (!supabaseUrl) throw new Error('supabaseUrl is required.')
if (!supabaseAnonKey) throw new Error('supabaseAnonKey is required.')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
