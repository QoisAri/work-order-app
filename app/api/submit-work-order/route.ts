// /api/submit-work-order/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ message: 'Otentikasi gagal atau email tidak ditemukan.' }, { status: 401 });
    }

    // Ambil data dari body, TANPA email
    const body = await request.json();
    const { full_name, no_wa, sub_depart } = body;

    // Validasi input
    if (!full_name || !no_wa || !sub_depart) {
      return NextResponse.json({ message: 'Nama Lengkap, No. WhatsApp, dan Sub Departemen wajib diisi.' }, { status: 400 });
    }

    // Siapkan data untuk di-update
    const profileData = {
      full_name,
      no_wa,
      sub_depart,
      email: user.email, // <-- PERUBAHAN KUNCI: Ambil email dari sesi
      is_profile_complete: true,
    };

    // Lakukan update ke tabel profiles
    const { error: updateError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id); // Cocokkan dengan ID user yang sedang login

    if (updateError) {
      console.error("Supabase Update Error:", updateError);
      throw new Error(`Gagal mengupdate profil di database: ${updateError.message}`);
    }

    // Jika berhasil, redirect ke dashboard (atau halaman utama)
    // Ganti '/dashboard' jika halaman tujuan Anda berbeda
    return NextResponse.redirect(new URL('/dashboard', request.url), {
      status: 302,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi error tidak diketahui';
    console.error('Error saat submit profil:', error);
    return NextResponse.json({ message: `Gagal memproses permintaan: ${errorMessage}` }, { status: 500 });
  }
}