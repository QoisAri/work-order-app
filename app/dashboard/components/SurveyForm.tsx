'use client';

import { useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createSurveyWorkOrder } from '../survey/action';

const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Ya, Lanjutkan</button>
        </div>
      </div>
    </div>
  );
};

export default function SurveyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const workOrderId = searchParams.get('workOrderId');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>('');
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(null);

    if (!workOrderId) {
      setError("ID Work Order tidak ditemukan. Silakan mulai dari awal.");
      return;
    }
    formData.append('workOrderId', workOrderId);

    startTransition(async () => {
      const result = await createSurveyWorkOrder(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Work Order berhasil diperbarui dan dikirim!');
      }
    });
  };

  if (!workOrderId) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center p-8 bg-white rounded-xl shadow-md border">
        <h2 className="text-xl font-bold text-red-600">Error: ID Work Order Hilang</h2>
        <p className="text-gray-700 mt-2">Tidak dapat melanjutkan karena ID work order tidak ditemukan di URL.</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto bg-gray-50 p-6 sm:p-8 rounded-2xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Detail Pekerjaan: Survey</h2>
          <p className="text-sm text-gray-500 mt-1">Lengkapi semua informasi yang diperlukan di bawah ini.</p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {error && <p className="text-red-600 font-medium text-center bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
          {success && <p className="text-green-700 font-medium text-center bg-green-50 p-3 rounded-lg border border-green-200">{success}</p>}
          
          <FormSection title="Detail Survey">
            <div className="space-y-4">
              <div>
                <label htmlFor="lokasi_survey" className="block text-sm font-medium text-gray-700">Lokasi Survey *</label>
                <input type="text" name="lokasi_survey" id="lokasi_survey" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label htmlFor="deskripsi_survey" className="block text-sm font-medium text-gray-700">Deskripsi Survey *</label>
                <p className="text-xs text-gray-500 mt-1">Diisi waktu survey serta alamat lengkap</p>
                <textarea name="deskripsi_survey" id="deskripsi_survey" rows={4} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label htmlFor="estimasi_pengerjaan" className="block text-sm font-medium text-gray-700">Estimasi Tanggal Pengerjaan</label>
                  <input type="date" name="estimasi_pengerjaan" id="estimasi_pengerjaan" min={today} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="estimasi_selesai" className="block text-sm font-medium text-gray-700">Estimasi Tanggal Selesai</label>
                  <input type="date" name="estimasi_selesai" id="estimasi_selesai" min={startDate || today} disabled={!startDate} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>
            </div>
          </FormSection>

          <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-3 pt-4">
            <button type="button" onClick={() => setIsBackModalOpen(true)} className="w-full sm:w-auto text-center rounded-lg bg-gray-200 px-8 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-300">
              Kembali
            </button>
            <button type="submit" disabled={isPending} className="w-full sm:w-auto inline-flex justify-center rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-gray-400">
              {isPending ? 'Mengirim...' : 'Kirim Work Order'}
            </button>
          </div>
        </form>
      </div>
      <ConfirmationModal
        isOpen={isBackModalOpen}
        onClose={() => setIsBackModalOpen(false)}
        onConfirm={() => router.push('/dashboard')}
        title="Konfirmasi Kembali"
        message="Apakah Anda yakin ingin kembali? Semua data yang belum disimpan akan hilang."
      />
    </>
  );
}
