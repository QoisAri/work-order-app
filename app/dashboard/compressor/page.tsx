// app/dashboard/compressor/page.tsx
import CompressorForm from '@/app/dashboard/components/CompressorForm';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

// Fungsi ini sekarang mengambil ID equipment
async function getEquipmentData() {
    const supabase = createClient();
    const equipmentName = 'Compressor'; // Nama equipment harus cocok dengan di database

    const { data: equipment, error } = await supabase
        .from('equipments')
        .select('id')
        .eq('nama_equipment', equipmentName)
        .single(); // .single() untuk mengambil satu baris data

    // Jika equipment tidak ditemukan di database, tampilkan halaman 404
    if (error || !equipment) {
        console.error(`Error fetching equipment ID for ${equipmentName}:`, error);
        notFound();
    }

    return {
        equipmentId: equipment.id,
    };
}

export default async function CompressorWorkOrderPage() {
  // Panggil fungsi baru untuk mendapatkan data
  const { equipmentId } = await getEquipmentData();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Work Order - Compressor
        </h1>
        {/* Sekarang kita mengirim prop 'equipmentId' yang benar */}
        <CompressorForm equipmentId={equipmentId} />
      </div>
    </div>
  );
}
