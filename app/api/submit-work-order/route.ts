// /api/submit-work-order/route.ts

// Ganti import NextResponse dari 'next/server' agar bisa menggunakan NextRequest
import { type NextRequest, NextResponse } from 'next/server';
// Import createClient dari server utils Anda, bukan supabase-js biasa
import { createClient } from '@/utils/supabase/server'; 

// Hapus supabaseAdmin, kita akan gunakan client yang berbasis cookie
// const supabaseAdmin = ... (HAPUS ATAU KOMENTARI BAGIAN INI)

// Fungsi handleUserProfile tetap bisa sama, TAPI lebih baik jika menggunakan client yang dilewatkan sebagai argumen
async function handleUserProfile(
    supabase: any, // Terima instance supabase
    full_name: string,
    email: string,
    no_wa: string,
    sub_depart: string,
    userId?: string // Terima userId untuk kasus user sudah ada
) {
    const profileData = {
        full_name,
        email,
        no_wa,
        sub_depart,
        is_profile_complete: true,
    };
    
    // Jika user sudah ada (dari sesi), kita hanya update
    if (userId) {
        const { error: updateError } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', userId);

        if (updateError) {
            console.error('Update Error:', updateError);
            throw new Error(`Gagal mengupdate profil: ${updateError.message}`);
        }
    } else {
      // Logika ini mungkin perlu penyesuaian, karena signUp seharusnya sudah terjadi sebelumnya.
      // Untuk alur "lengkapi profil", user seharusnya sudah login.
      // Kode di bawah mengasumsikan kita selalu mengupdate profil user yang sedang login.
      throw new Error("User ID tidak ditemukan. Pengguna harus login untuk melengkapi profil.");
    }
}

// Ubah parameter dari Request menjadi NextRequest
export async function POST(request: NextRequest) {
  try {
    // Buat client Supabase yang sadar akan cookies/sesi
    const supabase = createClient();
    
    // Cek data user dari sesi yang aktif
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ message: 'Otentikasi gagal. Silakan login kembali.' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, email, no_wa, sub_depart } = body;

    if (!full_name || !email || !no_wa || !sub_depart) {
      return NextResponse.json({ message: 'Semua field wajib diisi.' }, { status: 400 });
    }
    
    // Panggil fungsi dengan client yang sudah dibuat dan userId dari sesi
    // Kita gunakan client dari @/utils/supabase/server agar bisa melakukan RLS
    await handleUserProfile(supabase, full_name, email, no_wa, sub_depart, user.id);

    // INI BAGIAN KUNCI:
    // Lakukan redirect dari sisi server. Ini akan mengirim response 307 ke browser.
    // Browser akan otomatis pindah ke URL baru DENGAN COOKIE SESI YANG SUDAH DIPERBARUI.
    // Ganti '/' dengan halaman tujuan Anda, misal '/dashboard'
    return NextResponse.redirect(new URL('/dashboard', request.url), {
      status: 302, // 302 untuk redirect 'Found'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi error tidak diketahui';
    console.error('Error saat submit profil:', error);
    return NextResponse.json({ message: `Gagal memproses permintaan: ${errorMessage}` }, { status: 500 });
  }
}