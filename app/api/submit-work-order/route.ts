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

    // Simpan data ke tabel 'work_orders'
    // Perhatikan: kita tidak lagi memasukkan equipment_id di sini
    const { data, error } = await supabase
      .from('work_orders')
      .insert([
        {
          ...body,
          status: 'pending',
          user_id: user.id,
          // equipment_id sengaja dibiarkan kosong (NULL)
        },
      ])
      .select('id') // <-- PENTING: Ambil ID dari WO yang baru dibuat
      .single();

    if (error) {
      throw new Error(`Gagal menyimpan ke database: ${error.message}`);
    }

    // Kirim respons berhasil beserta ID unik dari WO yang baru
    return NextResponse.json({ 
      message: 'Work Order berhasil dibuat.', 
      data: data // Ini akan berisi { id: '...' }
    }, { status: 201 });

  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}