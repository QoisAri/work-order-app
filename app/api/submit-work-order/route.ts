import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ message: 'Otentikasi gagal atau email tidak ditemukan.' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, no_wa, sub_depart } = body;

    if (!full_name || !no_wa || !sub_depart) {
      return NextResponse.json({ message: 'Semua field wajib diisi.' }, { status: 400 });
    }

    const profileData = {
      full_name,
      no_wa,
      sub_depart,
      email: user.email,
      is_profile_complete: true,
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id);

    if (updateError) {
      console.error("Supabase Update Error:", updateError);
      throw new Error(`Gagal mengupdate profil di database: ${updateError.message}`);
    }

    // PERUBAHAN UTAMA: Kirim respons JSON, bukan redirect.
    return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui.' }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi error tidak diketahui';
    console.error('Error saat submit profil:', error);
    return NextResponse.json({ message: `Gagal memproses permintaan: ${errorMessage}` }, { status: 500 });
  }
}
