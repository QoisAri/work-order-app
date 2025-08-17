// test-supabase.js
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Konfigurasi dotenv untuk membaca file .env.local
dotenv.config({ path: './.env.local' });

// Fungsi ini akan berjalan sendiri
async function testConnection() {
  console.log('Mencoba terhubung ke Supabase...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY ada di file .env.local');
    return;
  }

  console.log('URL:', supabaseUrl);

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // --- PERBAIKAN: Mencari profil dengan peran 'admin' ---
    console.log("Mencoba mengambil data admin dari tabel 'profiles'...");
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin'); // Filter untuk mencari admin

    if (error) {
      console.error('KONEKSI GAGAL! Error dari Supabase:', error.message);
    } else if (data && data.length > 0) {
      console.log('KONEKSI BERHASIL! Data admin yang diterima:', data);
    } else {
      console.log('KONEKSI BERHASIL, TAPI TIDAK ADA PROFIL ADMIN YANG DITEMUKAN.');
    }
  } catch (e) {
    console.error('KONEKSI GAGAL! Terjadi error umum:', e.message);
  }
}

testConnection();
