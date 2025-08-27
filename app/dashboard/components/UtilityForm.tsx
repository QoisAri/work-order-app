// app/dashboard/components/UtilityForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation'; // 1. Impor useSearchParams
import { createUtilityWorkOrder } from '../utility/action';

// Hapus props karena ID diambil dari URL
export default function UtilityForm() {
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

    startTransition(async () => {
      const result = await createUtilityWorkOrder(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Work Order berhasil diperbarui dan dikirim!');
      }
    });
  };

  const lokasiOptions = ["Ms. Cikampek", "Ms. Cikande", "Ms. PSJ", "Head Office"];

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
      <h1 className="text-2xl font-bold text-gray-800">08. Utility (Genset, LVMDP, Trafo)</h1>
      <form action={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 font-semibold text-center">{error}</p>}
        {success && <p className="text-green-500 font-semibold text-center">{success}</p>}
        
        {/* Input 'equipmentId' tidak lagi diperlukan */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <label htmlFor="lokasi_utility" className="block text-base font-semibold text-gray-800">Lokasi Utility *</label>
          <select name="lokasi_utility" id="lokasi_utility" required defaultValue="" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black">
            <option value="" disabled>--Pilih Lokasi--</option>
            {lokasiOptions.map(lokasi => <option key={lokasi} value={lokasi}>{lokasi}</option>)}
          </select>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <label className="block text-base font-semibold text-gray-800 mb-4">Jenis Utility *</label>
          <div className="space-y-3">
            <div className="flex items-center">
              <input id="jenis-genset" name="jenis_utility" type="radio" value="Genset" required className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="jenis-genset" className="ml-3 block text-sm text-gray-900">Genset</label>
            </div>
            <div className="flex items-center">
              <input id="jenis-lvmdp" name="jenis_utility" type="radio" value="LVMDP" required className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="jenis-lvmdp" className="ml-3 block text-sm text-gray-900">LVMDP</label>
            </div>
            <div className="flex items-center">
              <input id="jenis-trafo" name="jenis_utility" type="radio" value="Trafo" required className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="jenis-trafo" className="ml-3 block text-sm text-gray-900">Trafo</label>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div>
                <label htmlFor="deskripsi" className="block text-base font-semibold text-gray-800">Deskripsi Pekerjaan *</label>
                <textarea name="deskripsi" id="deskripsi" rows={5} required className="mt-2 block w-full rounded-md border-gray-300 text-black shadow-sm placeholder:text-gray-500"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                    <label htmlFor="estimasi_pengerjaan" className="block text-base font-semibold text-gray-800">Estimasi Tanggal Pengerjaan</label>
                    <input 
                      type="date" 
                      name="estimasi_pengerjaan" 
                      id="estimasi_pengerjaan"
                      min={today}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black" 
                    />
                </div>
                <div>
                    <label htmlFor="estimasi_selesai" className="block text-base font-semibold text-gray-800">Estimasi Tanggal Selesai</label>
                    <input 
                      type="date" 
                      name="estimasi_selesai" 
                      id="estimasi_selesai" 
                      min={startDate || today}
                      disabled={!startDate}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black disabled:bg-gray-100" 
                    />
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
