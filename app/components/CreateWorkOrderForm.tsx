'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Asumsi Anda punya tipe data ini dari database
type JobType = { id: string; nama_pekerjaan: string };
type Department = { id: string; nama_departemen: string };

// Props untuk menerima data dropdown dari server
type FormProps = {
  jobTypes: JobType[];
  departments: Department[];
};

export default function CreateWorkOrderForm({ jobTypes, departments }: FormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/submit-work-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: data.nama_lengkap,
          email: data.email,
          no_wa: data.no_wa,
          sub_depart: data.sub_depart,
          job_type_id: data.job_type_id,
          // Anda mungkin perlu menambahkan equipment_id dan details di sini
          // tergantung pada form lengkap Anda
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengirim data.');
      }

      // Jika berhasil, arahkan ke halaman sukses atau dasbor
      alert('Work Order berhasil dibuat!');
      router.push('/'); // Arahkan ke dasbor utama
      router.refresh(); // Refresh state di server

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        Create Work Order
      </h1>
      
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div>
        <label htmlFor="nama_lengkap" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input type="text" name="nama_lengkap" id="nama_lengkap" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" name="email" id="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
      </div>
      <div>
        <label htmlFor="no_wa" className="block text-sm font-medium text-gray-700">No. WhatsApp</label>
        <input type="tel" name="no_wa" id="no_wa" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
      </div>
      <div>
        <label htmlFor="sub_depart" className="block text-sm font-medium text-gray-700">User Sub Depart</label>
        <select name="sub_depart" id="sub_depart" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
          <option value="">Pilih Departemen...</option>
          {/* Contoh mapping, sesuaikan dengan data Anda */}
        {departments.map(dept => (
        <option key={dept.id} value={dept.nama_departemen}>{dept.nama_departemen}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="job_type_id" className="block text-sm font-medium text-gray-700">Jenis Pekerjaan</label>
        <select name="job_type_id" id="job_type_id" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
          <option value="">Pilih Pekerjaan...</option>
          {jobTypes.map(job => (
            <option key={job.id} value={job.id}>{job.nama_pekerjaan}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
      >
        {isLoading ? 'Mengirim...' : 'Lanjutkan'}
      </button>
    </form>
  );
}