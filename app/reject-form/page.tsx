'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function RejectFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workOrderId = searchParams.get('id');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const reason = formData.get('rejection_reason');

    const response = await fetch('/api/handle-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: workOrderId,
            action: 'rejected',
            reason: reason,
        }),
    });

    if (response.ok) {
        // Jika berhasil, arahkan ke halaman sukses penolakan
        router.push('/approval-rejected');
    } else {
        const result = await response.json();
        setMessage(result.message || 'Terjadi kesalahan saat menolak.');
        setIsLoading(false);
    }
  };

  if (!workOrderId) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100">
            <div className="text-center bg-white p-10 rounded-lg shadow-xl">
                <h1 className="text-2xl font-bold text-red-600">Error</h1>
                <p className="mt-4 text-gray-700">ID Work Order tidak ditemukan di URL.</p>
            </div>
        </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Alasan Penolakan</h1>
        <p className="mb-6 text-gray-600">
          Berikan alasan mengapa Work Order ID <code className="font-mono bg-gray-200 px-2 py-1 rounded">{workOrderId}</code> ditolak.
        </p>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="rejection_reason" className="block text-sm font-medium text-gray-700">Alasan *</label>
            <textarea
              id="rejection_reason"
              name="rejection_reason"
              rows={5}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            ></textarea>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:bg-gray-400"
            >
              {isLoading ? 'Mengirim...' : 'Kirim Alasan & Tolak Work Order'}
            </button>
          </div>
          {message && <p className="mt-4 text-center font-medium text-red-600">{message}</p>}
        </form>
      </div>
    </main>
  );
}