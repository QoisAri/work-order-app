'use client';

import { useState } from 'react';

// Asumsi tipe data ini sudah ada di file Anda
type JobType = { id: string; nama_pekerjaan: string };
type Department = { id: string; nama_departemen: string };

type FormProps = {
  jobTypes: JobType[];
  departments: Department[];
};

export default function CreateWorkOrderForm({ jobTypes, departments }: FormProps) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.full_name,
          no_wa: data.no_wa,
          sub_depart: data.sub_depart,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengirim data.');
      }

      // PERUBAHAN UTAMA: Jika server merespons dengan sukses,
      // kita paksa pindah halaman di sini.
      if (result.success) {
        // Menggunakan window.location.assign() untuk navigasi yang jelas.
        // Ganti '/dashboard' jika halaman tujuan Anda berbeda.
        window.location.assign('/dashboard');
      } else {
        // Fallback jika sukses bernilai false
        throw new Error(result.message || 'Terjadi kesalahan yang tidak diketahui.');
      }

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false); // Hanya set isLoading false jika ada error
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        Lengkapi Profil Anda
      </h1>
      
      {error && <p className="text-red-500 text-center">{error}</p>}
      
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input type="text" name="full_name" id="full_name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
      </div>

      <div>
        <label htmlFor="no_wa" className="block text-sm font-medium text-gray-700">No. WhatsApp</label>
        <input type="tel" name="no_wa" id="no_wa" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
      </div>

      <div>
        <label htmlFor="sub_depart" className="block text-sm font-medium text-gray-700">User Sub Depart</label>
        <select name="sub_depart" id="sub_depart" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
          <option value="">Pilih Departemen...</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.nama_departemen}>{dept.nama_departemen}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="job_type_id_placeholder" className="block text-sm font-medium text-gray-700">Jenis Pekerjaan (Contoh)</label>
        <select name="job_type_id_placeholder" id="job_type_id_placeholder" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
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
