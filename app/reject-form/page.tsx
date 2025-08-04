'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function RejectFormComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    if (!id || !reason.trim()) {
      setError('Alasan tidak boleh kosong.');
      setIsSubmitting(false);
      return;
    }
    try {
      const response = await fetch('/api/reject-with-reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reason }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menolak Work Order.');
      }
      router.push('/approval-rejected');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center bg-white p-10 rounded-lg shadow-xl"><h1 className="text-2xl font-bold text-red-600">Error</h1><p className="mt-4 text-gray-700">ID Work Order tidak ditemukan di URL.</p></div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6">Tolak Work Order</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reason" className="block text-gray-700 text-sm font-bold mb-2">Alasan Penolakan</label>
            <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32" placeholder="Tuliskan alasan mengapa Work Order ini ditolak..." required />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-center">
            <button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400">{isSubmitting ? 'Memproses...' : 'Tolak Work Order'}</button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function RejectFormPage() {
    return (<Suspense fallback={<div>Loading...</div>}><RejectFormComponent /></Suspense>);
}