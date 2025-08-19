// app/dashboard/history/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import HistoryClientPage from './HistoryClientPage';
import { redirect } from 'next/navigation';

export default async function HistoryPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // --- PERUBAHAN: Menggunakan !inner join untuk memaksa relasi ---
  const { data: workOrders, error } = await supabase
    .from('work_orders')
    .select(`
      id,
      created_at,
      status,
      wo_number,
      equipments!inner ( nama_equipment )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching history:', error);
    return <div className="p-8 text-red-500">Gagal memuat riwayat work order. Coba lagi nanti.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Work Order Saya</h1>
      <HistoryClientPage initialWorkOrders={workOrders || []} />
    </div>
  );
}
