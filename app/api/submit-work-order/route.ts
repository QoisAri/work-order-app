import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Gunakan SERVICE_ROLE_KEY agar bisa melewati RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Fungsi ini akan menangani pembuatan atau pembaruan profil pengguna.
 * Alur yang lebih sederhana dan andal.
 */
async function handleUserProfile(
    nama_lengkap: string,
    email: string,
    no_wa: string,
    sub_depart: string
) {
    // 1. Cek apakah user sudah ada di tabel 'profiles' kita berdasarkan email.
    let { data: existingProfile, error: findError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

    // Jika terjadi error saat mencari, hentikan proses.
    if (findError && findError.code !== 'PGRST116') { // Abaikan error 'PGRST116' (no rows found)
        throw new Error(`Gagal mencari profil: ${findError.message}`);
    }

    // Data untuk di-insert atau di-update
    const profileData = {
        nama_lengkap,
        email,
        no_wa,
        sub_depart,
        is_profile_complete: true,
    };

    if (existingProfile) {
        // 2. Jika profil sudah ada, UPDATE saja.
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update(profileData)
            .eq('id', existingProfile.id);

        if (updateError) {
            throw new Error(`Gagal mengupdate profil: ${updateError.message}`);
        }
    } else {
        // 3. Jika profil belum ada, buat user baru di Auth dan profilnya.
        const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
            email: email,
            password: `wopass-${Date.now()}`, // Buat password acak sementara
            options: {
                data: {
                    nama_lengkap: nama_lengkap,
                    role: 'pemohon',
                },
            },
        });

        if (signUpError || !signUpData.user) {
            throw new Error(`Gagal mendaftarkan user baru di Auth: ${signUpError?.message}`);
        }
        
        // Update baris profil yang seharusnya dibuat oleh trigger
        // dengan data lengkap dari form.
        const { error: updateNewProfileError } = await supabaseAdmin
            .from('profiles')
            .update(profileData)
            .eq('id', signUpData.user.id);
        
        if (updateNewProfileError) {
             throw new Error(`Gagal melengkapi profil untuk user baru: ${updateNewProfileError.message}`);
        }
    }
}


// --- MAIN POST HANDLER ---
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Ambil data dari body request
    const { nama, email, no_wa, sub_depart } = body;

    // Validasi input dasar
    if (!nama || !email || !no_wa || !sub_depart) {
      return NextResponse.json({ message: 'Semua field wajib diisi.' }, { status: 400 });
    }

    // Panggil satu fungsi utama untuk menangani semua logika
    await handleUserProfile(nama, email, no_wa, sub_depart);

    return NextResponse.json({ message: 'Profil berhasil dibuat atau diperbarui.' }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi error tidak diketahui';
    console.error('Error saat submit profil:', error);
    return NextResponse.json({ message: `Gagal memproses permintaan: ${errorMessage}` }, { status: 500 });
  }
}