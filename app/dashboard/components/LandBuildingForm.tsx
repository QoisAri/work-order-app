// app/dashboard/components/LandBuildingForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { createLandBuildingWorkOrder } from '../land-and-building/action'; // Impor Server Action

type LandBuildingFormProps = {
  equipmentId: string;
};

export default function LandBuildingForm({ equipmentId }: LandBuildingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(null);

    // Menggabungkan nilai "Yang lain" ke dalam FormData
    const maintenanceLainValue = formData.get('maintenance_lain');
    if (maintenanceLainValue) {
      // Menambahkan nilai dari input teks ke grup checkbox
      formData.append('equipment_maintenance', `Yang lain: ${maintenanceLainValue}`);
    }
    // Menghapus field sementara agar tidak ikut tersimpan
    formData.delete('maintenance_lain');

    startTransition(async () => {
      const result = await createLandBuildingWorkOrder(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Work Order berhasil dibuat!');
      }
    });
  };

  const lokasiOptions = ["Ms. Cikampek", "Ms. Cikande", "Ms. PSJ", "Head Office"];
  const maintenanceOptions = [
    "Pintu", "Ruangan", "Drainase", "Atap", "AC", "Jendela",
    "Meja/Kursi", "Lantai", "Plafon", "Penerangan"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">05. Land Of Building</h1>
      <form action={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 font-semibold text-center">{error}</p>}
        {success && <p className="text-green-500 font-semibold text-center">{success}</p>}

        <input type="hidden" name="equipmentId" value={equipmentId} />

        <div className="bg-white p-6 rounded-lg shadow-md">
          <label htmlFor="lokasi_perbaikan" className="block text-base font-semibold text-gray-800">Lokasi Perbaikan Land of Building *</label>
          <select name="lokasi_perbaikan" id="lokasi_perbaikan" required defaultValue="" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black">
            <option value="" disabled>--Pilih--</option>
            {lokasiOptions.map(lokasi => <option key={lokasi} value={lokasi}>{lokasi}</option>)}
          </select>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <label className="block text-base font-semibold text-gray-800 mb-4">Equipment Maintenance Land of Building *</label>
          <div className="space-y-3">
            {maintenanceOptions.map(item => (
              <div key={item} className="flex items-center">
                <input id={`maintenance-${item}`} name="equipment_maintenance" type="checkbox" value={item} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor={`maintenance-${item}`} className="ml-3 block text-sm text-gray-900">{item}</label>
              </div>
            ))}
            <div className="flex items-center">
              <label htmlFor="maintenance-lain-cb" className="ml-3 block text-sm text-gray-900">Yang lain:</label>
              <input type="text" name="maintenance_lain" className="ml-2 w-48 rounded-md border-gray-300 shadow-sm text-sm text-black placeholder:text-gray-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div>
                <label htmlFor="deskripsi_maintenance" className="block text-base font-semibold text-gray-800">Deskripsi Maintenance Land of Building *</label>
                <textarea name="deskripsi_maintenance" id="deskripsi_maintenance" rows={5} required className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black placeholder:text-gray-500"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                    <label htmlFor="estimasi_pengerjaan" className="block text-base font-semibold text-gray-800">Estimasi Tanggal Pengerjaan</label>
                    <input type="date" name="estimasi_pengerjaan" id="estimasi_pengerjaan" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black" />
                </div>
                <div>
                    <label htmlFor="estimasi_selesai" className="block text-base font-semibold text-gray-800">Estimasi Tanggal Selesai</label>
                    <input type="date" name="estimasi_selesai" id="estimasi_selesai" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black" />
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isPending} className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-gray-400">
            {isPending ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </form>
    </div>
  );
}
