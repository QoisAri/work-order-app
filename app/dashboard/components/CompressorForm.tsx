// app/dashboard/components/CompressorForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation'; // 1. Impor useSearchParams
import { createCompressorWorkOrder } from '../compressor/action';

// Hapus props karena ID diambil dari URL
export default function CompressorForm() {
  // 2. Ambil workOrderId dari URL
  const searchParams = useSearchParams();
  const workOrderId = searchParams.get('workOrderId');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>('');

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(null);

    // 3. Validasi dan tambahkan workOrderId ke formData
    if (!workOrderId) {
        setError("ID Work Order tidak ditemukan. Silakan mulai dari awal.");
        return;
    }
    formData.append('workOrderId', workOrderId);

    // Hapus logika pemrosesan form dari sini, pindahkan ke server action
    startTransition(async () => {
      const result = await createCompressorWorkOrder(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Work Order berhasil diperbarui dan dikirim!');
      }
    });
  };

  // Opsi-opsi form (tidak ada perubahan)
  const lokasiOptions = ["PSJ", "Cikampek", "Cikande"];
  const noCompressorOptions = ["CBG 1(PSJ)", "CBG 2(PSJ)", "CBG 3(CKP)", "CBG 4(CKP)", "CBG 5(CKD)", "CBG 6(CKD)", "MRU 1", "MRU 2", "IMW 1(CKP)", "IMW 2(CKP)"];
  const kerusakanOptions = [
    "Gas Kompressor", "Gas Engine Driven or Electric Motor Driven (Included Transmition System)", "Filter Inlet",
    "Filter Outlet", "Aktuator", "Water Pump", "Motor Gas Cooler", "Transmitter",
    "PLC", "HMI", "Power Supply", "Kontaktor", "Air Compressor", "Dispenser",
    "Flowmeter", "PSV", "Maintenance 1.000 Hr", "Maintenance 2.000 Hr",
    "Maintenance 4.000 Hr", "Maintenance 8.000 Hr", "Maintenance 16.000Hr", "Overhaul"
  ];

  // Tampilkan pesan error jika workOrderId tidak ada
  if (!workOrderId) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-red-600">Error: ID Work Order Hilang</h2>
        <p className="text-gray-700 mt-2">Tidak dapat melanjutkan karena ID work order tidak ditemukan di URL.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">01 Compressor</h1>
      <form action={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 font-semibold text-center">{error}</p>}
        {success && <p className="text-green-500 font-semibold text-center">{success}</p>}
        
        {/* Input 'equipmentId' tidak lagi diperlukan */}
        {/* Sisa dari JSX form Anda (tidak ada perubahan) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <label className="block text-base font-semibold text-gray-800 mb-4">Lokasi Pekerjaan Kompressor *</label>
          <div className="space-y-3">
            {lokasiOptions.map(lokasi => (
              <div key={lokasi} className="flex items-center">
                <input id={`lokasi-${lokasi}`} name="lokasi" type="checkbox" value={lokasi} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor={`lokasi-${lokasi}`} className="ml-3 block text-sm text-gray-900">{lokasi}</label>
              </div>
            ))}
            <div className="flex items-center">
              <label htmlFor="lokasi-lain-cb" className="ml-3 block text-sm text-gray-900">Yang lain:</label>
              <input type="text" name="lokasi_lain" className="ml-2 w-48 rounded-md border-gray-300 shadow-sm text-sm text-black placeholder:text-gray-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
            <label htmlFor="no_compressor" className="block text-base font-semibold text-gray-800">No. Compressor *</label>
            <select name="no_compressor" id="no_compressor" required defaultValue="" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black">
                <option value="" disabled>--Pilih--</option>
                {noCompressorOptions.map(no => <option key={no} value={no}>{no}</option>)}
            </select>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
            <label className="block text-base font-semibold text-gray-800 mb-4">Jenis Kerusakan *</label>
            <div className="space-y-3">
                {kerusakanOptions.map(kerusakan => (
                    <div key={kerusakan} className="flex items-center">
                        <input id={`kerusakan-${kerusakan}`} name="jenis_kerusakan" type="checkbox" value={kerusakan} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor={`kerusakan-${kerusakan}`} className="ml-3 block text-sm text-gray-900">{kerusakan}</label>
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
                <label htmlFor="running_hours" className="block text-base font-semibold text-gray-800">Running Hours</label>
                <input type="text" name="running_hours" id="running_hours" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black placeholder:text-gray-500" />
            </div>
            <div>
                <label htmlFor="deskripsi" className="block text-base font-semibold text-gray-800">Deskripsi Maintenance Compressor *</label>
                <textarea name="deskripsi" id="deskripsi" rows={4} required className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black placeholder:text-gray-500" placeholder="Deskripsi berisikan tipe kerusakan, jenis part equipment, atau penyebabnya..."></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                    <label htmlFor="estimasi_pengerjaan" className="block text-base font-semibold text-gray-800">Estimasi Tanggal Pengerjaan</label>
                    <input type="date" name="estimasi_pengerjaan" id="estimasi_pengerjaan" min={today} onChange={(e) => setStartDate(e.target.value)} className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black" />
                </div>
                <div>
                    <label htmlFor="estimasi_selesai" className="block text-base font-semibold text-gray-800">Estimasi Tanggal Selesai</label>
                    <input type="date" name="estimasi_selesai" id="estimasi_selesai" min={startDate || today} disabled={!startDate} className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black disabled:bg-gray-100" />
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
