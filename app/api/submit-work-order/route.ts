// app/api/submit-work-order/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }); },
      },
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 401 });
    }

    const body = await request.json();
    
    // --- PERBAIKAN UTAMA ADA DI SINI ---
    // Ekstrak semua field yang relevan untuk tabel 'work_orders' dan 'profiles'
    const { 
      full_name, 
      sub_depart, 
      no_wa, 
      job_type_id, 
      equipment_id,
      ...otherDetails // Sisa data (jika ada) akan masuk ke 'details'
    } = body;

    // 1. Lakukan UPDATE pada tabel 'profiles' (logika ini sudah benar)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: full_name,
        sub_depart: sub_depart,
        no_wa: no_wa,
      })
      .eq('id', user.id);

    if (profileError) {
      throw new Error(`Gagal memperbarui profil: ${profileError.message}`);
    }

    // 2. Simpan data ke tabel 'work_orders' dengan struktur yang benar
    const { data, error: workOrderError } = await supabase
      .from('work_orders')
      .insert([
        {
          // Masukkan setiap data ke kolomnya masing-masing
          user_id: user.id,
          job_type_id: job_type_id,
          equipment_id: equipment_id,
          status: 'pending',
          // Sisa data lainnya bisa dimasukkan ke kolom 'details' jika perlu
          details: otherDetails, 
        },
      ])
      .select('id')
      .single();

    if (workOrderError) {
      throw new Error(`Gagal menyimpan work order: ${workOrderError.message}`);
    }

    return NextResponse.json({ 
      message: 'Work Order berhasil dibuat.', 
      data: data 
    }, { status: 201 });

  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
