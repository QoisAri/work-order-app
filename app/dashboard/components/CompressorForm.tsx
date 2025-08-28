'use client';

import { useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // 1. Impor useRouter
import Link from 'next/link';
import { createCompressorWorkOrder } from '../compressor/action';

// Komponen kecil untuk setiap bagian form agar lebih rapi
const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);

// 2. Komponen Modal Konfirmasi yang bisa dipakai ulang
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Batal
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};


export default function CompressorForm() {
  const searchParams = useSearchParams();
  const router = useRouter(); // 3. Inisialisasi router
  const workOrderId = searchParams.get('workOrderId');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>('');
  const [isBackModalOpen, setIsBackModalOpen] = useState(false); // 4. State untuk modal kembali

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(null);

    if (!workOrderId) {
      setError("ID Work Order tidak ditemukan. Silakan mulai dari awal.");
      return;
    }
    formData.append('workOrderId', workOrderId);

    startTransition(async () => {
      const result = await createCompressorWorkOrder(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Work Order berhasil diperbarui dan dikirim!');
      }
    });
  };

  const lokasiOptions = ["PSJ", "Cikampek", "Cikande"];
  const noCompressorOptions = ["CBG 1(PSJ)", "CBG 2(PSJ)", "CBG 3(CKP)", "CBG 4(CKP)", "CBG 5(CKD)", "CBG 6(CKD)", "MRU 1", "MRU 2", "IMW 1(CKP)", "IMW 2(CKP)"];
  const kerusakanOptions = [
    "Gas Kompressor", "Gas Engine Driven or Electric Motor Driven (Included Transmition System)", "Filter Inlet",
    "Filter Outlet", "Aktuator", "Water Pump", "Motor Gas Cooler", "Transmitter",
    "PLC", "HMI", "Power Supply", "Kontaktor", "Air Compressor", "Dispenser",
    "Flowmeter", "PSV", "Maintenance 1.000 Hr", "Maintenance 2.000 Hr",
    "Maintenance 4.000 Hr", "Maintenance 8.000 Hr", "Maintenance 16.000Hr", "Overhaul"
  ];

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
          <h2 className="text-2xl font-bold text-gray-800">Detail Pekerjaan: Compressor</h2>
          <p className="text-sm text-gray-500 mt-1">Lengkapi semua informasi yang diperlukan di bawah ini.</p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {error && <p className="text-red-600 font-medium text-center bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
          {success && <p className="text-green-700 font-medium text-center bg-green-50 p-3 rounded-lg border border-green-200">{success}</p>}
          
          <FormSection title="Lokasi Pekerjaan Kompressor *">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {lokasiOptions.map(lokasi => (
                <div key={lokasi} className="flex items-center">
                  <input id={`lokasi-${lokasi}`} name="lokasi" type="checkbox" value={lokasi} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <label htmlFor={`lokasi-${lokasi}`} className="ml-3 block text-sm font-medium text-gray-700">{lokasi}</label>
                </div>
              ))}
               <div className="flex items-center col-span-2 md:col-span-1">
                  <label htmlFor="lokasi-lain-cb" className="block text-sm font-medium text-gray-700 mr-2">Lainnya:</label>
                  <input type="text" name="lokasi_lain" className="flex-1 rounded-md border-gray-300 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
          </FormSection>

          <FormSection title="No. Compressor *">
            <select name="no_compressor" id="no_compressor" required defaultValue="" className="block w-full rounded-md border-gray-300 shadow-sm text-black focus:ring-indigo-500 focus:border-indigo-500">
              <option value="" disabled>-- Pilih Nomor Compressor --</option>
              {noCompressorOptions.map(no => <option key={no} value={no}>{no}</option>)}
            </select>
          </FormSection>

          <FormSection title="Jenis Kerusakan *">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {kerusakanOptions.map(kerusakan => (
                <div key={kerusakan} className="flex items-center">
                  <input id={`kerusakan-${kerusakan}`} name="jenis_kerusakan" type="checkbox" value={kerusakan} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <label htmlFor={`kerusakan-${kerusakan}`} className="ml-3 block text-sm font-medium text-gray-700">{kerusakan}</label>
                </div>
              ))}
              <div className="flex items-center sm:col-span-2 lg:col-span-3">
                <label htmlFor="kerusakan-lain-cb" className="block text-sm font-medium text-gray-700 mr-2">Lainnya:</label>
                <input type="text" name="kerusakan_lain" className="flex-1 rounded-md border-gray-300 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
          </FormSection>

          <FormSection title="Detail Tambahan">
              <div className="space-y-4">
                  <div>
                      <label htmlFor="running_hours" className="block text-sm font-medium text-gray-700">Running Hours</label>
                      <input type="text" name="running_hours" id="running_hours" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                      <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">Deskripsi Maintenance *</label>
                      <textarea name="deskripsi" id="deskripsi" rows={4} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Jelaskan detail kerusakan, part yang dibutuhkan, atau penyebabnya..."></textarea>
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

          {/* --- 5. PERBAIKAN TOMBOL DI SINI --- */}
          <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => setIsBackModalOpen(true)}
              className="w-full sm:w-auto text-center rounded-lg bg-gray-200 px-8 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-300"
            >
              Kembali
            </button>
            <button type="submit" disabled={isPending} className="w-full sm:w-auto inline-flex justify-center rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
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
