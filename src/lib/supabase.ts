import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qmmqlvfiolcmflcwzlir.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbXFsdmZpb2xjbWZsY3d6bGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNzQ5NjgsImV4cCI6MjA5NTc1MDk2OH0.RD1FO_gUDZIBdO8CeTh3XhZ3uq7AWKgPu6sBWvnJoTo';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Buat client Supabase (bisa null jika belum terkonfigurasi)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper untuk mengambil url & key guna ditunjukkan di petunjuk setup
export const getSupabaseConfig = () => ({
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
});
