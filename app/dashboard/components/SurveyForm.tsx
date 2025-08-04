'use client';

import { FormEvent, useState } from 'react';

export default function SurveyForm({ equipmentId }: { equipmentId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    const userInfo = JSON.parse(sessionStorage.getItem('workOrderUserInfo') || '{}');
    if (!userInfo.email) {
      setMessage('Error: Sesi tidak ditemukan. Silakan mulai dari awal.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const details = {
      lokasiSurvey: formData.get('lokasi_survey'),
      deskripsiSurvey: formData.get('deskripsi_survey'),
      estimasiPengerjaan: formData.get('estimasi_pengerjaan'),
      estimasiSelesai: formData.get('estimasi_selesai'),
    };

    const finalData = {
      ...userInfo,
      equipment_id: equipmentId,
      details: details,
    };
    
    const response = await fetch('/api/submit-work-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalData),
    });
    const result = await response.json();
    setMessage(result.message);
    setIsLoading(false);
    if (response.ok) {
        sessionStorage.removeItem('workOrderUserInfo');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">07. Survey</h1>
      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 space-y-4">
            <div>
                <label htmlFor="lokasi_survey" className="block text-base font-semibold text-gray-800">Lokasi Survey *</label>
                {/* PERBAIKAN: Menambahkan placeholder:text-gray-500 */}
                <input type="text" name="lokasi_survey" id="lokasi_survey" required className="mt-2 block w-full rounded-md border-gray-300 text-black shadow-sm placeholder:text-gray-500" />
            </div>
            <div>
                <label htmlFor="deskripsi_survey" className="block text-base font-semibold text-gray-800">Deskripsi Survey *</label>
                <p className="text-sm text-gray-500">Diisi waktu survey serta alamat lengkap dan maps (jika ada)</p>
                <textarea name="deskripsi_survey" id="deskripsi_survey" rows={5} required className="mt-2 block w-full rounded-md border-gray-300 text-black shadow-sm placeholder:text-gray-500"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                    <label htmlFor="estimasi_pengerjaan" className="block text-base font-semibold text-gray-800">Estimasi Tanggal Pengerjaan</label>
                    {/* PERBAIKAN: Menambahkan text-black */}
                    <input type="date" name="estimasi_pengerjaan" id="estimasi_pengerjaan" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black" />
                </div>
                <div>
                    <label htmlFor="estimasi_selesai" className="block text-base font-semibold text-gray-800">Estimasi Tanggal Selesai</label>
                    {/* PERBAIKAN: Menambahkan text-black */}
                    <input type="date" name="estimasi_selesai" id="estimasi_selesai" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black" />
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isLoading} className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-gray-400">
            {isLoading ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </form>
      {message && <p className="mt-4 text-center font-medium text-green-600">{message}</p>}
    </div>
  );
}