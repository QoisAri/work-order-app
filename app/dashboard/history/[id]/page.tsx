// app/dashboard/history/[id]/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Fungsi untuk memformat tanggal
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default async function WorkOrderDetailPage({ params }: { params: { id: string } }) {
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

  const { data: workOrder, error } = await supabase
    .from('work_orders')
    .select(`*, equipments(nama_equipment), profiles(full_name, email)`)
    .eq('id', params.id)
    .single();

  if (error || !workOrder) {
    notFound();
  }
  
  // --- KAMUS LENGKAP UNTUK SEMUA EQUIPMENT ---
  const detailLabels: { [key: string]: string } = {
    // Kunci umum
    estimasi_pengerjaan: 'Estimasi Pengerjaan',
    estimasi_selesai: 'Estimasi Selesai',
    
    // Kunci dari form Storage
    storage_no: 'Nomor Storage',
    jenis_maintenance: 'Jenis Maintenance',
    
    // Kunci dari form MRS
    nomor_mrs: 'Nomor MRS',
    lokasi_mrs: 'Lokasi MRS',
    kerusakan_equipment: 'Kerusakan Equipment',
    deskripsi_maintenance: 'Deskripsi Maintenance',

    // Kunci dari form Land and Building
    equipment_maintenance: 'Equipment Maintenance',
    lokasi_perbaikan: 'lokasi_perbaikan',
    jenis_pekerjaan_gedung: 'Jenis Pekerjaan',
    
    // Kunci dari form Utility
    lokasi_utility: 'Lokasi Utility',
    jenis_utility: 'Jenis Utility',
    item_utility: 'Item Utility',
    masalah_utility: 'Masalah',
    
    // Kunci dari form Compressor
    running_hours: 'Running Hours',
    jenis_kerusakan: 'Jenis Kerusakan',
    lokasi:'lokasi',
    nomor_kompresor: 'Nomor Kompresor',
    tipe_kompresor: 'Tipe Kompresor',
    
    // Kunci dari form Safety Equipment
    jenis_equipment: 'Jenis Equipment',
    lokasi_equipment: 'Lokasi Equipment',
    jenis_safety_equipment: 'Jenis Alat Safety',
    masalah_safety: 'Masalah',

    // Kunci dari form Survey
    deskripsi_survey: 'Deskripsi Survey',
    lokasi_survey: 'Lokasi Survey',
    jenis_survey: 'Jenis Survey',

    // Kunci umum lainnya (bisa dipakai di banyak form)
    deskripsi: 'Deskripsi',
    deskripsi_pekerjaan: 'Deskripsi Pekerjaan',
    catatan_tambahan: 'Catatan Tambahan',
  };
  // --- AKHIR DARI KAMUS ---

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md max-w-4xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Detail Work Order
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {workOrder.wo_number ? `Nomor WO: ${workOrder.wo_number}` : `ID: ${workOrder.id.substring(0,8)}...`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Kolom Kiri: Informasi Umum */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-600">Pemohon</h3>
            <p className="text-gray-800">{workOrder.profiles?.full_name || 'N/A'}</p>
            <p className="text-sm text-gray-500">{workOrder.profiles?.email || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Equipment</h3>
            <p className="text-gray-800">{workOrder.equipments?.nama_equipment || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Tanggal Dibuat</h3>
            <p className="text-gray-800">{formatDate(workOrder.created_at)}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Status</h3>
            {workOrder.status === 'approved' && <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">Disetujui</span>}
            {workOrder.status === 'rejected' && <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">Ditolak</span>}
            {workOrder.status === 'pending' && <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>}
          </div>
        </div>

        {/* Kolom Kanan: Detail Spesifik */}
        <div className="space-y-4">
          {workOrder.status === 'rejected' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800">Alasan Penolakan</h3>
              <p className="text-red-700 mt-1">{workOrder.rejection_reason || 'Tidak ada alasan yang diberikan.'}</p>
            </div>
          )}

          {workOrder.details && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Detail Kerusakan/Pekerjaan</h3>
              <div className="space-y-3">
                {Object.keys(workOrder.details).map(key => {
                  if (detailLabels[key]) {
                    const value = (workOrder.details as any)[key];
                    const displayValue = Array.isArray(value) ? value.join(', ') : value;
                    if (displayValue) {
                      return (
                        <div key={key} className="grid grid-cols-3 gap-2 text-sm">
                          <span className="font-medium text-gray-500 col-span-1">{detailLabels[key]}</span>
                          <span className="text-gray-800 col-span-2">: {displayValue}</span>
                        </div>
                      );
                    }
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 border-t pt-6">
        <Link href="/dashboard/history" className="text-indigo-600 hover:text-indigo-800 font-semibold">
          ← Kembali ke Riwayat
        </Link>
      </div>
    </div>
  );
}