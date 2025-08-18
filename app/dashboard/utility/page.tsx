// app/dashboard/utility/page.tsx
import UtilityForm from '@/app/dashboard/components/UtilityForm';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

async function getEquipmentData() {
    const supabase = createClient();
    // Pastikan nama ini persis sama dengan yang ada di database Anda
    const equipmentName = 'Utility (genset, LVMDP, Trafo)'; 

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

export default async function UtilityWorkOrderPage() {
  const { equipmentId } = await getEquipmentData();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Komponen form yang benar sekarang akan dirender di sini */}
        <UtilityForm equipmentId={equipmentId} />
      </div>
    </div>
  );
}
