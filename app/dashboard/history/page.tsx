import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import HistoryClientPage from './HistoryClientPage';

// Tipe data ini sudah benar, 'equipments' didefinisikan sebagai objek tunggal.
export type WorkOrderHistory = {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'done';
  wo_number: string | null;
  equipments: { 
    nama_equipment: string | null; 
  } | null;
};

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

  // 1. Cek autentikasi pengguna di server
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. Ambil data work order dari database
  const { data: workOrders, error } = await supabase
    .from('work_orders')
    .select('id, created_at, status, wo_number, equipments(nama_equipment)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching history:', error.message);
    return <div className="p-8 text-red-500">Gagal memuat riwayat work order.</div>;
  }
  
  // 3. Normalisasi data: memastikan 'equipments' selalu menjadi objek (bukan array)
  const formattedWorkOrders = workOrders?.map(wo => ({
    ...wo,
    equipments: Array.isArray(wo.equipments) ? wo.equipments[0] || null : wo.equipments,
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Riwayat Work Order Saya</h1>
          <p className="text-sm text-gray-500 mt-1">
            Berikut adalah daftar semua work order yang pernah Anda buat.
          </p>
        </div>
        
        {/* 4. Kirim data yang sudah bersih ke Client Component untuk ditampilkan */}
        <HistoryClientPage initialWorkOrders={formattedWorkOrders} />
      </div>
    </div>
  );
}