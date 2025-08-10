import DashboardClient from './components/DashboardClient';
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
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

  const { data: { user } } = await supabase.auth.getUser();
  
  // Ambil data equipment
  const { data: equipments } = user 
    ? await supabase
        .from('equipments')
        .select('id, nama_equipment')
        .order('nama_equipment', { ascending: true }) 
    : { data: [] };

  // Ambil data profil, termasuk status kelengkapan
  const { data: profile } = user 
    ? await supabase
        .from('profiles')
        .select('is_profile_complete, role')
        .eq('id', user.id)
        .single() 
    : { data: null };

  return (
    // Kirim semua data (user, equipments, dan profile) ke DashboardClient
    <DashboardClient user={user} equipments={equipments || []} profile={profile}>
      {children}
    </DashboardClient>
  );
}