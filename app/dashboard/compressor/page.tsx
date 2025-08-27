// app/dashboard/compressor/page.tsx
import CompressorForm from '@/app/dashboard/components/CompressorForm';
// Fungsi getEquipmentData tidak lagi diperlukan karena ID diambil di form
// import { createClient } from '@/utils/supabase/server';
// import { notFound } from 'next/navigation';

export default async function CompressorWorkOrderPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Work Order - Compressor
        </h1>
        {/* PERBAIKAN: Hapus prop equipmentId dari sini */}
        <CompressorForm />
      </div>
    </div>
  );
}
