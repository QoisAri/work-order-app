// app/dashboard/land-and-building/page.tsx
import LandBuildingForm from '@/app/dashboard/components/LandBuildingForm';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

async function getEquipmentData() {
    const supabase = createClient();
    const equipmentName = 'Land and Building'; // Sesuaikan nama ini

    const { data: equipment, error } = await supabase
        .from('equipments')
        .select('id')
        .eq('nama_equipment', equipmentName)
        .single();

    if (error || !equipment) {
        console.error(`Error fetching equipment ID for ${equipmentName}:`, error);
        notFound();
    }

    return {
        equipmentId: equipment.id,
    };
}

export default async function LandBuildingWorkOrderPage() {
  const { equipmentId } = await getEquipmentData();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Work Order - Land and Building
        </h1>
        <LandBuildingForm equipmentId={equipmentId} />
      </div>
    </div>
  );
}
