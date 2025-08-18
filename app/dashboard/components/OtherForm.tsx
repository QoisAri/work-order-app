// app/dashboard/components/OtherForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { createOtherWorkOrder } from '../other/action'; // Impor Server Action

type OtherFormProps = {
  equipmentId: string;
};

export default function OtherForm({ equipmentId }: OtherFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- PENAMBAHAN: State untuk validasi tanggal ---
  const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  const [startDate, setStartDate] = useState<string>('');

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await createOtherWorkOrder(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Work Order berhasil dibuat!');
      }
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Others</h1>
      <form action={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 font-semibold text-center">{error}</p>}
        {success && <p className="text-green-500 font-semibold text-center">{success}</p>}
        
        <input type="hidden" name="equipmentId" value={equipmentId} />

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div>
                <label htmlFor="deskripsi" className="block text-base font-semibold text-gray-800">Deskripsi *</label>
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
