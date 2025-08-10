import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Gunakan SERVICE_ROLE_KEY agar bisa melewati RLS untuk membuat user/profil
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let userId: string;

    // Cek apakah user sudah ada di tabel 'users' Supabase Auth
    const { data: { user } } = await supabaseAdmin.auth.getUser(body.access_token); // Asumsi token dikirim dari client

    if (user) {
        userId = user.id;
    } else {
        // Jika tidak ada user (misalnya pendaftaran pertama), buat user baru
        // Ini adalah skenario fallback jika user belum terotentikasi saat submit
        const { data: newUser, error: userError } = await supabaseAdmin.auth.signUp({
            email: body.email,
            password: 'generate-a-secure-password-here', // Anda perlu strategi password di sini
            options: {
                data: {
                    nama_lengkap: body.nama,
                    sub_depart: body.sub_depart,
                }
            }
        });

        if (userError || !newUser.user) throw new Error(userError?.message || 'Gagal membuat user baru di Auth.');
        userId = newUser.user.id;
    }

    // Masukkan data Work Order ke database
    const { error: woError } = await supabaseAdmin
      .from('work_orders')
      .insert({
        nama_pemohon: body.nama,
        no_wa_pemohon: body.no_wa,
        sub_depart: body.sub_depart, 
        job_type_id: body.job_type_id, 
        equipment_id: body.equipment_id,
        status: 'pending',
        details: body.details, 
        user_id: userId,
      });

    if (woError) {
      throw new Error(`Database Error: ${woError.message}`);
    }
    
    // Setelah work order pertama berhasil dibuat, tandai profil sebagai lengkap
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ is_profile_complete: true })
      .eq('id', userId);

    if (profileError) {
        console.warn(`Peringatan: Gagal update status profil untuk user ${userId}:`, profileError.message);
    }

    return NextResponse.json({ message: 'Work Order berhasil dibuat dan profil Anda telah diperbarui.' }, { status: 201 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi error tidak diketahui';
    console.error('Error saat membuat Work Order:', error);
    return NextResponse.json({ message: `Gagal membuat Work Order: ${errorMessage}` }, { status: 500 });
  }
}