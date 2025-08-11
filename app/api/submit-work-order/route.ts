import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function handleUserProfile(
    full_name: string,
    email: string,
    no_wa: string,
    sub_depart: string
) {
    let { data: existingProfile, error: findError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

    if (findError && findError.code !== 'PGRST116') {
        throw new Error(`Gagal mencari profil: ${findError.message}`);
    }

    const profileData = {
        full_name: full_name,
        email: email,
        no_wa: no_wa,
        sub_depart: sub_depart,
        is_profile_complete: true,
    };

    if (existingProfile) {
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update(profileData)
            .eq('id', existingProfile.id);
        if (updateError) throw new Error(`Gagal mengupdate profil: ${updateError.message}`);
    } else {
        const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
            email: email,
            password: `wopass-${Date.now()}`,
            options: { data: { full_name: full_name } },
        });
        if (signUpError || !signUpData.user) throw new Error(`Gagal mendaftarkan user baru di Auth: ${signUpError?.message}`);
        
        const { error: updateNewProfileError } = await supabaseAdmin
            .from('profiles')
            .update(profileData)
            .eq('id', signUpData.user.id);
        if (updateNewProfileError) throw new Error(`Gagal melengkapi profil: ${updateNewProfileError.message}`);
    }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, no_wa, sub_depart } = body;

    if (!full_name || !email || !no_wa || !sub_depart) {
      return NextResponse.json({ message: 'Semua field wajib diisi.' }, { status: 400 });
    }

    await handleUserProfile(full_name, email, no_wa, sub_depart);

    // --- PERUBAHAN KUNCI DI SINI ---
    // Kirim respons sukses beserta URL untuk redirect.
    return NextResponse.json({ 
        success: true, 
        message: 'Profil berhasil dibuat atau diperbarui.',
        redirectUrl: '/' 
    }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi error tidak diketahui';
    console.error('Error saat submit profil:', error);
    return NextResponse.json({ message: `Gagal memproses permintaan: ${errorMessage}` }, { status: 500 });
  }
}