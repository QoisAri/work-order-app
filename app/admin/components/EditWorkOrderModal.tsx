'use client';

import { useState, useEffect } from 'react';
import { type WorkOrder } from './AdminTabs';

type EditWorkOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  onSave: (id: string, updates: any) => Promise<void>;
};

// Helper untuk format tanggal YYYY-MM-DD
const formatDateForInput = (dateString?: string | null) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

export default function EditWorkOrderModal({ isOpen, onClose, workOrder, onSave }: EditWorkOrderModalProps) {
  const [status, setStatus] = useState(workOrder?.status || 'approved');
  const [estimasiPengerjaan, setEstimasiPengerjaan] = useState('');
  const [estimasiSelesai, setEstimasiSelesai] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (workOrder) {
      setStatus(workOrder.status);
      // Asumsi tanggal ada di dalam properti 'details'
      setEstimasiPengerjaan(formatDateForInput(workOrder.details?.estimasi_pengerjaan));
      setEstimasiSelesai(formatDateForInput(workOrder.details?.estimasi_selesai));
    }
  }, [workOrder]);

  if (!isOpen || !workOrder) return null;

  const handleSave = async () => {
    setIsLoading(true);
    const updates = {
      status,
      details: {
        estimasi_pengerjaan: estimasiPengerjaan,
        estimasi_selesai: estimasiSelesai,
      }
    };
    await onSave(workOrder.id, updates);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full space-y-4">
        <h2 className="text-xl font-bold mb-4">Edit Work Order</h2>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'approved' | 'done')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="approved">Approved</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label htmlFor="estimasi_pengerjaan" className="block text-sm font-medium text-gray-700">Estimasi Pengerjaan</label>
          <input
            type="date"
            id="estimasi_pengerjaan"
            value={estimasiPengerjaan}
            onChange={(e) => setEstimasiPengerjaan(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="estimasi_selesai" className="block text-sm font-medium text-gray-700">Estimasi Selesai</label>
          <input
            type="date"
            id="estimasi_selesai"
            value={estimasiSelesai}
            onChange={(e) => setEstimasiSelesai(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">
            Batal
          </button>
          <button onClick={handleSave} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}