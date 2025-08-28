'use client';

import { useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createMrsWorkOrder } from '../mrs/action';

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

export default function MrsForm() {
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
      setError("ID Work Order tidak ditemukan. Silakan kembali ke halaman sebelumnya.");
      return;
    }
    formData.append('workOrderId', workOrderId);

    startTransition(async () => {
      const result = await createMrsWorkOrder(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Work Order berhasil diperbarui dan dikirim!');
      }
    });
  };

  const nomorMrsOptions = [ "001 (300 Nm3/h)", "003 (300 Nm3/h)", "005 (200 Nm3/h)", "006 (150 Nm3/h)", "007 (250 Nm3/h)", "008 (300 Nm3/h)", "009 (500 Nm3/h)", "010 (150 Nm3/h)", "011 (1500 Nm3/h)", "012 (1500 Nm3/h)", "015 (1500 Nm3/h)", "016 (1500 Nm3/h)", "017 (1000 Nm3/h)", "018 (1000 Nm3/h)", "019 (1000 Nm3/h)", "020 (500 Nm3/h)", "021 (1000 Nm3/h)", "022 (1000 Nm3/h)", "023 (600 Nm3/h)", "024 (500 Nm3/h)", "025 (1000 Nm3/h)", "026 (1000 Nm3/h)", "027 (1000 Nm3/h)", "028 (1000 Nm3/h)", "029 (1000 Nm3/h)", "030 (1000 Nm3/h)", "031 (1000 Nm3/h)", "032 (1000 Nm3/h)", "033 (1000 Nm3/h)", "034 (1000 Nm3/h)", "035 (1000 Nm3/h)", "036 (300 Nm3/h)", "037 (300 Nm3/h)", "038 (300 Nm3/h)", "039 (300 Nm3/h)", "040 (300 Nm3/h)", "041 (300 Nm3/h)", "042 (300 Nm3/h)", "043 (300 Nm3/h)", "044 (300 Nm3/h)", "045 (300 Nm3/h)", "046 (300 Nm3/h)", "047 (300 Nm3/h)", "052 (300 Nm3/h)", "053 (300 Nm3/h)", "054 (300 Nm3/h)", "055 (300 Nm3/h)", "056 (300 Nm3/h)", "057 (300 Nm3/h)", "058 (300 Nm3/h)", "059 (300 Nm3/h)", "060 (300 Nm3/h)", "061 (300 Nm3/h)", "062 (1500 Nm3/h)", "063 (1500 Nm3/h)", "064 (150 Nm3/h)", "065 (100 Nm3/h)", "066 (100 Nm3/h)", "067 (100 Nm3/h)" ];
  const kerusakanOptions = [ "Scrubber", "Filter", "Aktuator", "Flow Meter", "Tubing and Instrumentation", "Piping line", "Regulator", "PSV", "Ball Valve", "Pressure Gauge", "Heater", "Heat Exchanger", "Hot Water line", "Hot Water Tank", "Hot Water Pump", "Panel Control", "Telemetri" ];

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
          <h2 className="text-2xl font-bold text-gray-800">Detail Pekerjaan: MRS</h2>
          <p className="text-sm text-gray-500 mt-1">Lengkapi semua informasi yang diperlukan di bawah ini.</p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {error && <p className="text-red-600 font-medium text-center bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
          {success && <p className="text-green-700 font-medium text-center bg-green-50 p-3 rounded-lg border border-green-200">{success}</p>}

          <FormSection title="Nomor & Lokasi MRS *">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="nomor_mrs" className="block text-sm font-medium text-gray-700">Nomor MRS</label>
                    <select name="nomor_mrs" id="nomor_mrs" required defaultValue="" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="" disabled>--Pilih--</option>
                      {nomorMrsOptions.map(no => <option key={no} value={no}>{no}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="lokasi_mrs" className="block text-sm font-medium text-gray-700">Lokasi MRS (Inisial Customer)</label>
                    <input type="text" name="lokasi_mrs" id="lokasi_mrs" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
            </div>
          </FormSection>

          <FormSection title="Kerusakan Equipment MRS *">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {kerusakanOptions.map(item => (
                <div key={item} className="flex items-center">
                  <input id={`kerusakan-${item}`} name="kerusakan_equipment" type="checkbox" value={item} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <label htmlFor={`kerusakan-${item}`} className="ml-3 block text-sm font-medium text-gray-700">{item}</label>
                </div>
              ))}
              <div className="flex items-center sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mr-2">Lainnya:</label>
                <input type="text" name="kerusakan_lain" className="flex-1 rounded-md border-gray-300 shadow-sm text-sm" />
              </div>
            </div>
          </FormSection>
          
          <FormSection title="Detail Tambahan">
            <div className="space-y-4">
              <div>
                <label htmlFor="deskripsi_maintenance" className="block text-sm font-medium text-gray-700">Deskripsi Maintenance *</label>
                <textarea name="deskripsi_maintenance" id="deskripsi_maintenance" rows={4} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Jelaskan tipe kerusakan, part, spek, atau penyebabnya..."></textarea>
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
