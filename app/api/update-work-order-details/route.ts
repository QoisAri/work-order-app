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

    const { workOrderId, details } = await request.json();

    if (!workOrderId || !details) {
        return NextResponse.json({ message: 'ID Work Order atau detail tidak ditemukan.' }, { status: 400 });
    }

    // --- PERBAIKAN DI SINI ---
    // Hapus .single() dan proses hasilnya sebagai array
    const { data, error } = await supabase
      .from('work_orders')
      .update({
        details: details,
      })
      .eq('id', workOrderId)
      .select(); // <-- .single() dihapus

    if (error) {
      throw new Error(`Gagal memperbarui detail work order: ${error.message}`);
    }

    // Jika tidak ada baris yang diupdate, kirim error
    if (!data || data.length === 0) {
        throw new Error(`Work Order dengan ID ${workOrderId} tidak ditemukan.`);
    }

    return NextResponse.json({ 
      message: 'Detail Work Order berhasil diperbarui.', 
      data: data[0] // <-- Kirim objek pertama dari array
    }, { status: 200 });

  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
