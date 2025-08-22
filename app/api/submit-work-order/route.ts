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
    
    // --- PERBAIKAN 1 DI SINI ---
    // Baca 'nama_lengkap' dari body, bukan 'full_name'
    const { full_name, sub_depart, no_wa, ...workOrderData } = body;

    // Lakukan UPDATE pada tabel 'profiles' terlebih dahulu
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        // --- PERBAIKAN 2 DI SINI ---
        // Simpan data 'nama_lengkap' ke dalam kolom 'full_name'
        full_name: full_name, 
        sub_depart: sub_depart,
        no_wa: no_wa,
      })
      .eq('id', user.id);

    if (profileError) {
      throw new Error(`Gagal memperbarui profil: ${profileError.message}`);
    }

    // Simpan sisa data ke tabel 'work_orders'
    const { data, error: workOrderError } = await supabase
      .from('work_orders')
      .insert([
        {
          ...workOrderData,
          status: 'pending',
          user_id: user.id,
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