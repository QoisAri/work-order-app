'use client'; // <-- Tambahkan ini di baris paling atas

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DownloadButton from './DownloadButton';
import { markAsDone } from './actions'; // <-- Kita akan buat file ini

// Komponen kecil untuk menampilkan baris detail agar rapi
const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
    <dt className="text-sm font-medium leading-6 text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm leading-6 text-gray-800 font-semibold sm:col-span-2 sm:mt-0">{value || '-'}</dd>
  </div>
);

// Komponen Modal Konfirmasi
const ConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, isLoading: boolean }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">Konfirmasi Penyelesaian</h2>
        <p className="text-gray-600 mb-6">Apakah Anda yakin pekerjaan ini sudah selesai?</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">
            Batal
          </button>
          <button onClick={onConfirm} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Memproses...' : 'Ya, Sudah Selesai'}
          </button>
        </div>
      </div>
    </div>
  );
};


export default function WorkOrderDetail({ workOrder }: { workOrder: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const details = workOrder.details || {};

const handleMarkAsDone = async () => {
    setIsLoading(true);
    try {
      await markAsDone(workOrder.id);
      setIsModalOpen(false);
      router.refresh(); // Refresh halaman untuk melihat status baru
    } catch (error) {
      // Tampilkan error jika gagal
      alert((error as Error).message);
      setIsModalOpen(false);
    } finally {
      // Bagian ini akan selalu dijalankan, baik sukses maupun gagal
      setIsLoading(false); // <-- Ini memastikan tombol tidak akan nyangkut
    }
  };

  const detailLabels: { [key: string]: string } = {
    jenis_equipment: 'Jenis equipment',
    estimasi_selesai: 'Estimasi selesai',
    lokasi_equipment: 'Lokasi equipment',
    deskripsi_pekerjaan: 'Deskripsi pekerjaan',
    estimasi_pengerjaan: 'Estimasi pengerjaan',
    deskripsi: 'Deskripsi',
    storage_no: 'Nomor Storage',
    jenis_maintenance: 'Jenis Maintenance',
    nomor_mrs: 'Nomor MRS',
    lokasi_mrs: 'Lokasi MRS',
    kerusakan_equipment: 'Kerusakan',
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md mt-4">
        <div className="px-4 sm:px-0 flex justify-between items-center flex-wrap gap-y-4">
          <div>
            <h3 className="text-base font-semibold leading-7 text-gray-900">Informasi Umum</h3>
          </div>
          <div className="flex items-center gap-4">
            {workOrder.status === 'approved' && <DownloadButton workOrder={workOrder} />}
            {/* Tombol Selesaikan Pekerjaan */}
            {workOrder.status === 'approved' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Selesaikan Pekerjaan
              </button>
            )}
          </div>
        </div>
        <div className="mt-6 border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <DetailRow label="Nomor Work Order" value={workOrder.wo_number} />
            <DetailRow label="Pemohon" value={workOrder.profiles?.full_name} />
            <DetailRow label="Division" value={workOrder.profiles?.sub_depart} />
            <DetailRow label="Status" value={ 
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  workOrder.status === 'approved' ? 'bg-green-100 text-green-800' :
                  workOrder.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  workOrder.status === 'done' ? 'bg-blue-100 text-blue-800' : // <-- Status baru
                  'bg-yellow-100 text-yellow-800'
              }`}>
                {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
              </span>
            } />
            <DetailRow label="Equipment" value={workOrder.equipments?.nama_equipment} />
          </dl>
        </div>
        
        {workOrder.status === 'rejected' && workOrder.rejection_reason && (
          <>
            <div className="px-4 sm:px-0 mt-8">
              <h3 className="text-base font-semibold leading-7 text-red-700">Alasan Penolakan</h3>
            </div>
            <div className="mt-6 border-t border-gray-200">
              <dl>
                <DetailRow label="Alasan" value={workOrder.rejection_reason} />
              </dl>
            </div>
          </>
        )}

        <div className="px-4 sm:px-0 mt-8">
          <h3 className="text-base font-semibold leading-7 text-gray-900">Detail Pekerjaan</h3>
        </div>
        <div className="mt-6 border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            {Object.keys(details).map(key => {
              if (detailLabels[key]) {
                const value = Array.isArray(details[key]) ? details[key].join(', ') : details[key];
                if (value) {
                  return <DetailRow key={key} label={detailLabels[key]} value={value} />;
                }
              }
              return null;
            })}
          </dl>
        </div>
      </div>
      
      {/* Panggil Komponen Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleMarkAsDone}
        isLoading={isLoading}
      />
    </>
  );
}