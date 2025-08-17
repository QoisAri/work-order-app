// app/admin/work-orders/[id]/ActionButtons.tsx
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateWorkOrderStatus } from './actions';

// Komponen terpisah untuk tombol agar bisa menggunakan useFormStatus
function SubmitButton({ actionType }: { actionType: 'approve' | 'reject' }) {
  const { pending } = useFormStatus();

  if (actionType === 'approve') {
    return (
      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {pending ? 'Memproses...' : 'Setujui'}
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {pending ? 'Memproses...' : 'Konfirmasi Penolakan'}
    </button>
  );
}

type Props = {
  workOrderId: string;
};

export default function ActionButtons({ workOrderId }: Props) {
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  
  // PERBAIKAN: Definisikan fungsi yang akan dipanggil oleh form action
  const approveAction = () => {
    // Panggil Server Action dengan argumen yang sudah ditentukan
    updateWorkOrderStatus(workOrderId, 'approved');
  };

  const rejectAction = (formData: FormData) => {
    const reason = formData.get('rejectionReason') as string;
    updateWorkOrderStatus(workOrderId, 'rejected', reason);
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-end space-x-4">
        {!showRejectionForm ? (
          <>
            <button
              onClick={() => setShowRejectionForm(true)}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700"
            >
              Tolak
            </button>
            {/* PERBAIKAN: Panggil fungsi yang sudah didefinisikan */}
            <form action={approveAction}>
              <SubmitButton actionType="approve" />
            </form>
          </>
        ) : (
          <form action={rejectAction} className="w-full bg-gray-100 p-4 rounded-lg">
            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">Alasan Penolakan</label>
            <textarea
              id="rejectionReason"
              name="rejectionReason"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              rows={3}
              required
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button type="button" onClick={() => setShowRejectionForm(false)} className="px-4 py-2 text-sm text-gray-700">Batal</button>
              <SubmitButton actionType="reject" />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
