import DashboardClient from './components/DashboardClient'; // Impor komponen client baru
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()

  // Buat Supabase client di server
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      } as CookieOptions,
    }
  )

  // Ambil data user dan equipment di server
  const { data: { user } } = await supabase.auth.getUser();
  const { data: equipments } = await supabase
    .from('equipments')
    .select('id, nama_equipment')
    .order('nama_equipment', { ascending: true });

  // Render komponen client dan kirim semua data yang dibutuhkan sebagai props
  return (
    <DashboardClient user={user} equipments={equipments || []}>
      {children}
    </DashboardClient>
  );
}