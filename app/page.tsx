'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type DropdownItem = {
  id: number | string;
  nama_departemen?: string;
  nama_pekerjaan?: string;
};

export default function HomePage() {
  const router = useRouter();
  const [subDepartments, setSubDepartments] = useState<DropdownItem[]>([]);
  const [jobTypes, setJobTypes] = useState<DropdownItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: deptsData, error: deptsError } = await supabase.from('sub_departments').select('*');
        if (deptsError) throw deptsError;
        setSubDepartments(deptsData || []);

        const { data: jobsData, error: jobsError } = await supabase.from('job_types').select('id, nama_pekerjaan');
        if (jobsError) throw jobsError;
        setJobTypes(jobsData || []);
      // PERBAIKAN DI SINI: Mengubah 'err: any' menjadi 'err: unknown' dan menambahkan pengecekan
      } catch (err: unknown) {
        if (err instanceof Error) {
            setError(`Gagal memuat data: ${err.message}`);
        } else {
            setError('Terjadi error tidak diketahui');
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userInfo = {
      nama: formData.get('nama') as string,
      email: formData.get('email') as string,
      no_wa: formData.get('no_wa') as string,
      sub_depart: formData.get('sub_depart') as string, 
      job_type_id: formData.get('job_type_id') as string,
    };
    
    sessionStorage.setItem('workOrderUserInfo', JSON.stringify(userInfo));
    router.push('/dashboard');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Create Work Order</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input type="text" name="nama" id="nama" required className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" required className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
          </div>
          <div>
            <label htmlFor="no_wa" className="block text-sm font-medium text-gray-700">No. WhatsApp</label>
            <input type="tel" name="no_wa" id="no_wa" required className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
          </div>
          <div>
            <label htmlFor="sub_depart" className="block text-sm font-medium text-gray-700">User Sub Depart</label>
            <select name="sub_depart" id="sub_depart" required disabled={isLoading} defaultValue="" className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-200">
              <option value="" disabled className="text-gray-500">Pilih Departemen...</option>
              {subDepartments.map(dept => <option key={dept.id} value={dept.nama_departemen}>{dept.nama_departemen}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="job_type_id" className="block text-sm font-medium text-gray-700">Jenis Pekerjaan</label>
            <select name="job_type_id" id="job_type_id" required disabled={isLoading} defaultValue="" className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-200">
              <option value="" disabled className="text-gray-500">Pilih Pekerjaan...</option>
              {jobTypes.map(item => <option key={item.id} value={item.id}>{item.nama_pekerjaan}</option>)}
            </select>
          </div>
          <button type="submit" disabled={isLoading} className="w-full flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300">
            Lanjutkan
          </button>
        </form>
        {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
        )}
      </div>
    </main>
  );
}
