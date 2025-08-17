// app/dashboard/components/MrsForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { createMrsWorkOrder } from '../mrs/action'; // Impor Server Action

type MrsFormProps = {
  equipmentId: string;
};

export default function MrsForm({ equipmentId }: MrsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(null);

    const kerusakanLainValue = formData.get('kerusakan_lain');
    if (kerusakanLainValue) {
      formData.append('kerusakan_equipment', `Yang lain: ${kerusakanLainValue}`);
    }
    formData.delete('kerusakan_lain');

    startTransition(async () => {
      const result = await createMrsWorkOrder(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Work Order berhasil dibuat!');
      }
    });
  };

  const nomorMrsOptions = [
    "001 (300 Nm3/h)", "003 (300 Nm3/h)", "005 (200 Nm3/h)", "006 (150 Nm3/h)",
    "007 (250 Nm3/h)", "008 (300 Nm3/h)", "009 (500 Nm3/h)", "010 (150 Nm3/h)",
    "011 (1500 Nm3/h)", "012 (1500 Nm3/h)", "015 (1500 Nm3/h)", "016 (1500 Nm3/h)",
    "017 (1000 Nm3/h)", "018 (1000 Nm3/h)", "019 (1000 Nm3/h)", "020 (500 Nm3/h)",
    "021 (1000 Nm3/h)", "022 (1000 Nm3/h)", "023 (600 Nm3/h)", "024 (500 Nm3/h)",
    "025 (1000 Nm3/h)", "026 (1000 Nm3/h)", "027 (1000 Nm3/h)", "028 (1000 Nm3/h)",
    "029 (1000 Nm3/h)", "030 (1000 Nm3/h)", "031 (1000 Nm3/h)", "032 (1000 Nm3/h)",
    "033 (1000 Nm3/h)", "034 (1000 Nm3/h)", "035 (1000 Nm3/h)", "036 (300 Nm3/h)",
    "037 (300 Nm3/h)", "038 (300 Nm3/h)", "039 (300 Nm3/h)", "040 (300 Nm3/h)",
    "041 (300 Nm3/h)", "042 (300 Nm3/h)", "043 (300 Nm3/h)", "044 (300 Nm3/h)",
    "045 (300 Nm3/h)", "046 (300 Nm3/h)", "047 (300 Nm3/h)", "052 (300 Nm3/h)",
    "053 (300 Nm3/h)", "054 (300 Nm3/h)", "055 (300 Nm3/h)", "056 (300 Nm3/h)",
    "057 (300 Nm3/h)", "058 (300 Nm3/h)", "059 (300 Nm3/h)", "060 (300 Nm3/h)",
    "061 (300 Nm3/h)", "062 (1500 Nm3/h)", "063 (1500 Nm3/h)", "064 (150 Nm3/h)",
    "065 (100 Nm3/h)", "066 (100 Nm3/h)", "067 (100 Nm3/h)"
  ];

  const kerusakanOptions = [
    "Scrubber", "Filter", "Aktuator", "Flow Meter", "Tubing and Instrumentation",
    "Piping line", "Regulator", "PSV", "Ball Valve", "Pressure Gauge",
    "Heater", "Heat Exchanger", "Hot Water line", "Hot Water Tank",
    "Hot Water Pump", "Panel Control", "Telemetri"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">03. MRS</h1>
      <form action={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 font-semibold text-center">{error}</p>}
        {success && <p className="text-green-500 font-semibold text-center">{success}</p>}
        
        <input type="hidden" name="equipmentId" value={equipmentId} />

        <div className="bg-white p-6 rounded-lg shadow-md">
          <label htmlFor="nomor_mrs" className="block text-base font-semibold text-gray-800">Nomor MRS *</label>
          <select name="nomor_mrs" id="nomor_mrs" required defaultValue="" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black">
            <option value="" disabled>--Pilih--</option>
            {nomorMrsOptions.map(no => <option key={no} value={no}>{no}</option>)}
          </select>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <label htmlFor="lokasi_mrs" className="block text-base font-semibold text-gray-800">Lokasi MRS *</label>
          <p className="text-sm text-gray-500">Berisikan Inisial Customer</p>
          <input type="text" name="lokasi_mrs" id="lokasi_mrs" required className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black placeholder:text-gray-500" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <label className="block text-base font-semibold text-gray-800 mb-4">Kerusakan Equipment MRS *</label>
          <div className="space-y-3">
            {kerusakanOptions.map(item => (
              <div key={item} className="flex items-center">
                <input id={`kerusakan-${item}`} name="kerusakan_equipment" type="checkbox" value={item} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor={`kerusakan-${item}`} className="ml-3 block text-sm text-gray-900">{item}</label>
              </div>
            ))}
            <div className="flex items-center">
              <label htmlFor="kerusakan-lain-cb" className="ml-3 block text-sm text-gray-900">Yang lain:</label>
              <input type="text" name="kerusakan_lain" className="ml-2 w-48 rounded-md border-gray-300 shadow-sm text-sm text-black placeholder:text-gray-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div>
                <label htmlFor="deskripsi_maintenance" className="block text-base font-semibold text-gray-800">Deskripsi Maintenance *</label>
                <p className="text-sm text-gray-500">Deskripsi berisikan type kerusakan, jenis part equipment, spek equipment, atau penyebabnya,</p>
                <textarea name="deskripsi_maintenance" id="deskripsi_maintenance" rows={4} required className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black placeholder:text-gray-500"></textarea>
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

        <div className="flex justify-end mt-6">
          <button type="submit" disabled={isPending} className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-gray-400">
            {isPending ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </form>
    </div>
  );
}
