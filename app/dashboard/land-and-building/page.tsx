// app/dashboard/land-and-building/page.tsx
import LandBuildingForm from '@/app/dashboard/components/LandBuildingForm';
// Fungsi getEquipmentData tidak lagi diperlukan karena ID diambil di form
// import { createClient } from '@/utils/supabase/server';
// import { notFound } from 'next/navigation';

export default async function LandBuildingWorkOrderPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Work Order - Land and Building
        </h1>
        {/* PERBAIKAN: Hapus prop equipmentId dari sini */}
        <LandBuildingForm />
      </div>
    </div>
  );
}
